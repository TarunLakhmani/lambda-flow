// === File: src/core/executor/executeNode.js ===

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { nodeMap } from '../../../config/nodeMap.js';
import { categoryMap } from '../../../config/nodeCategories.js';
import dotenv from 'dotenv';
dotenv.config();

const isOffline = process.env.IS_OFFLINE === 'true';

const getModulePath = (nodeType) => {
  if (!nodeType) throw new Error('Missing nodeType in request payload');
  if (nodeType.includes('/')) return nodeType;

  const category = categoryMap[nodeType];
  if (!category) throw new Error(`Cannot resolve module path for nodeType: ${nodeType}`);
  return `${category}/${nodeType}`;
};

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'ap-south-1' });

export const handler = async ({ nodeType, config, input }) => {
  const normalizedType = nodeType.includes('/') ? nodeType.split('/')[1] : nodeType;
  if (!normalizedType || !nodeMap[normalizedType]) {
    console.error(`🚫 Unknown nodeType: ${nodeType}`);
    throw new Error(`Unknown or missing node type: ${nodeType}`);
  }

  console.log(`🔍 nodeType: ${nodeType}`);
  console.log(`🔍 isOffline: ${isOffline}`);

  if (isOffline) {
    // Support dynamic JS code execution in local mode
    if (normalizedType === 'customdatatransformation') {
      const { userCode } = config;
      if (!userCode) {
        throw new Error('User code is missing in the config');
      }

      try {
        const wrappedCode = `
          ${userCode}
          return customTransformation(config, input);
        `;
        const userFn = new Function('config', 'input', wrappedCode);
        const result = await userFn(config, input);

        return {
          success: true,
          summary: 'Custom data transformation executed successfully',
          details: { userCode },
          output: result,
        };
      } catch (err) {
        console.error(`❌ Error in custom transformation:`, err);
        return {
          success: false,
          summary: 'Error executing custom data transformation',
          details: { message: err.message, stack: err.stack },
          output: null,
        };
      }
    }

    const modulePath = getModulePath(nodeType);
    let module;
    try {
      module = await import(`../../nodes/${modulePath}.js`);
    } catch (err) {
      throw new Error(`Failed to load local module: ${modulePath}.js — ${err.message}`);
    }

    try {
      const result = await module.handler(config, input);
      return {
        success: true,
        summary: result.summary || 'Executed successfully',
        details: result.details || result,
        output: result.output ?? result,
      };
    } catch (err) {
      console.error(`❌ Error in node ${nodeType}:`, err);
      return {
        success: false,
        summary: err.message,
        details: { message: err.message, stack: err.stack },
        output: null,
      };
    }
  }

  if (normalizedType === 'customdatatransformation') {
    const { userCode } = config;
    if (!userCode) {
      throw new Error('User code is missing in the config');
    }

    try {
      const wrappedCode = `
        ${userCode}
        return customTransformation(config, input);
      `;
      const userFn = new Function('config', 'input', wrappedCode);
      const result = await userFn(config, input);

      return {
        success: true,
        summary: 'Custom data transformation executed (cloud)',
        details: { userCode },
        output: result,
      };
    } catch (err) {
      console.error(`❌ Cloud error in custom transformation:`, err);
      return {
        success: false,
        summary: 'Error executing custom data transformation (cloud)',
        details: { message: err.message, stack: err.stack },
        output: null,
      };
    }
  }

  const functionName = nodeMap[nodeType];
  const command = new InvokeCommand({
    FunctionName: functionName,
    Payload: Buffer.from(JSON.stringify({ nodeType, config, input })),
  });

  try {
    const response = await lambdaClient.send(command);
    const payloadString = Buffer.from(response.Payload).toString();
    const payload = JSON.parse(payloadString);

    if (payload?.errorMessage) throw new Error(payload.errorMessage);

    return {
      success: payload.success !== false,
      summary: payload.summary || 'Executed',
      details: payload.details || {},
      output: payload.output ?? payload,
    };
  } catch (err) {
    console.error(`❌ Lambda invocation failed for ${nodeType}:`, err);
    return {
      success: false,
      summary: err.message,
      details: { message: err.message, stack: err.stack },
      output: null,
    };
  }
};

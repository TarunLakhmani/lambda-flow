// === File: src/core/store/workflows.js ===

import { GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../utils/dynamodbClient.js';

const WORKFLOW_TABLE = process.env.WORKFLOW_TABLE || 'LambdaFlowWorkflows';

export const saveWorkflowToDynamoDB = async (workflowId, nodes, edges) => {
  const cmd = new PutCommand({
    TableName: WORKFLOW_TABLE,
    Item: {
      workflowId,
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: new Date().toISOString(),
    },
  });
  console.log(`💾 Saving workflow ${workflowId}`);
  await ddbDocClient.send(cmd);
};

export const getWorkflowFromDynamoDB = async (workflowId) => {
  const cmd = new GetCommand({
    TableName: WORKFLOW_TABLE,
    Key: { workflowId },
  });

  const response = await ddbDocClient.send(cmd);
  if (!response.Item) throw new Error('Workflow not found');
  return response.Item;
};

export const listWorkflowsFromDynamoDB = async () => {
  const cmd = new ScanCommand({
    TableName: WORKFLOW_TABLE,
    ProjectionExpression: 'workflowId',
  });

  const result = await ddbDocClient.send(cmd);
  console.log(`📋 Listed ${result.Items?.length || 0} workflows.`);
  return result.Items || [];
};
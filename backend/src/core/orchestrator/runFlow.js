// === File: src/core/orchestrator/runFlow.js ===

import { handler as executeNode } from '../executor/executeNode.js';

export const runFlow = async (nodes, edges, globalInput, startNodeId = null) => {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const adjList = edges.reduce((map, edge) => {
    if (!map[edge.source]) map[edge.source] = [];
    map[edge.source].push(edge.target);
    return map;
  }, {});
  const reverseAdjList = edges.reduce((map, edge) => {
    if (!map[edge.target]) map[edge.target] = [];
    map[edge.target].push(edge.source);
    return map;
  }, {});

  const visited = new Set();
  const results = {};
  const flowContext = {};
  const executionId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const execute = async (nodeId, overrideInput = null, context = '') => {
    const key = `${context}:${nodeId}`;
    if (visited.has(key)) return results[key];
    visited.add(key);

    const node = nodeMap[nodeId];
    if (!node) {
      console.warn(`⚠️ Node with ID '${nodeId}' not found.`);
      return null;
    }

    const nodeType = node.type;
    const config = node.data?.config || {};
    const staticInput = node.data?.input || {};

    let dynamicInput = {};
    const parentIds = reverseAdjList[nodeId] || [];

    for (const parentId of parentIds) {
      const parentOutput = await execute(parentId, null, context);
      if (parentOutput && typeof parentOutput === 'object') {
        dynamicInput = { ...dynamicInput, ...parentOutput.output };
      }
    }

    const finalInput = overrideInput || {
      ...flowContext,
      ...dynamicInput,
      ...staticInput,
      ...globalInput,
    };

    console.log(`\n🟢 Executing Node: ${nodeId} (${node.data.label || nodeType})`);
    console.log('🔸 Input:', finalInput);

    try {
      const output = await executeNode({ nodeType, config, input: finalInput });
      results[key] = output;

      if (output?.output && typeof output.output === 'object') {
        Object.assign(flowContext, output.output);
      }

      if (output?.terminate === true) {
        console.log(`🛑 Termination triggered at node ${nodeId}`);
        return output;
      }

      const branches = output?.output?.branches;
      const children = adjList[nodeId] || [];

      if (Array.isArray(branches) && branches.length > 0) {
        let i = 0;
        for (const branch of branches) {
          for (const child of children) {
            await execute(child, branch, `${nodeId}#${i++}`);
          }
        }
      } else {
        for (const child of children) {
          await execute(child, null, context);
        }
      }

      return output;
    } catch (err) {
      console.error(`❌ Error executing node ${nodeId} (${nodeType}):`, err);
      const failure = {
        success: false,
        summary: err.message,
        details: { message: err.message, stack: err.stack },
        output: null,
      };
      results[key] = failure;
      return failure;
    }
  };

  const allNodeIds = new Set(nodes.map((n) => n.id));
  const targetNodeIds = new Set(edges.map((e) => e.target));
  const sourceNodeIds = [...allNodeIds].filter((id) => !targetNodeIds.has(id));

  const startNodes = startNodeId ? [startNodeId] : sourceNodeIds;

  for (const startId of startNodes) {
    try {
      await execute(startId);
    } catch (err) {
      console.error(`❌ Flow failed at start node ${startId}:`, err);
      results[startId] = {
        success: false,
        summary: 'Unhandled execution error',
        details: { message: err.message, stack: err.stack },
        output: null,
      };
    }
  }

  const flatResults = {};
  for (const key of Object.keys(results)) {
    const [, nodeId] = key.split(':');
    flatResults[nodeId] = results[key];
  }

  return flatResults;
};

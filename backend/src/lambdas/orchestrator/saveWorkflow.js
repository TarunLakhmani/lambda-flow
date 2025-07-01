// === File: src/lambdas/orchestrator/listWorkflows.js ===

const { saveWorkflowToDynamoDB } = require('../../core/store/workflows.js');
const { corsHeaders, preflightResponse } = require('../../core/utils/cors.js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const { workflowId } = event.pathParameters || {};
    const { nodes, edges } = JSON.parse(event.body || '{}');

    if (!workflowId || workflowId.length < 3) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Invalid workflowId' }),
      };
    }

    await saveWorkflowToDynamoDB(workflowId, nodes, edges);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

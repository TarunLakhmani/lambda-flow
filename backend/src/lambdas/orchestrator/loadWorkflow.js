// === File: src/lambdas/orchestrator/listWorkflows.js ===

const { getWorkflowFromDynamoDB } = require('../../core/store/workflows.js');
const { corsHeaders, preflightResponse } = require('../../core/utils/cors.js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const { workflowId } = event.pathParameters || {};
    const workflow = await getWorkflowFromDynamoDB(workflowId);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, workflow }),
    };
  } catch (err) {
    const status = err.message === 'Workflow not found' ? 404 : 500;
    return {
      statusCode: status,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

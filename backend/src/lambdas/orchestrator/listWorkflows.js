// === File: src/lambdas/orchestrator/listWorkflows.js ===

const { listWorkflowsFromDynamoDB } = require('../../core/store/workflows.js');
const { corsHeaders, preflightResponse } = require('../../core/utils/cors.js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const workflows = await listWorkflowsFromDynamoDB();
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, workflows }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

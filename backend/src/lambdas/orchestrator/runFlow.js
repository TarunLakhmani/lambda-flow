// === File: src/lambdas/orchestrator/listWorkflows.js ===

const { runFlow } = require('../../core/orchestrator/runFlow.js');
const { corsHeaders, preflightResponse } = require('../../core/utils/cors.js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const { nodes, edges, input } = JSON.parse(event.body || '{}');
    const result = await runFlow(nodes, edges, input);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, result }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

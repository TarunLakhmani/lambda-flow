const { getWorkflowFromDynamoDB } = require('../../core/store/workflows.js');
const { runFlow } = require('../../core/orchestrator/runFlow.js');
const { corsHeaders, preflightResponse } = require('../../core/utils/cors.js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const { workflowId } = event.pathParameters || {};
    const triggerInput = JSON.parse(event.body || '{}');

    const { nodes, edges } = await getWorkflowFromDynamoDB(workflowId);
    const triggerNode = nodes.find((n) => n.type === 'dynamodbtrigger');
    if (!triggerNode) throw new Error('DynamoDB Trigger node not found');

    const result = await runFlow(nodes, edges, triggerInput, triggerNode.id);
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

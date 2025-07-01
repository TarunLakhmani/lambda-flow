const { getWorkflowFromDynamoDB } = require('../../core/store/workflows.js');
const { runFlow } = require('../../core/orchestrator/runFlow.js');
const { corsHeaders, preflightResponse } = require('../../core/utils/cors.js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const { workflowId } = event.pathParameters || {};
    const rawBody = event.body || '';
    const messageObj = JSON.parse(rawBody);

    const { nodes, edges } = await getWorkflowFromDynamoDB(workflowId);
    const triggerNode = nodes.find((n) => n.type === 's3trigger');
    if (!triggerNode) throw new Error('S3 Trigger node not found');

    const result = await runFlow(nodes, edges, messageObj, triggerNode.id);
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

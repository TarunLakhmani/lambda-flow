// === File: src/lambdas/orchestrator/triggerSNS.js ===

const { getWorkflowFromDynamoDB } = require('../../core/store/workflows.js');
const { runFlow } = require('../../core/orchestrator/runFlow.js');
const { corsHeaders, preflightResponse } = require('../../core/utils/cors.js');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const { workflowId } = event.pathParameters || {};
    const rawBody = event.body || '';
    const headers = event.headers || {};

    const messageObj = JSON.parse(rawBody);
    const messageType = headers['x-amz-sns-message-type'];

    // Confirm SNS subscription
    if (messageType === 'SubscriptionConfirmation' && messageObj.SubscribeURL) {
      await fetch(messageObj.SubscribeURL);
      return { statusCode: 200, headers: corsHeaders, body: 'Subscription confirmed' };
    }

    const { nodes, edges } = await getWorkflowFromDynamoDB(workflowId);
    const triggerNode = nodes.find((n) => n.type === 'snstrigger');
    if (!triggerNode) throw new Error('SNS Trigger node not found');

    const snsPayload = JSON.parse(messageObj.Message);
    const result = await runFlow(nodes, edges, snsPayload, triggerNode.id);

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

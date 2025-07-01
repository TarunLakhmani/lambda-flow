// === File: src/lambdas/orchestrator/listWorkflows.js ===

import { createScheduleRule } from '../../core/utils/eventBridgeScheduler.js';
import { corsHeaders, preflightResponse } from '../../core/utils/cors.js';

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return preflightResponse;

  try {
    const { workflowId } = event.pathParameters || {};
    const body = JSON.parse(event.body || '{}');
    const { cron } = body;

    if (!workflowId || !cron || !cron.startsWith('cron(')) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, error: 'Invalid workflowId or cron expression' }),
      };
    }

    // 🔗 Construct base URL dynamically from API Gateway context
    const host = event.headers?.Host;
    const stage = event.requestContext?.stage;
    const baseUrl = `https://${host}/${stage}`;

    const targetUrl = `${baseUrl}/trigger/schedule/${workflowId}`;
    console.log("Desitination URL : ")
    console.log(targetUrl);
    const result = await createScheduleRule({ workflowId, cronExpression: cron, targetUrl });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: result.message }),
    };
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};

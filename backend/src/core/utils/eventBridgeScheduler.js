// === File: src/core/utils/eventBridgeScheduler.js ===

import {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
  CreateConnectionCommand,
  CreateApiDestinationCommand,
} from '@aws-sdk/client-eventbridge';
import { v4 as uuidv4 } from 'uuid';

const client = new EventBridgeClient({});

const CONNECTION_NAME_PREFIX = 'LambdaFlowConnection';
const DESTINATION_NAME_PREFIX = 'LambdaFlowDestination';

export async function createScheduleRule({ workflowId, cronExpression, targetUrl }) {
  const connectionName = `${CONNECTION_NAME_PREFIX}-${workflowId}`;
  const destinationName = `${DESTINATION_NAME_PREFIX}-${workflowId}`;
  const ruleName = `LambdaFlow-Schedule-${workflowId}`;

  // 1. Create connection (once per URL)
  const connection = await client.send(
    new CreateConnectionCommand({
      Name: connectionName,
      AuthorizationType: 'API_KEY',
      AuthParameters: {
        ApiKeyAuthParameters: {
          ApiKeyName: 'X-Placeholder-Key',
          ApiKeyValue: 'dummy-value', // Replace with real value if needed
        },
      },
    })
  );

  // 2. Create API destination
  const apiDest = await client.send(
    new CreateApiDestinationCommand({
      Name: destinationName,
      ConnectionArn: connection.ConnectionArn,
      InvocationEndpoint: targetUrl,
      HttpMethod: 'POST',
    })
  );

  // 3. Create EventBridge Rule
  await client.send(
    new PutRuleCommand({
      Name: ruleName,
      ScheduleExpression: cronExpression,
      State: 'ENABLED',
    })
  );

  // 4. Attach Target
  await client.send(
    new PutTargetsCommand({
      Rule: ruleName,
      Targets: [
        {
          Id: `LambdaFlowTarget-${workflowId}`,
          Arn: apiDest.ApiDestinationArn,
          RoleArn: "arn:aws:iam::064725643419:role/LambdaFlowEventBridgeInvokeRole", // 🔐 Required
        },
      ],
    })
  );

  return {
    message: `Scheduled rule created for workflow ${workflowId}`,
    ruleName,
  };
}

// === File: src/nodes/notifications/sendemail.js ===

import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

export const handler = async (config, input) => {
  const { awsRegion = 'ap-south-1' } = config;
  const { to, message } = input;

  if (!to || !message) {
    throw new Error('Missing required fields: "to" or "message"');
  }

  const sns = new SNSClient({ region: awsRegion });

  try {
    const command = new PublishCommand({
      PhoneNumber: to,
      Message: message,
    });

    const result = await sns.send(command);

    return {
      summary: `✅ SMS sent to ${to}`,
      details: result,
      output: result,
    };
  } catch (err) {
    return {
      summary: '❌ Failed to send SMS via AWS SNS',
      details: err.message,
      output: null,
    };
  }
};

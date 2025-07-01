// === File: src/nodes/notifications/sendemail.js ===

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export const handler = async (config, input) => {
  const { from } = config;
  let { to, subject, body, html } = input;

  body = body || html;

  if (!from || !to || !subject || !body) {
    throw new Error('Missing required fields: from, to, subject, or body');
  }

  const client = new SESClient();

  const command = new SendEmailCommand({
    Source: from,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: body },
      },
    },
  });

  try {
    const result = await client.send(command);
    return {
      summary: `✅ Email sent to ${to}`,
      details: result,
      output: result,
    };
  } catch (err) {
    return {
      summary: '❌ Failed to send email',
      details: err.message,
      output: null,
    };
  }
};

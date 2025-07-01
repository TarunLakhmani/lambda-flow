// === File: src/nodes/triggers/snstrigger.js ===

export const handler = async (config, input) => {
  const snsMessage = input.Records?.[0]?.Sns || {};

  return {
    summary: 'Triggered via SNS',
    details: {
      messageId: snsMessage.MessageId,
      subject: snsMessage.Subject,
    },
    output: JSON.parse(snsMessage.Message || '{}'),
  };
};

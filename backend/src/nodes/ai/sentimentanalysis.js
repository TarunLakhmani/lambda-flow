// === File: src/nodes/ai/sentimentanalysis.js ===
import { ComprehendClient, DetectSentimentCommand } from '@aws-sdk/client-comprehend';

export const handler = async (config, input) => {

  let text = input.text || input?.details?.text;

  if (!text) {
    const fileData = input.file || input?.details?.file;
    if (fileData?.startsWith('data:')) {
      const base64Match = fileData.match(/^data:.*?;base64,(.*)$/);
      const buffer = Buffer.from(base64Match[1], 'base64');
      text = buffer.toString('utf-8');
    }
  }

  if (!text) throw new Error('No input text provided.');

  const client = new ComprehendClient({});

  const command = new DetectSentimentCommand({
    Text: text,
    LanguageCode: 'en',
  });

  const response = await client.send(command);

  return {
    summary: `Sentiment detected: ${response.Sentiment}`,
    details: response,
    sentiment: response.Sentiment,
    aiResult: `Sentiment detected: ${response.Sentiment}`
  };
};

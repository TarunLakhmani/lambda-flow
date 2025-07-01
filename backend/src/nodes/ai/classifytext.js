// === File: src/nodes/ai/classifytext.js ===
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const handler = async (config, input) => {
  const {
    categories = [],
    provider = 'bedrock',
    modelId = 'amazon.titan-text-lite-v1',
    awsRegion = process.env.AWS_REGION || 'ap-south-1',
  } = config;

  let text = input.text || input?.details?.text || input?.item?.text;
  const fileData = input.file || input?.details?.file;

  if (!text && fileData?.startsWith('data:')) {
    const base64Match = fileData.match(/^data:.*?;base64,(.*)$/);
    if (!base64Match) throw new Error('Invalid base64 file format');
    const buffer = Buffer.from(base64Match[1], 'base64');
    text = buffer.toString('utf-8');
  }

  if (!text || text.trim().length < 20) {
    throw new Error('Input text missing or too short to classify.');
  }

  const categoryPrompt = categories.length
    ? `Classify the following text into **only one** of the following categories. Respond with just the category name, and nothing else:\n${categories.join(", ")}`
    : 'Classify the following text into an appropriate category. Respond with only the category name.';

  const prompt = `${categoryPrompt}\n\nText:\n${text}`;

  if (provider === 'bedrock') {
    const bedrock = new BedrockRuntimeClient({
      region: awsRegion,
      // ✅ No credentials block — uses default credential provider chain
    });

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: 100,
          temperature: 0.2,
          topP: 0.9,
        },
      }),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));
    const classification = responseBody.results?.[0]?.outputText?.trim() || 'Unknown';

    return {
      summary: `Category Result - ${classification}`,
      details: {
        inputLength: text.length,
        modelId,
        categories,
      },
      text,
      category: classification,
      aiResult: `Category Result - ${classification}`
    };
  }

  throw new Error('Unsupported AI provider');
};

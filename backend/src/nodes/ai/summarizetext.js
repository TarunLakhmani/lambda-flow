// === File: src/nodes/ai/summarizetext.js ===
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const handler = async (config, input) => {
  const {
    provider = 'bedrock',
    modelId = 'amazon.titan-text-lite-v1', // ✅ Nova Micro default
    awsRegion = process.env.AWS_REGION || 'ap-south-1',
    openaiApiKey = process.env.OPENAI_API_KEY
  } = config;

  // 🧠 STEP 1: Extract text from direct or file input
  let text = input.text || input?.output?.text || input?.details?.text;
  const fileData = input.file || input?.output?.file || input?.details?.file;

  if (!text && fileData?.startsWith('data:')) {
    const base64Match = fileData.match(/^data:.*?;base64,(.*)$/);
    if (!base64Match) throw new Error('Invalid base64 file format');
    const buffer = Buffer.from(base64Match[1], 'base64');
    text = buffer.toString('utf-8');
  }

  if (!text || text.trim().length < 20) {
    throw new Error('Input text missing or too short to summarize.');
  }

  // ✨ STEP 2: Amazon Bedrock (Nova Micro - Titan)
  if (provider === 'bedrock') {
    const bedrock = new BedrockRuntimeClient({
      region: awsRegion,
      // ✅ Default AWS credentials will be used
    });

    let command;

    if (modelId.startsWith('amazon.titan')) {
      // Titan/Nova Micro body format
      command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: `Summarize the following text:\n\n${text}`,
          textGenerationConfig: {
            maxTokenCount: 300,
            temperature: 0.3,
            topP: 0.9,
          },
        }),
      });
    } else if (modelId.startsWith('anthropic.claude')) {
      // Claude/Anthropic body format
      command = new InvokeModelCommand({
        modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          messages: [
            {
              role: "user",
              content: `Summarize the following text:\n\n${text}`,
            }
          ],
          max_tokens: 300,
        }),
      });
    } else {
      throw new Error(`Unsupported model ID for Bedrock: ${modelId}`);
    }

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));

    const summary = modelId.startsWith('amazon.titan')
      ? responseBody.results?.[0]?.outputText?.trim()
      : responseBody.content?.[0]?.text?.trim();

    return {
      summary: 'Text summarized successfully',
      details: {
        inputLength: text.length,
        summaryLength: summary?.length || 0,
        modelId,
      },
      text: summary,
      aiResult: `Summary is: ${summary}`
    };
  }

  throw new Error('Unsupported AI provider');
};

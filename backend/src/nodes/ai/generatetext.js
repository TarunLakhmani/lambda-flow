// === File: src/nodes/ai/generatetext.js ===
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

/**
 * Recursively resolve dot-path strings like 'candidate.name' from an object
 */
function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : ''), obj);
}

/**
 * Normalize object keys to lowercase
 */
function normalizeKeys(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;

  const normalized = {};
  for (const key of Object.keys(obj)) {
    normalized[key.toLowerCase()] = obj[key];
  }
  return normalized;
}

export const handler = async (config, input) => {
  let { model, temperature } = config;

  model = model || 'amazon.titan-text-express-v1';
  temperature = temperature === null || temperature === '' || isNaN(temperature) ? 0.5 : Number(temperature);

  if (!input?.prompt) {
    throw new Error('Missing prompt in input.prompt');
  }

  // Interpolate placeholders
  const finalPrompt = input.prompt.replace(/\{([\w\d_.]+)\}/g, (_, path) => {
    if (path.startsWith('input.')) path = path.slice(6);
    const value = resolvePath(input, path);
    return typeof value === 'string' ? value : JSON.stringify(value);
  });

  const bedrock = new BedrockRuntimeClient();

  const command = new InvokeModelCommand({
    modelId: model,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      inputText: finalPrompt,
      textGenerationConfig: {
        maxTokenCount: 400,
        temperature,
        topP: 1,
        stopSequences: [],
      },
    }),
  });

  const response = await bedrock.send(command);
  const responseJson = JSON.parse(Buffer.from(response.body).toString('utf-8'));

  let rawOutputText = responseJson?.results?.[0]?.outputText?.trim() || '';
  let parsedJson = null;

  // Strip code block formatting
  if (rawOutputText.startsWith('```tabular-data-json')) {
    rawOutputText = rawOutputText.replace(/^```tabular-data-json\s*/, '').replace(/```$/, '').trim();
  }

  try {
    const possibleJson = JSON.parse(rawOutputText);
    if (typeof possibleJson === 'object') {
      parsedJson = possibleJson;
    }
  } catch (_) {}

  // Normalize structure and keys
  let normalized = null;
  if (parsedJson) {
    if (Array.isArray(parsedJson?.rows) && parsedJson.rows.length > 0) {
      normalized = normalizeKeys(parsedJson.rows[0]);
    } else if (typeof parsedJson === 'object') {
      normalized = normalizeKeys(parsedJson);
    }
  }

  return {
    summary: '✅ Text generated using Amazon Titan',
    text: rawOutputText,
    json: normalized,
    raw: parsedJson,
    aiResult: `Text Generated : ${rawOutputText}`
  };
};

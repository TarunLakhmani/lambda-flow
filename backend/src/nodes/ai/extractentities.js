// === File: src/nodes/ai/extractentities.js ===
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export const handler = async (config, input) => {
  const {
    entityTypes = [],
    provider = 'bedrock',
    modelId = 'meta.llama3-70b-instruct-v1:0', // ✅ LLaMA 3 model
  } = config;

  let text = input.text || input?.details?.text;
  const fileData = input.file || input?.details?.file;

  if (!text && fileData?.startsWith('data:')) {
    const base64Match = fileData.match(/^data:.*?;base64,(.*)$/);
    if (!base64Match) throw new Error('Invalid base64 file format');
    const buffer = Buffer.from(base64Match[1], 'base64');
    text = buffer.toString('utf-8');
  }

  if (!text || text.trim().length < 20) {
    throw new Error('Input text missing or too short to extract entities.');
  }

  const typeList = entityTypes.length
    ? `Limit extraction to the following types: ${entityTypes.join(', ')}.`
    : '';

  const prompt = `
<|begin_of_text|><|start_header_id|>user<|end_header_id|>
Extract named entities from the text below and return only in this exact format:

\`\`\`tabular-data-json
{
  "rows": [
    { "Name": "entity name", "Type": "entity type" }
  ]
}
\`\`\`

${typeList}

Text:
${text}
<|eot_id|><|start_header_id|>assistant<|end_header_id|>
`;

  const extractJsonFromText = (rawText) => {
    try {
      let jsonMatch;

      if (typeof rawText === 'string' && rawText.trim().startsWith('{')) {
        const directParsed = JSON.parse(rawText);
        if (directParsed?.rows && Array.isArray(directParsed.rows)) {
          return { success: true, json: directParsed, raw: rawText };
        }
      }

      if (Array.isArray(rawText)) {
        const parsedRows = rawText
          .map(str => {
            try {
              return JSON.parse(str);
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .flatMap(obj => Array.isArray(obj?.rows) ? obj.rows : []);
        if (parsedRows.length > 0) {
          return {
            success: true,
            json: { rows: parsedRows },
            raw: JSON.stringify(parsedRows, null, 2),
          };
        }
      }

      const tabularMatch = rawText.match(/```tabular-data-json\s*([\s\S]*?)```/i);
      if (tabularMatch) {
        const jsonContent = tabularMatch[1].trim();
        try {
          const parsed = JSON.parse(jsonContent);
          if (parsed?.rows && Array.isArray(parsed.rows)) {
            return { success: true, json: parsed, raw: jsonContent };
          }
        } catch {
          const partialRows = [];
          const rowMatches = [...jsonContent.matchAll(/{[^{}]*?"Name"\s*:\s*".+?",\s*"Type"\s*:\s*".+?"[^{}]*}/g)];
          for (const match of rowMatches) {
            try {
              partialRows.push(JSON.parse(match[0]));
            } catch {}
          }
          if (partialRows.length) {
            return {
              success: true,
              json: { rows: partialRows },
              raw: JSON.stringify({ rows: partialRows }, null, 2),
            };
          }
        }
      }

      if (!jsonMatch) {
        const fencedMatch = rawText.match(/```(?:[\w-]+)?\s*({[\s\S]*?})\s*```/);
        if (fencedMatch) jsonMatch = fencedMatch[1];
      }

      if (!jsonMatch) {
        const standardMatch = rawText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (standardMatch) jsonMatch = standardMatch[0];
      }

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch);
        return {
          success: true,
          json: Array.isArray(parsed)
            ? { rows: parsed.map(v => (typeof v === 'string' ? { Name: v } : v)) }
            : parsed,
          raw: jsonMatch
        };
      }

      const lines = rawText.split('\n').map(line => line.trim());
      const entityLines = lines.filter(line => /^\d+\.\s+["“]?(.+?)["”]?\s*-\s*(.+)$/.test(line));
      if (entityLines.length) {
        const rows = entityLines.map(line => {
          const [, name, type] = line.match(/^\d+\.\s+["“]?(.+?)["”]?\s*-\s*(.+)$/) || [];
          return name ? { Name: name, Type: type || 'Entity' } : null;
        }).filter(Boolean);

        return { success: true, json: { rows }, raw: rawText };
      }

      throw new Error('No structured entity data found');
    } catch {
      return {
        success: false,
        json: null,
        raw: typeof rawText === 'string' ? rawText : JSON.stringify(rawText, null, 2)
      };
    }
  };

const buildOutput = (parsed, modelUsed) => {
  const isJson = parsed.success;

  if (!isJson || !Array.isArray(parsed?.json?.rows)) {
    return {
      summary: 'No structured entities parsed',
      details: {
        inputLength: text.length,
        modelId: modelUsed,
        entityTypes,
      },
      entities: null,
      entityRaw: null,
    };
  }

  const rows = parsed.json.rows;
  const entityMap = {};
  const entityValues = [];

  for (const row of rows) {
    const type = row?.Type?.trim();
    const value = row?.Name?.trim();
    if (type && value) {
      entityMap[type] = value;
      entityValues.push(value);
    }
  }

  const fileContent = JSON.stringify({ rows }, null, 2);

  return {
    summary: `Entities Extracted: ${Object.entries(entityMap).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'}`,
    details: {
      inputLength: text.length,
      modelId: modelUsed,
      entityTypes,
    },
    entities: entityMap,
    entitiesRaw: entityValues.join(', '),
    aiResult: `Entities Extracted: ${Object.entries(entityMap).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'}`
  };
};

  if (provider === 'bedrock') {
    const bedrock = new BedrockRuntimeClient();

    const command = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt,
        max_gen_len: 512,
        temperature: 0.2,
        top_p: 0.9,
      }),
    });

    const response = await bedrock.send(command);
    const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));
    const resultText = responseBody.generation?.trim() || '{}';

    const parsed = extractJsonFromText(resultText);
    return buildOutput(parsed, modelId);
  }

  throw new Error('Unsupported AI provider');
};

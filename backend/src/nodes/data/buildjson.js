// === File: src/nodes/data/buildjson.js ===

export const handler = async (config, input) => {
  const { fields = [] } = config;

  if (!Array.isArray(fields) || fields.length === 0) {
    throw new Error('No fields specified to build JSON');
  }

  let source;

  // Step 1: Try to parse JSON from base64 file inside input.output
  const fileData = input?.output?.file || input?.file;
  if (typeof fileData === 'string' && fileData.startsWith('data:application/json;base64,')) {
    const base64Match = fileData.match(/^data:application\/json;base64,(.*)$/);
    if (!base64Match) throw new Error('Invalid base64 JSON file format');

    const buffer = Buffer.from(base64Match[1], 'base64');
    try {
      source = JSON.parse(buffer.toString('utf-8'));
    } catch (e) {
      throw new Error('Failed to parse base64 JSON content');
    }
  }

  // Step 2: Fallback to input.json → input.output → input
  if (!source) {
    let candidate = input.json || input || input.output;

    // If input.json is a string, try parsing it
    if (typeof candidate === 'string') {
      try {
        candidate = JSON.parse(candidate);
      } catch (e) {
        throw new Error('Failed to parse input.json string');
      }
    }

    source = candidate;
  }

  if (!source || typeof source !== 'object') {
    throw new Error('Invalid input for building JSON');
  }

  const filtered = {};
  for (const field of fields) {
    if (field in source) {
      filtered[field] = source[field];
    }
  }

  const jsonStr = JSON.stringify(filtered, null, 2); 
  const base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
  const filename = `filteredjson_${Date.now()}.json`;
  const dataUri = `data:application/json;base64,${base64}`;

  return {
    summary: `Built JSON with ${Object.keys(filtered).length} field(s)`,
    details: { fieldsUsed: Object.keys(filtered) },
    json: filtered,
    ...filtered
  };
};

// === File: src/nodes/data/flattenjson.js ===

export const handler = async (config, input) => {
  const sourceJson =
    input?.json ||
    input?.output?.json ||
    (typeof input === 'object' && input) ||
    {};

  if (typeof sourceJson !== 'object' || Array.isArray(sourceJson)) {
    throw new Error('Input must be a non-array JSON object');
  }

  const flatten = (obj, parentKey = '', result = {}) => {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value, newKey, result);
      } else {
        result[newKey] = value;
      }
    }
    return result;
  };

  const flattened = flatten(sourceJson);

  return {
    summary: `✅ Flattened JSON with ${Object.keys(flattened).length} fields`,
    details: flattened,
    output: {
      json: flattened,
    },
  };
};

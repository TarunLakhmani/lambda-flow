// === File: src/nodes/data/extractfield.js ===

export const handler = async (config, input) => {
  const { fieldPath } = config;

  if (!fieldPath || typeof fieldPath !== 'string') {
    throw new Error('Missing or invalid config: fieldPath');
  }

  const sourceJson =
        input?.output?.json && typeof input.output.json === 'object'
            ? input.output.json
            : input?.json && typeof input.json === 'object'
                ? input.json
                : input?.output && typeof input.output === 'object'
                    ? input.output
                    : typeof input === 'object'
                        ? input
                        : {};

  const pathParts = fieldPath.split('.');
  let value = sourceJson;

  for (const part of pathParts) {
    if (value && typeof value === 'object') {
      value = value[part];
    } else {
      value = undefined;
      break;
    }
  }

  return {
    summary: `✅ Extracted "${fieldPath}"`,
    details: value,
    output: value,
  };
};

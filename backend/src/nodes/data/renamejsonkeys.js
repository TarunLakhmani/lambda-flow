import _ from 'lodash';  // Correct CommonJS import handling

export const handler = async (config, input) => {
  let mapping;

  try {
    mapping = JSON.parse(config.mapping);
  } catch (err) {
    throw new Error(`Config 'mapping' must be a valid JSON string. Error: ${err.message}`);
  }

  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) {
    throw new Error('Parsed mapping must be a JSON object like {"newKey": "json.rows[0].Summary"}');
  }

  const renamedJson = {};
  const errors = {};

  for (const [newKey, pathExpression] of Object.entries(mapping)) {
    const value = _.get(input, pathExpression); // ✅ Use lodash.get safely
    if (value === undefined) {
      renamedJson[newKey] = null;
      errors[newKey] = `⚠ Path not found: ${pathExpression}`;
    } else {
      renamedJson[newKey] = value;
    }
  }

  return {
    summary: `✅ Extracted ${Object.keys(mapping).length} field(s)` +
             (Object.keys(errors).length ? `, ${Object.keys(errors).length} missing` : ''),
    details: {
      mapping,
      result: renamedJson,
      errors: Object.keys(errors).length ? errors : undefined,
    },
    ...renamedJson,
    json: renamedJson,
  };
};

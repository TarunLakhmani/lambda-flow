// === File: src/nodes/integrations/graphqlrequest.js ===

import axios from 'axios';

export const handler = async (config, input) => {
  const { endpoint } = config;
  let { operation, fields, filters } = input;

  if (!endpoint || !operation || !fields) {
    throw new Error('Missing endpoint, operation, or fields');
  }

  // Convert "code, name, capital" => ["code", "name", "capital"]
  const fieldList = fields.split(',').map(f => f.trim());

  // Safely parse filters from string to object
  try {
    filters = new Function('return ' + filters)(); // Parses "{continent: 'AS'}"
  } catch (err) {
    throw new Error('Invalid filters format. Expected a JS-style object string.');
  }

  // Generate GraphQL variable definitions and filter expression
  let variableDefs = '';
  let filterString = '';
  let variables = {};

  if (filters && Object.keys(filters).length > 0) {
    variableDefs = Object.keys(filters)
      .map(key => `$${key}: String`)
      .join(', ');

    const filterObject = Object.keys(filters)
      .map(key => `${key}: { eq: $${key} }`)
      .join(', ');

    filterString = `(filter: { ${filterObject} })`;
    variables = { ...filters };
  }

  // Compose final query string
  const query = `
    query ${variableDefs ? `(${variableDefs})` : ''} {
      ${operation} ${filterString} {
        ${fieldList.join('\n')}
      }
    }
  `;

  try {
    const response = await axios.post(endpoint, {
      query,
      variables,
    });

    return {
      summary: '✅ GraphQL request succeeded',
      details: response.data,
      output: response.data,
    };
  } catch (err) {
    return {
      summary: '❌ GraphQL request failed',
      details: {
        error: err.message,
        response: err.response?.data,
      },
      output: null,
    };
  }
};

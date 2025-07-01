// === File: src/nodes/integrations/crmsync.js ===

import axios from 'axios';

export const handler = async (config, input) => {
  const { apiKey, endpoint = 'https://api.hubapi.com/crm/v3/objects/contacts' } = config;
  const data = input?.data;

  if (!apiKey || !data) throw new Error('Missing apiKey or data');

  try {
    const response = await axios.post(endpoint, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return {
      summary: '✅ CRM sync successful',
      details: response.data,
      output: response.data,
    };
  } catch (err) {
    return {
      summary: '❌ CRM sync failed',
      details: {
        error: err.message,
        response: err.response?.data,
      },
      output: null,
    };
  }
};

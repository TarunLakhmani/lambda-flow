// === File: src/nodes/integrations/httprequest.js ===

import axios from 'axios';

export const handler = async (config, input) => {
  const { url, method = 'GET', headers = {} } = config;
  const body = input?.body;

  if (!url) throw new Error('Missing URL in config');

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: body,
    });

    return {
      summary: `✅ ${method} request to ${url} succeeded`,
      details: response.data,
      output: response.data,
      json: response.data,
    };
  } catch (err) {
    return {
      summary: `❌ HTTP request failed`,
      details: {
        error: err.message,
        response: err.response?.data,
      },
      output: null,
    };
  }
};

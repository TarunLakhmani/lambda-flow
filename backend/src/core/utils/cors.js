// === File: src/core/utils/cors.js ===

exports.corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.preflightResponse = {
  statusCode: 200,
  headers: exports.corsHeaders,
  body: '',
};

// === File: src/nodes/data/jsontocsv.js ===

import { stringify } from 'csv-stringify/sync';

export const handler = async (config, input) => {
  let json = input.json || input.row || input?.output?.json || input?.output?.rows || input?.rows || input?.output;

  if (!json) throw new Error('Missing input JSON');

  // Support single JSON object by wrapping in array
  if (!Array.isArray(json)) {
    if (typeof json === 'object') {
      json = [json];
    } else {
      throw new Error('Input must be a JSON object or array of JSON objects');
    }
  }

  if (json.length === 0) {
    throw new Error('Input JSON array is empty');
  }

  // Determine CSV fields: use config.fields if provided, else all keys from first object
  const fields = Array.isArray(config.fields) && config.fields.length > 0
    ? config.fields
    : Object.keys(json[0]);

  const csv = stringify(json, {
    header: false,
    columns: fields,
  });

  const base64 = Buffer.from(csv, 'utf-8').toString('base64');
  const filename = `converted_${Date.now()}.csv`;
  const dataUri = `data:text/csv;base64,${base64}`;

  return {
    summary: `Converted ${json.length} JSON object(s) to CSV`,
    details: {
      fields,
      rowCount: json.length,
      filename,
    },
    file: dataUri,
    base64,
    filename,
    text: csv,
  };
};

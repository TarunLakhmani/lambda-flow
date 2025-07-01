// === File: src/nodes/data/parsecsv.js ===

import { parse } from 'csv-parse/sync';

export const handler = async (config, input) => {
  let csvText = input.text || input?.details?.text;

  const fileData = input.file || input?.details?.file;
  let filename = input.filename || input?.details?.filename || 'parsed.csv';
  if (!csvText && fileData?.startsWith('data:')) {
    const base64Match = fileData.match(/^data:.*?;base64,(.*)$/);
    if (!base64Match) throw new Error('Invalid base64 file format');
    const buffer = Buffer.from(base64Match[1], 'base64');
    csvText = buffer.toString('utf-8');
  }


  if (!csvText) throw new Error('Missing CSV text input');

  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  const jsonOutput = JSON.stringify(records, null, 2);
  const base64 = Buffer.from(jsonOutput, 'utf8').toString('base64');
  const dataUri = `data:application/json;base64,${base64}`;
  return {
    summary: `Parsed ${records.length} row(s) from CSV`,
    details: { rowCount: records.length, filename },
    rows: records,
    filename: filename.replace(/\.csv$/, '.json'),
    file: dataUri,
    base64,
    json: records,
  };
};
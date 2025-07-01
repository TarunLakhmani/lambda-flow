// === File: src/nodes/file/writefile.js ===

import fs from 'fs/promises';
import path from 'path';

const mimeToExt = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/json': 'json',
  'text/csv': 'csv',
  // Extend as needed
};

export const handler = async (config, input) => {
  // Extract base64/text from various locations
  let base64 = input.base64 || input?.output?.base64;
  let text = input.text || input?.output?.text;
  let filename = input.filename || input?.output?.filename;
  let mimeType = null;

  const fileData = input.file || input?.details?.file || input?.output?.file;

  // Case: file provided as data URI
  if (fileData?.startsWith('data:')) {
    const base64Match = fileData.match(/^data:(.*?);base64,(.*)$/);
    if (!base64Match) throw new Error('Invalid base64 file format');

    mimeType = base64Match[1];
    base64 = base64 || base64Match[2];

    if (!filename) {
      const ext = mimeToExt[mimeType] || 'bin';
      filename = `output_${Date.now()}.${ext}`;
    }
  }

  // Case: fallback to converting plain text to base64
  if (!base64 && text) {
    base64 = Buffer.from(text, 'utf-8').toString('base64');
    mimeType = 'text/plain';
    if (!filename) {
      filename = `output_${Date.now()}.txt`;
    }
  }

  if (!base64) {
    throw new Error('Missing base64 or text content to write');
  }

  const outputDir = config.outputDir || './output';
  await fs.mkdir(outputDir, { recursive: true });

  const filePath = path.join(outputDir, filename);
  const buffer = Buffer.from(base64, 'base64');
  await fs.writeFile(filePath, buffer);

  return {
    status: 'success',
    summary: `File saved to ${filePath}`,
    details: {
      path: filePath,
      size: buffer.length,
      filename,
      outputDir,
      mimeType: mimeType || 'unknown',
    },
  };
};

// === File: src/nodes/file/appendtofile.js ===

import fs from 'fs/promises';
import path from 'path';

const allowedExtensions = ['txt', 'csv', 'json'];

export const handler = async (config, input) => {
  let base64 = input.base64 || input?.output?.base64;
  let text = input.text || input?.output?.text;
  let filename = input.filename || input?.output?.filename;

  if (!filename) {
    throw new Error('Filename is required to append content');
  }

  const ext = filename.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    throw new Error(`Appending is only supported for .txt, .csv, and .json files`);
  }

  // Convert text to base64 if needed
  if (!base64 && text) {
    base64 = Buffer.from(text, 'utf-8').toString('base64');
  }

  if (!base64) {
    throw new Error('Missing base64 or text content to append');
  }

  const outputDir = config.outputDir || './output';
  await fs.mkdir(outputDir, { recursive: true });

  const filePath = path.join(outputDir, filename);
  const buffer = Buffer.from(base64, 'base64');

  await fs.appendFile(filePath, buffer);

  return {
    status: 'success',
    summary: `Appended to file: ${filePath}`,
    details: {
      path: filePath,
      size: buffer.length,
      filename,
      outputDir,
    },
  };
};

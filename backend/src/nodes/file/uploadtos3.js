// === File: src/nodes/file/uploadtos3.js ===

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const mimeToExt = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'text/plain': 'txt',
  'application/json': 'json',
  'text/csv': 'csv',
  'text/html': 'html',
};

function renderKeyTemplate(template, entities) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, expression) => {
    const [rawKey, fallback] = expression.split('||').map(s => s.trim());
    const value = entities?.[rawKey];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    if (fallback) {
      return fallback.replace(/^['"]|['"]$/g, '');
    }
    return 'unknown';
  });
}

export const handler = async (config, input) => {
  const {
    bucket,
    keyPrefix = '',
    key: customKey,
  } = config;

  const s3Client = new S3Client();

  let base64 = input.base64 || input?.output?.base64;
  let text = input.text || input?.output?.text;
  let html = input.html || input?.output?.html;
  let filename = input.filename || input?.output?.filename;
  let mimeType = null;

  const fileData = input.file || input?.details?.file || input?.output?.file;

  // Priority 1: Base64 file
  if (fileData?.startsWith('data:')) {
    const base64Match = fileData.match(/^data:(.*?);base64,(.*)$/);
    if (!base64Match) throw new Error('Invalid base64 file format');

    mimeType = base64Match[1];
    base64 = base64 || base64Match[2];

    if (!filename) {
      const ext = mimeToExt[mimeType] || 'bin';
      filename = `uploaded_${Date.now()}.${ext}`;
    }
  }

  // Priority 2: HTML content
  if (!base64 && html && typeof html === 'string') {
    base64 = Buffer.from(html, 'utf-8').toString('base64');
    mimeType = 'text/html';
    if (!filename) {
      filename = `uploaded_${Date.now()}.html`;
    }
  }

  // Priority 3: Plain text
  if (!base64 && text && typeof text === 'string') {
    base64 = Buffer.from(text, 'utf-8').toString('base64');
    mimeType = 'text/plain';
    if (!filename) {
      filename = `uploaded_${Date.now()}.txt`;
    }
  }

  if (!base64) {
    throw new Error('Missing file, html, or text content to upload');
  }

  const buffer = Buffer.from(base64, 'base64');

  let key;
  if (customKey) {
    try {
      key = renderKeyTemplate(customKey, input.entities || {});
    } catch (err) {
      throw new Error(`Error rendering key template: ${err.message}`);
    }
  } else {
    key = `${keyPrefix}${filename}`;
  }

  const uploadParams = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType || 'application/octet-stream',
  };

  await s3Client.send(new PutObjectCommand(uploadParams));

  return {
    status: 'success',
    summary: `File uploaded to s3://${bucket}/${key}`,
    bucket,
    key,
    details: {
      size: buffer.length,
      filename,
      mimeType,
    },
  };
};

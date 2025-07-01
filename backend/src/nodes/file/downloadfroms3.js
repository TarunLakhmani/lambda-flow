// === File: src/nodes/file/downloadfroms3.js ===
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const mimeTextTypes = [
  'application/json',
  'text/plain',
  'text/csv',
  'text/html',
  'application/xml',
  'application/javascript',
  'application/x-www-form-urlencoded',
];

// Helper to convert stream to buffer
const streamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
};

export const handler = async (config, input) => {
  const key =
    config.key ||
    input.key ||
    input.row?.key ||
    input?.details?.row?.key;

  const bucket =
    config.bucket ||
    input.bucket ||
    input.row?.bucket ||
    input?.details?.row?.bucket ||
    input?.details?.bucket;

  if (!bucket || !key) {
    throw new Error(`Missing required S3 bucket or key.\nResolved: bucket=${bucket}, key=${key}`);
  }

  const s3 = new S3Client();

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3.send(command);

  const buffer = await streamToBuffer(response.Body);
  const mimeType = response.ContentType || 'application/octet-stream';

  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;
  const isText = mimeTextTypes.includes(mimeType);
  const text = isText ? buffer.toString('utf8') : undefined;

  const filename = key.split('/').pop();

  return {
    summary: `Downloaded ${filename} from s3://${bucket}/${key}`,
    details: {
      bucket,
      key,
      mimeType,
      size: buffer.length,
      filename,
      file: dataUri,
      ...(text && { text }),
    },
    base64,
    file: dataUri,
    filename,
    ...(text && { text }),
  };
};

// === File: src/nodes/file/lists3files.js ===

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const handler = async (config) => {
  const {
    bucket,
    prefix = '',
  } = config;

  const s3 = new S3Client();

  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const response = await s3.send(command);

    const fileKeys = (response.Contents || [])
      .filter(obj => obj.Size > 0)
      .map(obj => ({
        key: obj.Key,
        bucket
      }));

    return {
      summary: `${fileKeys.length} file(s) found in s3://${bucket}/${prefix}`,
      details: {
        bucket,
        prefix,
        count: fileKeys.length,
      },
      fileKeys,
    };
  } catch (err) {
    throw new Error(`Failed to list S3 files: ${err.message}`);
  }
};

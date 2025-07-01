// === File: src/nodes/file/scandynamodb.js ===

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async (config, input) => {
  const { tableName } = config;

  if (!tableName) {
    throw new Error('Missing required config: tableName');
  }

  const filterJson =
    input?.output?.json && typeof input.output.json === 'object'
      ? input.output.json
      : {};

  if (!Object.keys(filterJson).length) {
    throw new Error('No filter keys provided in input.output.json');
  }

  const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

  try {
    const scanCommand = new ScanCommand({ TableName: tableName });
    const result = await client.send(scanCommand);

    let items = result.Items?.map(unmarshall) || [];

    // Apply filtering
    items = items.filter(item =>
      Object.entries(filterJson).every(([k, v]) => item[k] === v)
    );

    return {
      summary: `✅ ${items.length} item(s) matched in "${tableName}"`,
      details: items,
      output: { items },
    };
  } catch (err) {
    return {
      summary: '❌ Scan failed',
      details: err.message,
      output: null,
    };
  }
};

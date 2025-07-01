// === File: src/nodes/file/getitem.js ===

import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

export const handler = async (config, input) => {
  const { tableName } = config;
  const key = input.json || input.output?.json;

  if (!tableName || !key) {
    throw new Error('Missing tableName or key');
  }

  const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

  const command = new GetItemCommand({
    TableName: tableName,
    Key: marshall(key),
  });

  try {
    const result = await client.send(command);
    const item = result.Item ? unmarshall(result.Item) : null;

    return {
      summary: item ? `✅ Item retrieved from "${tableName}"` : '⚠️ Item not found',
      details: item,
      output: item,
    };
  } catch (err) {
    return {
      summary: '❌ Failed to get item from DynamoDB',
      details: err.message,
      output: null,
    };
  }
};

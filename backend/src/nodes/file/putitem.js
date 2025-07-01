// === File: src/nodes/file/putitem.js ===

import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

export const handler = async (config, input) => {
  const { tableName } = config;
  const item = input.json || input.output?.json;

  if (!tableName || !item || typeof item !== 'object') {
    throw new Error('Missing or invalid tableName or item');
  }

  const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-south-1' });

  const command = new PutItemCommand({
    TableName: tableName,
    Item: marshall(item),
  });

  try {
    await client.send(command);
    return {
      summary: `✅ Item inserted into "${tableName}"`,
      details: item,
      output: item,
    };
  } catch (err) {
    return {
      summary: '❌ Failed to insert item into DynamoDB',
      details: err.message,
      output: null,
    };
  }
};

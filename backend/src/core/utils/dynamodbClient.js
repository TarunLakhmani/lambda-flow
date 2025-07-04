// === File: src/core/utils/dynamodbClient.js ===

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
});

export const ddbDocClient = DynamoDBDocumentClient.from(client);

// === File: src/nodes/triggers/dynamodbtrigger.js ===

export const handler = async (config, input) => {
  const records = input?.Records || [];

  const parsed = records.map((record) => ({
    eventName: record.eventName,
    tableName: record.eventSourceARN?.split('/')[1] || 'Unknown',
    keys: record.dynamodb?.Keys || {},
    newImage: record.dynamodb?.NewImage || null,
    oldImage: record.dynamodb?.OldImage || null,
    eventID: record.eventID,
    approxCreationDateTime: record.dynamodb?.ApproximateCreationDateTime,
  }));

  return {
    summary: 'Triggered by DynamoDB event',
    details: parsed,
    output: parsed,
  };
};

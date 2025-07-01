// === File: src/nodes/triggers/s3trigger.js ===

export const handler = async (config, input) => {
  // S3 EventBridge/SNS sends a list of Records
  const records = input?.Records || [];

  const parsed = records.map(record => ({
    eventName: record.eventName,
    bucket: record.s3?.bucket?.name,
    key: decodeURIComponent(record.s3?.object?.key || ''),
    size: record.s3?.object?.size,
    time: record.eventTime,
  }));

  return {
    summary: 'Triggered by S3 event',
    details: parsed,
    output: parsed,
  };
};

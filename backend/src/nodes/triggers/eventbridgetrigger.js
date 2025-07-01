// === File: src/nodes/triggers/eventbridgetrigger.js ===

export const handler = async (config, input) => {
  return {
    summary: `Triggered by EventBridge`,
    details: {
      source: input.source,
      detailType: input['detail-type'],
      time: input.time,
      id: input.id,
    },
    output: input.detail,
  };
};

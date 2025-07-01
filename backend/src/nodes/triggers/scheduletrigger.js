// === File: src/nodes/triggers/scheduletrigger.js ===

export const handler = async (config, input) => {
  const { cron } = config || {};

  return {
    summary: `Scheduled trigger invoked`,
    details: {
      cron,
      triggeredAt: new Date().toISOString(),
    },
    output: input || {}, // pass through input
  };
};

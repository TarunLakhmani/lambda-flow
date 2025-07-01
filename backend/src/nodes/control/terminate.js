// === File: src/nodes/control/terminate.js ===

export const handler = async (config) => {
  const message = config.message || 'Workflow terminated intentionally.';

  return {
    summary: '🛑 Workflow terminated',
    details: {
      message,
      terminatedAt: new Date().toISOString(),
    },
    terminate: true,
  };
};

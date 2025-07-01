// === File: src/nodes/control/delay.js ===

export const handler = async (config, input) => {
  const MAX_DELAY_MS = 5000;
  const duration = parseInt(config.duration, 10);

  if (isNaN(duration) || duration < 0) {
    throw new Error('Invalid delay duration. Please provide a positive number in milliseconds.');
  }

  if (duration > MAX_DELAY_MS) {
    throw new Error(`Configured delay (${duration} ms) exceeds the Lambda-safe limit of ${MAX_DELAY_MS} ms.`);
  }

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const start = Date.now();
  await delay(duration);
  const end = Date.now();

  return {
    summary: `⏱️ Waited for ${duration} ms`,
    details: {
      requestedDelay: duration,
      actualDelay: end - start,
      startedAt: new Date(start).toISOString(),
      endedAt: new Date(end).toISOString(),
    },
    output: input.output,
  };
};

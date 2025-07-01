// === File: src/lambdas/categories/control.js ===
export const handler = async (event) => {
  const { nodeType, config, input } = event;
  const parts = nodeType.split('/');
  const nodeName = parts.length === 1 ? parts[0] : parts[1];
  try {
    console.log(`🧠 Executing ${nodeType}`);
    const module = await import(`../../nodes/control/${nodeName}.js`);
    const result = await module.handler(config, input);

    return {
      success: result?.success !== false,
      summary: result.summary || 'Executed successfully',
      details: result.details || {},
      output: result.output ?? result,
    };
  } catch (err) {
    console.error(`❌ Error in ${nodeType}:`, err);
    return {
      success: false,
      summary: err.message,
      details: { message: err.message, stack: err.stack },
      output: null,
    };
  }
};
// src/lambdas/categories/data.js

export const handler = async (event) => {
  const { nodeType, config, input } = event;
  const parts = nodeType.split('/');
  const nodeName = parts.length === 1 ? parts[0] : parts[1];
  try {
    console.log(`🧠 Executing ${nodeType}`);

    if (nodeName === 'customdatatransformation') {
      const { userCode } = config;
      if (!userCode) throw new Error('Missing user code');

      const userFunction = new Function('config', 'input', userCode);
      const result = await userFunction(config, input);

      return {
        summary: 'Custom data transformation executed successfully',
        details: { userCode },
        output: result,
      };
    }

    const module = await import(`../../nodes/data/${nodeName}.js`);
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
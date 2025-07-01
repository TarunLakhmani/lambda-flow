// === File: src/nodes/control/condition.js ===

export const handler = async (config, input) => {
    const { expression } = config;

    if (!expression || typeof expression !== 'string') {
        throw new Error('Missing or invalid expression in config');
    }

    // Dynamically extract possible JSON context
    const evalContext = typeof input === 'object' ? input : {};

    try {
        // Dynamically create and execute a function with destructured context
        const isMatch = Function(
            ...Object.keys(evalContext),
            `return (${expression});`
        )(...Object.values(evalContext));

        return isMatch
            ? {
                summary: `✅ Condition met: ${expression}`,
                details: { expression, passed: true },
                output: input,
            }
            : {
                summary: `❌ Condition failed: ${expression}`,
                details: { expression, passed: false },
                skip:true
            };
    } catch (err) {
        return {
            summary: `⚠️ Condition evaluation error`,
            details: {
                error: err.message,
                expression,
                evaluatedOn: evalContext,
            },
            skip:true
        };
    }
};

// === File: src/nodes/data/mergejson.js ===

const cache = new Map();

export const handler = async (config, input) => {
    const expectedCount = parseInt(config.expectedCount || '2', 10);
    const timeoutMs = parseInt(config.timeoutMs || '5000', 10);

    if (isNaN(expectedCount) || expectedCount < 1) {
        throw new Error('Expected count must be a valid number ≥ 1');
    }

    if (isNaN(timeoutMs) || timeoutMs < 0 || timeoutMs > 5000) {
        throw new Error('Timeout must be a number between 0 and 5000 ms');
    }

    const contextId = input.__contextId || 'default';
    const nodeId = input.__nodeId || 'unknown';
    const cacheKey = `${nodeId}::${contextId}`;

    const incomingJson = input?.json || input?.output?.json;
    if (typeof incomingJson !== 'object') {
        throw new Error('Input json must be an object');
    }

    if (!cache.has(cacheKey)) {
        cache.set(cacheKey, []);
    }

    const jsonList = cache.get(cacheKey);
    jsonList.push(incomingJson);

    if (jsonList.length >= expectedCount) {
        cache.delete(cacheKey);
        const merged = Object.assign({}, ...jsonList);
        return {
            summary: `✅ Merged ${expectedCount} JSONs`,
            details: { jsonList, merged },
            output: { json: merged },
        };
    }

    // Wait up to timeout for remaining inputs
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (cache.get(cacheKey)?.length >= expectedCount) {
            const collected = cache.get(cacheKey);
            cache.delete(cacheKey);
            const merged = Object.assign({}, ...collected);
            return {
                summary: `✅ Merged ${expectedCount} JSONs (waited)`,
                details: { jsonList: collected, merged },
                output: { json: merged },
            };
        }
    }

    // Timeout reached
    cache.delete(cacheKey);
    return {
        summary: `❌ Timeout: Only received ${jsonList.length} of ${expectedCount} JSONs`,
        details: { received: jsonList.length, expected: expectedCount, inputs: jsonList },
        output: null,
        error: true,
    };
};

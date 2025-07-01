// === File: nodes/triggers/apigatewaytrigger.js ===

export const handler = async (config, input) => {
    let parsedBody;

    try {
        parsedBody = input?.body ? JSON.parse(input.body) : {};
    } catch (err) {
        return {
            summary: 'Invalid JSON in body',
            details: {
                error: err.message,
            },
            output: input,
        };
    }

    return {
        summary: 'Triggered via API Gateway',
        details: {
            headers: input.headers || {},
            method: input.method || 'POST',
        },
        output: parsedBody || input,
    };
};

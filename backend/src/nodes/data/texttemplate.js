// === File: src/nodes/data/texttemplate.js ===

export const handler = async (config, input) => {
    const { template } = config;

    if (!template || typeof template !== 'string') {
        throw new Error('Missing or invalid template in config');
    }

    // Simple {{key}} interpolation
    const rendered = template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
        const value = key.split('.').reduce((acc, part) => acc?.[part], input);
        return value !== undefined ? value : '';
    });

    return {
        summary: 'Template rendered successfully',
        details: {
            originalTemplate: template,
        },
        output: {
            html: rendered,
        },
    };
};

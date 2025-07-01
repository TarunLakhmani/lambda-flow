// === File: src/nodes/utility/mockdata.js ===

import { faker } from '@faker-js/faker';

/**
 * Generates `count` mock objects based on a user‐provided schema.
 * config.schema may be an object or a JSON string.
 * config.count must be a positive integer (default: 1).
 */
export const handler = async (config, input) => {
    let { schema, count = 1 } = config;

    // Parse count
    count = Number(count);
    if (!Number.isInteger(count) || count < 1) {
        throw new Error('config.count must be a positive integer');
    }

    // If schema is a string, try to parse it
    if (typeof schema === 'string') {
        try {
            schema = JSON.parse(schema);
        } catch (err) {
            throw new Error(`Invalid JSON for schema: ${err.message}`);
        }
    }

    if (!schema || typeof schema !== 'object') {
        throw new Error('Missing or invalid schema in config.schema');
    }

    // Recursive generator
    const generate = (spec) => {
        if (typeof spec === 'object') {
            const nested = {};
            for (const [k, v] of Object.entries(spec)) {
                nested[k] = generate(v);
            }
            return nested;
        }

        // Trim, split into path + params
        const trimmed = spec.trim();
        const [path, paramStr] = trimmed.split('|');
        const [provider, method] = path.split('.');
        const fakerFn = faker[provider]?.[method];
        if (typeof fakerFn !== 'function') {
            throw new Error(`Unknown faker function: \`${path}\``);
        }

        if (paramStr) {
            const args = paramStr.split(',').map((s) => {
                const n = Number(s);
                return isNaN(n) ? s : n;
            });
            // Special case for number
            if (provider === 'datatype' && method === 'number' && args.length === 2) {
                return fakerFn({ min: args[0], max: args[1] });
            }
            return fakerFn(...args);
        }

        return fakerFn();
    };

    // Generate `count` records
    const records = [];
    for (let i = 0; i < count; i++) {
        const obj = {};
        for (const [key, spec] of Object.entries(schema)) {
            obj[key] = generate(spec);
        }
        records.push(obj);
    }

    return {
        summary: `Generated ${count} mock record${count > 1 ? 's' : ''}`,
        details: { schema, count },
        output: records,
    };
};

// === File: src/nodes/utility/generateuuid.js ===

import { randomUUID } from 'crypto';
import { customAlphabet } from 'nanoid';
import { nanoid } from 'nanoid';
import cuid from 'cuid';

export const handler = async (config = {}) => {
  const {
    key = 'id',
    type = 'uuid', // Options: uuid, nanoid, cuid, custom
    customLength = 12, // used for custom only
  } = config;

  if (!key || typeof key !== 'string') {
    throw new Error('Missing or invalid config: key must be a non-empty string');
  }

  let id;

  switch (type) {
    case 'uuid':
      id = randomUUID();
      break;

    case 'nanoid':
      id = nanoid();
      break;

    case 'cuid':
      id = cuid();
      break;

    case 'custom':
      const length = Math.max(4, Math.min(customLength, 64)); // limit to 4-64 chars
      const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      const custom = customAlphabet(alphabet, length);
      id = custom();
      break;

    default:
      throw new Error(`Invalid type: ${type}. Use 'uuid', 'nanoid', 'cuid', or 'custom'`);
  }

  return {
    summary: `✅ Generated ${type.toUpperCase()} with key '${key}'`,
    output: {
      [key]: id,
    },
  };
};

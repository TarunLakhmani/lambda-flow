// === File: src/nodes/control/loopforeach.js ===

export const handler = async (config, input) => {
  let list = input.list || input?.fileKeys || input?.output?.fileKeys || input?.rows || input?.output?.rows || input?.output;

  // Auto-handle nested output structures (like from List S3 Files)
  if (!Array.isArray(list)) {
    throw new Error('Input is not a valid array for iteration. Expected input.list or output.fileKeys to be an array.');
  }

  const iterator = config.iterator || 'row';

  const iterations = list.map((item, index) => ({
    [iterator]: item,
    index,
  }));

  return {
    summary: `Loop prepared for ${iterations.length} item(s) using iterator "${iterator}"`,
    details: {
      iterator,
      itemCount: iterations.length,
    },
    branches: iterations,
    iterations
  };
};

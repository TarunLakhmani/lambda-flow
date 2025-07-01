// esbuild.config.js
import { build } from 'esbuild';

build({
  entryPoints: [
    'src/lambdas/orchestrator/index.js',
    'src/lambdas/nodes/classifyText.js',
    // Add more node handlers here as needed
  ],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: true,
  external: ['aws-sdk'], // exclude if using Lambda's built-in AWS SDK
  minify: false,
  logLevel: 'info',
});

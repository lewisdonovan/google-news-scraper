import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import json from '@rollup/plugin-json';

export default {
  input: 'src/index.ts', // Entry point of your package
  output: {
    dir: 'dist', // Change from 'file' to 'dir' to handle multiple chunks.
    format: 'cjs', // You can adjust for your needs.
    sourcemap: true,
  },
  plugins: [
    json(),       // Handles JSON imports
    resolve({ preferBuiltins: false }),
    typescript({ tsconfig: './tsconfig.json' }), // Compiles TypeScript
    terser(), // Minifies the output bundle for production
    commonjs({ context: "global" }),
  ],
};
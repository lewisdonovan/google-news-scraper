import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import del from 'rollup-plugin-delete';
import terser from '@rollup/plugin-terser';

export default {
  input: './dist/tsc/index.js', // Change to compiled JavaScript from tsc
  output: [
    {
      dir: './dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: false,
      entryFileNames: '[name].mjs',
    },
    {
      dir: './dist/esm/min',
      format: 'esm',
      plugins: [terser()],
      sourcemap: true,
      entryFileNames: '[name].min.mjs',
    },
    {
      dir: './dist/cjs',
      format: 'cjs',
      sourcemap: false,
      exports: 'auto',
      entryFileNames: '[name].js',
    },
    {
      dir: './dist/cjs/min',
      format: 'cjs',
      plugins: [terser()],
      sourcemap: true,
      exports: 'auto',
      entryFileNames: '[name].min.js',
    },
  ],
  plugins: [
    del({ targets: ['./dist/esm/*', './dist/cjs/*'] }),
    resolve(),
    commonjs(),
    json(),
  ],
  external: ['puppeteer', 'cheerio', 'jsdom', 'winston'],
};
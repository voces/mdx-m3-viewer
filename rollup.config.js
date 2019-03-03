
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/parsers/w3x/index.js',
  output: {
    file: 'dist/bundle.mjs',
    format: 'esm',
  },
  plugins: [
    resolve({module: true}),
  ],
};

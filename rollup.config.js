import resolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/react-from-text.min.js',
    format: 'esm',
  },
  external: ['invariant', 'react', 'sprintf-js'],
  plugins: [
    resolve(),
    replace({
      'process.env.NODE_ENV': '"production"',
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    terser(),
  ],
};

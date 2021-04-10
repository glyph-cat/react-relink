import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'

const INPUT_FILE = 'src/index.js'
const EXTERNAL_LIBS = ['react', 'react-dom', 'fast-copy', 'react-fast-compare']

const UMD_GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'fast-copy': 'fastCopy',
  'react-fast-compare': 'isEqual',
}

/**
 * @param {object} config
 * @param {object} config.overrides
 * @param {'development'|'production'} config.mode
 * @returns {Array}
 */
function getPlugins({ overrides = {}, mode }) {
  const basePlugins = {
    babel: babel({
      presets: ['@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-optional-chaining'],
      exclude: '**/node_modules/**',
      babelHelpers: 'bundled',
    }),
    nodeResolve: nodeResolve(),
    commonjs: commonjs(),
    replace: replace({ 'process.env.NODE_ENV': JSON.stringify(mode) }),
  }
  for (const overrideKey in overrides) {
    basePlugins[overrideKey] = overrides[overrideKey]
  }
  const pluginStack = []
  for (const i in basePlugins) {
    pluginStack.push(basePlugins[i])
  }
  if (mode === 'production') {
    const terserPlugin = terser({ mangle: { properties: { regex: /^M\$/ } } })
    pluginStack.push(terserPlugin)
  }
  return pluginStack
}

const config = [
  {
    // CommonJS
    input: INPUT_FILE,
    output: {
      file: 'dist/cjs/index.js',
      format: 'cjs',
      exports: 'named',
    },
    external: EXTERNAL_LIBS,
    plugins: getPlugins({ mode: 'development' }),
  },
  {
    // EcmaScript
    input: INPUT_FILE,
    output: {
      file: 'dist/es/index.js',
      format: 'es',
      exports: 'named',
    },
    external: EXTERNAL_LIBS,
    plugins: getPlugins({ mode: 'development' }),
  },
  {
    // EcmaScript (Production)
    input: INPUT_FILE,
    output: {
      file: 'dist/es/index.mjs',
      format: 'es',
      exports: 'named',
    },
    external: EXTERNAL_LIBS,
    plugins: getPlugins({ mode: 'production' }),
  },
  {
    // React Native
    input: INPUT_FILE,
    output: {
      file: 'dist/native/index.js',
      format: 'es',
      exports: 'named',
    },
    external: [...EXTERNAL_LIBS, 'react-native'],
    plugins: getPlugins({
      mode: 'development',
      overrides: {
        nodeResolve: nodeResolve({
          extensions: ['.native.js', '.js'],
        }),
      },
    }),
  },
  {
    // UMD
    input: INPUT_FILE,
    output: {
      file: 'dist/umd/index.js',
      format: 'umd',
      name: 'Relink',
      exports: 'named',
      globals: UMD_GLOBALS,
    },
    external: EXTERNAL_LIBS,
    plugins: getPlugins({ mode: 'development' }),
  },
  {
    // UMD (Production)
    input: INPUT_FILE,
    output: {
      file: 'dist/umd/index.min.js',
      format: 'umd',
      name: 'Relink',
      exports: 'named',
      globals: UMD_GLOBALS,
    },
    external: EXTERNAL_LIBS,
    plugins: getPlugins({ mode: 'production' }),
  },
]

export default config

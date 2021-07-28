import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'

const INPUT_FILE = 'src/index.js'
const EXTERNAL_LIBS_BASE = ['react', 'fast-copy', 'react-fast-compare']
const EXTERNAL_LIBS_DOM = [...EXTERNAL_LIBS_BASE, 'react-dom']
const EXTERNAL_LIBS_RN = [...EXTERNAL_LIBS_BASE, 'react-native']

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
function getPlugins({ overrides = {}, mode } = {}) {
  const basePlugins = {
    babel: babel({
      presets: ['@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-optional-chaining'],
      exclude: '**/node_modules/**',
      babelHelpers: 'bundled',
    }),
    nodeResolve: nodeResolve(),
    commonjs: commonjs(),
  }
  for (const overrideKey in overrides) {
    basePlugins[overrideKey] = overrides[overrideKey]
  }
  const pluginStack = []
  for (const i in basePlugins) {
    // Allows plugins to be excluded by replacing them with falsey values
    if (basePlugins[i]) {
      pluginStack.push(basePlugins[i])
    }
  }
  if (mode) {
    pluginStack.push(replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(mode),
      },
    }))
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
    external: EXTERNAL_LIBS_DOM,
    plugins: getPlugins(),
  },
  {
    // EcmaScript
    input: INPUT_FILE,
    output: {
      file: 'dist/es/index.js',
      format: 'es',
      exports: 'named',
    },
    external: EXTERNAL_LIBS_DOM,
    plugins: getPlugins(),
  },
  {
    // EcmaScript for browsers
    input: INPUT_FILE,
    output: {
      file: 'dist/es/index.mjs',
      format: 'es',
      exports: 'named',
    },
    external: EXTERNAL_LIBS_DOM,
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
    external: [...EXTERNAL_LIBS_RN, 'react-native'],
    plugins: getPlugins({
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
    external: EXTERNAL_LIBS_DOM,
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
    external: EXTERNAL_LIBS_DOM,
    plugins: getPlugins({ mode: 'production' }),
  },
]

export default config

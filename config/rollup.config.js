import nodeResolve from '@rollup/plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import { version } from '../package.json'

const NODE_RESOLVE_CONFIG_BASE = {
  extensions: ['.ts', '.js'],
}

const INPUT_FILE = 'src/index.ts'

const UMD_GLOBALS = {
  react: 'React',
  'fast-copy': 'fastCopy',
  'react-fast-compare': 'isEqual',
}

const EXTERNAL_LIBS = Object.keys(UMD_GLOBALS)

/**
 * @param {Object?} config
 * @param {Object?} config.overrides
 * @param {'development'|'production'?} config.mode
 * @param {string?} config.buildEnv
 * @returns {Array}
 */
function getPlugins(config = {}) {
  const { overrides = {}, mode, buildEnv } = config
  const basePlugins = {
    nodeResolve: nodeResolve(NODE_RESOLVE_CONFIG_BASE),
    typescript: typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
          declarationDir: null,
          outDir: null,
        },
      },
    }),
    babel: babel({
      presets: ['@babel/preset-react'],
      plugins: ['@babel/plugin-proposal-optional-chaining'],
      exclude: '**/node_modules/**',
      babelHelpers: 'bundled',
    }),
    commonjs: commonjs(),
  }

  // Override plugins
  for (const overrideKey in overrides) {
    basePlugins[overrideKey] = overrides[overrideKey]
  }

  // Convert plugins object to array
  const pluginStack = []
  for (const i in basePlugins) {
    // Allows plugins to be excluded by replacing them with falsey values
    if (basePlugins[i]) {
      pluginStack.push(basePlugins[i])
    }
  }

  // Replace values
  const replaceValues = {
    'process.env.BUILD_ENV': JSON.stringify(buildEnv),
    'process.env.NPM_PACKAGE_VERSION': JSON.stringify(version),
  }
  if (mode) {
    replaceValues['process.env.NODE_ENV'] = JSON.stringify(mode)
  }
  pluginStack.push(replace({
    preventAssignment: true,
    values: replaceValues,
  }))

  // Minification and cleanup
  if (mode === 'production') {
    const terserPlugin = terser({ mangle: { properties: { regex: /^M\$/ } } })
    pluginStack.push(terserPlugin)
  }
  pluginStack.push(forceCleanup())

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
    external: EXTERNAL_LIBS,
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
    external: EXTERNAL_LIBS,
    plugins: getPlugins({ buildEnv: 'react-native' }),
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

function forceCleanup() {
  return {
    name: 'forceCleanup',
    transform: (code, id) => {
      if (id.includes('tslib')) {
        return new Promise((resolve) => {
          const indexOfFirstCommentCloseAsterisk = code.indexOf('*/')
          if (indexOfFirstCommentCloseAsterisk >= 0) {
            // +2 to include the 2 searched characters as well
            code = code.substring(
              indexOfFirstCommentCloseAsterisk + 2,
              code.length
            )
          }
          resolve({ code })
        })
      }
      return null
    },
  }
}

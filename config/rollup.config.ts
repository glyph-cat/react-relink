import nodeResolve from '@rollup/plugin-node-resolve'
// import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { execSync } from 'child_process'
import { Plugin as RollupPlugin, RollupOptions } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import { version } from '../package.json'
import { RelinkBuildType } from '../src/constants'

const NODE_RESOLVE_CONFIG_BASE = {
  extensions: ['.ts', '.js'],
}

const INPUT_FILE = 'src/bundle.ts'

const UMD_GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDom',
  'use-sync-external-store': 'useSyncExternalStore',
}

const EXTERNAL_LIBS_REACT_DOM = Object.keys(UMD_GLOBALS)

interface PluginConfigSchema {
  overrides?: Record<string, unknown>
  mode?: 'development' | 'production'
  buildType?: RelinkBuildType
}

function getPlugins(config: PluginConfigSchema = {}): Array<RollupPlugin> {
  const { overrides = {}, mode, buildType } = config
  const basePlugins = {
    nodeResolve: nodeResolve(NODE_RESOLVE_CONFIG_BASE),
    autoImportReact: autoImportReact(),
    // babel: babel({
    //   presets: [
    //     // '@babel/preset-react',
    //     '@babel/preset-env',
    //   ],
    //   plugins: [
    //     ['@babel/plugin-proposal-class-properties', {
    //       loose: true,
    //       setPublicClassFields: true,
    //     }],
    //   ],
    //   exclude: '**/node_modules/**',
    //   babelHelpers: 'bundled',
    // }),
    typescript: typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
          declarationDir: null,
          jsx: 'react',
          outDir: null,
        },
      },
    }),
    commonjs: commonjs(),
    // ^ Required, otherwise will get Error: "[name] is not exported by [module]"
    // when importing from 'use-sync-external-store/shim'
    // See: https://rollupjs.org/guide/en/#error-name-is-not-exported-by-module
  }

  // Override plugins
  for (const overrideKey in overrides) {
    basePlugins[overrideKey] = overrides[overrideKey]
  }

  // Convert plugins object to array
  const pluginStack: Array<RollupPlugin> = []
  for (const i in basePlugins) {
    // Allows plugins to be excluded by replacing them with falsy values
    if (basePlugins[i]) {
      pluginStack.push(basePlugins[i])
    }
  }

  // Replace values
  const replaceValues = {
    'process.env.BUILD_HASH': JSON.stringify(
      execSync('git rev-parse HEAD').toString().trim()
    ),
    'process.env.BUILD_TYPE': JSON.stringify(buildType),
    'process.env.IS_INTERNAL_DEBUG_ENV': JSON.stringify('false'),
    'process.env.NPM_PACKAGE_VERSION': JSON.stringify(version),
  }
  if (mode) {
    replaceValues['process.env.NODE_ENV'] = JSON.stringify(mode)
  }
  pluginStack.push(replace({
    preventAssignment: true,
    values: replaceValues,
  }))
  if (mode === 'production') {
    pluginStack.push(terser({
      mangle: {
        properties: {
          regex: /^M\$/,
        },
      },
    }))
  }
  pluginStack.push(forceCleanup())

  return pluginStack
}

const config: Array<RollupOptions> = [
  {
    // CommonJS
    input: INPUT_FILE,
    output: {
      file: 'lib/cjs/index.js',
      format: 'cjs',
      exports: 'named',
    },
    external: EXTERNAL_LIBS_REACT_DOM,
    plugins: getPlugins({
      buildType: RelinkBuildType.CJS,
    }),
  },
  {
    // EcmaScript
    input: INPUT_FILE,
    output: {
      file: 'lib/es/index.js',
      format: 'es',
      exports: 'named',
    },
    external: EXTERNAL_LIBS_REACT_DOM,
    plugins: getPlugins({
      buildType: RelinkBuildType.ES,
    }),
  },
  {
    // EcmaScript (Minified)
    input: INPUT_FILE,
    output: {
      file: 'lib/es/index.mjs',
      format: 'es',
      exports: 'named',
    },
    external: EXTERNAL_LIBS_REACT_DOM,
    plugins: getPlugins({
      buildType: RelinkBuildType.MJS,
      mode: 'production',
    }),
  },
  {
    // React Native
    input: INPUT_FILE,
    output: {
      file: 'lib/native/index.js',
      format: 'es',
      exports: 'named',
    },
    external: [...EXTERNAL_LIBS_REACT_DOM, 'react-native'].filter((item) => {
      return item !== 'react-dom'
    }),
    plugins: getPlugins({
      buildType: RelinkBuildType.RN,
      overrides: {
        nodeResolve: nodeResolve({
          ...NODE_RESOLVE_CONFIG_BASE,
          extensions: [
            '.native.ts',
            '.native.js',
            ...NODE_RESOLVE_CONFIG_BASE.extensions,
          ],
        }),
      },
    }),
  },
  {
    // UMD
    input: INPUT_FILE,
    output: {
      file: 'lib/umd/index.js',
      format: 'umd',
      name: 'Relink',
      exports: 'named',
      globals: UMD_GLOBALS,
    },
    external: EXTERNAL_LIBS_REACT_DOM,
    plugins: getPlugins({
      buildType: RelinkBuildType.UMD,
      mode: 'development',
    }),
  },
  {
    // UMD (Minified)
    input: INPUT_FILE,
    output: {
      file: 'lib/umd/index.min.js',
      format: 'umd',
      name: 'Relink',
      exports: 'named',
      globals: UMD_GLOBALS,
    },
    external: EXTERNAL_LIBS_REACT_DOM,
    plugins: getPlugins({
      buildType: RelinkBuildType.UMD_MIN,
      mode: 'production',
    }),
  },
]

export default config

/**
 * Automatically `imports React from "react"` if a file ends with '.tsx'.
 */
function autoImportReact() {
  return {
    name: 'autoImportReact',
    transform(code, id) {
      if (/tsx/gi.test(id)) {
        code = 'import React from "react";\n' + code
        return { code }
      }
      return null
    },
  }
}

/**
 * Removes redundant license information about tslib that is wasting precious
 * bytes in the final code bundle.
 */
function forceCleanup() {
  return {
    name: 'forceCleanup',
    transform(code, id) {
      if (id.includes('tslib')) {
        const indexOfFirstCommentCloseAsterisk = code.indexOf('*/')
        if (indexOfFirstCommentCloseAsterisk >= 0) {
          // +2 to include the 2 searched characters as well
          code = code.substring(
            indexOfFirstCommentCloseAsterisk + 2,
            code.length
          )
        }
        return { code }
      }
      return null
    },
  }
}

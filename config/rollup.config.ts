import nodeResolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { execSync } from 'child_process'
import { Plugin as RollupPlugin, RollupOptions } from 'rollup'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import pkg from '../package.json'
import { RelinkBuildType } from '../src/constants'

const BASE_NODE_RESOLVE_CONFIG = {
  extensions: ['.ts', '.js'],
}

const INPUT_FILE = 'src/bundle.ts'

const UMD_GLOBALS = {
  react: 'React',
  'react-dom': 'ReactDom',
  'use-sync-external-store': 'useSyncExternalStore',
}

const REACT_DOM_EXTERNAL_LIBS = Object.keys(UMD_GLOBALS)

const REACT_NATIVE_EXTERNAL_LIBS = [
  ...REACT_DOM_EXTERNAL_LIBS,
  'react-native',
].filter((item) => item !== 'react-dom')

interface PluginConfigSchema {
  overrides?: Record<string, unknown>
  mode?: 'development' | 'production'
  buildType: RelinkBuildType
}

function getPlugins(config: PluginConfigSchema): Array<RollupPlugin> {
  const { overrides = {}, mode, buildType } = config
  const basePlugins = {
    nodeResolve: nodeResolve(BASE_NODE_RESOLVE_CONFIG),
    // KIV
    // autoImportReact: autoImportReact(),
    typescript: typescript({
      tsconfigOverride: {
        compilerOptions: {
          declaration: false,
          declarationDir: null,
          outDir: null,
        },
        exclude: [
          './src/**/*.test*',
        ],
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
    'process.env.PACKAGE_VERSION': JSON.stringify(pkg.version),
    'process.env.REPORT_ISSUE_URL': JSON.stringify(pkg.bugs.url),
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
      sourcemap: false,
    },
    external: REACT_DOM_EXTERNAL_LIBS,
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
      sourcemap: false,
    },
    external: REACT_DOM_EXTERNAL_LIBS,
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
      sourcemap: true,
    },
    external: REACT_DOM_EXTERNAL_LIBS,
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
      sourcemap: false,
    },
    external: REACT_NATIVE_EXTERNAL_LIBS,
    plugins: getPlugins({
      buildType: RelinkBuildType.RN,
      overrides: {
        nodeResolve: nodeResolve({
          ...BASE_NODE_RESOLVE_CONFIG,
          extensions: [
            '.native.ts',
            '.native.js',
            ...BASE_NODE_RESOLVE_CONFIG.extensions,
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
      sourcemap: false,
    },
    external: REACT_DOM_EXTERNAL_LIBS,
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
      sourcemap: true,
    },
    external: REACT_DOM_EXTERNAL_LIBS,
    plugins: getPlugins({
      buildType: RelinkBuildType.UMD_MIN,
      mode: 'production',
    }),
  },
]

export default config

// /**
//  * Automatically `imports React from "react"` if a file ends with '.tsx'.
//  */
// function autoImportReact(): RollupPlugin {
//   return {
//     name: 'autoImportReact',
//     transform(code, id) {
//       if (/tsx/gi.test(id)) {
//         code = 'import React from "react";\n' + code
//         return {
//           code,
//           map: null,
//         }
//       }
//       return null
//     },
//   }
// }

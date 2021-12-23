// What this script does:
// Updates all `dependencies` and `devDependencies` in 'package.json' to the
// latest version.

import {
  dependencies as PKG_dependencies,
  devDependencies as PKG_devDependencies,
} from '../../package.json'
import { exec } from 'child_process'
import { getPackageInstallPaths } from './get-package-install-paths'

const depStack = Object.keys(PKG_dependencies)
const devDepStack = Object.keys(PKG_devDependencies)
const allDepStack = [...depStack, ...devDepStack]

const command = [
  `yarn remove ${allDepStack.join(' ')}`,
  `yarn add ${getPackageInstallPaths(PKG_dependencies).join(' ')}`,
  `yarn add -D ${getPackageInstallPaths(PKG_devDependencies).join(' ')}`,
].join(' && ')

const execProcess = exec(command)
execProcess.stdout.pipe(process.stdout)
execProcess.stderr.pipe(process.stderr)

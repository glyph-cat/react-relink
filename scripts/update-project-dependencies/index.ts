// What this script does:
// Updates all `dependencies` and `devDependencies` in 'package.json' to the
// latest version.

import {
  dependencies as PKG_dependencies,
  devDependencies as PKG_devDependencies,
} from '../../package.json'
import { exec } from 'child_process'
import { getPackageInstallPaths } from './get-package-install-paths'

const excludedDevPackages = ['chalk']

const depStack = Object.keys(PKG_dependencies)
const devDepStack = Object.keys(PKG_devDependencies).filter((value) => {
  // TOFIX: Not working somehow?
  return !excludedDevPackages.includes(value)
})

const allDepStack = [...depStack, ...devDepStack]

const commandStack = [`yarn remove ${allDepStack.join(' ')}`]
if (depStack.length > 0) {
  commandStack.push(
    `yarn add ${getPackageInstallPaths(PKG_dependencies).join(' ')}`
  )
}
if (devDepStack.length > 0) {
  commandStack.push(
    `yarn add -D ${getPackageInstallPaths(PKG_devDependencies).join(' ')}`
  )
}
const command = commandStack.join(' && ')

const execProcess = exec(command)
execProcess.stdout.pipe(process.stdout)
execProcess.stderr.pipe(process.stderr)

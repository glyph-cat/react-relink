// What this script does:
// Updates all `dependencies` and `devDependencies` in 'package.json' to the
// latest version.

import {
  dependencies as PKG_dependencies,
  devDependencies as PKG_devDependencies,
} from '../../package.json'
import { exec } from 'child_process'
import { getPackageInstallPaths } from './get-package-install-paths'

const dependenciesToExclude = []
const devDependenciesToExclude = [
  /**
   * Because any newer versions of the packages specified below uses ES, which
   * would break any scripts that attempt to import it.
   */
  'chalk', // Breaks from v5 onwards
  'query-string', // Breaks from v8 onwards
]

const depStack = Object.keys(PKG_dependencies)
const devDepStack = Object.keys(PKG_devDependencies).filter((value) => {
  return !devDependenciesToExclude.includes(value)
})
console.log({ devDepStack })

const allDepStack = [...depStack, ...devDepStack]

const commandStack = [`yarn remove ${allDepStack.join(' ')}`]
if (depStack.length > 0) {
  commandStack.push(
    `yarn add ${getPackageInstallPaths(
      PKG_dependencies,
      dependenciesToExclude
    ).join(' ')}`
  )
}
if (devDepStack.length > 0) {
  commandStack.push(
    `yarn add -D ${getPackageInstallPaths(
      PKG_devDependencies,
      devDependenciesToExclude
    ).join(' ')}`
  )
}
const command = commandStack.join(' && ')

const execProcess = exec(command)
execProcess.stdout.pipe(process.stdout)
execProcess.stderr.pipe(process.stderr)

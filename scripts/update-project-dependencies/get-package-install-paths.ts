const semverRegex = /^(@|\^|~)?\d+\.\d+\.\d+/

/**
 * Because `yarn add <private-dep-name>` will not work, you need to
 * `yarn add <url-to-private-dep-repo>.
 */
export function getPackageInstallPaths(
  deps: Record<string, string>,
  depsToExclude: Array<string>
): Array<string> {
  const keyStack = Object.keys(deps)
  const sourceNameStack = []
  for (let i = 0; i < keyStack.length; i++) {
    const depName = keyStack[i]
    if (depsToExclude.includes(depName)) { continue }
    if (semverRegex.test(deps[depName])) {
      // If is governed by semver, install path should be package name
      sourceNameStack.push(depName)
    } else {
      // Else (if) is governed by URL, install path should be the URL
      sourceNameStack.push(deps[depName])
    }
  }
  return sourceNameStack
}

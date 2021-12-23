const semverRegex = /^(@|\^|~)?\d+\.\d+\.\d+/

/**
 * Because `yarn add <private-dep-name>` will not work, you need to
 * `yarn add <url-to-private-dep-repo>.
 */
export function getPackageInstallPaths(
  deps: Record<string, string>
): Array<string> {
  const keyStack = Object.keys(deps)
  const sourceNameStack = []
  for (let i = 0; i < keyStack.length; i++) {
    if (semverRegex.test(deps[keyStack[i]])) {
      // If is governed by semver, install path should be package name
      sourceNameStack.push(keyStack[i])
    } else {
      // Else (if) is governed by URL, install path should be the URL
      sourceNameStack.push(deps[keyStack[i]])
    }
  }
  return sourceNameStack
}

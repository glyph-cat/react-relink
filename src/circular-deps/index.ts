import { INTERNALS_SYMBOL } from '../constants'
import { ERROR_CIRCULAR_DEPENDENCY } from '../errors'
import { RelinkSource, RelinkSourceKey } from '../schema'

export function checkForCircularDeps(
  deps: Array<RelinkSource<unknown>>,
  keyPathStack: Array<RelinkSourceKey>
): void {
  const depsKeyStack = []
  for (let i = 0; i < deps.length; i++) {
    const currentDepKey = deps[i][INTERNALS_SYMBOL].M$key
    depsKeyStack.push(currentDepKey)
    const currentKeyPathStack = [...keyPathStack, currentDepKey]
    // Check with previous stack to make sure current one is not compared
    // against itself.
    if (keyPathStack.includes(currentDepKey)) {
      throw ERROR_CIRCULAR_DEPENDENCY(currentKeyPathStack)
    }
    checkForCircularDeps(
      deps[i][INTERNALS_SYMBOL].M$parentDeps,
      currentKeyPathStack
    )
  }
}

import { INTERNALS_SYMBOL } from '../constants'
import { ERROR_CIRCULAR_DEPENDENCY } from '../errors'
import { RelinkSource, RelinkSourceKey } from '../schema'

export function checkForCircularDepsAndGetKeyStack(
  deps: Array<RelinkSource<unknown>>,
  keyPathStack: Array<RelinkSourceKey>
): Array<RelinkSourceKey> {
  const depsKeyStack = []
  for (let i = 0; i < deps.length; i++) {
    const currentDep = deps[i]
    const currentDepKey = currentDep[INTERNALS_SYMBOL].M$key
    depsKeyStack.push(currentDepKey)
    const currentKeyPathStack = [...keyPathStack, currentDepKey]
    // Check with previous stack to make sure current one is not compared
    // against itself.
    if (keyPathStack.includes(currentDepKey)) {
      throw ERROR_CIRCULAR_DEPENDENCY(currentKeyPathStack)
    }
    checkForCircularDepsAndGetKeyStack(
      currentDep[INTERNALS_SYMBOL].M$deps,
      currentKeyPathStack
    )
  }
  return depsKeyStack
}

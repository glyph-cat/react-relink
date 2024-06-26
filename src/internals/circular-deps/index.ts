import { RelinkSourceKey } from '../../abstractions'
import type { RelinkSource } from '../../api/source'
import { THROW_ERROR_CIRCULAR_DEPENDENCY } from '../errors'

/**
 * @internal
 */
export function checkForCircularDeps(
  deps: Array<RelinkSource<unknown>>,
  keyPathStack: Array<RelinkSourceKey>
): void {
  const depsKeyStack = []
  for (let i = 0; i < deps.length; i++) {
    const currentDepKey = deps[i].M$key
    depsKeyStack.push(currentDepKey)
    const currentKeyPathStack = [...keyPathStack, currentDepKey]
    // Check with previous stack to make sure current one is not compared
    // against itself.
    if (keyPathStack.includes(currentDepKey)) {
      THROW_ERROR_CIRCULAR_DEPENDENCY(currentKeyPathStack)
    }
    checkForCircularDeps(
      deps[i].M$parentDeps,
      currentKeyPathStack
    )
  }
}

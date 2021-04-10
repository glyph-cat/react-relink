import { IS_DEBUG } from './constants'

export function checkForCircularDepsAndGetKeyStack(...args) {
  const keyCache = {}

  const mapIdsToKeys = (idStack) => {
    const keyStack = []
    for (const id of idStack) {
      keyStack.push(keyCache[id] || '??')
    }
    return keyStack
  }

  const base = (sourceId, deps, idStack = [], keyStack = []) => {
    const depsKeyStack = Object.keys(deps)
    for (const depKey of depsKeyStack) {
      const dep = deps[depKey]
      keyCache[dep.M$internalId] = depKey
      const currentIdStack = [...idStack, sourceId]
      const currentKeyStack = [...keyStack, depKey]
      // Check with previous idStack so that current one is not compared against itself
      if (idStack.includes(dep.M$internalId)) {
        throw new Error(
          IS_DEBUG
            ? `Circular source dependencies are not allowed (In: ${mapIdsToKeys(
                [...currentIdStack, dep.M$internalId]
              ).join(' > ')})`
            : 1
        )
      }
      base(dep.M$internalId, dep.M$deps, currentIdStack, currentKeyStack)
    }
    return depsKeyStack
  }
  return base(...args)
}

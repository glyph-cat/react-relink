import { useCallback, useDebugValue, useMemo } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { $$INTERNALS, IS_DEV_ENV } from '../../constants'
import { RelinkSelector } from '../../schema'
import { useRef } from '../../internals/custom-hooks'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { useScopedRelinkSource } from '../scope'
import { RelinkSource } from '../source'
import { RelinkAdvancedSelector } from '../selector'

/**
 * @example
 * const state = useRelinkValue(Source)
 * @public
 */
export function useRelinkValue<S>(source: RelinkSource<S>): S

/**
 * @example
 * const selector = (state) => ({
 *   propertyA: state.propertyA,
 *   propertyB: state.propertyB,
 * })
 * const filteredState = useRelinkValue(Source, selector)
 * @public
 */
export function useRelinkValue<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
): K

export function useRelinkValue<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): S | K {
  // NOTE: `scopedSource` will still be the original (unscoped) one if component
  // using this hook is not nested in any scopes.
  const scopedSource = useScopedRelinkSource(source)
  return useRelinkValue_BASE(scopedSource, selector)
}

/**
 * @internal
 */
export function useRelinkValue_BASE<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): S | K {

  // Before anything else, perform suspension if source is not ready.
  useSuspenseForDataFetching(source)

  const unselectedSnapshotCache = useRef<S | K>()
  const selectedSnapshotCache = useRef<S | K>()

  const isEqual = useMemo(() => {
    return selector instanceof RelinkAdvancedSelector
      ? selector[$$INTERNALS].M$compareFn
      : Object.is
  }, [selector])

  const getState = useCallback((): S | K => {

    const currentStateSnapshot = source.get()

    if (Object.is(unselectedSnapshotCache.current, currentStateSnapshot)) {
      return selectedSnapshotCache.current // Early exit
    }

    // NOTE: `isFunction` is not used to check the selector because it can only
    // either be a faulty value or a function. If other types are passed, let
    // the error automatically surface up so that users are aware of the
    // incorrect type.
    if (selector) {
      if (selector instanceof RelinkAdvancedSelector) {
        selectedSnapshotCache.current = selector[$$INTERNALS].M$get(currentStateSnapshot)
      } else {
        selectedSnapshotCache.current = selector(currentStateSnapshot)
      }
    } else {
      selectedSnapshotCache.current = currentStateSnapshot
    }
    unselectedSnapshotCache.current = currentStateSnapshot
    return selectedSnapshotCache.current
  }, [selector, source])

  const state = useRef(getState)
  const updateCount = useRef(0)

  const getUpdateCount = useCallback((): number => {
    const nextState = getState()
    // Originally expecting an error below with `@ts-expect-error`, but we get:
    // - Compile error when bundling types because the compiler doesn't see any
    //   problem with it (so do I, hence this long-arse explanation), or
    // - Compile error when bundling CJS code if `@ts-expect-error` is removed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore If `selector` is provided, `selector` will always return
    // type `K` and since `compareFn` always compares `K` and always comes
    // together with `selector`, there should be no problem performing the
    // comparison below.
    const selectedStateAreEqual = isEqual(state.current, nextState)
    if (!selectedStateAreEqual) {
      state.current = nextState
      updateCount.current += 1
    }
    return updateCount.current
  }, [getState, isEqual])

  useSyncExternalStore(source.watch, getUpdateCount)

  // Show debug value.
  useDebugValue(undefined, () => {
    // In case source contains sensitive information, it is hidden away in
    // production environment by default.
    if (source.M$options.public || IS_DEV_ENV) {
      return {
        key: source.M$key,
        selector: selector,
        value: state,
      }
    }
  })

  return state.current
}

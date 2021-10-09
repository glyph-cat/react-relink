import { useDebugValue } from 'react'
import { INTERNALS_SYMBOL, IS_CLIENT_ENV, IS_DEV_ENV } from '../../constants'
import { useLayoutEffect, useState } from '../../internals/custom-hooks'
import deepCopy from '../../internals/deep-copy'
import {
  RelinkEvent,
  RelinkSelector,
  RelinkSource,
  RelinkSourceKey,
} from '../../schema'
import { isFunction } from '../../internals/type-checker'
import { unstable_batchedUpdates } from '../../internals/unstable_batchedUpdates'
import { CallbackWithNoParamAndReturnsVoid } from '../../internals/helper-types'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'

function getInitialState<S, K>(
  source: RelinkSource<S>,
  selector: RelinkSelector<S, K>
) {
  const currentValue = isFunction(selector)
    ? selector(source[INTERNALS_SYMBOL].M$directGet())
    : source[INTERNALS_SYMBOL].M$directGet()
  return source[INTERNALS_SYMBOL].M$isMutable
    ? currentValue
    : deepCopy(currentValue)
}

function getSubsequentState<S, K>(
  state: S,
  selector: RelinkSelector<S, K>,
  isMutable: boolean
) {
  const currentValue = isFunction(selector) ? selector(state) : state
  return isMutable ? currentValue : deepCopy(currentValue)
}

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
/**
 * @public
 */
export function useRelinkValue<S, K>(
  source: RelinkSource<S>,
  selector?: RelinkSelector<S, K>
): S | K {

  useSuspenseForDataFetching(source)

  // Use custom state hook
  const [state, setState] = useState(
    (): S | K => getInitialState(source, selector),
    source[INTERNALS_SYMBOL].M$isMutable
  )

  // Show debug value
  interface DebugValueReturnType {
    key: RelinkSourceKey
    selector: RelinkSelector<S, K>
    value: S | K
  }
  useDebugValue(undefined, (): DebugValueReturnType => {
    // In case source contains sensitive information, it is hidden away in
    // production environment by default.
    if (source[INTERNALS_SYMBOL].M$isPublic || IS_DEV_ENV) {
      return {
        key: source[INTERNALS_SYMBOL].M$key,
        selector,
        value: state,
      }
    }
  })

  // TODO: Suspense on hydrate start

  // Add/remove watcher
  useLayoutEffect((): CallbackWithNoParamAndReturnsVoid => {
    // NOTE: Virtual batching is implemented at the hook level instead of the
    // source because it used to cause faulty `Source.set()` calls... and also
    // because it just makes more sense.
    let debounceRef: ReturnType<typeof setTimeout>
    const triggerUpdateRightAway = (event: RelinkEvent<S>): void => {
      unstable_batchedUpdates((): void => {
        setState(getSubsequentState(
          event.state,
          selector,
          source[INTERNALS_SYMBOL].M$isMutable)
        )
      })
    }
    const triggerUpdateDebounced = (details: RelinkEvent<S>): void => {
      clearTimeout(debounceRef)
      debounceRef = setTimeout((): void => {
        triggerUpdateRightAway(details)
      })
    }
    const unwatch = source.watch(
      IS_CLIENT_ENV && source[INTERNALS_SYMBOL].M$isVirtualBatchEnabled
        ? triggerUpdateDebounced
        : triggerUpdateRightAway
    )
    return (): void => {
      unwatch()
      clearTimeout(debounceRef)
    }
  }, [source, selector])

  return state
}
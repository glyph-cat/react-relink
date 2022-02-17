import {
  MutableRefObject,
  useEffect,
  useReducer,
  useRef, // eslint-disable-line no-restricted-imports
} from 'react'
import { unstable_batchedUpdates } from '../../unstable_batchedUpdates'
import { useLayoutEffect } from '../isomorphic-layout-effect'
import { forceUpdateReducer } from '../force-update'

/**
 * @internal
 */
type StateId = Record<string, never>

/**
 * @internal
 */
const stateCache: WeakMap<
  StateId,
  [unknown, (newState: unknown) => void]
> = new WeakMap()

/**
 * @internal
 */
type StateHookData<S> = [S, (newState: S) => void]

/**
 * A custom state hook that has a similar usage pattern to React's, but is
 * highly specialized for Relink's state management workflow.
 * The differences:
 * - State values are not exposed in React dev tools
 * - Initial state must be a factory (has performance benefits when selectors
 *   are used)
 * - State setter only accepts new values (no reducers)
 * @internal
 */
export function useState<S>(initialState: () => S): StateHookData<S> {

  const isMounted = useRef(true)
  useEffect(() => { return () => { isMounted.current = false } }, [])

  const id: MutableRefObject<StateId> = useRef({})
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)

  if (!stateCache.has(id.current)) {
    const stateSetter = (nextStateValue: S): void => {
      if (!isMounted.current) { return } // Early exit
      const [prevStateValue] = stateCache.get(id.current)
      if (!Object.is(prevStateValue, nextStateValue)) {
        stateCache.set(id.current, [nextStateValue, stateSetter])
        unstable_batchedUpdates((): void => {
          forceUpdate()
        })
      }
    }
    stateCache.set(id.current, [initialState(), stateSetter])
  }

  useLayoutEffect(() => {
    const stateId = id.current
    return (): void => { stateCache.delete(stateId) }
  }, [])

  return stateCache.get(id.current) as StateHookData<S>
}

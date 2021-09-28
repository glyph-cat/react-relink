import { MutableRefObject, useReducer, useRef, useEffect } from 'react'
import { isEqual } from '../../equality'

const forceUpdateReducer = (c: number): number => c + 1

type StateId = Record<string, never>
const stateCache: WeakMap<
  StateId,
  [unknown, (newState: unknown) => void]
> = new WeakMap()

type StateHookData<S> = [S, (newState: S) => void]

/**
 * A custom state hook that has a similar usage pattern to React's, but is
 * highly specialized for Relink's state management workflow.
 * There are, however a few differences:
 * - Has customizable equality checking
 * - State values are not exposed in React dev tools
 * - Initial state must be a factory
 * - State setter only accepts new values (no factory functions)
 */
export function useState<S>(
  initialState: () => S,
  isMutable: boolean
): StateHookData<S> {

  const id: MutableRefObject<StateId> = useRef({})
  const [, forceUpdate] = useReducer(forceUpdateReducer, 0)

  if (!stateCache.has(id.current)) {
    const stateSetter = (nextStateValue: S): void => {
      const [prevStateValue] = stateCache.get(id.current)
      if (!isEqual(prevStateValue, nextStateValue, isMutable)) {
        stateCache.set(id.current, [nextStateValue, stateSetter])
        forceUpdate()
      }
    }
    stateCache.set(id.current, [initialState(), stateSetter])
  }

  useEffect((): (() => void) => {
    const stateId = id.current
    return (): void => { stateCache.delete(stateId) }
  }, [])

  return stateCache.get(id.current) as StateHookData<S>

}

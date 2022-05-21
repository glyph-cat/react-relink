import { $$INTERNALS } from '../constants'

/**
 * @internal
 */
export type ObjectMarker = Record<never, never>

/**
 * @internal
 */
export interface SyncValue<T> {
  [$$INTERNALS]: T
}

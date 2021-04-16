export interface HydrationCommitter<T> {
  commit: (state: T) => void
}

export interface RelinkSource<T> {
  addListener: (callback: (state: T) => void) => number
  removeListener: (id: number) => void
  get: () => T
  set: RelinkSetter<T>
  reset: () => void
  hydrate: HydrationCommitter<T>
}

export interface RelinkSetter<T> {
  (newState: T): void
  (callback: (scopedState: T) => T): void
}

export interface RelinkHydrator<T> {
  (config: HydrationCommitter<T>): void
}

export interface RelinkSelector<T, K> {
  (state: T): K
}

export interface RelinkLifecycleConfig<T> {
  init?: RelinkHydrator<T>
  didSet?: (details: { state: T }) => void
  didReset?: () => void
}

export interface RelinkSourceOptions {
  suspense?: boolean
  mutable?: boolean
  virtualBatch?: boolean
}

export interface RelinkSourceEntry<T> {
  key?: any
  default: T
  deps?: Record<string, RelinkSourceEntry<unknown>>,
  lifecycle?: RelinkLifecycleConfig<T>
  options?: RelinkSourceOptions
}

export function createSource<T>(
  specs: RelinkSourceEntry<T>,
): RelinkSource<T>

export function useRelinkValue<T>(
  source: RelinkSource<T>
): T

export function useRelinkValue<T, K>(
  source: RelinkSource<T>,
  selector?: RelinkSelector<T, K>,
): K

export function useRelinkState<T>(
  source: RelinkSource<T>,
): [T, RelinkSetter<T>]

export function useRelinkState<T, K>(
  source: RelinkSource<T>,
  selector?: RelinkSelector<T, K>,
): [K, RelinkSetter<T>]

export function useSetRelinkState<T>(
  source: RelinkSource<T>,
): RelinkSetter<T>

export function useResetRelinkState<T>(
  source: RelinkSource<T>,
): void

export function useRehydrateRelinkSource<T>(
  source: RelinkSource<T>,
): RelinkHydrator<T>

export function dangerouslyGetRelinkValue<T>(
  source: RelinkSource<T>
): T

export function dangerouslySetRelinkState<T>(
  source: RelinkSource<T>,
  partialState: RelinkSetter<T>,
): void

export function dangerouslyResetRelinkState<T>(
  source: RelinkSource<T>,
): void

export function dangerouslyRehydrateRelinkSource<T>(
  source: RelinkSource<T>,
  config: RelinkHydrator<T>
): void

export function waitForAll<T>(
  sources: Array<RelinkSource<T>>,
  callback: () => void,
  onError: (e: Error) => void
): void

export function waitForAll<T>(
  sources: Array<RelinkSource<T>>
): Promise<void>

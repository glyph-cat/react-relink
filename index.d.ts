export interface HydrationCommitter<T> {
  commit: (state: T) => void
}

export interface RelinkSource<T> {
  /**
   * @deprecated `addListener` and `removeListener` are deprecated.
   * Use `.watch()` instead.
   * ```
   * const unwatchSource = Source.watch() // Start watching
   * unwatchSource() // Stop watching
   * ```
   */
  addListener: (callback: (state: T) => void) => number
  /**
   * @deprecated `addListener` and `removeListener` are deprecated.
   * Use `.watch()` instead.
   * ```
   * const unwatchSource = Source.watch() // Start watching
   * unwatchSource() // Stop watching
   * ```
   */
  removeListener: (id: number) => void
  watch: (callback: (state: T) => void) => (() => void)
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

/**
 * @deprecated Prefer `YourSource.get()` over `dangerouslyGetRelinkValue(YourSource)`
 */
export function dangerouslyGetRelinkValue<T>(
  source: RelinkSource<T>
): T

/**
 * @deprecated Prefer `YourSource.set(...)` over `dangerouslySetRelinkValue(YourSource, ...)`
 */
export function dangerouslySetRelinkState<T>(
  source: RelinkSource<T>,
  partialState: RelinkSetter<T>,
): void

/**
 * @deprecated YourSource.reset()` over `dangerouslyResetRelinkValue(YourSource)`
 */
export function dangerouslyResetRelinkState<T>(
  source: RelinkSource<T>,
): void

/**
 * @deprecated Prefer `YourSource.hydrate(...)` over `dangerouslyHydrateRelinkValue(YourSource, ...)`
 */
export function dangerouslyRehydrateRelinkSource<T>(
  source: RelinkSource<T>,
  config: RelinkHydrator<T>
): void

export function waitForAll<T>(
  sources: Array<RelinkSource<T>>
): Promise<void>

export function waitForAll<T>(
  sources: Array<RelinkSource<T>>,
  callback: () => void,
  onError: (e: Error) => void
): void

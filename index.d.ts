export interface HydrationCommitter<T> {
  commit: (state: T) => void
}

export interface RelinkSource<T> {
  key: string
  default: T
}

export interface RelinkSetter<T> {
  (oldState: T): void
  (callback: (oldState: T) => T): void
}

export interface RelinkHydrator<T> {
  (config: HydrationCommitter<T>): void
}

export interface RelinkSelector<T, K> {
  (oldState: T): K
}

export interface RelinkSourceEntry<T> {
  key: string
  default: T
  lifecycle: {
    init?: RelinkHydrator<T>
    didSet?: (state: T) => void
    didReset: () => void
  }
  options?: {
    suspense?: boolean
    mutable?: boolean
    virtualBatch?: boolean
  }
}

export function createSource<T>(
  specs: RelinkSourceEntry<T>,
): RelinkSource<T>

export function useRelinkValue<T, K>(
  source: RelinkSource<T>,
  selector?: RelinkSelector<T, K>,
): T

export function useRelinkState<T, K>(
  source: RelinkSource<T>,
  selector?: RelinkSelector<T, K>,
): [T, RelinkSetter<T>]

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

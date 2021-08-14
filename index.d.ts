

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
): () => void

export function useRehydrateRelinkSource<T>(
  source: RelinkSource<T>,
): RelinkHydrator<T>

export function waitForAll<T>(
  sources: Array<RelinkSource<T>>
): Promise<void>

export function waitForAll<T>(
  sources: Array<RelinkSource<T>>,
  callback: () => void,
  onError: (e: Error) => void
): void

export function isRelinkSource(value: unknown): boolean

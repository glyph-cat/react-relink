import { IS_DEBUG_ENV } from '../constants'
import { devError, formatFunctionNotationArray } from '../dev'
import { RelinkSourceKey } from '../schema'

type UselessHydrationWarner = (concludeType: HydrationConcludeType) => boolean

export enum HydrationConcludeType {
  commit = 'commit',
  skip = 'skip',
}

export function formatWarningMessageForNoUselessHydration(
  sourceKey: RelinkSourceKey,
  currentConcludeType: HydrationConcludeType,
  concludeTypeHistoryStack: Array<HydrationConcludeType>
): string {
  const firstMessageFragment = `Attempted to ${currentConcludeType} a hydration in '${String(sourceKey)}' even though it has previously been concluded with: ${formatFunctionNotationArray(concludeTypeHistoryStack)}.`
  const secondMessageFragment = 'Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to `Source.hydrate()` instead, otherwise it might indicate a memory leak in your application.'
  return [firstMessageFragment, secondMessageFragment].join(' ')
}

export function createNoUselessHydrationWarner_DEV(
  sourceKey: RelinkSourceKey
): UselessHydrationWarner {
  const concludeTypeHistoryStack: Array<HydrationConcludeType> = []
  const M$conclude = (concludeType: HydrationConcludeType): boolean => {
    if (concludeTypeHistoryStack.length > 0) {
      devError(formatWarningMessageForNoUselessHydration(
        sourceKey,
        concludeType,
        concludeTypeHistoryStack
      ))
      return false
    } else {
      concludeTypeHistoryStack.push(concludeType)
      return true
    }
  }
  return M$conclude
}

export function createNoUselessHydrationWarner_PROD(): UselessHydrationWarner {
  let isConcluded = false
  const M$conclude = (): boolean => {
    if (isConcluded) {
      return false
    } else {
      isConcluded = true
      return true
    }
  }
  return M$conclude
}

/**
 * Returns a callback that concludes a hydration phase. Returns true if this is
 * the first hydration, otherwise returns false and shows an error message.
 */
export const createNoUselessHydrationWarner = IS_DEBUG_ENV
  ? createNoUselessHydrationWarner_DEV
  : createNoUselessHydrationWarner_PROD

// NOTE: The DEV version keeps track of the source key and conclude type for
// error reporting, but these aren't needed in production environments, so two
// different versions are created to allow code effiiency.

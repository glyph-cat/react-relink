import { INTERNALS_SYMBOL } from '../../constants'
import { RelinkSource } from '../../schema'

export function allDepsAreReady(
  sources: Array<RelinkSource<unknown>>
): boolean {
  for (const source of sources) {
    if (!source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
      return false // Early exit
    }
  }
  return true
}

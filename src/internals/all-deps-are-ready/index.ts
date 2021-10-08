import { INTERNALS_SYMBOL } from '../../constants'
import { RelinkSource } from '../../schema'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { genericDebugLogger } from '../../debugging'

export function allDepsAreReady(
  sources: Array<RelinkSource<unknown>>
): boolean {
  // KIV: genericDebugLogger.echo(`sources.length: ${sources.length}`)
  for (const source of sources) {
    if (!source[INTERNALS_SYMBOL].M$getIsReadyStatus()) {
      return false // Early exit
    }
  }
  return true
}

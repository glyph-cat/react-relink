import { RelinkSource } from '../../../api/source'

export function allDepsAreReady(
  sources: Array<RelinkSource<unknown>>
): boolean {
  for (const source of sources) {
    if (!source.M$getIsReadyStatus()) {
      return false // Early exit
    }
  }
  return true
}

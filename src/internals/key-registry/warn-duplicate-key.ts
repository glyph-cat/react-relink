import { RELINK_CONFIG } from '../../api/config'
import { RelinkSourceKey } from '../../schema'
import { devWarn } from '../dev'
import { formatSourceKeyArray } from '../string-formatting'

/**
 * @internal
 */
let tempKeyStack: Array<RelinkSourceKey> = []

/**
 * @internal
 */
let debouncedWarningRef: ReturnType<typeof setTimeout>

/**
 * @see https://github.com/facebookexperimental/Recoil/blob/c43c0906dda63760eaa359d248e484e68c5be093/src/core/Recoil_Node.js#L118
 * @internal
 */
export function warnDuplicateKey(key: RelinkSourceKey): void {
  if (!RELINK_CONFIG.hideDuplicateKeyWarnings) {
    clearTimeout(debouncedWarningRef)
    tempKeyStack.push(key)
    debouncedWarningRef = setTimeout((): void => {
      const dynamicMessageFragment = tempKeyStack.length === 1
        ? `key '${String(tempKeyStack[0])}'`
        : `keys: ${formatSourceKeyArray(tempKeyStack)}`
      devWarn([
        `Duplicate source ${dynamicMessageFragment}. This is a FATAL ERROR in`,
        'production. But it is safe to ignore this warning if it occurred',
        'because of hot module replacement.',
      ].join(' '))
      tempKeyStack = []
    })
  }
}

import { devWarn } from '../dev'
import { RelinkSourceKey } from '../schema'

let tempKeyStack: Array<RelinkSourceKey> = []
let debouncedWarningRef: ReturnType<typeof setTimeout>

/**
 * Reference: https://github.com/facebookexperimental/Recoil/blob/c43c0906dda63760eaa359d248e484e68c5be093/src/core/Recoil_Node.js#L118
 */
export function warnDuplicateKey(key: RelinkSourceKey): void {
  clearTimeout(debouncedWarningRef)
  tempKeyStack.push(key)
  debouncedWarningRef = setTimeout((): void => {
    const dynamicMessageFragment = tempKeyStack.length === 1
      ? `key '${String(tempKeyStack[0])}'`
      : `keys: '${tempKeyStack.join('\', \'')}'`
    devWarn(
      `Duplicate source ${dynamicMessageFragment}. This is a FATAL ERROR in ` +
      'production. But it is safe to ignore this warning if it occurred ' +
      'because of hot module replacement.'
    )
    tempKeyStack = []
  })
}

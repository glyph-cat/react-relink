import { IS_CLIENT_ENV, IS_DEBUG_ENV } from '../constants'
import { RelinkSourceKey } from '../schema'
import { warnDuplicateKey } from './warn-duplicate-key'

const KEY_STORE: Record<RelinkSourceKey, true> = {}

/**
 * Registers a key into the store. If key already existed, throws an error.
 */
export function registerKey(key: RelinkSourceKey): void {
  // Duplicate keys are guaranteed to occur in SSR because the same code can
  // be used to serve to multiple clients. By checking with `IS_CLIENT_ENV`,
  // duplicate keys are only checked when code is run in the client.
  if (IS_CLIENT_ENV) {
    if (!KEY_STORE[key]) {
      KEY_STORE[key] = true
    } else if (IS_DEBUG_ENV) {
      warnDuplicateKey(key)
    }
  }
}

/**
 * Removes a key from the store. If key is already removed, it does nothing.
 */
export function unregisterKey(key: RelinkSourceKey): void {
  delete KEY_STORE[key]
}

let counter = 1
export function getAutomaticKey(): number {
  let generatedKey: number
  do {
    // Avoid clash in case certain number-based keys already exist.
    generatedKey = counter++
  } while (KEY_STORE[generatedKey])
  return generatedKey
}

import { TYPE_ERROR_DUPLICATE_SOURCE_KEY } from '../errors'
import { RelinkSourceKey } from '../schema'

const KEY_STORE: Record<RelinkSourceKey, true> = {}

/**
 * Registers a key into the store. If key already existed, throws an error.
 */
export function registerKey(key: RelinkSourceKey): void {
  if (!KEY_STORE[key]) {
    KEY_STORE[key] = true
  } else {
    throw TYPE_ERROR_DUPLICATE_SOURCE_KEY(key)
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
    // In case the auto-generated key clashes with existing dev-defined keys
    generatedKey = counter++
  } while (KEY_STORE[generatedKey])
  return generatedKey
}

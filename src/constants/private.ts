import { ObjectMarker } from '../internals/helper-types'
import { BUILD_TYPE } from './public'

export const $$INTERNALS = Symbol()

/**
 * @internal
 */
export const EMPTY_OBJECT: ObjectMarker = {} as const

/**
 * Refers to the non-production environment where Relink is used by developers.
 * @internal
 */
export const IS_DEV_ENV = process.env.NODE_ENV !== 'production'

/**
 * Refers to the environment used to develop Relink.
 * @internal
 */
export const IS_INTERNAL_DEBUG_ENV = process.env.IS_INTERNAL_DEBUG_ENV !== 'false'

/**
 * Used to be `IS_BROWSER_ENV` which only `typeof window` is checked.
 * In React Native, the window is not exactly the same as what it is in the
 * browser. Even though it is accessible now, there's no guarantee it will stay
 * the same in the future. A more logical and transparent way is to create a
 * separate build for React Native where `IS_CLIENT_ENV` will always be true.
 * Here, it is also assumed that the internal debug environment and UMD builds
 * run on a client.
 *
 * NOTE: This should only be used to control the library's behaviour in different
 * environments, NOT for checking whether browser APIs are available.
 *
 * @internal
 */
export const IS_CLIENT_ENV =
  IS_INTERNAL_DEBUG_ENV ||
  BUILD_TYPE === 'RN' ||
  BUILD_TYPE === 'UMD' ||
  BUILD_TYPE === 'UMD_MIN' ||
  typeof window !== 'undefined'
// ^ NOTE: `typeof window !== 'undefined'` must be placed at the last because
// the value remains unknown at compile time, and will result in dead code not
// trimmed even if one of the other statements can be evaluated to true.

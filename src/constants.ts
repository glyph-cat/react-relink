import { ObjectMarker } from './internals/helper-types'

export const $$INTERNALS = Symbol()

/**
 * Refers to the environment used to develop Relink.
 * @internal
 */
export const IS_INTERNAL_DEBUG_ENV = process.env.IS_INTERNAL_DEBUG_ENV !== 'false'

/**
 * Refers to the non-production environment where Relink is used by developers.
 * @internal
 */
export const IS_DEV_ENV = process.env.NODE_ENV !== 'production'

/**
 * @internal
 */
export const EMPTY_OBJECT: ObjectMarker = {} as const

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
export const IS_CLIENT_ENV = IS_INTERNAL_DEBUG_ENV ||
  process.env.BUILD_TYPE === 'react-native' ||
  process.env.BUILD_TYPE === 'umd' ||
  typeof window !== 'undefined'
// ^ NOTE: `typeof window !== 'undefined'` must be placed at the last because
// the value remains unknown at compile time, and will result in dead code not
// trimmed even when `IS_CLIENT_ENV` is undoubtedly true.

/**
 * @public
 */
export const VERSION = process.env.NPM_PACKAGE_VERSION

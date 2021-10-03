export const INTERNALS_SYMBOL = Symbol()

export const IS_DIST_ENV = process.env.IS_DIST_ENV === 'true'

/**
 * Used to be `IS_BROWSER_ENV` which only `typeof window` is checked.
 * In React Native, the window is not exactly the same as what it is in the
 * browser. Even though it is accessible now, there's no guarantee it will stay
 * the same in the future. A more logical and transparent way is to create a
 * separate build for React Native where `IS_CLIENT_ENV` will always be true.
 * Here, it is also assumed that the internal debug environment is a client by
 * checking `process.env.IS_DIST_ENV !== 'true'`. This 'internal debug
 * environment' refers to the one used when building this library.
 */
export const IS_CLIENT_ENV = !IS_DIST_ENV ||
  process.env.BUILD_ENV === 'react-native' ||
  typeof window !== 'undefined'
// ^ NOTE: `typeof window !== 'undefined'` must be placed at the last because
// the value remains unknown at compile time, and will result in dead code not
// trimmed even when `IS_CLIENT_ENV` is undoubtedly true.

export const IS_DEBUG_ENV = process.env.NODE_ENV !== 'production'

/**
 * @public
 */
export const VERSION = process.env.NPM_PACKAGE_VERSION

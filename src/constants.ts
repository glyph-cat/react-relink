export const INTERNALS_SYMBOL = Symbol()

export const IS_DEBUG_ENV = process.env.NODE_ENV !== 'production'

/**
 * Used to be `IS_BROWSER_ENV` which only `typeof window` is checked.
 * In React Native, the window is not exactly the same as what it is in the
 * browser. Even though it is accessible now, there's no guarantee it will stay
 * the same in the future. A more logical and transparent way is to create a
 * separate build for React Native where `IS_CLIENT_ENV` will always be true.
 */
export const IS_CLIENT_ENV = process.env.BUILD_ENV === 'react-native' ||
  typeof window !== 'undefined'

/**
 * @public
 */
export const VERSION = process.env.NPM_PACKAGE_VERSION

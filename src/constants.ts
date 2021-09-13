export const IS_DEBUG_ENV = process.env.NODE_ENV !== 'production'
export const IS_DIST_ENV = process.env['DIST_ENV'] === 'true'

export const INTERNALS_SYMBOL = Symbol()

export const IS_BROWSER_ENV = typeof window !== 'undefined'

/**
 * @public
 */
export const VERSION = process.env.NPM_PACKAGE_VERSION

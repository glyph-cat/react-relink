/**
 * @public
 */
export enum RelinkBuildType {
  /**
   * React Native
   */
  RN = 'RN',
  /**
   * Common JS
   */
  CJS = 'CJS',
  /**
   * EcmaScript
   */
  ES = 'ES',
  /**
   * EcmaScript (minified)
   */
  MJS = 'MJS',
  /**
   * Universal Module Definition
   */
  UMD = 'UMD',
  /**
   * Universal Module Definition (Minified)
   */
  UMD_MIN = 'UMD_MIN',
}

/**
 * @public
 */
export const BUILD_TYPE = process.env.BUILD_TYPE as RelinkBuildType

/**
 * @public
 */
export const BUILD_HASH = process.env.BUILD_HASH

/**
 * @public
 */
export const VERSION = process.env.NPM_PACKAGE_VERSION

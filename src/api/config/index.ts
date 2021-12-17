/**
 * @public
 */
export const RELINK_CONFIG = {
  /**
   * Hide warnings related to performance such as when reducers take too long
   * to complete executing.
   * @defaultValue `false`.
   */
  hidePerformanceWarnings: false,
  /**
   * Hide warnings about duplicate source keys, but be careful as duplicate
   * keys will result in FATAL ERROR(S) in production. Only hide warnings from
   * this category if you are certain that there are no duplicate keys in your
   * code.
   * @defaultValue `false`.
   */
  hideDuplicateKeyWarnings: false,
}

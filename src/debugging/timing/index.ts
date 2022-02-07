/**
 * The minimal time delay unit used in tests.
 * @internal
 */
export const TIME_GAP = (unit: number): number => 20 * unit // ms

/**
 * @internal
 */
export function delay(timeout: number): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout(resolve, timeout)
  })
}

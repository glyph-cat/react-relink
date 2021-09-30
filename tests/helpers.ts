import * as __relink__ from '../src'

export interface IntegrationTestProps {
  Relink: typeof __relink__
}

/**
 * The minimal time delay unit used in tests.
 */
export const TIME_GAP = (unit: number): number => 50 * unit // ms

export function delay(timeout: number): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout(resolve, timeout)
  })
}

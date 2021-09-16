import * as __relink__ from '../src'

export interface IntegrationTestProps {
  Relink: typeof __relink__
  buildEnv: {
    tag: string,
    IS_DEBUG: boolean
  }
}

/**
 * The minimal time delay unit used in tests.
 */
export const TIME_GAP = (unit: number): number => 50 * unit // ms

export function delay(timeout: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

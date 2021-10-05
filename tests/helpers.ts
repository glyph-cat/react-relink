import * as __relink__ from '../src'

export interface TestBuildConfig {
  buildType: 'cjs' | 'es' | 'umd'
  description: string
  src: typeof __relink__
}

export interface IntegrationTestProps {
  Relink: typeof __relink__
}

/**
 * The minimal time delay unit used in tests.
 */
export const TIME_GAP = (unit: number): number => 20 * unit // ms

export function delay(timeout: number): Promise<void> {
  return new Promise((resolve): void => {
    setTimeout(resolve, timeout)
  })
}

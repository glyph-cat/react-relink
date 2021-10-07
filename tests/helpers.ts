import * as __relink__ from '../src'

export interface IntegrationTestConfig {
  buildType: 'cjs' | 'es' | 'umd'
  buildEnv: 'debug' | 'dev' | 'prod'
  description: string
  Relink: typeof __relink__
}

export interface SampleSchema {
  foo: number,
  bar: number,
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

// export function mockDatabase() { }

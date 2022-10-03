import * as __relink__ from '../src/bundle'

export interface UnitTestConfig {
  buildType: 'cjs' | 'es' | 'rn' | 'umd'
  buildEnv: 'debug' | 'dev' | 'prod'
  description: string
  Relink: typeof __relink__
}

export interface IntegrationTestConfig {
  buildType: UnitTestConfig['buildType']
  buildEnv: UnitTestConfig['buildEnv']
  description: UnitTestConfig['description']
  loadSandbox(sandboxName: string): Promise<void>
  screenshotFactory(testName: string): {
    snap(screenshotName: string): Promise<void>
  }
}

export interface SampleSchema {
  foo: number,
  bar: number,
}

export interface PlayerSetSchema {
  player1: {
    nickname: string
    score: number,
  },
  player2: {
    nickname: string
    score: number,
  },
}

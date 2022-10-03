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
  loadSandbox(sandboxName: string): Promise<ISandboxUtility>
}

export interface ISandboxUtility {
  screenshotFactory(): {
    snap(screenshotName: string): Promise<void>
  }
  getRenderCount(): Promise<number>
  sessionStorage: {
    // NOTE: Read-only
    getItem(key: string): Promise<string>
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

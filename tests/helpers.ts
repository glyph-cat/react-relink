import * as __relink__ from '../src/bundle'

export interface IntegrationTestConfig {
  buildType: 'cjs' | 'es' | 'rn' | 'umd'
  buildEnv: 'debug' | 'dev' | 'prod'
  description: string
  Relink: typeof __relink__
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

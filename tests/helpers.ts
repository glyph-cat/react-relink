import * as __relink__ from '../src/bundle'
// import { RelinkSource } from '../src/api/source'
// import * as __relink__ from '..'

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

import * as __relink__ from '../src/bundle'

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

import * as __relink__ from '../../../src'

export interface IntegrationTestProps {
  Relink: typeof __relink__
  buildEnv: {
    tag: string,
    IS_DEBUG: boolean
  }
}

import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  testRegex: '.test.(tsx|ts|jsx|js)',
  testTimeout: 2000,
  timers: 'real',
  verbose: true,
}

export default config

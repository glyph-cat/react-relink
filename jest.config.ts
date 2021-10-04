import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  testRegex: '.test.(tsx|ts|jsx|js)',
  timers: 'real',
  verbose: true,
}

export default config

import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'jest-puppeteer',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '@testing-library/jest-dom/extend-expect',
  ],
  testPathIgnorePatterns: [
    '.draft',
    '.old',
  ],
  // transform: {
  //   '\\.(ts|tsx)$': [
  //     'babel-jest', {
  //       configFile: './config/jest.babelConfig.js',
  //     },
  //   ],
  // },
  maxWorkers: 1,
  testTimeout: 1000,
  /**
   * Prefer fake timers by default because it saves time.
   */
  fakeTimers: {
    enableGlobally: true,
  },
  testRegex: '.test.(tsx|ts|jsx|js)',
  // verbose: true,
}

export default config

// NOTES:
// - Seems like fake timers are disabled by default now.
// - Seems like tests can now work even without `testEnvironment` specified,
//   also, `testEnvironment: 'jsdom'` conflicts with Puppeteer.

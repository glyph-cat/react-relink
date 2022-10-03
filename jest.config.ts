import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  preset: 'jest-puppeteer',
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '@testing-library/jest-dom/extend-expect',
  ],
  testPathIgnorePatterns: [
    '.draft',
    '.old',
  ],
  testRegex: '.test.(tsx|ts|jsx|js)',
  // KIV: Seems like fake timers are disabled by default now
  // testEnvironment: 'jsdom',
  // KIV: Seems like tests can now work even without `testEnvironment` specified
  verbose: false,
}

export default config

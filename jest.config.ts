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
  // verbose: true,
}

export default config

// NOTES:
// - Seems like fake timers are disabled by default now.
// - Seems like tests can now work even without `testEnvironment` specified,
//   also, `testEnvironment: 'jsdom'` conflicts with Puppeteer.

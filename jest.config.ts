import { Config } from '@jest/types'

const config: Config.InitialOptions = {
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.ts',
    '@testing-library/jest-dom/extend-expect',
  ],
  testPathIgnorePatterns: [
    '.draft',
    '.old',
  ],
  testRegex: '.test.(tsx|ts|jsx|js)',
  testTimeout: 1000,
  // Seems like fake timers are disabled by default now
  testEnvironment: 'jsdom',
  verbose: false,
}

export default config

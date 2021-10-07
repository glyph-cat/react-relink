import { dumpDebuglogs } from './src/private/debug-logger'

jest.mock('scheduler', () => require('scheduler/unstable_mock'))

afterAll((): void => {
  dumpDebuglogs()
})

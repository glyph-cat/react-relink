import { dumpDebuglogs } from './src/internals/debug-logger'

jest.mock('scheduler', (): unknown => require('scheduler/unstable_mock'))

afterEach((): void => {
  dumpDebuglogs()
})

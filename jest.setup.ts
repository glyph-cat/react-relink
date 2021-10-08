import { dumpDebuglogs } from './src/private/debug-logger'

jest.mock('scheduler', (): unknown => require('scheduler/unstable_mock'))

afterEach((): void => {
  dumpDebuglogs()
})

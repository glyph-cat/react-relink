import { dumpDebuglogs } from './src/debugging'

jest.mock('scheduler', (): unknown => require('scheduler/unstable_mock'))

afterEach((): void => {
  dumpDebuglogs()
})

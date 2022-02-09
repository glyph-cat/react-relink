import { SHALLOW_COMPARE_INVOCATION_SPY } from './src/api/compare-fn-presets'
import { dumpDebuglogs } from './src/debugging'

jest.mock('scheduler', (): unknown => require('scheduler/unstable_mock'))

afterEach((): void => {
  dumpDebuglogs()
  SHALLOW_COMPARE_INVOCATION_SPY.current = []
})

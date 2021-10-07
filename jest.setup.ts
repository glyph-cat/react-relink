import { dumpDebuglogs } from './src/private/debug-logger'

afterAll((): void => {
  dumpDebuglogs()
})

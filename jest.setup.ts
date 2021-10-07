import { dumpNDlogs } from './src/private/ndlog'

afterAll((): void => {
  dumpNDlogs()
})

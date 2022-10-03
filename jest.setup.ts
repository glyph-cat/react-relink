// import { ChildProcess, exec } from 'child_process'

jest.mock('scheduler', (): unknown => require('scheduler/unstable_mock'))

// jest.setTimeout(3000)
// let cp: ChildProcess
// beforeAll(() => {
//   cp = exec('yarn playground:web', (err, stdout, stderr) => {
//     // eslint-disable-next-line no-console
//     console.log({ err, stdout, stderr })
//   })
//   return new Promise<void>((resolve) => {
//     setTimeout(() => { resolve() }, 2000)
//   })
// })
// afterAll(() => {
//   if (typeof cp?.kill === 'function') {
//     cp.kill(0)
//   }
// })

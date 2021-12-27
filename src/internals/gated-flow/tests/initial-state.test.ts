import { delay, TIME_GAP } from '../../../debugging'
import { createGatedFlow } from '..'

// NOTE: Every time `M$exec` is called, so is `M$flush`, but the callbacks
// are not invoked because the gate is not opened, making the while-loop in
// `M$flush` unreachable.
describe('Initial state', (): void => {

  describe('Open (callbacks should run right away)', (): void => {

    test('Synchronous callbacks only', (): void => {
      const gateKeeper = createGatedFlow(true, 'test/gated-flow/initial-state/open/sync-cb-only')
      const callback = jest.fn()
      gateKeeper.M$exec(() => { callback() })
      expect(callback).toHaveBeenCalledTimes(1)
      gateKeeper.M$exec(() => { callback() })
      expect(callback).toHaveBeenCalledTimes(2)
      gateKeeper.M$exec(() => { callback() })
      expect(callback).toHaveBeenCalledTimes(3)
    })

    test('Mixed with asynchronous callbacks', async (): Promise<void> => {
      const gateKeeper = createGatedFlow(true, 'test/gated-flow/initial-state/open/mixed-cb')
      const callback = jest.fn()
      gateKeeper.M$exec(() => { callback() })
      expect(callback).toHaveBeenCalledTimes(1)
      gateKeeper.M$exec(async () => { callback() })
      expect(callback).toHaveBeenCalledTimes(2)
      gateKeeper.M$exec(async () => {
        await delay(TIME_GAP(1))
        callback()
      })
      await delay(TIME_GAP(2))
      expect(callback).toHaveBeenCalledTimes(3)
    })

  })

  describe('Closed (callbacks should not run right away)', (): void => {

    test('Synchronous callbacks only', (): void => {
      const gateKeeper = createGatedFlow(false, 'test/gated-flow/initial-state/closed/sync-cb-only')
      const callback = jest.fn()
      gateKeeper.M$exec((): void => { callback() })
      gateKeeper.M$exec((): void => { callback() })
      gateKeeper.M$exec((): void => { callback() })
      expect(callback).not.toHaveBeenCalled()
      gateKeeper.M$open()
      expect(callback).toHaveBeenCalledTimes(3)
    })

    test('Mixed with asynchronous callbacks', async (): Promise<void> => {
      const gateKeeper = createGatedFlow(false, 'test/gated-flow/initial-state/closed/mixed-cb')
      const callback = jest.fn()
      gateKeeper.M$exec((): void => { callback() })
      gateKeeper.M$exec(async (): Promise<void> => { callback() })
      gateKeeper.M$exec(async (): Promise<void> => {
        await delay(TIME_GAP(1))
        callback()
      })
      expect(callback).not.toHaveBeenCalled()
      gateKeeper.M$open()
      await delay(TIME_GAP(2))
      expect(callback).toHaveBeenCalledTimes(3)
    })

  })

})

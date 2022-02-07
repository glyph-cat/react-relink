import {
  createCleanupRef,
  createHookInterface,
} from '@glyph-cat/react-test-utils'
import { act } from 'react-test-renderer'
import { delay, TIME_GAP } from '../../../src/debugging'
import { RelinkSourceSchema } from '../../../src/schema'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * Make sure using virtual batch reduces the render count when state changes
// happen very frequently.

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useRelinkState } = Relink

  let Source: RelinkSourceSchema<number>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    cleanupRef.run()
    Source.cleanup()
  })

  test('With Virtual Batch', async (): Promise<void> => {

    Source = createSource({
      key: 'test/virtual-batch',
      default: 1,
      options: {
        virtualBatch: true,
      },
    })
    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source),
      values: {
        value: ({ hookData }): number => {
          const [counter] = hookData
          return counter
        },
      },
    }, cleanupRef)

    // Initial phase
    expect(hookInterface.getRenderCount()).toBe(1)

    // Set state multiple times in the same `act()` callback
    await act(async (): Promise<void> => {
      for (let i = 0; i < 4; i++) {
        await Source.set(c => c + 1)
      }
    })
    await act(async (): Promise<void> => {
      await delay(TIME_GAP(1))
    })
    expect(hookInterface.get('value')).toBe(5)

    // Check for unnecessary renders
    expect(hookInterface.getRenderCount()).toBe(2)

  })

  test('Without Virtual Batch', async (): Promise<void> => {

    Source = createSource({
      key: 'test/virtual-batch',
      default: 1,
      options: {
        virtualBatch: false,
      },
    })
    const hookInterface = createHookInterface({
      useHook: () => useRelinkState(Source),
      values: {
        value: ({ hookData }): number => {
          const [counter] = hookData
          return counter
        },
      },
    }, cleanupRef)

    // Initial phase
    expect(hookInterface.getRenderCount()).toBe(1)

    // Set state multiple times in the same `act()` callback
    await act(async (): Promise<void> => {
      for (let i = 0; i < 4; i++) {
        await Source.set(c => c + 1)
      }
    })
    await act(async (): Promise<void> => {
      await delay(TIME_GAP(1))
    })
    expect(hookInterface.get('value')).toBe(5)

    // Check render count
    expect(hookInterface.getRenderCount()).toBe(5)

  })

})

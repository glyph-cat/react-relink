import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'
import { getFreshTestData } from '../../test-data'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkState } = Relink
  describe('Complex object', (): void => {

    test('Mutable', (): void => {

      const Source = createSource({
        key: 'test/same-value-no-update/complex/mutable:true',
        default: getFreshTestData(),
        options: {
          mutable: true,
        },
      })
      const hookInterface = createHookInterface({
        useHook: () => useRelinkState(Source),
        actions: {
          setState: ({ hookData }): void => {
            const [, updateState] = hookData
            updateState(oldState => oldState)
          },
        },
      }, cleanupRef)

      // We can spam as many setState called as we like
      hookInterface.actions('setState')
      hookInterface.actions('setState')
      hookInterface.actions('setState')
      // But if the resulting state is the same, no component update should take place
      expect(hookInterface.getRenderCount()).toBe(1)

      // Cleanup
      Source.UNSTABLE_cleanup()

    })

    test('Immutable', (): void => {

      const Source = createSource({
        key: 'test/same-value-no-update/complex/mutable:false',
        default: getFreshTestData(),
        options: {
          mutable: false,
        },
      })
      const hookInterface = createHookInterface({
        useHook: () => useRelinkState(Source),
        actions: {
          setState: ({ hookData }): void => {
            const [, updateState] = hookData
            updateState(getFreshTestData())
          },
        },
      }, cleanupRef)

      // We can spam as many setState called as we like
      hookInterface.actions('setState')
      hookInterface.actions('setState')
      hookInterface.actions('setState')
      // But if the resulting state is the same, no component update should take place
      expect(hookInterface.getRenderCount()).toBe(1)

      // Cleanup
      Source.UNSTABLE_cleanup()

    })

  })
}

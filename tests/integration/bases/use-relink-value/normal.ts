import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../constants'

const cleanupRef = createCleanupRef()
afterEach(() => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkValue } = Relink
  test('Normal', () => {

    const Source = createSource({
      key: `test/${useRelinkValue.name}`,
      default: 1,
    })

    const hookInterface = createHookInterface({
      useHook: () => useRelinkValue(Source),
      values: {
        value: ({ hookData }) => hookData,
      },
    }, cleanupRef)
    expect(hookInterface.get('value')).toBe(1)

    // Cleanup
    Source.UNSTABLE_cleanup()

  })
}

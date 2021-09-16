import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { IntegrationTestProps } from '../../../helpers'

const cleanupRef = createCleanupRef()
afterEach((): void => { cleanupRef.run() })

export default function ({ Relink }: IntegrationTestProps): void {
  const { createSource, useRelinkValue } = Relink
  const TEST_METHOD_NAME = 'useRelinkValue'
  test('Normal', (): void => {

    const Source = createSource({
      key: `test/${TEST_METHOD_NAME}`,
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

import {
  createCleanupRef,
  createHookInterface,
} from '@chin98edwin/react-test-utils'
import { RelinkSource } from '../../../src'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

// Test objectives:
// * ...

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, useRelinkValue } = Relink

  let Source: RelinkSource<number>
  const cleanupRef = createCleanupRef()
  afterEach((): void => {
    Source.cleanup()
    cleanupRef.run()
  })

  test.skip('Not ready', (): void => { expect('').toBe('') })

})

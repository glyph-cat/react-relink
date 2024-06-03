import { MutableRefObject } from 'react'
import type { RelinkSource } from '../../../../src/bundle'
import { IntegrationTestConfig, ISampleState } from '../../../helpers'
import { wrapper } from '../../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource } = Relink

  jest.useRealTimers()

  let Source: RelinkSource<ISampleState> = null
  afterEach(async () => {
    await Source.dispose()
    Source = null
  })

  test('main', async () => {

    const DEFAULT_STATE = {
      foo: 1,
      bar: 1,
    }

    const spiedValue: MutableRefObject<typeof DEFAULT_STATE> = { current: null }

    Source = new RelinkSource({
      key: 'test/Source.hydrate()/defaultState',
      default: DEFAULT_STATE,
    })

    await Source.hydrate(({ commitNoop, defaultState }) => {
      spiedValue.current = defaultState
      commitNoop()
    })

    expect(Object.is(spiedValue.current, DEFAULT_STATE)).toBe(true)

  })

})

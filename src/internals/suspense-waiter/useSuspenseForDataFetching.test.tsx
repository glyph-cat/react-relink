import React, { Suspense, useLayoutEffect } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { createSource } from '../../api/source'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { RelinkSource } from '../../schema'
import { delay, TIME_GAP } from '../../../tests/helpers'

describe.skip(useSuspenseForDataFetching.name, (): void => {

  jest.useFakeTimers()

  let root: ReactTestRenderer
  let Source: RelinkSource<number>
  afterEach((): void => {
    Source.cleanup()
    root.unmount()
  })

  test('main', (): void => {

    Source = createSource({
      key: 'test/suspense',
      default: null,
      lifecycle: {
        async init({ commit }) {
          await delay(TIME_GAP(2))
          commit(1)
        },
      },
      options: {
        suspense: true,
      },
    })

    let isFallbackComponentMounted = false
    function FallbackComponent(): JSX.Element {
      useLayoutEffect(() => {
        isFallbackComponentMounted = true
        return () => {
          isFallbackComponentMounted = false
        }
      }, [])
      return null
    }

    let isInnerComponentMounted = false
    function InnerComponent(): JSX.Element {
      useSuspenseForDataFetching(Source)
      useLayoutEffect(() => {
        isInnerComponentMounted = true
        return () => {
          isInnerComponentMounted = false
        }
      }, [])
      return null
    }

    function OuterComponent(): JSX.Element {
      return (
        <Suspense fallback={<FallbackComponent />}>
          <InnerComponent />
        </Suspense>
      )
    }

    act((): void => {
      root = create(<OuterComponent />)
      jest.advanceTimersByTime(TIME_GAP(1))
    })
    expect(isFallbackComponentMounted).toBe(true)
    expect(isInnerComponentMounted).toBe(false)

    act((): void => {
      jest.advanceTimersByTime(TIME_GAP(2))
    })
    expect(isFallbackComponentMounted).toBe(false)
    expect(isInnerComponentMounted).toBe(true)

  })

})

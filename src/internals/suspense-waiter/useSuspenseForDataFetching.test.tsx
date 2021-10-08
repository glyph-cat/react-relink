import React, { Suspense, useLayoutEffect } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { createSource } from '../../api/source'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { RelinkSource } from '../../schema'
import { delay, TIME_GAP } from '../../../tests/helpers'
import { genericDebugLogger } from '../debug-logger'

describe(useSuspenseForDataFetching.name, (): void => {

  let root: ReactTestRenderer
  let Source: RelinkSource<number>
  afterEach((): void => {
    Source.cleanup()
    root.unmount()
  })

  test('main', async (): Promise<void> => {

    Source = createSource({
      key: 'test/suspense',
      default: null,
      lifecycle: {
        async init({ commit }) {
          await delay(TIME_GAP(1))
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
        genericDebugLogger.echo('FallbackComponent mounted')
        genericDebugLogger.echo(JSON.stringify(getComponentMountStatus()))
        return () => {
          isFallbackComponentMounted = false
          genericDebugLogger.echo('FallbackComponent unmounting')
          genericDebugLogger.echo(JSON.stringify(getComponentMountStatus()))
        }
      }, [])
      return null
    }

    let isInnerComponentMounted = false
    function InnerComponent(): JSX.Element {
      useSuspenseForDataFetching(Source)
      useLayoutEffect(() => {
        isInnerComponentMounted = true
        genericDebugLogger.echo('InnerComponent mounted')
        genericDebugLogger.echo(JSON.stringify(getComponentMountStatus()))
        return () => {
          isInnerComponentMounted = false
          genericDebugLogger.echo('InnerComponent unmounting')
          genericDebugLogger.echo(JSON.stringify(getComponentMountStatus()))
        }
      }, [])
      return null
    }

    // We want both to be evaluated at the same time, under the same `expect`,
    // just to be sure.
    const getComponentMountStatus = () => ({
      isFallbackComponentMounted,
      isInnerComponentMounted,
    })

    function OuterComponent(): JSX.Element {
      return (
        <Suspense fallback={<FallbackComponent />}>
          <InnerComponent />
        </Suspense>
      )
    }

    act((): void => {
      root = create(<OuterComponent />)
    })
    expect(getComponentMountStatus()).toStrictEqual({
      isFallbackComponentMounted: true,
      isInnerComponentMounted: false,
    })

    // KIV: Not sure why await/async is needed here otherwise the test fails
    await act(async (): Promise<void> => {
      await delay(TIME_GAP(2))
    })
    expect(getComponentMountStatus()).toStrictEqual({
      isFallbackComponentMounted: false,
      isInnerComponentMounted: true,
    })

    // Check if component enters suspense mode again if source rehydrates
    genericDebugLogger.echo('A')
    act((): void => {
      genericDebugLogger.echo('B')
      Source.hydrate(async ({ commit }): Promise<void> => {
        genericDebugLogger.echo('C')
        await delay(TIME_GAP(2))
        genericDebugLogger.echo('D')
        act((): void => {
          genericDebugLogger.echo('E')
          commit(2)
          genericDebugLogger.echo('F')
        })
        genericDebugLogger.echo('G')
      })
      genericDebugLogger.echo('H')
    })
    genericDebugLogger.echo('I')
    await act(async (): Promise<void> => {
      genericDebugLogger.echo('J')
      await delay(TIME_GAP(1))
      genericDebugLogger.echo('K')
    })
    genericDebugLogger.echo('L')
    await act(async (): Promise<void> => {
      genericDebugLogger.echo('M')
      await delay(TIME_GAP(1))
      genericDebugLogger.echo('N')
    })
    genericDebugLogger.echo('O')
    expect(getComponentMountStatus()).toStrictEqual({
      isFallbackComponentMounted: true,
      isInnerComponentMounted: false,
    })

  })

})


// 01:07:51.908 FallbackComponent mounted
// 01:07:51.909 {"isFallbackComponentMounted":true,"isInnerComponentMounted":false}
// 01:07:51.955 FallbackComponent unmounting
// 01:07:51.955 {"isFallbackComponentMounted":false,"isInnerComponentMounted":false}
// 01:07:51.955 InnerComponent mounted
// 01:07:51.955 {"isFallbackComponentMounted":false,"isInnerComponentMounted":true}
// 01:07:51.957 A
// 01:07:51.957 B
// 01:07:51.957 C
// 01:07:51.958 H
// 01:07:51.959 FallbackComponent mounted
// 01:07:51.959 {"isFallbackComponentMounted":true,"isInnerComponentMounted":true}
// 01:07:51.959 I
// 01:07:51.959 J
// 01:07:51.979 K
// 01:07:51.979 L
// 01:07:51.979 M
// 01:07:51.999 D
// 01:07:51.999 E
// 01:07:51.999 F
// 01:07:51.999 G
// 01:07:51.999 N
// 01:07:52.872 InnerComponent unmounting
// 01:07:52.872 {"isFallbackComponentMounted":true,"isInnerComponentMounted":false}
// 01:07:52.872 FallbackComponent unmounting
// 01:07:52.872 {"isFallbackComponentMounted":false,"isInnerComponentMounted":false}

// Questions:
// * How can there be so long of a delay and nothing happens?
// * Why did the timestamp went backwards after '01:07:51.999 N'?

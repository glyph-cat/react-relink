import { delay } from '@glyph-cat/swiss-army-knife'
import {
  Suspense,
  useLayoutEffect, // eslint-disable-line no-restricted-imports
} from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { RelinkSource } from '../../api/source'
import { useSuspenseForDataFetching } from '../../internals/suspense-waiter'
import { TIME_GAP } from '../../debugging'

describe(useSuspenseForDataFetching.name, (): void => {

  let root: ReactTestRenderer
  let Source: RelinkSource<number>
  afterEach(async () => {
    await Source.dispose()
    root.unmount()
  })

  test('main', async () => {

    Source = new RelinkSource({
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

    // Refer to Local Note [A] near end of file
    await act(async () => {
      await delay(TIME_GAP(2))
    })
    expect(getComponentMountStatus()).toStrictEqual({
      isFallbackComponentMounted: false,
      isInnerComponentMounted: true,
    })

    // Check if component enters suspense mode again if source rehydrates
    act((): void => {
      Source.hydrate(async ({ commit }) => {
        await delay(TIME_GAP(1))
        act((): void => {
          commit(2)
        })
      })
    })
    expect(getComponentMountStatus()).toStrictEqual({
      isFallbackComponentMounted: true,
      isInnerComponentMounted: true,
      // KIV: Not sure why InnerComponent stays mounted
      // Tested in playground, got the same behaviour.
    })

    // Refer to Local Note [A] near end of file
    await act(async () => {
      await delay(TIME_GAP(2))
    })
    expect(getComponentMountStatus()).toStrictEqual({
      isFallbackComponentMounted: false,
      isInnerComponentMounted: true,
    })

  })

})

// === Local Notes ===
// KIV [A] Not sure why await/async is needed here otherwise we can't get the
//         expected results.

import { StrictMode, useEffect } from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, useRelinkValue } = Relink

  interface IState {
    counter: number
    isInnermostVisible: boolean
  }

  let Source: $RelinkSource<IState>
  let root: ReactTestRenderer
  afterEach(async () => {
    await Source.dispose()
    root.unmount()
    root = null
  })

  test('Main', async () => {

    Source = new RelinkSource<IState>({
      key: 'test/no-update-after-unmount',
      default: {
        counter: 0,
        isInnermostVisible: true,
      },
    })

    type StatKey = 'innermost' | 'middle' | 'outermost'

    interface ComponentStat {
      isMounted: boolean
      renderCount: number
    }

    const componentStats: Record<StatKey, ComponentStat> = {
      innermost: {
        isMounted: false,
        renderCount: 0,
      },
      middle: {
        isMounted: false,
        renderCount: 0,
      },
      outermost: {
        isMounted: false,
        renderCount: 0,
      },
    }

    function useStats(key: StatKey): void {
      componentStats[key].renderCount += 1
      useEffect(() => {
        componentStats[key].isMounted = true
        return () => { componentStats[key].isMounted = false }
      }, [key])
    }

    function InnermostComponent(): JSX.Element {
      const state = useRelinkValue(Source)
      useStats('innermost')
      return <span>{JSON.stringify(state)}</span>
    }

    function MiddleComponent(): JSX.Element {
      const state = useRelinkValue(Source)
      useStats('middle')
      return (
        <div>
          {JSON.stringify(state)}
          <InnermostComponent />
        </div>
      )
    }

    function OutermostComponent(): JSX.Element {
      const state = useRelinkValue(Source)
      useStats('outermost')
      return (
        <div>
          {state.isInnermostVisible && <MiddleComponent />}
        </div>
      )
    }

    act(() => {
      root = create(
        <StrictMode>
          <OutermostComponent />
        </StrictMode>
      )
    })

    expect(componentStats).toStrictEqual({
      innermost: {
        isMounted: true,
        renderCount: 1,
      },
      middle: {
        isMounted: true,
        renderCount: 1,
      },
      outermost: {
        isMounted: true,
        renderCount: 1,
      },
    })

    await act(async () => {
      await Source.set((state) => ({
        ...state,
        counter: state.counter + 1,
      }))
    })

    expect(componentStats).toStrictEqual({
      innermost: {
        isMounted: true,
        renderCount: 2,
      },
      middle: {
        isMounted: true,
        renderCount: 2,
      },
      outermost: {
        isMounted: true,
        renderCount: 2,
      },
    })

    await act(async () => {
      await Source.set((state) => ({
        ...state,
        isInnermostVisible: false,
      }))
    })

    expect(componentStats).toStrictEqual({
      innermost: {
        isMounted: false,
        renderCount: 2,
      },
      middle: {
        isMounted: false,
        renderCount: 2,
      },
      outermost: {
        isMounted: true,
        renderCount: 3,
      },
    })

  })

})

import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
} from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: UnitTestConfig): void => {

  const { RelinkSource, RelinkScope, useRelinkState } = Relink

  test('main', async () => {

    let root: ReactTestRenderer

    const MainCounterSource = new RelinkSource({
      key: 'test/RelinkScope/counter/main',
      default: 1,
    })

    let counterValueFromOuterSandbox: number
    let counterValueFromInnerSandbox: number
    const REF_changeValueForOuterSandbox: MutableRefObject<() => Promise<void>> = {
      current: null
    }
    const REF_changeValueForInnerSandbox: MutableRefObject<() => Promise<void>> = {
      current: null
    }

    function App(): JSX.Element {
      const SubCounterSource = useRef<typeof MainCounterSource>()
      if (!SubCounterSource.current) {
        SubCounterSource.current = new RelinkSource({
          key: 'test/RelinkScope/counter/sub',
          scope: MainCounterSource,
          default: 100,
        })
      }
      const onOuterSandboxMount = useCallback((c: number): void => {
        counterValueFromOuterSandbox = c
      }, [])
      const onInnerSandboxMount = useCallback((c: number): void => {
        counterValueFromInnerSandbox = c
      }, [])
      return (
        <div>
          <Sandbox
            onMount={onOuterSandboxMount}
            onChangeValueRequestedRef={REF_changeValueForOuterSandbox}
          />
          <RelinkScope sources={[SubCounterSource.current]}>
            <Sandbox
              onMount={onInnerSandboxMount}
              onChangeValueRequestedRef={REF_changeValueForInnerSandbox}
            />
          </RelinkScope>
        </div>
      )
    }

    interface SandboxProps {
      onMount(c: number): void
      onChangeValueRequestedRef: MutableRefObject<() => void>
    }

    function Sandbox({
      onMount,
      onChangeValueRequestedRef,
    }: SandboxProps): JSX.Element {
      const [counter, setCounter] = useRelinkState(MainCounterSource)
      useEffect(() => { onMount(counter) }, [counter, onMount])
      useEffect(() => {
        onChangeValueRequestedRef.current = async () => {
          await setCounter(c => (c + 1) * 2)
        }
      }, [onChangeValueRequestedRef, setCounter])

      return <>{counter}</>
    }

    // First render
    act((): void => { root = create(<App />) })
    expect(counterValueFromOuterSandbox).toBe(1)
    expect(counterValueFromInnerSandbox).toBe(100)

    // After change value
    await act(async () => {
      await REF_changeValueForOuterSandbox.current()
      await REF_changeValueForInnerSandbox.current()
    })
    expect(counterValueFromOuterSandbox).toBe(4)
    expect(counterValueFromInnerSandbox).toBe(202)

    // Cleanup
    await MainCounterSource.dispose()
    root.unmount()

  })

})

import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef, // eslint-disable-line no-restricted-imports
} from 'react'
import { act, create, ReactTestRenderer } from 'react-test-renderer'
import { CallbackWithNoParamAndReturnsVoid } from '../../../src/internals/helper-types'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource, RelinkScope, useRelinkState } = Relink

  test('main', async (): Promise<void> => {

    let root: ReactTestRenderer

    const CounterSource = createSource({
      key: 'test/RelinkScope/main-counter',
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
      const SubCounterSource = useRef<typeof CounterSource>()
      if (!SubCounterSource.current) {
        SubCounterSource.current = createSource({
          key: 'test/RelinkScope/main-counter',
          scope: CounterSource,
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
      onChangeValueRequestedRef: MutableRefObject<CallbackWithNoParamAndReturnsVoid>
    }

    function Sandbox({
      onMount,
      onChangeValueRequestedRef,
    }: SandboxProps): JSX.Element {
      const [counter, setCounter] = useRelinkState(CounterSource)
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
    await act(async (): Promise<void> => {
      await REF_changeValueForOuterSandbox.current()
      await REF_changeValueForInnerSandbox.current()
    })
    expect(counterValueFromOuterSandbox).toBe(4)
    expect(counterValueFromInnerSandbox).toBe(202)

    // Cleanup
    CounterSource.cleanup()
    root.unmount()

  })

})

import { useCallback } from 'react'
import { MainButtonStack } from '../../components/button-stack'
import { CounterValue } from '../../components/counter-value'
import { DebugFrame } from '../../components/debug-frame'
import { Divider } from '../../components/divider'
import { ExplanationText } from '../../components/explanation-text'
import { useRef, useRelinkPackage } from '../../utils'
import { TestId } from './constants'

function Sandbox(): JSX.Element {

  const { RelinkSource, useRelinkValue } = useRelinkPackage()

  const CounterSource = useRef(() => new RelinkSource({
    key: 'counter',
    default: 0,
  }))

  const counterValue = useRelinkValue(CounterSource.current)

  const increaseCounterWithPromiseAll = useCallback(async () => {
    const pr1 = CounterSource.current.set((c) => c + 1)
    const pr2 = CounterSource.current.set((c) => c + 1)
    const pr3 = CounterSource.current.set((c) => c + 1)
    const pr4 = CounterSource.current.set((c) => c + 1)
    const pr5 = CounterSource.current.set((c) => c + 1)
    await Promise.allSettled([pr1, pr2, pr3, pr4, pr5])
  }, [])

  const increaseCounterWithoutAwait = useCallback(async () => {
    CounterSource.current.set((c) => c + 1)
    CounterSource.current.set((c) => c + 1)
    CounterSource.current.set((c) => c + 1)
    CounterSource.current.set((c) => c + 1)
    CounterSource.current.set((c) => c + 1)
  }, [])

  const increaseCounterWithAwait = useCallback(async () => {
    await CounterSource.current.set((c) => c + 1)
    await CounterSource.current.set((c) => c + 1)
    await CounterSource.current.set((c) => c + 1)
    await CounterSource.current.set((c) => c + 1)
    await CounterSource.current.set((c) => c + 1)
  }, [])

  return (
    <DebugFrame>
      <CounterValue value={counterValue} />
      <MainButtonStack>
        <ExplanationText>This is applicable for React 18 and above only.</ExplanationText>
        <Divider />
        <button
          data-test-id={TestId.button.PROMISE_ALL}
          onClick={increaseCounterWithPromiseAll}
        >
          {'Increase counter (await Promise.all)'}
        </button>
        <button
          data-test-id={TestId.button.WITHOUT_AWAIT}
          onClick={increaseCounterWithoutAwait}
        >
          {'Increase counter (without await)'}
        </button>
        <button
          data-test-id={TestId.button.WITH_AWAIT}
          onClick={increaseCounterWithAwait}
        >
          {'Increase counter (with await)'}
        </button>
      </MainButtonStack>
    </DebugFrame>
  )
}

export default Sandbox

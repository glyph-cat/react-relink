import { useCallback } from 'react'
import { HorizontalButtonStack, MainButtonStack } from '../../components/button-stack'
import { CounterValue } from '../../components/counter-value'
import { DebugFrame } from '../../components/debug-frame'
import { useRef, useRelinkPackage } from '../../utils'
import { TestId } from './constants'

function Sandbox(): JSX.Element {

  const { RelinkSource, useRelinkState } = useRelinkPackage()

  const SOURCE_KEY = 'counter'
  const CounterSource = useRef(() => new RelinkSource({
    key: SOURCE_KEY,
    default: 0,
    lifecycle: {
      init({ commit, skip }) {
        const rawData = sessionStorage.getItem(SOURCE_KEY)
        if (rawData) {
          commit(JSON.parse(rawData))
          return // Early exit
        }
        skip()
      },
      didSet({ state }) {
        sessionStorage.setItem(SOURCE_KEY, JSON.stringify(state))
      },
      didReset() {
        sessionStorage.removeItem(SOURCE_KEY)
      },
    },
  }))

  const [counter, setCounter, resetCounter] = useRelinkState(CounterSource.current)

  const increaseCounter = useCallback(async () => {
    await setCounter(c => c + 1)
  }, [setCounter])

  const setCounter42 = useCallback(async () => {
    await setCounter(42)
  }, [setCounter])

  const hydrateCounter = useCallback(async () => {
    await CounterSource.current.hydrate(({ commit }) => { commit(36) })
  }, [CounterSource])

  return (
    <DebugFrame>
      <CounterValue value={counter} />
      <MainButtonStack>
        <HorizontalButtonStack>
          <button
            data-test-id={TestId.button.INCREASE_COUNTER}
            onClick={increaseCounter}
          >
            {'+1'}
          </button>
          <button
            data-test-id={TestId.button.SET_COUNTER_42}
            onClick={setCounter42}
          >
            {'Set value to 42'}
          </button>
        </HorizontalButtonStack>
        <button
          data-test-id={TestId.button.RESET_COUNTER}
          onClick={resetCounter}
        >
          {'Reset'}
        </button>
        <button
          data-test-id={TestId.button.HYDRATE_COUNTER}
          onClick={hydrateCounter}
        >
          {'Hydrate to 36'}
        </button>
      </MainButtonStack>
    </DebugFrame>
  )
}

export default Sandbox

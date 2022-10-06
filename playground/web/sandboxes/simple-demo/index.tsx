import { useCallback } from 'react'
import { DebugFrame } from '../../components/debug-frame'
import { useRef, useRelinkPackage } from '../../utils'
import styles from './index.module.css'

function Sandbox(): JSX.Element {

  const { RelinkSource, useRelinkState } = useRelinkPackage()

  const SOURCE_KEY = 'counter'
  const { current: CounterSource } = useRef(() => new RelinkSource({
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
  const [counter, setCounter, resetCounter] = useRelinkState(CounterSource)

  const increaseCounter = useCallback(async () => {
    await setCounter(c => c + 1)
  }, [setCounter])

  const setCounter42 = useCallback(async () => {
    await setCounter(42)
  }, [setCounter])

  const hydrateCounter = useCallback(async () => {
    await CounterSource.hydrate(({ commit }) => { commit(36) })
  }, [CounterSource])

  return (
    <DebugFrame>
      <h1
        data-test-id='counter-value'
        className={styles.counterValue}
      >
        {counter}
      </h1>
      <div style={{ display: 'grid', justifyContent: 'center' }}>
        <div style={{
          display: 'grid',
          gap: 10,
          width: 600,
        }}>
          <div style={{
            display: 'grid',
            gap: 10,
            gridAutoFlow: 'column',
          }}>
            <button data-test-id='button-increase-counter' onClick={increaseCounter}>
              {'+1'}
            </button>
            <button data-test-id='button-set-counter-42' onClick={setCounter42}>
              {'Set value to 42'}
            </button>
          </div>
          <button data-test-id='button-reset-counter' onClick={resetCounter}>
            {'Reset'}
          </button>
          <button data-test-id='button-hydrate-counter' onClick={hydrateCounter}>
            {'Hydrate to 36'}
          </button>
        </div>
      </div>

    </DebugFrame>
  )
}

export default Sandbox

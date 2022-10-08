import { useCallback, useState } from 'react'
import { RelinkSource as $RelinkSource } from '../../../../lib/types'
import { DebugFrame } from '../../components/debug-frame'
import { useRelinkPackage } from '../../utils'
import styles from './index.module.css'

let CounterSource: $RelinkSource<number>

function Sandbox(): JSX.Element {

  const { RelinkSource, useRelinkValue } = useRelinkPackage()

  if (!CounterSource) {
    CounterSource = new RelinkSource({
      key: 'counter',
      default: 0,
    })
  }

  const [isActive, setActiveState] = useState(true)
  const counterValue = useRelinkValue(CounterSource, null, isActive)

  const increaseCounter = useCallback(async () => {
    await CounterSource.set((c) => c + 1)
  }, [])

  const stopListening = useCallback(() => {
    setActiveState(false)
  }, [])

  const startListening = useCallback(() => {
    setActiveState(true)
  }, [])

  return (
    <DebugFrame>
      <h1
        className={styles.counterValue}
        data-test-id='counter-value'
      >
        {counterValue}
      </h1>
      <div style={{ display: 'grid', justifyContent: 'center' }}>
        <div style={{
          display: 'grid',
          gap: 10,
          width: 600,
        }}>
          <button
            data-test-id='button-increase-counter'
            onClick={increaseCounter}
          >
            {'Increase counter'}
          </button>
          <div style={{
            display: 'grid',
            gap: 10,
            gridAutoFlow: 'column',
          }}>
            <button
              data-test-id='button-stop-listening'
              onClick={stopListening}
            >
              {'Stop listening'}
            </button>
            <button
              data-test-id='button-start-listening'
              onClick={startListening}
            >
              {'Start listening'}
            </button>
          </div>
        </div>
      </div>

    </DebugFrame>
  )
}

export default Sandbox

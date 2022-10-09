import { useCallback, useState } from 'react'
import { HorizontalButtonStack, MainButtonStack } from '../../components/button-stack'
import { CounterValue } from '../../components/counter-value'
import { DebugFrame } from '../../components/debug-frame'
import { useRef, useRelinkPackage } from '../../utils'

function Sandbox(): JSX.Element {

  const { RelinkSource, useRelinkValue } = useRelinkPackage()

  const CounterSource = useRef(() => new RelinkSource({
    key: 'counter',
    default: 0,
  }))

  const [isActive, setActiveState] = useState(true)
  const counterValue = useRelinkValue(CounterSource.current, null, isActive)

  const increaseCounter = useCallback(async () => {
    await CounterSource.current.set((c) => c + 1)
  }, [])

  const stopListening = useCallback(() => {
    setActiveState(false)
  }, [])

  const startListening = useCallback(() => {
    setActiveState(true)
  }, [])

  return (
    <DebugFrame>
      <CounterValue value={counterValue} />
      <MainButtonStack>
        <button
          data-test-id='button-increase-counter'
          onClick={increaseCounter}
        >
          {'Increase counter'}
        </button>
        <HorizontalButtonStack>
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
        </HorizontalButtonStack>
      </MainButtonStack>
    </DebugFrame>
  )
}

export default Sandbox

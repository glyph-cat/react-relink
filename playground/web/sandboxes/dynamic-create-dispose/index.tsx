/* eslint-disable import/no-unresolved, @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { RelinkSource as $RelinkSource } from '../../../../lib/types'
/* eslint-enable import/no-unresolved, @typescript-eslint/ban-ts-comment */
import { StrictMode, useCallback, useLayoutEffect } from 'react'
import { CounterValue } from '../../components/counter-value'
import { DebugFrame } from '../../components/debug-frame'
import { useRef, useRelinkPackage } from '../../utils'
import { MainButtonStack } from '../../components/button-stack'
import { TestId } from './constants'

function SandboxBase(): JSX.Element {

  const { RelinkSource, useRelinkValue } = useRelinkPackage()

  const CounterSource = useRef<$RelinkSource<number>>()
  if (!CounterSource.current) {
    console.log('Creating source')
    CounterSource.current = new RelinkSource({
      key: 'counter',
      default: 0,
    })
  }
  useLayoutEffect(() => {
    return () => {
      console.log('Disposing source')
      if (typeof CounterSource.current?.dispose === 'function') {
        CounterSource.current.dispose()
      }
    }
  }, [])

  const counterValue = useRelinkValue(CounterSource.current)

  const increaseCounter = useCallback(async () => {
    await CounterSource.current.set((c) => c + 1)
  }, [])

  return (
    <DebugFrame>
      <CounterValue value={counterValue} />
      <MainButtonStack>
        <button
          data-test-id={TestId.button.INCREASE_COUNTER}
          onClick={increaseCounter}
        >
          {'Increase counter'}
        </button>
      </MainButtonStack>
    </DebugFrame>
  )
}

function Sandbox(): JSX.Element {
  return (
    <StrictMode>
      <SandboxBase />
    </StrictMode>
  )
}

export default Sandbox

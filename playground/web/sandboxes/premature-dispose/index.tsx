/* eslint-disable import/no-unresolved, @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { RelinkSource as $RelinkSource } from '../../../../lib/types'
/* eslint-enable import/no-unresolved, @typescript-eslint/ban-ts-comment */
import { useCallback } from 'react'
import { DebugFrame } from '../../components/debug-frame'
import { useRef, useRelinkPackage } from '../../utils'
import { MainButtonStack } from '../../components/button-stack'
import { TestId } from './constants'

// NOTE: We only need to check if a warning appears in the console.
// It is not necessary to include this in the e2e test as of now.

function Sandbox(): JSX.Element {

  const { RelinkSource } = useRelinkPackage()

  const MainCounterSource = useRef<$RelinkSource<number>>()
  if (!MainCounterSource.current) {
    console.log('Creating main source')
    MainCounterSource.current = new RelinkSource({
      key: Symbol('counter'),
      default: 0,
    })
  }

  const ChildCounterSource = useRef<$RelinkSource<number>>()
  if (!ChildCounterSource.current) {
    console.log('Creating child source')
    ChildCounterSource.current = new RelinkSource({
      key: Symbol('counter'),
      default: 0,
      deps: [MainCounterSource.current],
    })
  }

  const disposeMainCounterSource = useCallback(async () => {
    await MainCounterSource.current.dispose()
  }, [])

  return (
    <DebugFrame>
      <MainButtonStack>
        <button
          data-test-id={TestId.button.DISPOSE_MAIN_COUNTER}
          onClick={disposeMainCounterSource}
        >
          {'Dispose main counter source'}
        </button>
      </MainButtonStack>
    </DebugFrame>
  )
}

export default Sandbox

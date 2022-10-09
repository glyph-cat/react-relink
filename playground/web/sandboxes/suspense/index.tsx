/* eslint-disable import/no-unresolved, @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { RelinkSource as $RelinkSource } from '../../../../lib/types'
/* eslint-enable import/no-unresolved, @typescript-eslint/ban-ts-comment */
import { Suspense, useCallback } from 'react'
import { DebugFrame } from '../../components/debug-frame'
import { delay, useRelinkPackage } from '../../utils'
import { CounterValue } from '../../components/counter-value'
import styles from '../../components/counter-value/index.module.css'
import { MainButtonStack } from '../../components/button-stack'
import { useRenderCounter } from '../../utils/use-render-counter'
import { CounterValues, DataTestId, DELAY_TIMEOUT } from './constants'

let CounterSource: $RelinkSource<number>

function Sandbox(): JSX.Element {

  const { RelinkSource } = useRelinkPackage()

  if (!CounterSource) {
    CounterSource = new RelinkSource({
      key: 'counter',
      default: CounterValues.DEFAULT_VALUE,
      options: {
        suspense: true,
      },
    })
  }

  const hydrateByCommit = useCallback(async () => {
    await CounterSource.hydrate(async ({ commit }) => {
      await delay(DELAY_TIMEOUT)
      commit(CounterValues.COMMIT_VALUE)
    })
  }, [])

  const hydrateBySkip = useCallback(async () => {
    await CounterSource.hydrate(async ({ skip }) => {
      await delay(DELAY_TIMEOUT)
      skip()
    })
  }, [])

  const hydrateByCommitDefault = useCallback(async () => {
    await CounterSource.hydrate(async ({ commitDefault }) => {
      await delay(DELAY_TIMEOUT)
      commitDefault()
    })
  }, [])

  const hydrateByCommitNoop = useCallback(async () => {
    await CounterSource.hydrate(async ({ commitNoop }) => {
      await delay(DELAY_TIMEOUT)
      commitNoop()
    })
  }, [])

  const setTo64 = useCallback(async () => {
    await CounterSource.set(CounterValues.ARBITARY_VALUE)
  }, [])

  // NOTE: Need to create child component so that the main component hosting
  // <DebugFrame> does not enter suspensed mode.

  return (
    <DebugFrame>
      <Suspense fallback={<SuspenseFallback />}>
        <SubComponent />
      </Suspense>
      <MainButtonStack>
        <button
          onClick={hydrateByCommit}
          data-test-id={DataTestId.button.HYDRATE_BY_COMMIT}
        >
          {'Hydrate by commit'}
        </button>
        <button
          onClick={hydrateBySkip}
          data-test-id={DataTestId.button.HYDRATE_BY_SKIP}
        >
          {'Hydrate by skip (Deprecated)'}
        </button>
        <button
          onClick={hydrateByCommitDefault}
          data-test-id={DataTestId.button.HYDRATE_BY_COMMIT_DEFAULT}
        >
          {'Hydrate by commit default'}
        </button>
        <button
          onClick={hydrateByCommitNoop}
          data-test-id={DataTestId.button.HYDRATE_BY_COMMIT_NOOP}
        >
          {'Hydrate by commit noop'}
        </button>
        <hr style={{ width: '100%' }} />
        <button
          onClick={setTo64}
          data-test-id={DataTestId.button.SET_ARBITARY_VALUE}
        >
          {'Set arbitary value'}
        </button>
        <span>This allows us to change the counter to another value so that the outcome of each of the hydration methods become more distinct.</span>
      </MainButtonStack>
    </DebugFrame>
  )
}

export default Sandbox

function SuspenseFallback(): JSX.Element {
  return (
    <div>
      <span><br /></span>
      <h1
        className={styles.counterValue}
        data-test-id={DataTestId.SUSPENSE_FALLBACK_COMPONENT}
      >
        {'--'}
      </h1>
    </div>
  )
}

function SubComponent(): JSX.Element {
  const { useRelinkValue } = useRelinkPackage()
  const counterValue = useRelinkValue(CounterSource)
  const renderCount = useRenderCounter()
  return (
    <div>
      <span>
        {'Sub-render count: '}
        <span data-test-id={DataTestId.SUB_RENDER_COUNT}>
          {renderCount}
        </span>
      </span>
      <CounterValue value={counterValue} />
    </div>
  )
}
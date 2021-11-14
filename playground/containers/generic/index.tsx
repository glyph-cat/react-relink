import { Suspense, useLayoutEffect } from 'react'
import { createSource } from '../../../src/api/source'
import { useRelinkValue } from '../../../src/api/use-relink-value'
import { delay, TIME_GAP } from '../../../src/debugging'

const localTimeGap = TIME_GAP(25)

const CounterSource = createSource({
  key: 'counter',
  default: {
    a: 0,
    b: 0,
  },
  lifecycle: {
    async init({ commit }) {
      console.log('Comitting in 3...')
      await delay(localTimeGap)
      console.log('Comitting in 2...')
      await delay(localTimeGap)
      console.log('Comitting in 1...')
      await delay(localTimeGap)
      console.log('Comitting in 0...')
      commit({ a: 3, b: 3 })
    },
  },
  options: {
    suspense: true,
  },
})

const StateVisibilitySource = createSource({
  key: 'visibility',
  default: true,
})

const actions = {
  toggleVisibility(): void {
    StateVisibilitySource.set(s => !s)
  },
  createConsoleSeparator(): void {
    console.log('='.repeat(30))
  },
  clearConsole: console.clear,
  reset: CounterSource.reset,
  async hydrate(): Promise<void> {
    const res = await CounterSource.hydrate(async ({ commit }) => {
      console.log('Comitting in 3...')
      await delay(localTimeGap)
      console.log('Comitting in 2...')
      await delay(localTimeGap)
      console.log('Comitting in 1...')
      await delay(localTimeGap)
      console.log('Comitting in 0...')
      commit({ a: 3, b: 3 })
      return 'lorem-ipsum'
    })
    console.log(res)
  },
  bumpA(): void {
    CounterSource.set((state) => ({
      ...state,
      a: state.a + 1,
    }))
  },
  bumpADelayed(): void {
    CounterSource.set(async (state) => {
      await delay(1000)
      return {
        ...state,
        a: state.a + 1,
      }
    })
  },
  bumpB(): void {
    CounterSource.set((state) => ({
      ...state,
      b: state.b + 1,
    }))
  },
  bumpAB(): void {
    CounterSource.set((state) => ({
      ...state,
      a: state.a + 1,
      b: state.b + 1,
    }))
  },
  simulateUnreponsiveReducer(): void {
    CounterSource.set(async (state) => {
      await delay(18000 + Math.round(Math.random() * 1000))
      return {
        ...state,
        a: state.a + 1,
        b: state.b + 1,
      }
    })
  },
}

let isFallbackMounted = false
let isStateMounted = false

function Fallback(): JSX.Element {
  console.log('Fallback rendering...')
  useLayoutEffect(() => {
    isFallbackMounted = true
    console.log('Fallback mounted', { isFallbackMounted, isStateMounted })
    return () => {
      isFallbackMounted = false
      console.log('Fallback unmounting', { isFallbackMounted, isStateMounted })
    }
  }, [])
  return <h1>Loading...</h1>
}

function StateDisplay(): JSX.Element {
  // console.log('StateDisplay rendering...')
  useLayoutEffect(() => {
    isStateMounted = true
    console.log('StateDisplay mounted', { isFallbackMounted, isStateMounted })
    return () => {
      isStateMounted = false
      console.log('StateDisplay unmounting', { isFallbackMounted, isStateMounted })
    }
  }, [])
  const counterState = useRelinkValue(CounterSource)
  return (
    <h1>
      {JSON.stringify(counterState)}
    </h1>
  )
}

export function Playground(): JSX.Element {
  const showState = useRelinkValue(StateVisibilitySource)
  const renderStack = []
  for (const actionName in actions) {
    const action = actions[actionName]
    renderStack.push(
      <button
        key={actionName}
        className='code'
        onClick={action}
      >
        {`${actionName}()`}
      </button>
    )
  }
  return (
    <div style={{ padding: 20 }}>
      {showState && (
        <Suspense fallback={<Fallback />}>
          <StateDisplay />
        </Suspense>
      )}
      <hr />
      <div style={{ display: 'grid', gap: 5 }}>
        {renderStack}
      </div>
    </div>
  )
}

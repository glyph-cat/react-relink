import React, { Suspense, useLayoutEffect } from 'react'
import { createSource } from '../../../src/api/source'
import { useRelinkValue } from '../../../src/api/use-relink-value'
import { delay, TIME_GAP } from '../../../src/debugging'

// TOFIX: If 2 hydrations are fired at the same time (the 2nd is queued by the gate keeper naturally), components will not suspense for the second hydration

const localTimeGap = TIME_GAP(5)

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
  toggleVisibility(): void {
    StateVisibilitySource.set(s => !s)
  },
}

function Fallback(): JSX.Element {
  console.log('Fallback rendering...')
  useLayoutEffect(() => {
    console.log('Fallback mounted')
    return () => { console.log('Fallback unmounting') }
  }, [])
  return <h1>Loading...</h1>
}

function StateDisplay(): JSX.Element {
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
      <button key={actionName} onClick={action}>
        {actionName}
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
      <div style={{ display: 'grid', gap: 10 }}>
        {renderStack}
      </div>
    </div>
  )
}

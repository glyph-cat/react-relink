import React, { Suspense, useLayoutEffect } from 'react'
import { createSource } from '../../../src/api/source'
import { useRelinkValue } from '../../../src/api/use-relink-value'
import { delay } from '../../../src/debugging'

const CounterSource = createSource({
  key: 'counter',
  default: {
    a: 0,
    b: 0,
  },
  lifecycle: {
    async init({ commit }) {
      console.log('Comitting in 3...')
      await delay(1000)
      console.log('Comitting in 2...')
      await delay(1000)
      console.log('Comitting in 1...')
      await delay(1000)
      console.log('Comitting in 0...')
      commit({ a: 3, b: 3 })
    },
  },
  options: {
    suspense: true,
  },
})

const actions = {
  reset: CounterSource.reset,
  hydrate(): void {
    // TOFIX
    CounterSource.hydrate(async ({ commit }) => {
      console.log('Comitting in 3...')
      await delay(1000)
      console.log('Comitting in 2...')
      await delay(1000)
      console.log('Comitting in 1...')
      await delay(1000)
      console.log('Comitting in 0...')
      commit({ a: 3, b: 3 })
    })
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
      <Suspense fallback={<Fallback />}>
        <StateDisplay />
      </Suspense>
      <hr />
      <div style={{ display: 'grid', gap: 10 }}>
        {renderStack}
      </div>
    </div>
  )
}

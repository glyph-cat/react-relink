import React from 'react'
import { RelinkSource } from '../../../../src/api/source'
import { useRelinkState } from '../../../../src/api/use-relink-state'

const CounterSource = new RelinkSource({
  key: 'counter',
  default: {
    a: 0,
    b: 0,
  },
})

export function Playground(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [counterState, setCounter, resetCounter] = useRelinkState(CounterSource)
  return (
    <div style={{ padding: 20 }}>
      <h1>{JSON.stringify(counterState)}</h1>
    </div>
  )
}

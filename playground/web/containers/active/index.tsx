import { useState } from 'react'
import { RelinkSource, useRelinkValue } from '../../../../src/bundle'

const CounterSource = new RelinkSource({
  key: 'counter',
  default: 0,
})

export function Playground(): JSX.Element {

  const [isActive, setActiveState] = useState(true)
  const stateValue = useRelinkValue(CounterSource, null, isActive)

  return (
    <div style={{
      display: 'grid',
      height: '100vh',
    }}>
      <button onClick={() => {
        CounterSource.set((c) => c + 1)
      }}>Increase counter</button>
      <button onClick={() => {
        setActiveState(false)
      }}>Stop listening</button>
      <button onClick={() => {
        setActiveState(true)
      }}>Start listening</button>
      <pre>
        <code>
          {JSON.stringify(stateValue, null, 2)}
        </code>
      </pre>
    </div>
  )
}

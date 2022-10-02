import { useState } from 'react'
import { DebugFrame, useRelinkPackage, useRef } from '../../utils'

function Sandbox(): JSX.Element {

  const { RelinkSource, useRelinkValue, BUILD_TYPE } = useRelinkPackage()

  const CounterSource = useRef(() => new RelinkSource({
    key: 'counter',
    default: 0,
  }))

  const [isActive, setActiveState] = useState(true)
  const stateValue = useRelinkValue(CounterSource.current, null, isActive)

  return (
    <DebugFrame>
      <button onClick={() => {
        CounterSource.current.set((c) => c + 1)
      }}>Increase counter</button>
      <button onClick={() => {
        setActiveState(false)
      }}>Stop listening</button>
      <button onClick={() => {
        setActiveState(true)
      }}>Start listening</button>
      <h1>{String(BUILD_TYPE)}</h1>
      <pre>
        <code>
          {JSON.stringify(stateValue, null, 2)}
        </code>
      </pre>
    </DebugFrame>
  )
}

export default Sandbox

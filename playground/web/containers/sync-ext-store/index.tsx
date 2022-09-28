// import {
//   useEffect,
//   useRef,
// } from 'react'
import { useEffect, useTransition } from 'react'
import { RelinkSource, useRelinkValue } from '../../../../src/bundle'
// import { RelinkSource, useRelinkValue } from '../../../..' // Imports from 'lib'

const MySource = new RelinkSource({
  key: 'test/api-useRelinkValue/selector',
  default: {
    foo: 1,
    bar: 1,
  },
})

const MouseSource = new RelinkSource({
  key: 'mouse',
  default: {
    x: 0,
    y: 0,
  },
})

async function handleOnClick() {
  console.log('handleOnClick()')
  await MySource.set((s) => ({ ...s, bar: s.bar + 1 }))
}

function UnstableImplementation() {
  // console.log('Rendering: UnstableImplementation...')
  const state = useRelinkValue(MySource, (s) => s.bar)
  const mouseXY = useRelinkValue(MouseSource)
  // const renderCount = useRef(0)
  // useEffect(() => {
  //   console.log(`Rendered: UnstableImplementation (count: ${++renderCount.current})`)
  // })
  return (
    <div>
      Counter value: {state} | {JSON.stringify(mouseXY)}
    </div>
  )
}

export function Playground(): JSX.Element {
  const [isPending, startTransition] = useTransition()
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      startTransition(() => {
        MouseSource.set({ x: e.clientX, y: e.clientY })
      })
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])
  return (
    <div>
      {[...Array(50).keys()].map((key) => <UnstableImplementation key={key} />)}
      <button onClick={handleOnClick}>Increase value</button>
    </div>
  )
}

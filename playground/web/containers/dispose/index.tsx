// import {
//   useEffect,
//   useRef,
// } from 'react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { RelinkSource, useRelinkValue } from '../../../../src/bundle'
// import { RelinkSource, useRelinkValue } from '../../../..' // Imports from 'lib'

const MySource = new RelinkSource({
  key: 'test/dispose',
  default: {
    foo: 1,
    bar: 1,
  },
})

export function Playground(): JSX.Element {

  // const [
  //   sourceCollection,
  //   setSourceCollection,
  // ] = useState<Record<string, RelinkSource<any>>>({})

  // const counter = useRef(1)

  // const addSource = useCallback(() => {
  //   const id = counter.current++
  //   const newSource = new RelinkSource({ key: id, default: 'someValue' })
  //   setSourceCollection((s) => ({ ...s, [id]: newSource }))
  // }, [])

  // ...

  return (
    <div>
      <h1>Hello world</h1>
      <button onClick={() => {
        console.log(MySource.get())
      }}>Get value</button>
      <button onClick={async () => {
        console.log(MySource)
        await MySource.dispose()
        console.log(MySource)
      }}>Dispose</button>
    </div>
  )
}

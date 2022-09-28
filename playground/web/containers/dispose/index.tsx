import { useCallback } from 'react'
import { RelinkSource } from '../../../../src/bundle'

const MySource = new RelinkSource({
  key: 'test/dispose',
  default: {
    foo: 1,
    bar: 1,
  },
})

export function Playground(): JSX.Element {

  const getValue = useCallback(() => {
    console.log(MySource.get())
  }, [])

  const dispose = useCallback(async () => {
    console.log(MySource)
    await MySource.dispose()
    console.log(MySource)
  }, [])

  return (
    <div>
      <h1>Hello world</h1>
      <button onClick={getValue}>Get value</button>
      <button onClick={dispose}>Dispose</button>
    </div>
  )
}

import { createSource, useRelinkValue } from '../../../../src/bundle'

const CounterSource = createSource({
  key: 'theme',
  default: 0,
})

async function onButtonClick(): Promise<void> {
  console.log('Invoked `onButtonClick()`')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  await CounterSource.set(async (counter) => {
    console.log('Invoked `await CounterSource.set(...)`')
    // Relink methods are guarded by an execution gate to prevent race conditions
    // What happens when there are cyclic calls? ¯\_(ツ)_/¯
    // TODO: Is there anyway to detect this loop and throw an error?
    const counter2 = await CounterSource.getAsync()
    console.log('Invoked `await CounterSource.getAsync.set(...)`')
    return counter2 + 1
  })
}

export function Playground(): JSX.Element {
  const counter = useRelinkValue(CounterSource)
  return (
    <div>
      <h1>Counter: {counter}</h1>
      <button onClick={onButtonClick}>
        {'Click to set state'}
      </button>
    </div>
  )
}

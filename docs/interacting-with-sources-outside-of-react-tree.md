# Interacting with Sources Outside of React Tree

## Examples
```ts
import { createSource } from 'react-relink'

const CounterSource = createSource<number>({
  default: 1,
})

// Getting the value
const value = CounterSource.get()

// Set the state...
CounterSource.set(newValue) // directly
CounterSource.set(c => c + 1) // with a function
// Pro tip: The function is actually just a 'reducer'
const reducer = c => + 1
CounterSource.set(reducer)

// Reset the state
CounterSource.reset()

// Rehydrate the source
CounterSource.hydrate(({ commit }) => {
  commit(newValue)
})
```

<br/>

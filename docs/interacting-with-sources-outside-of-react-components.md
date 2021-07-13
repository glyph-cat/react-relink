# Interacting with Sources outside of React components

## Examples
```js
import { createSource } from 'react-relink'

const CounterSource = createSource({
  default: 1,
})

// Getting the value
const value = CounterSource.get()

// Set the state...
CounterSource.set(newValue) // directly
CounterSource.set(c => c + 1) // with a function

// Reset the state
CounterSource.reset()

// Rehydrate the source
CounterSource.hydrate(({ commit }) => {
  commit(newValue)
})
```

<br/>

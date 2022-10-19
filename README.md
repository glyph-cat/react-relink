<div align="center">

[![React Relink Banner](https://raw.githubusercontent.com/glyph-cat/react-relink/main/assets/react-relink-wording.svg)](https://github.com/glyph-cat/react-relink)
*A lightweight state management library for React.*

<br/>

[![Version](https://img.shields.io/npm/v/react-relink.svg)](https://www.npmjs.com/package/react-relink)
![Build Status](https://img.shields.io/github/workflow/status/glyph-cat/react-relink/Test/main)
![Bundle size](https://img.shields.io/bundlephobia/min/react-relink)
[![License](https://img.shields.io/github/license/glyph-cat/react-relink)](https://github.com/glyph-cat/react-relink/blob/main/LICENSE)

<!-- See: https://github.com/microsoft/vscode/issues/128813#issuecomment-943125631 -->
[![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://open.vscode.dev/glyph-cat/react-relink)
[![Support me on Ko-fi](https://img.shields.io/static/v1?label&logo=kofi&logoColor=ffffff&message=Support%20me%20on%20Ko-fi&color=FF5E5B)](https://ko-fi.com/glyphcat)

</div>

<br/>

**Key features:**
* Components don't need to be wrapped in Providers
* States can be shared across different React components trees
* Supports asynchronous "setState" functions
* Declarative lifecycle management

<br/>

# Installation

With [Yarn](https://yarnpkg.com/package/react-relink)
```sh
yarn add react-relink
```

<br/>

With [NPM](https://www.npmjs.com/package/react-relink):
```sh
npm i react-relink
```

<br/>

# Usage

*Note: you can find a more detailed documentation in the TypeScript definition file which is located at `<your-project>/node_modules/react-relink/lib/types/index.d.ts`.*

<br/>

## Create a Source

Provide a default state for the source.

```js
import { RelinkSource } from 'react-relink'

const CounterSource = new RelinkSource({
  key: 'counter',
  default: 1,
})
```

<br/>

## Consume a Source

You can work with the sources right away without needing to wrap your app inside any provider components. This makes accessing them across different React component trees very easy, such as when [registering screen components](https://wix.github.io/react-native-navigation/docs/third-party-react-context#register-the-screen) in React Native Navigation.

To consume a source, pass it as a parameter into any of the following Relink hooks:
* `useRelinkState` - returns the state value, a setter, and a resetter function.
* `useSetRelinkState` - returns just the setter function of the state.
* `useRelinkValue` - returns just the value of the state.
* `useResetRelinkState` - returns a function that sets the state to its default value.
* `useHydrateRelinkSource` - returns a function that sets the state without invoking the `didSet` lifecycle method.

An example with the `useRelinkState` hook:

```js
function App() {
  const [counter, setCounter, resetCounter] = useRelinkState(CounterSource)
  // `setCounter` accepts either a value to replace the state or a reducer
  return (
    <div>
      <span>Counter: {counter}</span>
      <button onClick={() => {
        // Value
        setCounter(5)
      }}>Set to 5</button>
      <button onClick={() => {
        // Reducer
        setCounter((oldCounter) => {
          const newCounter = oldCounter + 1
          return newCounter
        })
      }}>Step up</button>
      <button onClick={resetCounter}>Reset</button>
    </div>
  )
}
```

Examples with other hooks:

```js
const counter = useRelinkValue(CounterSource)
console.log('Counter is ' + counter)
```

```js
const setCounter = useSetRelinkState(CounterSource)
setCounter(/* new value */)
```

```js
const resetCounter = useResetRelinkState(CounterSource)
resetCounter()
```

```js
const rehydrateCounter = useHydrateRelinkSource(CounterSource)
rehydrateCounter(({ commit, skip }) => {
  const persistedState = custom_method_to_fetch_persisted_state()
  if (persistedState) {
    commit(persistedState)
  } else {
    skip()
  }
})
```

<br/>

# Error Codes
In production builds, error codes are thrown instead of the lengthy messages to save data.
* `Relink_E1-typeofRawKey` — Expected `key` to be a string or number but got `${typeofRawKey}`
* `Relink_E2-depStack` — Circular dependencies are not allowed: `${depStack}`
* `Relink_E3-marker` - Internal error: malformed hydration marker '`${marker}`'
<br/>

# List of Breaking Changes
* [From `v0` to `v1`](https://github.com/glyph-cat/react-relink/releases/tag/1.0.0)
* [From `v1` to `v2`](https://github.com/glyph-cat/react-relink/releases/tag/2.0.0)
* [From `v2` to `v3`](https://github.com/glyph-cat/react-relink/releases/tag/3.0.0)
* [From `v3` to `v4`](https://github.com/glyph-cat/react-relink/releases/tag/4.0.0)

<br/>

# Support This Project

* Ko-fi: [`ko-fi.com/glyphcat`](https://ko-fi.com/glyphcat)
* BTC: [`bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we`](bitcoin:bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we)

<br/>

# Miscellaneous
Looking for a specialized package to handle localizations? Check out [Langutil](https://github.com/glyph-cat/langutil).

<br/>

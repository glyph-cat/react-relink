<div align="center">

[![React Relink Banner](https://raw.githubusercontent.com/chin98edwin/react-relink/main/assets/react-relink-wording.svg)](https://github.com/chin98edwin/react-relink)
*A lightweight state management library for React.*

<br/>

[![Version](https://img.shields.io/npm/v/react-relink.svg)](https://www.npmjs.com/package/react-relink)
![Build Status](https://img.shields.io/github/workflow/status/chin98edwin/langutil/Test/main)
![Bundle size](https://img.shields.io/bundlephobia/min/react-relink)
[![License](https://img.shields.io/github/license/chin98edwin/react-relink)](https://github.com/chin98edwin/react-relink/blob/main/LICENSE)

[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/chin98edwin/react-relink)
[![Support me on Ko-fi](https://img.shields.io/static/v1?label&logo=kofi&logoColor=ffffff&message=Support%20me%20on%20Ko-fi&color=FF5E5B)](https://ko-fi.com/dev_chin98edwin)

</div>

<br/>

**Key features:**
* Components don't need to be wrapped in Providers
* States can be shared across different React components trees
* Supports asynchronous reducers
* Declarative lifecycle management
* Less boilerplate code in general

<br/>

# Installation

With [NPM](https://www.npmjs.com/package/react-relink):
```sh
npm i react-relink
```

<br/>

With [Yarn](https://yarnpkg.com/package/react-relink):
```sh
yarn add react-relink
```

<br/>

# Usage

## Create a Source

Provide a default state for the source.

```js
import { createSource } from 'react-relink'

const CounterSource = createSource({
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
rehydrateCounter(({ commit }) => {
  commit(/* new value */)
})
```

<br/>

# Documentation
* [Main Directory](https://github.com/chin98edwin/react-relink/blob/main/docs)
* [Selectors](https://github.com/chin98edwin/react-relink/blob/main/docs/selectors.md)
* [Lifecycle](https://github.com/chin98edwin/react-relink/blob/main/docs/lifecycle.md)
* [Source Dependencies](https://github.com/chin98edwin/react-relink/blob/main/docs/source-dependencies.md)
* [Immutability In Setters](https://github.com/chin98edwin/react-relink/blob/main/docs/immutability-in-setters.md)
* [Options](https://github.com/chin98edwin/react-relink/blob/main/docs/options.md)
* [Error Codes](https://github.com/chin98edwin/react-relink/blob/main/docs/error-codes.md)
* [Interacting with Sources Outside of React Tree](https://github.com/chin98edwin/react-relink/blob/main/docs/interacting-with-sources-outside-of-react-tree.md)

<br/>

# Support Me

* Ko-fi: [`ko-fi.com/dev_chin98edwin`](https://ko-fi.com/dev_chin98edwin)
* PayPal: [`paypal.me/chin98edwin`](http://paypal.me/chin98edwin)
* BTC: [`bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we`](bitcoin:bc1q5qp6a972l8m0k26ln9deuhup0nmldf86ndu5we)

<br/>

# Miscellaneous
Looking for a specialized package to handle localizations? Check out [Langutil](https://github.com/chin98edwin/langutil).

<br/>

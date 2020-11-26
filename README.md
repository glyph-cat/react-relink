[![Relink banner](https://i.imgur.com/WRLh6At.png)](https://github.com/chin98edwin/react-relink)
[![NPM](https://img.shields.io/npm/v/react-relink.svg)](https://www.npmjs.com/package/react-relink)

- [Introduction](#introduction)
- [Usage](#usage)
- [Create a Source](#create-a-source)
- [Consume a Source](#consume-a-source)
- [Selectors](#selectors)
- ["dangerously-" methods](#dangerously--methods)
  - [Examples](#examples)
- [Lifecycle](#lifecycle)
  - [Synchronous Example](#synchronous-example)
  - [Asynchronous Example](#asynchronous-example)
- [Options](#options)
- [Error Codes](#error-codes)

# Introduction
Relink is a React state management library inspired by [Recoil](https://recoiljs.org). Relink provides some APIs that are similar to Recoil to minimize the learning gap.

With Relink,
* There will be less boilerplate code, just like Recoil;
* There is no need to wrap components in a Provider;
* States can be shared across different React components trees.

Relink is *not* a replacement for Recoil — it can, however serve as an alternative for projects that do not require the full feature-set of Recoil. Relink also has a few downsides as it:
* Does not support snapshots;
* Does not provide advanced APIs for scenarios that are hard/impossible to achieve with the currently provided ones;
* (and possibly other unforeseen concerns — Relink is also experimental).

<br/>

# Usage

```bash
# NPM
npm install react-relink

# Yarn
yarn add react-relink

# unpkg (Replace <VERSION> with the version you need)
<script src="https://unpkg.com/react-relink@<VERSION>/dist/umd/index.min.js" crossorigin></script>
```

# Create a Source

Provide a unique key and default state for the source.

```js
import { createSource } from 'react-relink'

const CounterSource = createSource({
  key: 'counter',
  default: 1,
})
```

<br/>

# Consume a Source

In Relink, you can work with the sources right away without needing to wrap your app inside any provider components. This makes accessing them across different React component trees easy, such as when [registerering screen components](https://wix.github.io/react-native-navigation/docs/third-party-react-context#register-the-screen) in React Native Navigation.

To consume a source, pass it as a parameter into any of the following Relink hooks:
* `useRelinkState` - returns the state value and a setter function like React's [`useState`](https://reactjs.org/docs/hooks-state.html)
* `useSetRelinkState` - returns just the setter function of the state
* `useRelinkValue` - returns just the value of the state
* `useResetRelinkState` - returns a function that sets the state to its default value
* `useRehydrateRelinkSource` - returns a function that sets the state without invoking the `didSet` lifecycle method

An example with the `useRelinkState` hook:

```js
function App() {
  const [counter, setCounter] = useRelinkState(CounterSource)
  // `setCounter` accepts either:
  // • A value to replace the state, or
  // • A function that returns a new state.
  return (
    <div>
      <span>Counter: {counter}</span>
      <button onClick={() => { setCounter(5) }}>Set to 5</button>
      <button onClick={() => { setCounter(c => c + 1) }}>Step up</button>
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
const rehydrateCounter = useRehydrateRelinkSource(CounterSource)
rehydrateCounter(({ commit }) => {
  commit(/* new value */)
})
```

<br/>

# Selectors

You can use selectors to narrow down the items passed from `useRelinkState` and `useRelinkValue`.

```js
const MessagesSource = createSource({
  key: 'messages',
  default: [
    {
      messageId: 1,
      userId: 1,
      title: '...',
      body: '...',
    },
    {
      messageId: 2,
      userId: 2,
      title: '...',
      body: '...',
    },
    {
      messageId: 3,
      userId: 1,
      title: '...',
      body: '...',
    },
  ],
})

function App() {
  const messages = useRelinkValue(MessagesSource, (allMessages) => {
    return allMessages.filter((m) => m.userId === 1)
  })
  console.log(messages)
  // [
  //   {
  //     messageId: 1,
  //     userId: 1,
  //     title: '...',
  //     body: '...',
  //   },
  //   {
  //     messageId: 3,
  //     userId: 1,
  //     title: '...',
  //     body: '...',
  //   },
  // ]
  return '...'
}
```

<br/>

# "dangerously-" methods

You can also consume sources outside of a component. Although the hooks mentioned above should be enough for most cases, there are equivalent ordinary functions in case you need them. These APIs have the "dangerously-" prefix as using them might result in hard-to-debug code. They should be used sparingly.

## Examples
```js
import {
  createSource,
  dangerouslyGetRelinkValue,
  dangerouslySetRelinkState,
  dangerouslyResetRelinkState,
  dangerouslyRehydrateRelinkSource,
} from 'react-relink'

const CounterSource = createSource({
  key: 'counter',
  default: 1,
})

// Getting the value
const value = dangerouslyGetRelinkValue(CounterSource)

// Set the state...
dangerouslySetRelinkState(newValue, CounterSource) // directly
dangerouslySetRelinkState(c => c + 1, CounterSource) // with a function

// Reset the state
dangerouslyResetRelinkState(Source)

// Rehydrate the source
dangerouslyResetRelinkState(Source, ({ commit }) => {
  commit(newValue)
})
```

<br/>

# Lifecycle
Sources can be initialized(hydrated), persisted and reset.

Upon creating a new source, the `lifecycle.init` method will be called. This is the first hydration. Subsequent hydrations can be performed with the `useRehydrateRelinkSource` hook. This can be useful, for example, when switching accounts and user preferences need to be rehydrated. If you attempt to use an ordinary "setState" to rehydrate a source, it will call the `didSet` lifecycle method, persisting the just-fetched data back to your server, which is unnecessary.

Upon setting a state, the `lifecycle.didSet` method will be called while upon resetting a state, the `lifecycle.didReset` method will be called. You can either persist or reset data here. For example, persisting data into or removing it from localStorage.

## Synchronous Example

```js
import { createSource } from 'react-relink'

const defaultUserState = {
  username: 'Unknown',
  preferences: {
    theme: 'system-default',
    language: 'system-default',
  }
}

const UserSource = createSource({
  key: 'user',
  default: defaultUserState,
  lifecycle: {
    init: ({ commit }) => {
      const data = localStorage.getItem('user')
      commit(data ? JSON.parse(data) : defaultUserState)
    },
    didSet: (payload) => {
      localStorage.setItem('user', JSON.stringify(payload))
    },
    didReset: () => {
      localStorage.removeItem('user')
    }
  },
})
```

## Asynchronous Example

First, set `options.suspense` to `true` and wrap your components in `<Suspense>` as they will be suspended while the data is being fetched. This is made possible with React's experimental feature — [Suspensed Data Fetching](https://reactjs.org/docs/concurrent-mode-suspense.html). Since it is experimental, source hydration in Relink will always be synchronous *unless explicitly specified* in `options.suspense`.

```js
// Throttling can help reduce the number of network requests made to persist data
// Further reading: https://dev.to/bmsvieira/using-throttle-in-javascript-254g
// Lodash docs: https://lodash.com/docs/4.17.15#throttle
import { throttle } from 'lodash'
import { Suspense } from 'react'
import { createSource } from 'react-relink'

// Mock function
const saveToServer = throttle((data) {
  fetch('https://your-api-endpoint-2', { body: data }).then(() => {
    console.log('saved')
  }).catch((e) => {
    // Perform error handling here...
    console.log(e)
  })
}, 5000) // 5 seconds

const defaultUserState = {
  username: 'Unknown',
  preferences: {
    theme: 'system-default',
    language: 'system-default',
  }
}

const UserSource = createSource({
  key: 'user',
  default: defaultUserState,
  lifecycle: {
    init: ({ commit }) => {
      if (loggedIn) {
        fetch('https://your-api-endpoint-1').then((userData) => {
          commit(userData)
        })
      } else {
        commit(defaultUserState)
      }
    },
    didSet: (payload) => {
      saveToServer(payload)
    },
    didReset: () => {
      saveToServer(defaultUserState)
    }
  },
  options: { suspense: true },
})
```

<br/>

# Options
There are several options that you can enable when creating a source. The default values for all of these options are `false`. They are designed to be opt-in because they are either experimental or they can make code more prone to bugs.

```js
const Source = createSource({
  key: 'my-source',
  default: { /* . . . */ },
  options: {
    suspense: true | false,
    mutable: true | false,
    virtualbatch: true | false,
  }
})
```

| `options`      | Description                                                                                       | Warning                  |
| -------------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| `suspense`     | Components that consume the source will be suspended while hydrating                              | Unstable React feature   |
| `mutable`      | Allows slight performance improvement by not deep-copying the values returned                     | Makes code hard to debug |
| `virtualBatch` | Slightly improve performance by coalescing the "setState" calls on top of React's batched updates | Unstable Relink feature  |

<br/>

# Error Codes

Error codes will be thrown instead of messages in production builds to save data.

| Code | Description                                                   |
| ---- | ------------------------------------------------------------- |
| 1    | Key must be a string (or number - will be casted into string) |
| 2    | Duplicate source key                                          |

<br/>

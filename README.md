[![Relink banner](https://raw.githubusercontent.com/chin98edwin/react-relink/main/assets/banner.png)](https://github.com/chin98edwin/react-relink)
[![NPM](https://img.shields.io/npm/v/react-relink.svg)](https://www.npmjs.com/package/react-relink)

Relink is a React state management library inspired by [Recoil](https://recoiljs.org). Relink provides some APIs that are similar to Recoil to minimize the learning gap.

With Relink,
* There will be less boilerplate code, just like Recoil;
* There is no need to wrap components in a Provider;
* States can be shared across different React components trees.

Relink is *not* a replacement for Recoil — it can, however serve as an alternative for projects that do not require the full feature-set of Recoil. Relink also has a few downsides as it:
* Does not support snapshots or advanced APIs for edge cases that would be achievable with Recoil
* Server-side rendering not officially supported
* (and possibly other unforeseen concerns — Relink is also experimental).

*Extra Reading: [State Management with React Relink](https://dev.to/chin98edwin/state-management-with-react-relink-3g9)*

<br/>

# Table of Contents
<!-- Automatically generated by VS Code -->
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
- [Create a Source](#create-a-source)
- [Consume a Source](#consume-a-source)
- [Selectors](#selectors)
- [Immutability](#immutability)
  - [Selectors](#selectors-1)
  - [Setters](#setters)
  - [What to do about it](#what-to-do-about-it)
- [Lifecycle](#lifecycle)
  - [Synchronous Example](#synchronous-example)
  - [Asynchronous Example](#asynchronous-example)
- [Options](#options)
- [Error Codes](#error-codes)
- [Interacting with Sources outside of React components](#interacting-with-sources-outside-of-react-components)
  - [Examples](#examples)

<br/>

# Installation

```sh
# NPM
npm i react-relink

# Yarn
yarn add react-relink
```

<br/>

# Create a Source

Provide a default state for the source.

```js
import { createSource } from 'react-relink'

const CounterSource = createSource({
  key: 'counter', // Optional, used for debugging with React DevTools
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

# Immutability

All Relink states are immutable by default. Every copy of the state you receive is a new copy so if you modify or tamper with it, only that local copy is affected.

## Selectors
Take note, however, that for hooks, the state passed into your selector will be the same copy you receive afterwards.

The selector works like this: Relink gives you a new copy of the complete state to your selector, the selector then cherry-picks the values that concerns your component and returns it to Relink to compare. If the currently cherry-picked values is different from that of the previous render, Relink will trigger a component update, otherwise nothing happens. Then, Relink returns the cherry-picked values directly to your component via the hook that you called.

In the next major (1.X.X) update, selectors will be mutable. This means the internal copy of the state will be directly passed to selectors. Since selectors are well, selectors, they should not modify the state in anyway (and this shouldn't concern you if you do not abuse the use of selectors). After a selector returns the cherry-picked values to Relink for comparison, Relink will compare it with the previous set, create a deep copy and return it to your component. This is done out of consideration for performance. Instead of deep-copying the entire state for selection, Relink encourages you to select only what you need, then let Relink create a deep copy of it.

![How selectors work in Relink before v1.x.x](https://raw.githubusercontent.com/chin98edwin/react-relink/main/assets/how-selectors-work-in-relink-before-1xx.png)

![How selectors work in Relink after v1.x.x](https://raw.githubusercontent.com/chin98edwin/react-relink/main/assets/how-selectors-work-in-relink-after-1xx.png)

## Setters
This concerns setter functions that uses callbacks.
```js
  setState((scopedState) => {
    ...scopedState,
    someProperty: 'foo'
  })
```
Relink will pass a new deep-copied state to your callback. We call it `scopedState`, where your callback is the scope. You are free to use and modify that copy as you please. When you return it back to Relink, Relink will deep-copy the return value before assigning the it back to Relink's internal state. This is so that in case of memory leaks or if your code alters the `scopedState` after setter is called, it corrupt the entire app.

![How state setters work in Relink](https://raw.githubusercontent.com/chin98edwin/react-relink/main/assets/how-state-setters-work-in-relink.png)]

[Sigh, Immutability...](https://i.imgur.com/j6PP6Pz.jpg)

## What to do about it
If you are concerned about performance, you can set `options.mutability` to `true` See [Options](#-options).

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
  default: { /* . . . */ },
  options: {
    suspense: true | false,
    mutable: true | false,
    virtualbatch: true | false,
  }
})
```

* `suspense?: boolean (Default: false)`<br/>Components that consume the source will be suspended while hydrating.

* `mutable?: boolean (Default: false)`<br/>Allows slight performance improvement by not deep-copying the values returned.
* `virtualBatch?: boolean (Default: false)`<br/>Slightly improve performance by coalescing the "setState" calls on top of React's batched updates. This is only suitable for sources that have frequent "`setState`" calls but results in little to no immediate UI changes. For example, a huge [virtualized](http://react-window.now.sh) list which its data is realtime and updated through a listener. Virtual batching actually creates a delay in component updating, but it's short enough that it's unnoticeable most of the time. Virtual batching is **not suitable** in UIs that updates frequently and needs to be responsive, such as forms and text fields. If you let a cat run across your keyboard, you are very likely to see the characters slowly appearing one by one.

<br/>

# Error Codes
Error codes will be thrown instead of messages in production builds to save data.

| Code | Description                                  |
| ---- | -------------------------------------------- |
| 1    | Circular source dependencies are not allowed |

<br/>

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

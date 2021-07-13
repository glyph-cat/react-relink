# Lifecycle
Sources can be initialized(hydrated), persisted and reset.

Upon creating a new source, the `lifecycle.init` method will be called. This is the first hydration. Subsequent hydrations can be performed with the `useRehydrateRelinkSource` hook. This can be useful, for example, when switching accounts and user preferences need to be rehydrated. If you attempt to use an ordinary "setState" to rehydrate a source, it will call the `didSet` lifecycle method, persisting the just-fetched data back to your server, which is unnecessary.

Upon setting a state, the `lifecycle.didSet` method will be called while upon resetting a state, the `lifecycle.didReset` method will be called. You can either persist or reset data here. For example, persisting data into or removing it from localStorage.

<br/>

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

<br/>

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

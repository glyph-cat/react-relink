# Source Dependencies
Sometimes you may want to wait for a source to finish hydrating before hydrating another source. This can be done by specifying the dependencies while creating a source. For example, for a game you might have something like this:

```js
const AuthSource = createSource({
  key: 'auth-source',
  default: {/* ... */},
})

const GamePreferencesSource = createSource({
  key: 'game-pref-source',
  default: {/* ... */},
  deps: [AuthSource],
})

const LocallyPersistedSessionSource = createSource({
  key: 'locally-persisted-session-source',
  default: {/* ... */}
})

const GameRoomSource = createSource({
  key: 'game-room-source',
  default: {/* ... */},
  deps: [
    GamePreferencesSource,
    LocallyPersistedSessionSource,
  ],
})
```

You can specify as many depencies as you like for a source or chain as many as you like, as long as there are no [circular dependencies](https://en.wikipedia.org/wiki/Circular_dependency).

To wait for all sources to hydrate before doing something, you can use the `waitForAll` method.

```js
import { waitForAll } from 'react-relink'

async function asyncMethod() {
  await waitForAll([SourceA, SourceB, SourceC, SourceD, SourceE])
  // Continue to do something here
}
```

To wait for only one source to hydrate, you can use the `waitFor()` method.

```js
import { waitFor } from 'react-relink'

async function asyncMethod() {
  await waitFor(SourceA)
  // Continue to do something here
}
```

<br/>

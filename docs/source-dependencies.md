# Source Dependencies
Sometimes you may want to wait for a source to finish hydrating before hydrating another source. This can be done by specifying the dependencies while creating a source. For example, for a game you might have something like this:

```js
const AuthSource = createSource({
  default: {/* ... */},
})

const GamePreferencesSource = createSource({
  default: {/* ... */},
  deps: { AuthSource },
})

const LocallyPersistedSessionSource = createSource({
  default: {/* ... */}
})
const GameRoomSource = createSource({
  default: {/* ... */},
  deps: { 
    GamePreferencesSource,
    LocallyPersistedSessionSource,
  },
})

```

You can specify as many depencies as you like for a source or chain as many as you like, as long as there are no [circular dependencies](https://en.wikipedia.org/wiki/Circular_dependency). Also note that preferences are specified as objects, not arrays.

To wait for all sources to hydrate before doing something, you can use the `waitForAll` method.

```js
import { waitForAll } from 'react-relink'

// With a callback
waitForAll([SourceA, SourceB, SourceC, SourceD, SourceE], () => {
  // Do something here
})

// Or asynchonously
async function asyncMethod() {
  await waitForAll([SourceA, SourceB, SourceC, SourceD, SourceE])
  // Do something here
}
```

<br/>

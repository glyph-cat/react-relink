# Immutability In Setters
This concerns setter functions that uses callbacks.

```js
  setState((scopedState) => {
    ...scopedState,
    someProperty: 'foo'
  })
```

With `option.mutable` set to `true`, Relink will pass a new deep-copied state to your callback. We call it `scopedState`, where your callback is the scope. You are free to use and modify that copy as you please. When you return it back to Relink, Relink will deep-copy the return value before assigning the it back to Relink's internal state. This is so that in case of memory leaks or if your code alters the `scopedState` after setter is called, it corrupt the entire app.

![How state setters work in Relink](https://raw.githubusercontent.com/glyph-cat/react-relink/main/assets/how-state-setters-work-in-relink.png)]

<br/>

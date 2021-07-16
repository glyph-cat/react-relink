# Options
There are several options that you can enable when creating a source. The default values for all of these options are `false`. They are designed to be opt-in because they are either experimental or they can make code more prone to bugs.

```js
const Source = createSource({
  default: { /* ... */ },
  options: {
    suspense: true | false,
    mutable: true | false,
    virtualBatch: true | false,
  }
})
```

<br/>

## `suspense`
* Type: `boolean`
* Default: `false`

Components that consume the source will be suspended while hydrating.

<br/>

## `mutable`
* Type: `boolean`
* Default: `false`

Setting the value to `true` can slightly improve performance by not deep-copying the returned state values.

***NOTE: The default value will be `true` starting from V1.***

<br/>

## `virtualBatch`
* Type: `boolean`
* Default: `false`

Slightly improve performance by coalescing the "setState" calls on top of React's batched updates.

This is only suitable for sources that have frequent "`setState`" calls but results in little to no immediate UI changes. For example, a huge [virtualized](http://react-window.now.sh) list which its data is realtime and updated through a listener.

Virtual batching actually creates a delay in component updating, but it's short enough that it's unnoticeable most of the time. Virtual batching is **not suitable** in UIs that updates frequently and needs to be responsive such as forms and text fields.

With virtual batch enabled, if you let a cat run across your keyboard, you are very likely to see the characters slowly appearing one by one.

<br/>

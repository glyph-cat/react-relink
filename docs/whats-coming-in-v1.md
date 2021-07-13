# What's Coming in V1

Relink is finally entering V1 and here are some important (breaking) changes to take note. For now, it is planned what V1 will be released some time in September 2021.

<br/>

## Mutability By Default

In V0, all Relink states are immutable by default. Every copy of the state you receive is a new copy so if you modify or tamper with it, only that local copy is affected. In V1, they will be **mutable by default**.

To opt out of this, set `options.mutable` to `false` when creating your source. However, the values passed to selectors **will always be a direct copy** of the current state of a source.

### How selectors work in Relink before v1.x.x
Relink gives you a new copy of the complete state to your selector, the selector then cherry-picks the values that concerns your component and returns it to Relink to compare. If the currently cherry-picked values is different from that of the previous render, Relink will trigger a component update, otherwise nothing happens. Then, Relink returns the cherry-picked values directly to your component via the hook that you called.

![How selectors work in Relink before v1.x.x](https://raw.githubusercontent.com/chin98edwin/react-relink/main/assets/how-selectors-work-in-relink-before-1xx.png)

<br/>

### How selectors work in Relink after v1.x.x
internal copy of the state will be directly passed to selectors. Since selectors are well, selectors, they should not modify the state in anyway (and this shouldn't concern you if you do not abuse the use of selectors). After a selector returns the cherry-picked values to Relink for comparison, Relink will compare it with the previous set, create a deep copy and return it to your component. This is done out of consideration for performance. Instead of deep-copying the entire state for selection, Relink encourages you to select only what you need, then let Relink create a deep copy of it.

![How selectors work in Relink after v1.x.x](https://raw.githubusercontent.com/chin98edwin/react-relink/main/assets/how-selectors-work-in-relink-after-1xx.png)

<br/>

## Removal of Event Listeners

The `addListener` and `removeListener` methods will be removed in favor of `watch-unwatch` methods.

```js
// Old
const listenerId = Source.addListener(() => {/* ... */})
Source.removeListener(listenerId)

// New
const unwatchSource = Source.watch(() => {/* ... */})
unwatchSource()
```

<br/>

## Removal of "Dangerously" Methods
Below are the replacements for the "dangerously" methods:

```js
// For dangerouslyGetRelinkValue:
Source.get()
// For dangerouslySetRelinkState:
Source.set(/* state */)
// For dangerouslyResetRelinkState:
Source.reset()
// For dangerouslyHydrateRelinkSource:
Source.hydrate(/* state or callback as you would do in `lifecycle.init` */)
```

<br/>

# Selectors

You can use selectors to narrow down the items passed from `useRelinkState` and `useRelinkValue`.

```js
const MessagesSource = createSource({
  key: 'messages-source',
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

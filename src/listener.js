export function createListener() {
  let counter = 0
  const subscribers = {}
  return {
    M$add: (callback) => {
      const newId = ++counter
      subscribers[newId] = callback
      return newId
    },
    M$remove: (id) => {
      delete subscribers[id]
    },
    M$refresh: () => {
      const listenerStack = Object.values(subscribers)
      for (const listener of listenerStack) {
        listener()
      }
    },
  }
}

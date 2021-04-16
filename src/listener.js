// Make it global in case of passing in wrong id for removal by mistake
// but ended up cancelling another valid listener
let counter = 0

export function createListener() {
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
    M$refresh: (...args) => {
      const listenerStack = Object.values(subscribers)
      for (const listener of listenerStack) {
        listener(...args)
      }
    },
  }
}

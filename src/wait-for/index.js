import { deprecationWarn } from '../dev'

export async function waitForAll(sources = [], callback, onError) {
  if (callback) {
    deprecationWarn(
      'Starting from V1, `waitForAll` will be just an async function, but it seems like you have passed a callback to it, which will do nothing. Instead, try using `await waitForAll(...)` or `waitForAll(...).then()`.'
    )
    waitForAllBase(sources).then(callback).catch(onError)
  } else {
    await waitForAllBase(sources)
  }
}

function waitForAllBase(sources) {
  return new Promise((resolve, reject) => {
    try {
      let readyCount = 0
      for (const source of sources) {
        if (source.M$getIsReadyStatus()) {
          // If source is already hydrated, no need add listener
          readyCount += 1
        } else {
          // If not, only then we add a listener to it
          const listenerId = source.M$addInitListener((type) => {
            if (type === 0) {
              readyCount += 1
              source.M$removeInitListener(listenerId)
              if (readyCount === sources.length) {
                resolve()
              }
            }
          })
        }
      }
    } catch (e) {
      reject(e)
    }
  })
}

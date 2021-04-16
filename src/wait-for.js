export async function waitForAll(sources = [], callback, onError) {
  if (callback) {
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
    } catch (e) {
      reject(e)
    }
  })
}

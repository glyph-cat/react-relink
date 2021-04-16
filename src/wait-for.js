export async function waitForAll(sources = [], callback) {
  if (callback) {
    waitForAllBase(sources).then(callback)
  } else {
    await waitForAllBase(sources)
  }
}

function waitForAllBase(sources) {
  return new Promise((resolve) => {
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
  })
}

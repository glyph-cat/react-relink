let debounceRef = null;
const queueStack = [];

function virtualBatch(callback) {
  queueStack.push(callback);
  clearTimeout(debounceRef);
  debounceRef = setTimeout(() => {
    while (queueStack.length > 0) {
      // First in, First out
      const queuedCallback = queueStack.shift();
      queuedCallback();
    }
  });
}

export default virtualBatch;

/**
 * @description A stack that either calls or queues callbacks depending on a flag.
 * Queued callbacks are first-in first-out.
 */
export function createGatedQueue(initialStatus = false) {
  let isOpen = initialStatus;
  const queueStack = [];
  const M$getStatus = () => isOpen;
  const M$setStatus = (status) => {
    isOpen = status;
    if (status === true) {
      while (queueStack.length > 0) {
        const queuedCallback = queueStack.shift();
        queuedCallback();
      }
    }
  };
  const M$exec = (callback) => {
    isOpen ? callback() : queueStack.push(callback);
  };
  return {
    M$exec,
    M$setStatus,
    M$getStatus,
  };
}

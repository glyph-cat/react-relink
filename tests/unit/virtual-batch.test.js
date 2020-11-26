import virtualBatch from '../../src/virtual-batch';

jest.useFakeTimers();

it('Callbacks are batched', () => {
  let debouncedCallCount = 0,
    debouncedExecuteCount = 0;
  let debounceRef = null;
  const debouncedCallback = () => {
    clearTimeout(debounceRef);
    debouncedCallCount += 1;
    debounceRef = setTimeout(() => {
      debouncedExecuteCount += 1;
    });
  };

  virtualBatch(debouncedCallback);
  virtualBatch(debouncedCallback);
  jest.advanceTimersByTime();

  // The debounced callback should be called twice but only fired once
  expect(debouncedCallCount).toBe(2);
  expect(debouncedExecuteCount).toBe(1);
});

it('Callbacks are called in First-in, First-out order', () => {
  const normalStack = [],
    batchedStack = [];
  for (let i = 0; i < 10; i++) {
    normalStack.push(i);
    virtualBatch(() => {
      batchedStack.push(i);
    });
  }
  jest.advanceTimersByTime();
  expect(batchedStack).toStrictEqual(normalStack);
});

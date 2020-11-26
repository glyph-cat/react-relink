import { createListener } from '../../src/listener';

it('createListener', () => {
  const listener = createListener();

  // Counter - value will increase when listener receives payload
  let counter = 0;
  const expectedCounterValue = 3;
  const listenerId = listener.M$add(() => {
    counter += 1;
    if (counter >= expectedCounterValue) {
      listener.M$remove(listenerId);
    }
  });

  for (let i = 0; i < expectedCounterValue; i++) {
    listener.M$refresh();
  }
  // Extra trigger to check if listener is still lingering around
  listener.M$refresh();

  // Assertion
  expect(counter).toBe(expectedCounterValue);
});

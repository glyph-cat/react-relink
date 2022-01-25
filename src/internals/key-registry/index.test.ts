import { KEY_REGISTRY, registerKey, unregisterKey } from '.'

test('Key registration', () => {
  // Initial state
  expect(KEY_REGISTRY).toStrictEqual({})
  const key = Symbol('test')
  // After registering a key
  registerKey(key)
  expect(KEY_REGISTRY).toStrictEqual({ [key]: true })
  // After unregistering the key
  unregisterKey(key)
  expect(KEY_REGISTRY).toStrictEqual({})
})

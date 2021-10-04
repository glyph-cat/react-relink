import { getAutomaticKey, KEY_REGISTRY, registerKey, unregisterKey } from '.'

test('Key registration', () => {
  // Initial state
  expect(KEY_REGISTRY).toStrictEqual({})
  const autokey = getAutomaticKey()
  // After registering a key
  registerKey(autokey)
  expect(KEY_REGISTRY).toStrictEqual({ [autokey]: true })
  // After unregistering the key
  unregisterKey(autokey)
  expect(KEY_REGISTRY).toStrictEqual({})
})

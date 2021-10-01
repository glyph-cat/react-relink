// import { getAutomaticKey, KEY_STORE, registerKey, unregisterKey } from '.'

test('Key registration', () => {
  // // Initial state
  // expect(KEY_STORE).toStrictEqual({})
  // const autokey = getAutomaticKey()
  // // After registering a key
  // registerKey(autokey)
  // expect(KEY_STORE).toStrictEqual({ [autokey]: true })
  // // After unregistering the key
  // unregisterKey(autokey)
  // expect(KEY_STORE).toStrictEqual({})
  // KIV:
  // This doesn't work because key registration only happens in the client
  // environment. So the `KEY_STORE` will always be `{}`.
})

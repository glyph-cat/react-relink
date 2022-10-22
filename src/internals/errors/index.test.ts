import {
  formatErrorCode,
  showInternalErrorNextSteps,
  HANDLE_ERROR_NO_USELESS_HYDRATION,
  HANDLE_INTERNAL_ERROR_FAIL_TO_REMOVE_SELF_KEY_FROM_PARENT,
  HANDLE_WARNING_NO_EMPTY_KEYS_ALLOWED,
  HANDLE_WARNING_NO_FORWARDED_HYDRATION_CALLBACK_VALUE_ALLOWED,
  HANDLE_WARNING_SOURCE_DISPOSAL_WITH_ACTIVE_DEPS,
  THROW_ERROR_CIRCULAR_DEPENDENCY,
  THROW_INTERNAL_ERROR_MALFORMED_HYDRATION_MARKER,
  THROW_TYPE_ERROR_SOURCE_KEY,
} from '.'

afterEach(() => { jest.restoreAllMocks() })

describe(formatErrorCode.name, () => {

  test('Without args', () => {
    const output = formatErrorCode(1)
    expect(output).toBe('Relink_E1')
  })

  test('With args', () => {
    const args = ['foo', 42, true, false, null, undefined, Symbol('x')]
    const output = formatErrorCode(1, ...args)
    expect(output).toBe('Relink_E1-foo,42,true,false,null,undefined,Symbol(x)')
  })

})

test(showInternalErrorNextSteps.name, () => {
  const spy = jest.spyOn(console, 'error')
  showInternalErrorNextSteps('Hello world')
  // Link is supposed to be https://github.com/glyph-cat/react-relink/issues
  // but it is not available until after code is compiled.
  expect(spy).toHaveBeenCalledWith([
    'Next steps:',
    '1. You can check if similar reports have been made at undefined?q=Hello+world',
    '2. If no such reports have been made, you can file an issue at undefined/new?labels=bug&template=bug-report.md&title=Hello+world',
  ].join('\n'))
})

describe.skip(HANDLE_ERROR_NO_USELESS_HYDRATION.name, () => {

  // test('Previously concluded once', () => {
  //   const concludeTypeHistoryStack = [HydrationConcludeType.M$commit]
  //   const sourceKey = 'foo'
  //   const currentConcludeType = HydrationConcludeType.M$commit
  //   const warningMessage = formatWarningMessageForNoUselessHydration(
  //     sourceKey,
  //     currentConcludeType,
  //     concludeTypeHistoryStack
  //   )
  //   expect(warningMessage).toBe(
  //     'Attempted to commit a hydration in \'foo\' even though it has previously been concluded with: `commit()`. Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to `Source.hydrate()` instead, otherwise it might indicate a memory leak in your application.'
  //   )
  // })

  // test('Previously concluded multiple times', () => {
  //   const concludeTypeHistoryStack = [
  //     HydrationConcludeType.M$commit,
  //     HydrationConcludeType.M$skip,
  //     HydrationConcludeType.M$commit,
  //     HydrationConcludeType.M$skip,
  //     HydrationConcludeType.M$skip,
  //     HydrationConcludeType.M$commit,
  //   ]
  //   const sourceKey = 'foo'
  //   const currentConcludeType = HydrationConcludeType.M$skip
  //   const warningMessage = formatWarningMessageForNoUselessHydration(
  //     sourceKey,
  //     currentConcludeType,
  //     concludeTypeHistoryStack
  //   )
  //   expect(warningMessage).toBe(
  //     'Attempted to skip a hydration in \'foo\' even though it has previously been concluded with: `commit()`, `skip()`, `commit()`, `skip()`, `skip()`, `commit()`. Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to `Source.hydrate()` instead, otherwise it might indicate a memory leak in your application.'
  //   )
  // })

})


test(HANDLE_INTERNAL_ERROR_FAIL_TO_REMOVE_SELF_KEY_FROM_PARENT.name, () => {
  const spy = jest.spyOn(console, 'error')
  HANDLE_INTERNAL_ERROR_FAIL_TO_REMOVE_SELF_KEY_FROM_PARENT('foo', 'bar')
  expect(spy).toHaveBeenNthCalledWith(1, 'Internal error: Failed to unregister source key \'foo\' from parent source \'bar\'. While this is not immediately fatal, it could indicate a memory leak.')
})

test(HANDLE_WARNING_NO_EMPTY_KEYS_ALLOWED.name, () => {
  const spy = jest.spyOn(console, 'warn')
  HANDLE_WARNING_NO_EMPTY_KEYS_ALLOWED()
  expect(spy).toHaveBeenCalledWith('Did you just pass an empty string as a source key? Be careful, it can lead to problems that are hard to diagnose and debug later on.')
})

test(HANDLE_WARNING_NO_FORWARDED_HYDRATION_CALLBACK_VALUE_ALLOWED.name, () => {
  const spy = jest.spyOn(console, 'warn')
  HANDLE_WARNING_NO_FORWARDED_HYDRATION_CALLBACK_VALUE_ALLOWED('string')
  expect(spy).toHaveBeenCalledWith('Expected the callback passed to `Source.hydrate()` or declared for `lifecycle.init` to return undefined but got string. You should not rely on hydration callbacks to return any value as this just happens to be an unintended feature. This behaviour might change as Relink\'s internal implementation changes in the future.')
})

test(HANDLE_WARNING_SOURCE_DISPOSAL_WITH_ACTIVE_DEPS.name, () => {
  const spy = jest.spyOn(console, 'warn')
  HANDLE_WARNING_SOURCE_DISPOSAL_WITH_ACTIVE_DEPS('foo', ['bar', 'baz'])
  expect(spy).toHaveBeenCalledWith('Disposing/Cleaning up \'foo\' while there are still other sources that depend on it: \'bar\', \'baz\'. The source will stop emitting events upon state change, but this means components that rely on the children of this source might have unintended behaviours.')
})

test(THROW_ERROR_CIRCULAR_DEPENDENCY.name, () => {
  const callback = () => {
    THROW_ERROR_CIRCULAR_DEPENDENCY(['foo', 'bar', 'foo'])
  }
  expect(callback).toThrowError(new Error('Circular dependencies are not allowed: foo -> bar -> foo'))
})

test(THROW_INTERNAL_ERROR_MALFORMED_HYDRATION_MARKER.name, () => {
  const callback = () => {
    THROW_INTERNAL_ERROR_MALFORMED_HYDRATION_MARKER('meow')
  }
  expect(callback).toThrowError(new Error('Internal error: malformed hydration marker \'meow\''))
})

test(THROW_TYPE_ERROR_SOURCE_KEY.name, () => {
  const callback = () => {
    THROW_TYPE_ERROR_SOURCE_KEY('boolean')
  }
  expect(callback).toThrowError(new TypeError('Expected `key` to be a string, number, or symbol but got boolean'))
})

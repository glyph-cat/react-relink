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

describe.skip(showInternalErrorNextSteps.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

describe.skip(HANDLE_ERROR_NO_USELESS_HYDRATION.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

    // Reference from old test:
    // (Should be working fine because it's just the name that has changed)

    // describe(formatWarningMessageForNoUselessHydration.name, () => {

    //   test('Previously concluded once', () => {
    //     const concludeTypeHistoryStack = [HydrationConcludeType.M$commit]
    //     const sourceKey = 'foo'
    //     const currentConcludeType = HydrationConcludeType.M$commit
    //     const warningMessage = formatWarningMessageForNoUselessHydration(
    //       sourceKey,
    //       currentConcludeType,
    //       concludeTypeHistoryStack
    //     )
    //     expect(warningMessage).toBe(
    //       'Attempted to commit a hydration in \'foo\' even though it has previously been concluded with: `commit()`. Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to `Source.hydrate()` instead, otherwise it might indicate a memory leak in your application.'
    //     )
    //   })

    //   test('Previously concluded multiple times', () => {
    //     const concludeTypeHistoryStack = [
    //       HydrationConcludeType.M$commit,
    //       HydrationConcludeType.M$skip,
    //       HydrationConcludeType.M$commit,
    //       HydrationConcludeType.M$skip,
    //       HydrationConcludeType.M$skip,
    //       HydrationConcludeType.M$commit,
    //     ]
    //     const sourceKey = 'foo'
    //     const currentConcludeType = HydrationConcludeType.M$skip
    //     const warningMessage = formatWarningMessageForNoUselessHydration(
    //       sourceKey,
    //       currentConcludeType,
    //       concludeTypeHistoryStack
    //     )
    //     expect(warningMessage).toBe(
    //       'Attempted to skip a hydration in \'foo\' even though it has previously been concluded with: `commit()`, `skip()`, `commit()`, `skip()`, `skip()`, `commit()`. Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to `Source.hydrate()` instead, otherwise it might indicate a memory leak in your application.'
    //     )
    //   })

    // })

  })

})

describe.skip(HANDLE_INTERNAL_ERROR_FAIL_TO_REMOVE_SELF_KEY_FROM_PARENT.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

describe.skip(HANDLE_WARNING_NO_EMPTY_KEYS_ALLOWED.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

describe.skip(HANDLE_WARNING_NO_FORWARDED_HYDRATION_CALLBACK_VALUE_ALLOWED.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

describe.skip(HANDLE_WARNING_SOURCE_DISPOSAL_WITH_ACTIVE_DEPS.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

describe.skip(THROW_ERROR_CIRCULAR_DEPENDENCY.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

describe.skip(THROW_INTERNAL_ERROR_MALFORMED_HYDRATION_MARKER.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

describe.skip(THROW_TYPE_ERROR_SOURCE_KEY.name, () => {

  test('Not ready', () => {

    expect(null).toBe(null)

  })

})

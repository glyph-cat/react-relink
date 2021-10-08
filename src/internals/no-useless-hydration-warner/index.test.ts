import {
  createNoUselessHydrationWarner_DEV,
  createNoUselessHydrationWarner_PROD,
  formatWarningMessageForNoUselessHydration,
  HydrationConcludeType,
} from '.'

test(createNoUselessHydrationWarner_DEV.name, (): void => {
  const concludeHydration = createNoUselessHydrationWarner_DEV('foo')
  const isFirstHydration_1 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_1).toBe(true)
  const isFirstHydration_2 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_2).toBe(false)
})

test(createNoUselessHydrationWarner_PROD.name, (): void => {
  const concludeHydration = createNoUselessHydrationWarner_PROD()
  const isFirstHydration_1 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_1).toBe(true)
  const isFirstHydration_2 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_2).toBe(false)
})


describe(formatWarningMessageForNoUselessHydration.name, (): void => {

  test('Previously concluded once', (): void => {
    const concludeTypeHistoryStack = [HydrationConcludeType.M$commit]
    const sourceKey = 'foo'
    const currentConcludeType = HydrationConcludeType.M$commit
    const warningMessage = formatWarningMessageForNoUselessHydration(
      sourceKey,
      currentConcludeType,
      concludeTypeHistoryStack
    )
    expect(warningMessage).toBe(
      'Attempted to commit a hydration in \'foo\' even though it has previously been concluded with: `commit()`. Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to `Source.hydrate()` instead, otherwise it might indicate a memory leak in your application.'
    )
  })

  test('Previously concluded multiple times', (): void => {
    const concludeTypeHistoryStack = [
      HydrationConcludeType.M$commit,
      HydrationConcludeType.M$skip,
      HydrationConcludeType.M$commit,
      HydrationConcludeType.M$skip,
      HydrationConcludeType.M$skip,
      HydrationConcludeType.M$commit,
    ]
    const sourceKey = 'foo'
    const currentConcludeType = HydrationConcludeType.M$skip
    const warningMessage = formatWarningMessageForNoUselessHydration(
      sourceKey,
      currentConcludeType,
      concludeTypeHistoryStack
    )
    expect(warningMessage).toBe(
      'Attempted to skip a hydration in \'foo\' even though it has previously been concluded with: `commit()`, `skip()`, `commit()`, `skip()`, `skip()`, `commit()`. Only the first attempt to conclude a hydration is effective while the rest are ignored. If this was intentional, please make separate calls to `Source.hydrate()` instead, otherwise it might indicate a memory leak in your application.'
    )
  })

})

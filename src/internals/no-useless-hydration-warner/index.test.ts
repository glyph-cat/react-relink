import {
  createNoUselessHydrationWarner_DEV,
  createNoUselessHydrationWarner_PROD,
  HydrationConcludeType,
} from '.'

test(createNoUselessHydrationWarner_DEV.name, () => {
  const concludeHydration = createNoUselessHydrationWarner_DEV('foo')
  const isFirstHydration_1 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_1).toBe(true)
  const isFirstHydration_2 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_2).toBe(false)
})

test(createNoUselessHydrationWarner_PROD.name, () => {
  const concludeHydration = createNoUselessHydrationWarner_PROD()
  const isFirstHydration_1 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_1).toBe(true)
  const isFirstHydration_2 = concludeHydration(HydrationConcludeType.M$commit)
  expect(isFirstHydration_2).toBe(false)
})

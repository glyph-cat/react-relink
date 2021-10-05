import {
  formatPerformanceThresholdWarning,
  warnIfExceedPerformanceThreshold,
} from '.'

describe(formatPerformanceThresholdWarning.name, (): void => {

  test('Synchronous', (): void => {
    const output = formatPerformanceThresholdWarning(4896, false)
    expect(output).toBe('Spent 4896ms to execute a synchronous reducer')
  })

  test('Asynchronous', (): void => {
    const output = formatPerformanceThresholdWarning(4896, true)
    expect(output).toBe('Spent 4896ms to execute an async reducer')
  })

})

describe(warnIfExceedPerformanceThreshold.name, (): void => {

  test('Exceeded limit', (): void => {
    const output = warnIfExceedPerformanceThreshold(100, 3000, false)
    expect(output).toBe(true)
  })

  test('Not exceeded limit', (): void => {
    const output = warnIfExceedPerformanceThreshold(2, 9, false)
    expect(output).toBe(false)
  })

})

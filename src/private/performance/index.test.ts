import { TIME_GAP } from '../../../tests/helpers'
import {
  formatReducerNotRespondingWarning,
  formatReducerSlowWarning,
  PERFORMANCE_SYNC_SLOW_THRESHOLD_MS,
  PERFORMANCE_ASYNC_SLOW_THRESHOLD_MS,
  PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS,
  startMeasuringReducerPerformance,
} from '.'

// NOTE: Time gaps are added for extra time padding

describe(formatReducerSlowWarning.name, (): void => {

  jest.useFakeTimers()

  test('Synchronous', (): void => {
    const output = formatReducerSlowWarning('foo', 4896, false)
    expect(output).toBe(
      'Spent 4896ms to execute a synchronous reducer in \'foo\''
    )
  })

  test('Asynchronous', (): void => {
    const output = formatReducerSlowWarning(Symbol('bar'), 4896, true)
    expect(output).toBe(
      'Spent 4896ms to execute an async reducer in \'Symbol(bar)\''
    )
  })

})

describe(formatReducerNotRespondingWarning.name, (): void => {

  test('Synchronous', (): void => {
    const output = formatReducerNotRespondingWarning('foo', false)
    expect(output).toBe(
      '10000ms and counting: A synchronous reducer is still running for \'foo\'.'
    )
  })

  test('Asynchronous', (): void => {
    const output = formatReducerNotRespondingWarning(Symbol('bar'), true)
    expect(output).toBe(
      '10000ms and counting: An async reducer has not yet been resolved for \'Symbol(bar)\'.'
    )
  })

})

describe(startMeasuringReducerPerformance.name, (): void => {

  describe('Synchronous', (): void => {

    test('Normal', (): void => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(false)
      expect(isNotResponding).toBe(false)
    })

    test('Slow', (): void => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      jest.advanceTimersByTime(PERFORMANCE_SYNC_SLOW_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(false)
    })

    test('Not responding', (): void => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      jest.advanceTimersByTime(PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(true)
    })

  })

  describe('Asynchronous', (): void => {

    test('Normal', (): void => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      perfMeasurer.isAsync.current = true
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(false)
      expect(isNotResponding).toBe(false)
    })

    test('Slow', (): void => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      perfMeasurer.isAsync.current = true
      jest.advanceTimersByTime(PERFORMANCE_ASYNC_SLOW_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(false)
    })

    test('Not responding', (): void => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      perfMeasurer.isAsync.current = true
      jest.advanceTimersByTime(PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(true)
    })

  })

})

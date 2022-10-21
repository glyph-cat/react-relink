import { TIME_GAP } from '../../../debugging-utils'
import {
  formatReducerNotRespondingWarning,
  formatReducerSlowWarning,
  PERFORMANCE_SLOW_THRESHOLD_MS,
  PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS,
  startMeasuringReducerPerformance,
} from '.'

// NOTE: Time gaps are added for extra time padding

describe(formatReducerSlowWarning.name, () => {

  test('Synchronous', () => {
    const output = formatReducerSlowWarning('foo', 4896, false)
    expect(output).toBe(
      'Spent 4896ms to execute a synchronous reducer in \'foo\''
    )
  })

  test('Asynchronous', () => {
    const output = formatReducerSlowWarning(Symbol('bar'), 4896, true)
    expect(output).toBe(
      'Spent 4896ms to execute an async reducer in \'Symbol(bar)\''
    )
  })

})

describe(formatReducerNotRespondingWarning.name, () => {

  test('Synchronous', () => {
    const output = formatReducerNotRespondingWarning('foo', false)
    expect(output).toBe(
      '10000ms and counting: A synchronous reducer is still running for \'foo\'.'
    )
  })

  test('Asynchronous', () => {
    const output = formatReducerNotRespondingWarning(Symbol('bar'), true)
    expect(output).toBe(
      '10000ms and counting: An async reducer has not yet been resolved for \'Symbol(bar)\'.'
    )
  })

})

describe(startMeasuringReducerPerformance.name, () => {

  describe('Synchronous', () => {

    test('Normal', () => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(false)
      expect(isNotResponding).toBe(false)
    })

    test('Slow', () => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      jest.advanceTimersByTime(PERFORMANCE_SLOW_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(false)
    })

    test('Not responding', () => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      jest.advanceTimersByTime(PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(true)
    })

  })

  describe('Asynchronous', () => {

    test('Normal', () => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      perfMeasurer.isAsync.current = true
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(false)
      expect(isNotResponding).toBe(false)
    })

    test('Slow', () => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      perfMeasurer.isAsync.current = true
      jest.advanceTimersByTime(PERFORMANCE_SLOW_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(false)
    })

    test('Not responding', () => {
      const perfMeasurer = startMeasuringReducerPerformance('foo')
      perfMeasurer.isAsync.current = true
      jest.advanceTimersByTime(PERFORMANCE_NOT_RESPONDING_THRESHOLD_MS + TIME_GAP(1))
      const [isSlow, isNotResponding] = perfMeasurer.stop()
      expect(isSlow).toBe(true)
      expect(isNotResponding).toBe(true)
    })

  })

})

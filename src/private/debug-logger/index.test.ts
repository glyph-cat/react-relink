import { createDebugLogger } from '.'

describe(createDebugLogger.name, (): void => {

  test('echo', (): void => {
    const debugLogger1 = createDebugLogger('debug-logger-test')
    expect(debugLogger1.echo('message')).toBe(true)
    const debugLogger2 = createDebugLogger('foo-bar')
    expect(debugLogger2.echo('message')).toBe(undefined)
  })

})

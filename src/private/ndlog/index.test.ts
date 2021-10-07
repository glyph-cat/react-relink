import { createNDLogger } from '.'

describe(createNDLogger.name, (): void => {

  test('echo', (): void => {
    const NDlogger1 = createNDLogger('ndlog-test')
    expect(NDlogger1.echo('message')).toBe(true)
    const NDlogger2 = createNDLogger('foo-bar')
    expect(NDlogger2.echo('message')).toBe(undefined)
  })

})

import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { createSource } = Relink

  test('Number key', (): void => {
    const callback = (): void => {
      createSource({
        key: 1, // 'createSource/number-key'
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('String key', (): void => {
    const callback = (): void => {
      createSource({
        key: 'createSource/string-key',
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('Symbol key', (): void => {
    const callback = (): void => {
      createSource({
        key: Symbol('createSource/number-key'),
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('No key', (): void => {
    const callback = (): void => {
      // @ts-expect-error: Done on purpose to test the error.
      createSource({
        default: null,
      })
    }
    expect(callback).toThrow(TypeError)
  })

  test('Invalid key', (): void => {
    const callback = (): void => {
      createSource({
        // @ts-expect-error: Done on purpose to test the error.
        key: false,
        default: null,
      })
    }
    expect(callback).toThrowError(TypeError)
  })

  test('Duplicate keys', (): void => {
    const callback = (): void => {
      createSource({
        key: 'test/duplicate-keys',
        default: null,
      })
      createSource({
        key: 'test/duplicate-keys',
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

})

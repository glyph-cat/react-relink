import { UnitTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: UnitTestConfig): void => {

  const { RelinkSource } = Relink

  test('Number key', (): void => {
    const callback = (): void => {
      new RelinkSource({
        key: 1, // 'RelinkSource/number-key'
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('String key', (): void => {
    const callback = (): void => {
      new RelinkSource({
        key: 'RelinkSource/string-key',
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('Symbol key', (): void => {
    const callback = (): void => {
      new RelinkSource({
        key: Symbol('RelinkSource/number-key'),
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('No key', (): void => {
    const callback = (): void => {
      // @ts-expect-error: Done on purpose to test the error.
      new RelinkSource({
        default: null,
      })
    }
    expect(callback).toThrow(TypeError)
  })

  test('Invalid key', (): void => {
    const callback = (): void => {
      new RelinkSource({
        // @ts-expect-error: Done on purpose to test the error.
        key: false,
        default: null,
      })
    }
    expect(callback).toThrowError(TypeError)
  })

  test('Duplicate keys', (): void => {
    const callback = (): void => {
      new RelinkSource({
        key: 'test/duplicate-keys',
        default: null,
      })
      new RelinkSource({
        key: 'test/duplicate-keys',
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

})

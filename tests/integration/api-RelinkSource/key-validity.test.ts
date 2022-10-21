import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource } = Relink

  test('Number key', () => {
    const callback = () => {
      new RelinkSource({
        key: 1, // 'RelinkSource/number-key'
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('String key', () => {
    const callback = () => {
      new RelinkSource({
        key: 'RelinkSource/string-key',
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('Symbol key', () => {
    const callback = () => {
      new RelinkSource({
        key: Symbol('RelinkSource/number-key'),
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('No key', () => {
    const callback = () => {
      // @ts-expect-error: Done on purpose to test the error.
      new RelinkSource({
        default: null,
      })
    }
    expect(callback).toThrow(TypeError)
  })

  test('Invalid key', () => {
    const callback = () => {
      new RelinkSource({
        // @ts-expect-error: Done on purpose to test the error.
        key: false,
        default: null,
      })
    }
    expect(callback).toThrowError(TypeError)
  })

  test('Duplicate keys', () => {
    const callback = () => {
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

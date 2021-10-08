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
      createSource({
        default: null,
      })
    }
    expect(callback).not.toThrow()
  })

  test('Invalid key', (): void => {
    const callback = (): void => {
      createSource({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore; // Refer to Special Note 'B' in 'src/README.md'
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

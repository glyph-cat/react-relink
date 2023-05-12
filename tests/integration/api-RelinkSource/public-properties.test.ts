import { RelinkSource as $RelinkSource } from '../../../src/bundle'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig) => {

  const { RelinkSource } = Relink

  describe('.key', () => {

    const SOURCE_KEY = 'test/public-properties/key'
    let Source: $RelinkSource<number>
    beforeEach(async () => {
      Source = new RelinkSource({
        key: SOURCE_KEY,
        default: 1,
      })
    })
    afterEach(async () => {
      await Source.dispose()
    })

    test('Returned value is correct', () => {
      expect(Source.key).toBe(SOURCE_KEY)
    })

    test('Value cannot be modified', () => {
      const callback = () => {
        // @ts-expect-error: Done on purpose to test the error.
        Source.key = 'lorem-ipsum'
      }
      expect(callback).toThrowError(TypeError)
      expect(callback).toThrowError(
        /^Cannot set property key of (#<[A-Za-z]+>|\[object Object\]) which has only a getter$/
      )
    })

  })

  describe('.default', () => {

    let Source: $RelinkSource<number>
    beforeEach(async () => {
      Source = new RelinkSource({
        key: 'test/public-properties/default',
        default: 1,
      })
    })
    afterEach(async () => {
      await Source.dispose()
    })

    test('Returned value is correct', async () => {
      expect(Source.default).toBe(1) // before
      await Source.set(2)
      expect(Source.default).toBe(1) // and after set state
    })

    test('Value cannot be modified', () => {
      const callback = () => {
        // @ts-expect-error: Done on purpose to test the error.
        Source.default = 2
      }
      expect(callback).toThrowError(TypeError)
      expect(callback).toThrowError(
        /^Cannot set property default of (#<[A-Za-z]+>|\[object Object\]) which has only a getter$/
      )
    })

  })

})

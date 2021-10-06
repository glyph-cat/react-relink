import { RelinkSource } from '../../../../src'
import { IntegrationTestProps, SampleSchema } from '../../../helpers'

export default function ({ Relink }: IntegrationTestProps): void {

  const { createSource } = Relink

  describe('Source.reset()', (): void => {

    let Source: RelinkSource<SampleSchema>
    beforeEach(async (): Promise<void> => {
      Source = createSource({
        key: 'test/Source.reset()',
        default: {
          foo: 1,
          bar: 1,
        },
      })
      await Source.set({ foo: 2, bar: 2 })
    })
    afterEach((): void => {
      Source.cleanup()
    })

    test('Without await', async (): Promise<void> => {
      const promise = Source.reset()
      expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
      expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
      expect((await promise)).toBe(undefined)
    })

    test('With await', async (): Promise<void> => {
      const awaitedPromise = await Source.reset()
      expect(Source.get()).toStrictEqual({ foo: 1, bar: 1 })
      expect((await Source.getAsync())).toStrictEqual({ foo: 1, bar: 1 })
      expect(awaitedPromise).toBe(undefined)
    })

  })

}

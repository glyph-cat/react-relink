export default function ({ Relink }) {
  const { createSource } = Relink
  describe('Basics', () => {

    it('createSource', () => {
      const key = 'test/createSource'
      const Source = Relink.createSource({
        key,
        default: { username: 'foo' },
      })
      expect(Object.values(Source).includes(key)).toBe(true)
    })

    it('get', () => {
      const sh = createSource({
        default: 1,
      })
      const state = sh.get()
      expect(state).toBe(1)
    })

    it('set', () => {
      const sh = createSource({
        default: 1,
      })
      sh.set(3)
      const state = sh.get()
      expect(state).toBe(3)
    })

    it('States are carried forward in the batches', () => {
      jest.useFakeTimers()
      const sh = createSource({
        default: { a: 1, b: 1 },
        options: { virtualBatch: true },
      })
      sh.set((oldState) => ({ ...oldState, a: oldState.a + 1 }))
      sh.set((oldState) => ({ ...oldState, b: oldState.b + 1 }))
      jest.advanceTimersByTime()
      const state = sh.get()
      expect(state).toStrictEqual({ a: 2, b: 2 })
    })
  })
}

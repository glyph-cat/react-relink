export default function ({ Relink }) {
  describe('createSource', () => {
    const key = 'test/createSource'
    const Source = Relink.createSource({
      key,
      default: { username: 'foo' },
    })
    expect(Object.values(Source).includes(key)).toBe(true)
  })
}

export default function (config) {
  describe('useRelinkValue', () => {
    require('./normal').default(config)
    require('./with-selector').default(config)
  })
}

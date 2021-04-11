export default function (config) {
  describe('Setting same values won\'t cause updates', () => {
    require('./simple').default(config)
    require('./complex').default(config)
  })
}

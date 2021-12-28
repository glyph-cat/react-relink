// TODO: Test with complex data
export default function (config) {
  describe('Source', () => {
    require('./use-relink-state').default(config)
    require('./use-relink-state-s').default(config)
    require('./use-relink-state-s,r').default(config)
    require('./use-relink-state-s,r,d').default(config)
  })
}

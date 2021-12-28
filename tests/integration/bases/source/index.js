export default function (config) {
  describe('Source', () => {
    require('./basics').default(config)
    require('./hydrate-persist').default(config)
    require('./listener').default(config)
    require('./mutability').default(config)
    require('./rehydration').default(config)
  })
}

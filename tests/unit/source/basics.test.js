import { createSource } from '../../../src/source'

describe('Basics', () => {
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
})

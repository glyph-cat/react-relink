import { TIME_GAP } from '../../../debugging-utils'
import { RelinkSource } from '../../api/source'
import { allDepsAreReady } from '.'

describe(allDepsAreReady.name, () => {

  test('No deps', () => {
    const MainSource = new RelinkSource({
      key: `test/${allDepsAreReady.name}/no-deps`,
      default: 1,
    })
    const output = allDepsAreReady(MainSource.M$parentDeps)
    expect(output).toBe(true)
  })

  test('All deps don\'t need hydration', () => {
    const scopeName = 'all-deps-no-need-hydration'
    const SourceA = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
    })
    const SourceB = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
    })
    const MainSource = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource.M$parentDeps)
    expect(output).toBe(true)
  })

  test('All deps are ready', () => {
    const scopeName = 'all-deps-are-ready'
    const SourceA = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
      lifecycle: {
        init: ({ commit }) => { commit(1) },
      },
    })
    const SourceB = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
      lifecycle: {
        init: ({ commit }) => { commit(1) },
      },
    })
    const MainSource = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource.M$parentDeps)
    expect(output).toBe(true)
  })

  test('Only some deps are ready', () => {
    const scopeName = 'some-deps-are-ready'
    const SourceA = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
      lifecycle: {
        init: ({ commit }) => { commit(1) },
      },
    })
    const SourceB = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit(1)
          }, TIME_GAP(10))
        },
      },
    })
    const MainSource = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource.M$parentDeps)
    expect(output).toBe(false)
  })

  test('No deps are ready', () => {
    const scopeName = 'no-deps-are-ready'
    const SourceA = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit(1)
          }, TIME_GAP(10))
        },
      },
    })
    const SourceB = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
      lifecycle: {
        init: ({ commit }) => {
          setTimeout(() => {
            commit(1)
          }, TIME_GAP(10))
        },
      },
    })
    const MainSource = new RelinkSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource.M$parentDeps)
    expect(output).toBe(false)
  })

})

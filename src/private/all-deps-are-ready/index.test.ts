import { TIME_GAP } from '../../../tests/helpers'
import { INTERNALS_SYMBOL } from '../../constants'
import { createSource } from '../../public/source'
import { allDepsAreReady } from '.'

describe(allDepsAreReady.name, (): void => {

  test('No deps', (): void => {
    const MainSource = createSource({
      key: `test/${allDepsAreReady.name}/no-deps`,
      default: 1,
    })
    const output = allDepsAreReady(MainSource[INTERNALS_SYMBOL].M$parentDeps)
    expect(output).toBe(true)
  })

  test('All deps don\'t need hydration', (): void => {
    const scopeName = 'all-deps-no-need-hydration'
    const SourceA = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
    })
    const SourceB = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
    })
    const MainSource = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource[INTERNALS_SYMBOL].M$parentDeps)
    expect(output).toBe(true)
  })

  test('All deps are ready', (): void => {
    const scopeName = 'all-deps-are-ready'
    const SourceA = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
      lifecycle: {
        init: ({ commit }): void => { commit(1) },
      },
    })
    const SourceB = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
      lifecycle: {
        init: ({ commit }): void => { commit(1) },
      },
    })
    const MainSource = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource[INTERNALS_SYMBOL].M$parentDeps)
    expect(output).toBe(true)
  })

  test('Only some deps are ready', (): void => {
    const scopeName = 'some-deps-are-ready'
    const SourceA = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
      lifecycle: {
        init: ({ commit }): void => { commit(1) },
      },
    })
    const SourceB = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
      lifecycle: {
        init: ({ commit }): void => {
          setTimeout((): void => {
            commit(1)
          }, TIME_GAP(10))
        },
      },
    })
    const MainSource = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource[INTERNALS_SYMBOL].M$parentDeps)
    expect(output).toBe(false)
  })

  test('No deps are ready', (): void => {
    const scopeName = 'no-deps-are-ready'
    const SourceA = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/a`,
      default: 1,
      lifecycle: {
        init: ({ commit }): void => {
          setTimeout((): void => {
            commit(1)
          }, TIME_GAP(10))
        },
      },
    })
    const SourceB = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/b`,
      default: 1,
      lifecycle: {
        init: ({ commit }): void => {
          setTimeout((): void => {
            commit(1)
          }, TIME_GAP(10))
        },
      },
    })
    const MainSource = createSource({
      key: `test/${allDepsAreReady.name}/${scopeName}/main`,
      default: 1,
      deps: [SourceA, SourceB],
    })
    const output = allDepsAreReady(MainSource[INTERNALS_SYMBOL].M$parentDeps)
    expect(output).toBe(false)
  })

})

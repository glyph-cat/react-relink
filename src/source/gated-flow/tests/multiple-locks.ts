import { createGatedFlow } from '..'

describe(createGatedFlow.name, (): void => {
  test('Multiple locks', () => {
    const gateKeeper = createGatedFlow(true)

    const array: Array<number> = []
    gateKeeper.M$exec((): void => {
      array.push(-1)
    })

    for (let i = 0; i < 10; i++) {
      gateKeeper.M$lock()
      gateKeeper.M$exec((): void => {
        array.push(i)
      })
    }

    // Array should still be the same at this point
    expect(array).toStrictEqual([-1])

    // Unlock gate one by one...
    gateKeeper.M$open() // 1st
    expect(array).toStrictEqual([-1, 0])
    gateKeeper.M$open() // 2nd
    expect(array).toStrictEqual([-1, 0, 1])
    gateKeeper.M$open() // 3rd
    expect(array).toStrictEqual([-1, 0, 1, 2])
    gateKeeper.M$open() // 4th
    expect(array).toStrictEqual([-1, 0, 1, 2, 3])
    gateKeeper.M$open() // 5th
    expect(array).toStrictEqual([-1, 0, 1, 2, 3, 4])
    gateKeeper.M$open() // 6th
    expect(array).toStrictEqual([-1, 0, 1, 2, 3, 4, 5])
    gateKeeper.M$open() // 7th
    expect(array).toStrictEqual([-1, 0, 1, 2, 3, 4, 5, 6])
    gateKeeper.M$open() // 8th
    expect(array).toStrictEqual([-1, 0, 1, 2, 3, 4, 5, 6, 7])
    gateKeeper.M$open() // 9th
    expect(array).toStrictEqual([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8])
    gateKeeper.M$open() // 10th
    expect(array).toStrictEqual([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

  })
})

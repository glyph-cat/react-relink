import { LazyVariable } from '.'

test(LazyVariable.name, (): void => {

  const factory = jest.fn(() => 'obj')

  // NOTE: Can also be written as `new LazyVariable(factory)` in this case
  // because we don't need to pass any parameters into `factory`.
  const obj = new LazyVariable(() => factory())
  expect(factory).not.toBeCalled()

  const output = obj.get()
  expect(output).toBe('obj')
  expect(factory).toBeCalledTimes(1)

})

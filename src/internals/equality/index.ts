import reactFastCompare from 'react-fast-compare'

export function isEqual(a: unknown, b: unknown, mutable: boolean): boolean {
  return mutable ? Object.is(a, b) : reactFastCompare(a, b)
}

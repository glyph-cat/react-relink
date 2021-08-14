import reactFastCompare from 'react-fast-compare'

/**
 * @deprecated
 */
export function isEqual(mutable: boolean, a: unknown, b: unknown): boolean {
  return mutable ? Object.is(a, b) : reactFastCompare(a, b)
}

export interface EqualityChecker {
  (a: unknown, b: unknown): boolean
}

export function createEqualityChecker(mutable: boolean): EqualityChecker {
  return function (a: unknown, b: unknown): boolean {
    return mutable ? Object.is(a, b) : reactFastCompare(a, b)
  }
}

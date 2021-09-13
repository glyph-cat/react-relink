import reactFastCompare from 'react-fast-compare'

// export interface EqualityChecker {
//   (a: unknown, b: unknown): boolean
// }

// export function createEqualityChecker(mutable: boolean): EqualityChecker {
//   return function (a: unknown, b: unknown): boolean {
//     return mutable ? Object.is(a, b) : reactFastCompare(a, b)
//   }
// }


export function isEqual(a: unknown, b: unknown, mutable: boolean): boolean {
  return mutable ? Object.is(a, b) : reactFastCompare(a, b)
}

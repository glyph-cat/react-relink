import { RelinkSourceKey } from '../../schema'

export type SafeStringJoinTypes = boolean | number | string | null | undefined | symbol

/**
 * Safely concatenates array values into strings. `Array.prototype.join` will
 * convert `null` and `undefined` into empty strings and throw an error if there
 * is a Symbol. This function aims to fix that.
 */
export function safeStringJoin(
  values: Array<SafeStringJoinTypes>,
  separator: string
): string {
  const strStack: Array<string> = []
  for (let i = 0; i < values.length; i++) {
    strStack.push(String(values[i]))
  }
  return strStack.join(separator)
}

export function formatSourceKeyArray(
  sourceKeys: Array<RelinkSourceKey>
): string {
  return `'${safeStringJoin(sourceKeys, '\', \'')}'`
}

export function formatFunctionNotation(fnName: string): string {
  return `\`${fnName}()\``
}

export function formatFunctionNotationArray(fnNames: string[]): string {
  const formattedStack: Array<string> = []
  for (let i = 0; i < fnNames.length; i++) {
    formattedStack.push(formatFunctionNotation(fnNames[i]))
  }
  return formattedStack.join(', ')
}

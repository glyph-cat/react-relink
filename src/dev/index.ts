import { IS_DEBUG_ENV } from '../constants'

export function devError(message: string): void {
  if (IS_DEBUG_ENV) {
    // eslint-disable-next-line no-console
    console.error(message)
  }
}

export function devWarn(message: string): void {
  if (IS_DEBUG_ENV) {
    // eslint-disable-next-line no-console
    console.warn(message)
  }
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

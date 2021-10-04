import { IS_DEBUG_ENV } from '../constants'

function devPrint(
  type: 'log' | 'info' | 'warn' | 'error',
  message: string
): void {
  if (IS_DEBUG_ENV) {
    // eslint-disable-next-line no-console
    console[type](message)
  }
}

export function devError(message: string): void {
  devPrint('error', message)
}

export function devWarn(message: string): void {
  devPrint('warn', message)
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

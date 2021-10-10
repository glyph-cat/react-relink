export function hasSymbol(value: unknown, symbol: symbol): boolean {
  // NOTE: Must do preliminary check. If value is undefined, trying to directly
  // access `value[INTERNALS_SYMBOL]` would've resulted in an error.
  if (!value) { return false } // Early exit
  return typeof value[symbol] !== 'undefined'
}

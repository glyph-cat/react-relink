export const IS_DEBUG_ENV = process.env.NODE_ENV !== 'production'
export const RelinkInternals = Symbol(IS_DEBUG_ENV ? 'RelinkInternals' : undefined)

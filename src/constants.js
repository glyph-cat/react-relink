export const IS_DEBUG = process.env.NODE_ENV !== 'production'
export const RelinkInternals = Symbol(IS_DEBUG ? 'RelinkInternals' : undefined)

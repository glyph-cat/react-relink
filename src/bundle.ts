import { IS_DEV_ENV } from './constants'

export * from './abstractions'
export * from './api/compare-fn-presets'
export * from './api/config'
export * from './api/scope'
export * from './api/selector'
export * from './api/source'
export * from './api/use-hydrate-relink-source'
export * from './api/use-relink-source'
export * from './api/use-relink-state'
export * from './api/use-relink-value'
export * from './api/use-reset-relink-state'
export * from './api/use-set-relink-state'
export * from './api/wait-for'
export * from './constants/public'

if (IS_DEV_ENV) {
  // eslint-disable-next-line no-console
  console.warn('This package has been deprecated in favor of a cleaner and more efficient alternative: \'cotton-box\'. The migration guide is available at: https://glyph-cat.github.io/cotton-box/docs/learn/react/migration-from-react-relink')
}

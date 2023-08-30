export const DELAY_TIMEOUT = 200 // ms

export const TestId = {
  button: {
    HYDRATE_BY_COMMIT: 'hydrate-by-commit',
    HYDRATE_BY_COMMIT_DEFAULT: 'hydrate-by-commit-default',
    HYDRATE_BY_COMMIT_NOOP: 'hydrate-by-commit-noop',
    SET_ARBITARY_VALUE: 'set-arbitary-value',
  },
  SUB_RENDER_COUNT: 'sub-render-count',
  SUSPENSE_FALLBACK_COMPONENT: 'suspense-fallback-component',
} as const

export enum CounterValues {
  DEFAULT_VALUE = 0,
  ARBITARY_VALUE = 64,
  COMMIT_VALUE = 42,
}

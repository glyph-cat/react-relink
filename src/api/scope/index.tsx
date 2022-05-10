import { createContext, ReactNode, useContext } from 'react'
import { RelinkScopeId, RelinkSourceKey } from '../../schema'
import type { RelinkSource } from '../source'

/**
 * @internal
 */
let scopeIdCounter = 0

/**
 * @internal
 */
export const getNewScopeId = (): RelinkScopeId => ++scopeIdCounter

/**
 * @internal
 */
interface RelinkContextSchema {
  M$pool: Record<RelinkSourceKey, RelinkSource<unknown>>
}

/**
 * @internal
 */
const RelinkContext = createContext<RelinkContextSchema>({
  M$pool: {},
})

/**
 * @internal
 */
export function useScopedRelinkSource<S>(source: RelinkSource<S>): RelinkSource<S> {
  const currentContext = useContext(RelinkContext)
  const scopedSource = currentContext.M$pool[source.M$scopeId]
  return scopedSource
    ? scopedSource as RelinkSource<S> // If in pool, return the scoped source.
    : source // Otherwise, return the original source.
}

/**
 * ## 🚧 EXPERIMENTAL 🚧
 * Relink Scope is an experimental feature. Until it is stable, the usage,
 * parameters, and behaviours might change from version to version, potentially
 * causing your app to break when you update the package between minor and even
 * patch versions!
 * @public
 */
export interface RelinkScopeProps {
  /**
   * The sources to scope from.
   */
  // Refer to Special Note 'A' in 'src/README.md'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sources: Array<RelinkSource<any>>
  children: ReactNode
}

/**
 * ## 🚧 EXPERIMENTAL 🚧
 * Relink Scope is an experimental feature. Until it is stable, the usage,
 * parameters, and behaviours might change from version to version, potentially
 * causing your app to break when you update the package between minor and even
 * patch versions!
 * -----------------------------------------------------------------------------
 * Under the hood, React's Context API is used to allow scoping of different
 * sources. Any sources can be passed into the `sources` prop. Then, child
 * components will consume from whichever source that is available if no source
 * is available, it will consume from the orignal "unscoped" source.
 * @example
 * // First approach
 *
 * const MainSource = new RelinkSource({
 *   key: 'main',
 *   default: '...',
 * })
 *
 * const SubSource = new RelinkSource({
 *   key: 'sub',
 *   scope: MainSource,
 *   default: '...',
 * })
 *
 * function App() {
 *   return (
 *     <RelinkScope sources={[SubSource]}>
 *       <SomeComponent />
 *     </RelinkScope>
 *   )
 * }
 *
 * function SomeComponent(): JSX.Element {
 *   // Passing `MainSource` or `SubSource` to `useRelinkState` have the same effect.
 *   // But for clarity's sake, always use the main source as a rule of thumb.
 *   const [state, setState] = useRelinkState(MainSource)
 *   return '...'
 * }
 *
 * @example
 * // Second approach
 *
 * const MainSource = new RelinkSource({
 *   key: 'main',
 *   default: '...',
 * })
 *
 * function App() {
 *   const SubSource = useRef<typeof MainSource>()
 *   if (!SubSource.current) {
 *     SubSource.current = new RelinkSource({
 *       key: 'sub',
 *       scope: MainSource,
 *       default: '...',
 *     })
 *   }
 *   return (
 *     <RelinkScope sources={[SubSource.current]}>
 *       <SomeComponent />
 *     </RelinkScope>
 *   )
 * }
 *
 * function SomeComponent(): JSX.Element {
 *   const [state, setState] = useRelinkState(MainSource)
 *   return '...'
 * }
 *
 * @public
 */
export function RelinkScope({
  children,
  sources,
}: RelinkScopeProps): JSX.Element {
  const currentContext = useContext(RelinkContext)
  const nextContext: RelinkContextSchema = {
    M$pool: {
      ...currentContext.M$pool,
    },
  }
  // Sources from props are merged with sources from parent providers.
  for (const source of sources) {
    nextContext.M$pool[source.M$scopeId] = source
  }
  return (
    <RelinkContext.Provider value={nextContext}>
      {children}
    </RelinkContext.Provider>
  )
}

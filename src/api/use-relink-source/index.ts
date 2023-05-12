import { useEffect, useState } from 'react'
import { RelinkSource, RelinkSourceConfig } from '../source'

/**
 * ## 🚨 KNOWN ISSUES 🚨
 * This USED TO break in Strict Mode, but has been improved since then.
 * You can learn more by referring to the "Known Issues" section of the
 * [4.1.0 release notes](https://github.com/glyph-cat/react-relink/releases/tag/4.1.0).
 *
 * ## 🚧 EXPERIMENTAL 🚧
 * This is an experimental feature. Until it is stable, the usage, parameters,
 * and behaviours might change from version to version, potentially causing
 * your app to break when you update the package between minor and even patch
 * versions!
 * @example
 * function App(): JSX.Element {
 *   const MySource = useRelinkSource({
 *     key: 'foo-bar',
 *     default: {
 *       // Default value goes here
 *     },
 *   })
 *   return '...'
 * }
 * @public
 */
export function useRelinkSource<State>(
  config: RelinkSourceConfig<State>
): RelinkSource<State> {
  const [source] = useState<Array<RelinkSource<State>>>([])
  if (source.length <= 0) {
    source.push(new RelinkSource(config))
  }
  useEffect(() => {
    return () => {
      if (source.length > 0) {
        const sourceToDispose = source.shift()
        sourceToDispose.dispose()
      }
    }
  }, [source])
  return source[0]
}

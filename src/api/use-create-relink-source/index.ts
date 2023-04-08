import { useRef, useState } from 'react'
import { useLayoutEffect } from '../../internals/custom-hooks'
import { RelinkSource, RelinkSourceConfig } from '../source'

// TOFIX

/**
 * ## 🚨 KNOWN ISSUES 🚨
 * This will break your app in Strict Mode. You can learn more by referring to
 * the "Known Issues" section of the
 * [4.1.0 release notes](https://github.com/glyph-cat/react-relink/releases/tag/4.1.0).
 *
 * ## 🚧 EXPERIMENTAL 🚧
 * This is an experimental feature. Until it is stable, the usage, parameters,
 * and behaviours might change from version to version, potentially causing
 * your app to break when you update the package between minor and even patch
 * versions!
 * @example
 * function App(): JSX.Element {
 *   const MySource = useCreateRelinkSource({
 *     key: 'foo-bar',
 *     default: {
 *       // Default value goes here
 *     },
 *   })
 *   return '...'
 * }
 * @public
 */
export function useCreateRelinkSource<State>(
  config: RelinkSourceConfig<State>
): RelinkSource<State> {
  const cachedConfig = useRef(config)
  const [source, setSource] = useState(null)
  useLayoutEffect(() => {
    const $source = new RelinkSource(cachedConfig.current)
    setSource($source)
    return () => {
      $source.dispose()
      setSource(null)
    }
  }, [])
  return source

  // const hash = useRef(Math.round(Math.random() * 10000))
  // const cachedConfig = useRef(config)
  // const source = useRef<RelinkSource<State>>()
  // const hash_current = hash.current
  // useLayoutEffect(() => {
  //   console.log(hash_current, 'Mounted')
  //   const source_current = source.current
  //   return () => {
  //     console.log(hash_current, 'Unmounting component, disposing source...')
  //     source_current.dispose()
  //     source.current = null
  //   }
  // }, [hash_current])
  // if (!source.current) {
  //   console.log(hash.current, 'source.current PRE', source.current)
  //   console.log(hash.current, 'Assigning source...')
  //   source.current = new RelinkSource(cachedConfig.current)
  //   console.log(hash.current, 'source.current POST', source.current)
  // }
  // return source.current

  // Expected log order:
  //   [Log] Assigning source (bundle.3db07c8d.js, line 1872)
  //   [Log] Mounted (bundle.3db07c8d.js, line 1876)
  //   [Log] Unmounting component, disposing source... (bundle.3db07c8d.js, line 1879)
  //   [Log] Assigning source (bundle.3db07c8d.js, line 1872)
  //   [Log] Mounted (bundle.3db07c8d.js, line 1876)
  // Actual log order:
  //   [Log] Assigning source (bundle.3db07c8d.js, line 1872)
  //   [Log] Assigning source (bundle.3db07c8d.js, line 1872)
  //   [Log] Mounted (bundle.3db07c8d.js, line 1876)
  //   [Log] Unmounting component, disposing source... (bundle.3db07c8d.js, line 1879)
  //   [Log] Mounted (bundle.3db07c8d.js, line 1876)
}

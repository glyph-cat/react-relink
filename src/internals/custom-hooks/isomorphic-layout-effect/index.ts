import {
  useEffect,
  useLayoutEffect, // eslint-disable-line no-restricted-imports
} from 'react'
import { IS_CLIENT_ENV } from '../../../constants'

/**
 * @internal
 */
const useIsomorphicLayoutEffect = IS_CLIENT_ENV ? useLayoutEffect : useEffect

export { useIsomorphicLayoutEffect as useLayoutEffect }

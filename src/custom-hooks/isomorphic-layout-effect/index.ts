import { useEffect, useLayoutEffect } from 'react'
import { IS_BROWSER_ENV } from '../../constants'

const useIsomorphicLayoutEffect = IS_BROWSER_ENV ? useLayoutEffect : useEffect

export { useIsomorphicLayoutEffect as useLayoutEffect }

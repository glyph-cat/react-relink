import { useEffect, useLayoutEffect } from 'react'
import { IS_CLIENT_ENV } from '../../../constants'

const useIsomorphicLayoutEffect = IS_CLIENT_ENV ? useLayoutEffect : useEffect

export { useIsomorphicLayoutEffect as useLayoutEffect }

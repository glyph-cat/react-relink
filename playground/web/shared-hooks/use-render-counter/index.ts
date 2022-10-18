import { useRef } from 'react'

export function useRenderCounter(): number {
  const renderCount = useRef(0)
  renderCount.current += 1
  return renderCount.current
}

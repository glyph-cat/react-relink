import { CSSProperties, ReactNode, useRef } from 'react'
import { CONTAINER_PADDING, STATUS_BAR_HEIGHT } from './constants'
import { StatusBar } from './status-bar'

interface DebugFrameProps {
  children: ReactNode
  /**
   * @defaultValue `false`
   */
  fullVh?: boolean
  /**
   * @defaultValue `undefined`
   */
  style?: CSSProperties
  /**
   * @defaultValue `undefined`
   */
  className?: string
}

export function DebugFrame({
  children,
  fullVh,
  style,
  className,
}: DebugFrameProps): JSX.Element {
  const renderCount = useRef(0)
  renderCount.current += 1
  return (
    <>
      <StatusBar renderCount={renderCount.current} />
      <div
        data-test-id='debug-frame'
        className={className}
        style={{
          alignItems: 'flex-start',
          display: 'grid',
          padding: CONTAINER_PADDING,
          ...(fullVh ? {
            minHeight: `calc(100vh - ${STATUS_BAR_HEIGHT + 2 * CONTAINER_PADDING}px)`,
          } : {}),
          ...style,
        }}
      >
        {children}
      </div>
    </>
  )
}

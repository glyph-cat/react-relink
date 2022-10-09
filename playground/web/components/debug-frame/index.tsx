import { CSSProperties, ReactNode } from 'react'
import { useRenderCounter } from '../../utils/use-render-counter'
import { CONTAINER_PADDING, STATUS_BAR_HEIGHT } from './constants'
import { StatusBar } from './status-bar'
import { StorageViewer } from './storage-viewer'

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
  const renderCount = useRenderCounter()
  return (
    <>
      <StatusBar renderCount={renderCount} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
      }}>
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
        <StorageViewer />
      </div>
    </>
  )
}

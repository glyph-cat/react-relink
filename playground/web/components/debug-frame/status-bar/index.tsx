import { useCallback, useState } from 'react'
import { useRelinkPackage } from '../../../utils'
import { STATUS_BAR_HEIGHT } from '../constants'
import { ListMenu } from './list-menu'
import styles from './index.module.css'

export interface StatusBarProps {
  renderCount: number
}

export function StatusBar({ renderCount }: StatusBarProps): JSX.Element {
  const RelinkPackage = useRelinkPackage()
  const {
    BUILD_HASH = 'X'.repeat(40),
    BUILD_TYPE = 'DEBUG',
    VERSION = 'X.X.X',
    RelinkBuildType,
  } = RelinkPackage

  const [shouldShowListMenu, setListMenuVisibility] = useState(false)
  const showListMenu = useCallback(() => {
    setListMenuVisibility(true)
  }, [])
  const hideListMenu = useCallback(() => {
    setListMenuVisibility(false)
  }, [])

  const [shouldShowFullHash, setFullHashVisibility] = useState(false)
  const toggleFullHashVisibility = useCallback(() => {
    setFullHashVisibility(v => !v)
  }, [])

  return (
    <>
      <div
        className={styles.container}
        style={{
          backgroundColor: RelinkPackage.BUILD_TYPE
            ? RelinkPackage.BUILD_TYPE !== RelinkBuildType.RN
              ? '#40C0A040'
              : '#8060C080'
            : '#E6510040',
          height: STATUS_BAR_HEIGHT,
        }}
      >
        <code onClick={showListMenu} style={{ cursor: 'pointer' }}>
          <span>Relink v</span>
          <span data-testid='relink-version'>{VERSION}</span>
          <span>{' ('}</span>
          <span data-testid='relink-build-type'>{BUILD_TYPE}</span>
          <span>{')'}</span>
        </code>
        <code style={{ minWidth: 200 }}>
          <span>{' | Render count: '}</span>
          <span data-testid='sandbox-render-count'>{renderCount}</span>
        </code>
        <div />
        <code
          onClick={toggleFullHashVisibility}
          style={{ textAlign: 'end' }}
          title={shouldShowFullHash ? null : `Hash: ${BUILD_HASH}`}
        >
          <span>{'Hash: '}</span>
          <span data-testid='relink-build-hash'>
            {shouldShowFullHash ? BUILD_HASH : BUILD_HASH.substring(0, 6)}
          </span>
        </code>
      </div>
      {shouldShowListMenu && <ListMenu onDismiss={hideListMenu} />}
    </>
  )
}

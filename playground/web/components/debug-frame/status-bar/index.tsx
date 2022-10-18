import { useCallback, useState } from 'react'
import { useRelinkPackage } from '../../../shared-hooks'
import { STATUS_BAR_HEIGHT } from '../constants'
import { ListMenu } from './list-menu'
import styles from './index.module.css'
import { StatusBarTestId } from './constants'

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
        <a data-test-id='anchor-home' href='/'><b>HOME</b></a>
        <code onClick={showListMenu} style={{ cursor: 'pointer' }}>
          <span>Relink v</span>
          <span data-test-id={StatusBarTestId.RELINK_VERSION}>
            {VERSION}
          </span>
          <span>{' ('}</span>
          <span data-test-id={StatusBarTestId.RELINK_BUILD_TYPE}>
            {BUILD_TYPE}
          </span>
          <span>{')'}</span>
        </code>
        <code style={{ minWidth: 200 }}>
          <span>{' | Render count: '}</span>
          <span data-test-id={StatusBarTestId.RENDER_COUNT}>
            {renderCount}
          </span>
        </code>
        <div />
        <code style={{ textAlign: 'end' }}>
          <span>{'Hash: '}</span>
          <span data-test-id={StatusBarTestId.RELINK_BUILD_HASH}>
            {BUILD_HASH}
          </span>
        </code>
      </div>
      {shouldShowListMenu && <ListMenu onDismiss={hideListMenu} />}
    </>
  )
}

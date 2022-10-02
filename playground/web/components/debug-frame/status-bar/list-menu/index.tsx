import { useCallback } from 'react'
import { stringifyUrl } from 'query-string'
import { useRelinkPackage } from '../../../../utils'
import { STATUS_BAR_HEIGHT } from '../../constants'
import styles from './index.module.css'

export interface ListMenuProps {
  onDismiss(): void
}

export function ListMenu({
  onDismiss,
}: ListMenuProps): JSX.Element {

  const { BUILD_TYPE, RelinkBuildType } = useRelinkPackage()

  const applyInternalDebug = useCallback(() => {
    window.location.href = window.location.pathname
  }, [])

  const applyCJS = useCallback(() => {
    window.location.href = stringifyUrl({
      url: window.location.pathname,
      query: { t: 'cjs' },
    })
  }, [])

  const applyES = useCallback(() => {
    window.location.href = stringifyUrl({
      url: window.location.pathname,
      query: { t: 'es' },
    })
  }, [])

  const applyMJS = useCallback(() => {
    window.location.href = stringifyUrl({
      url: window.location.pathname,
      query: { t: 'es', p: 1 },
    })
  }, [])

  const applyRN = useCallback(() => {
    window.location.href = stringifyUrl({
      url: window.location.pathname,
      query: { t: 'rn' },
    })
  }, [])

  const applyUMD = useCallback(() => {
    window.location.href = stringifyUrl({
      url: window.location.pathname,
      query: { t: 'umd' },
    })
  }, [])

  const applyUMDMin = useCallback(() => {
    window.location.href = stringifyUrl({
      url: window.location.pathname,
      query: { t: 'umd', p: 1 },
    })
  }, [])

  return (
    <div
      onClick={onDismiss}
      className={styles.underlay}
    >
      <div
        className={styles.menuContainer}
        style={{ marginTop: STATUS_BAR_HEIGHT }}
      >
        <ListButton
          onClick={applyInternalDebug}
          label={'DEBUG (INTERNAL)'}
          isActive={typeof BUILD_TYPE === 'undefined'}
        />
        <ListButton
          onClick={applyCJS}
          label={'CJS'}
          isActive={BUILD_TYPE === RelinkBuildType.CJS}
        />
        <ListButton
          onClick={applyES}
          label={'ES'}
          isActive={BUILD_TYPE === RelinkBuildType.ES}
        />
        <ListButton
          onClick={applyMJS}
          label={'MJS'}
          isActive={BUILD_TYPE === RelinkBuildType.MJS}
        />
        <ListButton
          onClick={applyRN}
          label={'React Native'}
          isActive={BUILD_TYPE === RelinkBuildType.RN}
        />
        <ListButton
          onClick={applyUMD}
          label={'UMD'}
          isActive={BUILD_TYPE === RelinkBuildType.UMD}
        />
        <ListButton
          onClick={applyUMDMin}
          label={'UMD (min)'}
          isActive={BUILD_TYPE === RelinkBuildType.UMD_MIN}
        />
      </div>
    </div>
  )
}

interface ListButtonProps {
  onClick(): void
  label: string
  isActive: boolean
}

function ListButton({
  onClick,
  label,
  isActive,
}: ListButtonProps): JSX.Element {
  return (
    <div
      onClick={isActive ? undefined : onClick}
      className={styles.listButtonContainer}
    >
      <span style={{
        opacity: isActive ? 1 : 0,
        margin: '0px 10px',
      }}>{'✓'}</span>
      <span>{label}</span>
    </div>
  )
}

import { CSSProperties, useCallback } from 'react'
import { RelinkSource as $RelinkSource } from '../../../../lib/types'
import { DebugFrame } from '../../components/debug-frame'
import { useRelinkPackage } from '../../utils'
import { TileColor } from './constants'
import styles from './index.module.css'

let areSourcesCreated = false
interface ThemeSpecs { primaryColor: CSSProperties['color'] }
let MainThemeSource: $RelinkSource<ThemeSpecs> = null
let SubThemeSourceA: $RelinkSource<ThemeSpecs> = null
let SubThemeSourceB: $RelinkSource<ThemeSpecs> = null
let SubThemeSourceC: $RelinkSource<ThemeSpecs> = null

function Sandbox(): JSX.Element {

  const { RelinkSource, RelinkScope } = useRelinkPackage()

  const SOURCE_KEY = 'theme'
  if (!areSourcesCreated) {
    MainThemeSource = new RelinkSource({
      key: SOURCE_KEY,
      default: { primaryColor: TileColor.red },
    })
    SubThemeSourceA = new RelinkSource({
      key: `${SOURCE_KEY}/A`,
      default: { primaryColor: TileColor.blue },
      scope: MainThemeSource,
    })
    SubThemeSourceB = new RelinkSource({
      key: `${SOURCE_KEY}/B`,
      default: { primaryColor: TileColor.green },
      scope: MainThemeSource,
    })
    SubThemeSourceC = new RelinkSource({
      key: `${SOURCE_KEY}/C`,
      default: { primaryColor: TileColor.yellow },
      scope: MainThemeSource,
    })
    areSourcesCreated = true
  }

  const changeMainThemeColorToPink = useCallback(async () => {
    await MainThemeSource.set({ primaryColor: TileColor.pink })
  }, [])

  const resetMainThemeColor = useCallback(async () => {
    await MainThemeSource.reset()
  }, [])

  return (
    <DebugFrame>
      <div style={{ display: 'grid', gap: 10, gridAutoFlow: 'column' }}>
        <button
          data-test-id='button-change-main-theme-color-pink'
          onClick={changeMainThemeColorToPink}
        >
          {'Change MainTheme color to pink'}
        </button>
        <button
          data-test-id='reset-main-theme-color'
          onClick={resetMainThemeColor}
        >
          {'Reset MainTheme color'}
        </button>
      </div>
      <div className={styles.frame}>
        <ColorTile testId='color-tile-01' />
        <div className={styles.frame}>
          <RelinkScope sources={[SubThemeSourceA]}>
            <ColorTile testId='color-tile-02' />
            <div className={styles.frame}>
              <RelinkScope sources={[SubThemeSourceB]}>
                <ColorTile testId='color-tile-03' />
                <div className={styles.frame}>
                  <RelinkScope sources={[SubThemeSourceC]}>
                    <ColorTile testId='color-tile-04' />
                    <div className={styles.frame}>
                      <RelinkScope sources={[MainThemeSource]}>
                        <ColorTile testId='color-tile-05' />
                      </RelinkScope>
                    </div>
                    <div className={styles.frame}>
                      <RelinkScope sources={[SubThemeSourceB]}>
                        <ColorTile testId='color-tile-06' />
                      </RelinkScope>
                    </div>
                  </RelinkScope>
                </div>
              </RelinkScope>
            </div>
          </RelinkScope>
        </div>
      </div>
    </DebugFrame>
  )
}

export default Sandbox

interface ColorTileProps {
  testId: string
}

function ColorTile({
  testId,
}: ColorTileProps): JSX.Element {
  const { useRelinkValue } = useRelinkPackage()
  const theme = useRelinkValue(MainThemeSource)
  return (
    <div
      className={styles.colorTile}
      style={{ backgroundColor: theme.primaryColor }}
      data-test-id={testId}
      data-test-value={theme.primaryColor}
    />
  )
}

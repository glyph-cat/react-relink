import { useRef } from 'react'
import { createSource, RelinkScope, useRelinkState } from '../../../../src/bundle'

const ThemeSource = createSource({
  key: 'theme',
  default: {
    primaryColor: '#ff4a4a',
  },
})

export function Playground(): JSX.Element {
  const [theme, setTheme] = useRelinkState(ThemeSource)
  const factoryHandleOnClick = (primaryColor: string) => {
    return () => {
      setTheme({ primaryColor })
    }
  }

  const SubThemeSource = useRef<typeof ThemeSource>()
  if (!SubThemeSource.current) {
    SubThemeSource.current = createSource({
      key: 'sub-theme',
      scope: ThemeSource,
      default: {
        primaryColor: '#2b80ff',
      },
    })
  }

  return (
    <div style={{
      backgroundColor: theme.primaryColor,
      display: 'grid',
      height: '100vh',
    }}>
      <button onClick={factoryHandleOnClick('#ff4a4a')}>
        {'Change to red'}
      </button>
      <button onClick={factoryHandleOnClick('#4add4a')}>
        {'Change to green'}
      </button>
      <RelinkScope sources={[SubThemeSource.current]}>
        <Sandbox />
      </RelinkScope>
      <RelinkScope sources={[SubThemeSource.current]}>
        <RelinkScope sources={[ThemeSource]}>
          <Sandbox />
        </RelinkScope>
      </RelinkScope>
    </div>
  )
}

function Sandbox(): JSX.Element {
  const [theme, setTheme] = useRelinkState(ThemeSource)
  const factoryHandleOnClick = (primaryColor: string) => {
    return () => { setTheme({ primaryColor }) }
  }
  return (
    <div style={{
      backgroundColor: theme.primaryColor,
    }}>
      <button onClick={factoryHandleOnClick('#2b80ff')}>
        {'Change to blue'}
      </button>
      <button onClick={factoryHandleOnClick('#ff2b80')}>
        {'Change to pink'}
      </button>
    </div>
  )
}

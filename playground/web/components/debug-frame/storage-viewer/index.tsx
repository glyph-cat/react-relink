import { Fragment } from 'react'
import { StorageViewerTestId } from './constants'

// NOTE: The reason why 'data-test-value' is not used in conjunction with
// 'data-test-id' for most of the other components is because conducting tests
// by reading the actual HTML content is a better way of checking whether
// contents are rendered correctly.

export function StorageViewer(): JSX.Element {
  return (
    <div data-test-id={StorageViewerTestId.STORAGE_VIEWER}>
      <StorageViewerBase
        title='Session Storage'
        storage={sessionStorage}
      />
      <StorageViewerBase
        title='Local Storage'
        storage={localStorage}
      />
    </div>

  )
}

interface StorageViewerBaseProps {
  title: string
  storage: Storage
}

const COLOR_PRESETS = [
  'yellowgreen',
  'cyan',
  'pink',
]

function StorageViewerBase({
  title,
  storage,
}: StorageViewerBaseProps): JSX.Element {
  const renderStack = []
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i)
    const value = storage.getItem(key)
    renderStack.push(
      <Fragment key={key}>
        <span
          data-test-id={key}
          data-test-value={value}
          style={{ color: COLOR_PRESETS[i % COLOR_PRESETS.length] }}
        >
          {`  "${key}": `}
          {JSON.stringify(JSON.parse(value), null, 4).replace(/}$/, '  }')}
        </span>
        {i < (storage.length - 1) ? <>{','}<br /></> : ''}
      </Fragment>
    )
  }
  return (
    <div>
      <h2>{title}</h2>
      <pre>
        <code>
          <>{'{'}</>
          <br />
          {renderStack.length > 0
            ? renderStack
            : <span style={{ opacity: 0.5 }}>{'  // Empty'}</span>
          }
          <br />
          <>{'}'}</>
        </code>
      </pre>
    </div>
  )
}

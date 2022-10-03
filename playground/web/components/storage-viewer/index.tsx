
export interface StorageViewerProps {
  storageKey: string
  type: 'local' | 'session'
  /**
   * @defaultValue `true`
   */
  shouldTreatAsJSON?: boolean
}

export function StorageViewer({
  type,
  storageKey,
  shouldTreatAsJSON,
}: StorageViewerProps): JSX.Element {
  const storageData = type === 'session'
    ? sessionStorage.getItem(storageKey)
    : localStorage.getItem(storageKey)
  return (
    <pre>
      <code>
        <span style={{ opacity: 0.5 }}>
          {`// ${type === 'session' ? 'Session' : 'Local'} Storage`}
        </span>
        <br />
        {Object.is(storageData, null)
          ? <span style={{ opacity: 0.5 }}>null</span>
          : shouldTreatAsJSON
            ? JSON.stringify(JSON.parse(storageData))
            : storageData
        }
      </code>
    </pre>
  )
}

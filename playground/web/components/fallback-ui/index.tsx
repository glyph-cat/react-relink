import styles from './index.module.css'

export function LoadingFallback(): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.label}>Loading...</h1>
    </div>
  )
}

export function NotFoundFallback(): JSX.Element {
  return (
    <div className={styles.container}>
      <h1 className={styles.label}>404｜Not found</h1>
    </div>
  )
}

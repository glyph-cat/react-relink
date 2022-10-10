import { ReactNode } from 'react'
import styles from './index.module.css'

export interface ExplanationTextProps {
  children: ReactNode | Array<ReactNode>
}

export function ExplanationText({
  children,
}: ExplanationTextProps): JSX.Element {
  return (
    <div className={styles.container}>
      <span className={styles.text}>
        {children}
      </span>
    </div>
  )
}

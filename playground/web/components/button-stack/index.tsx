import { ReactNode } from 'react'
import styles from './index.module.css'

export interface BaseButtonStackProps {
  children: ReactNode | Array<ReactNode>
}

export type MainButtonStackProps = BaseButtonStackProps

export function MainButtonStack({
  children,
}: MainButtonStackProps): JSX.Element {
  return (
    <div className={styles.buttonStackContainer}>
      <div className={styles.verticalButtonStack}>
        {children}
      </div>
    </div>
  )
}

export type HorizontalButtonStackProps = BaseButtonStackProps

export function HorizontalButtonStack({
  children,
}: HorizontalButtonStackProps): JSX.Element {
  return (
    <div className={styles.horizontalButtonStack}>
      {children}
    </div>
  )
}

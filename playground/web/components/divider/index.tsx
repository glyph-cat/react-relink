import styles from './index.module.css'

export interface DividerProps {
  /**
   * @defaultValue `true`
   */
  fullWidth?: boolean
}

export function Divider({
  fullWidth = true,
}: DividerProps): JSX.Element {
  return (
    <div className={[
      styles.divider,
      fullWidth ? styles.dividerFullWidth : '',
    ].join(' ')} />
  )
}

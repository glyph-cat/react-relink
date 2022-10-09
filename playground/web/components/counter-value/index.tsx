import { COUNTER_VALUE_TEST_ID } from './constants'
import styles from './index.module.css'

export interface CounterValueProps {
  value: number | string
}

export function CounterValue({
  value,
}: CounterValueProps): JSX.Element {
  return (
    <h1
      className={styles.counterValue}
      data-test-id={COUNTER_VALUE_TEST_ID}
      data-test-value={value}
    >
      {value}
    </h1>
  )
}

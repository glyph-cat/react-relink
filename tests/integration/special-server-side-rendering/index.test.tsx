import { renderToStaticMarkup } from 'react-dom/server'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink, buildEnv, buildType }: IntegrationTestConfig): void => {

  const { RelinkSource, useRelinkValue } = Relink

  if (buildEnv === 'debug' || buildType === 'rn' || buildType === 'umd') {
    test('Not required', () => { expect(null).toBe(null) })
    return // Early exit
  }

  test('Main', async () => {

    const Source = new RelinkSource<number>({
      key: 'test/special-ssr',
      default: 42,
    })

    function TestComponent(): JSX.Element {
      const value = useRelinkValue(Source)
      return <span>{value}</span>
    }

    const output = renderToStaticMarkup(<TestComponent />)
    expect(output).toBe('<span>42</span>')

    await Source.dispose()

  })

})


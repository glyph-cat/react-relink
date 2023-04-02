import { renderToStaticMarkup } from 'react-dom/server'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink, buildEnv, buildType }: IntegrationTestConfig): void => {

  const { RelinkSource, useRelinkValue } = Relink

  if (buildEnv === 'debug' || buildType === 'rn' || buildType === 'umd') {
    test('Not applicable', () => { expect(null).toBe(null) })
    // Since debug env is assumed to be client-side and SSR does not apply to
    // React Native and UMD.
    return // Early exit
  }

  test('Main', async () => {

    const Source = new RelinkSource<number>({
      key: 'test/special-ssr/main',
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

  test('With selector', async () => {

    const Source = new RelinkSource<number>({
      key: 'test/special-ssr/with-selector',
      default: 42,
    })

    function TestComponent(): JSX.Element {
      const value = useRelinkValue(Source, (s) => s.toString(16))
      return <span>{value}</span>
    }

    const output = renderToStaticMarkup(<TestComponent />)
    expect(output).toBe('<span>2a</span>')

    await Source.dispose()

  })

})


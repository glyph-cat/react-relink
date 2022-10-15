import { renderToStaticMarkup } from 'react-dom/server'
import { IntegrationTestConfig } from '../../helpers'
import { wrapper } from '../wrapper'

wrapper(({ Relink }: IntegrationTestConfig): void => {

  const { RelinkSource, useRelinkValue } = Relink

  // TODO: [Mid] Run this in node environment

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


import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
// import { Playground } from './containers/sync-ext-store'
// import { Playground } from './containers/cyclic-calls'
// import { Playground } from './containers/generic'
// import { Playground } from './containers/scope'
// import { Playground } from './containers/use-relink-state'
// import { Playground } from './containers/dispose'
import { Playground } from './containers/active'

const container = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(container)
root.render(
  <StrictMode>
    <Playground />
  </StrictMode>
)

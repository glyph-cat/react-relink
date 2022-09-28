import React from 'react'
import ReactDOM from 'react-dom/client'
// import { Playground } from './containers/sync-ext-store'
// import { Playground } from './containers/cyclic-calls'
// import { Playground } from './containers/generic'
// import { Playground } from './containers/scope'
// import { Playground } from './containers/use-relink-state'
// import { Playground } from './containers/dispose'
import { Playground } from './containers/active'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>
)

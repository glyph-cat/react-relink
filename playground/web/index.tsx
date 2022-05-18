import React from 'react'
import ReactDOM from 'react-dom/client'
import { Playground } from './containers/sync-ext-store'
// import { Playground } from './containers/cyclic-calls'
// import { Playground } from './containers/generic'
// import { Playground } from './containers/scope'
// import { Playground } from './containers/use-relink-state'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <Playground />
  // <React.StrictMode>
  // </React.StrictMode>
)

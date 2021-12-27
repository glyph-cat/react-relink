import React from 'react'
import ReactDOM from 'react-dom'
// import { Playground } from './containers/generic'
import { Playground } from './containers/scope'
// import { Playground } from './containers/use-relink-state'

ReactDOM.render(
  <React.StrictMode>
    <Playground />
  </React.StrictMode>,
  document.getElementById('root')
)

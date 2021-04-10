import React from 'react'
import ReactDOM from 'react-dom'
import RootA from './root-a'
import RootB from './root-b'
import './index.css'

ReactDOM.render(<RootA />, document.getElementById('root-a'))
ReactDOM.render(<RootB />, document.getElementById('root-b'))

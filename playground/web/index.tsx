import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// const Active = lazy(() => import('./sandboxes/active'))
const SimpleDemo = lazy(() => import('./sandboxes/simple-demo'))
// import { Playground } from './containers/sync-ext-store'
// import { Playground } from './containers/cyclic-calls'
// import { Playground } from './containers/generic'
// import { Playground } from './containers/scope'
// import { Playground } from './containers/use-relink-state'
// import { Playground } from './containers/dispose'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
  <Router>
    <Suspense fallback={<h1>Loading...</h1>}>
      <Routes>
        {/* <Route path='active' element={<Active />} /> */}
        <Route path='simple-demo' element={<SimpleDemo />} />
      </Routes>
    </Suspense>
  </Router>
)

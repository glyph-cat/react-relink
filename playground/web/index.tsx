import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LoadingFallback, NotFoundFallback } from './components/fallback-ui'

// import { Playground } from './containers/sync-ext-store'
// import { Playground } from './containers/cyclic-calls'
// import { Playground } from './containers/generic'
// import { Playground } from './containers/scope'
// import { Playground } from './containers/use-relink-state'
// import { Playground } from './containers/dispose'
const SimpleDemo = lazy(() => import('./sandboxes/simple-demo'))
// const Active = lazy(() => import('./sandboxes/active'))

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
  <Router>
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path='simple-demo' element={<SimpleDemo />} />
        <Route path='*' element={<NotFoundFallback />} />
      </Routes>
    </Suspense>
  </Router>
)


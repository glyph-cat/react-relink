import { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LoadingFallback, NotFoundFallback } from './components/fallback-ui'

const routeStack = [
  {
    path: '/active',
    RouteComponent: lazy(() => import('./sandboxes/active')),
  },
  {
    path: '/scope',
    RouteComponent: lazy(() => import('./sandboxes/scope')),
  },
  {
    path: '/simple-demo',
    RouteComponent: lazy(() => import('./sandboxes/simple-demo')),
  },
]

function startRender() {
  const renderStack = []
  for (const { path, RouteComponent } of routeStack) {
    renderStack.push(
      <Route
        key={path}
        path={path}
        element={<RouteComponent />}
      />
    )
  }
  const container = document.getElementById('root') as HTMLElement
  const root = createRoot(container)
  root.render(
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          {renderStack}
          <Route path='*' element={<NotFoundFallback />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

startRender()

function HomePage(): JSX.Element {
  const renderStack = []
  for (const { path } of routeStack) {
    renderStack.push(
      <li key={path}>
        <a data-test-id={`anchor-${path.replace(/^\//, '')}`} href={path}>
          {path}
        </a>
      </li>
    )
  }
  return (
    <div style={{
      display: 'grid',
      padding: 50,
      minHeight: '100vh',
    }}>
      <ul style={{ fontSize: '24pt' }}>
        {renderStack}
      </ul>
    </div>
  )
}

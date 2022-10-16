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
    path: '/batched-updates',
    RouteComponent: lazy(() => import('./sandboxes/batched-updates')),
  },
  {
    path: '/dynamic-create-dispose',
    RouteComponent: lazy(() => import('./sandboxes/dynamic-create-dispose')),
  },
  {
    path: '/premature-dispose',
    RouteComponent: lazy(() => import('./sandboxes/premature-dispose')),
  },
  {
    path: '/scope',
    RouteComponent: lazy(() => import('./sandboxes/scope')),
  },
  {
    path: '/simple-demo',
    RouteComponent: lazy(() => import('./sandboxes/simple-demo')),
  },
  {
    path: '/suspense',
    RouteComponent: lazy(() => import('./sandboxes/suspense')),
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

  // Note: StrictMode is not used here because it makes tracking the render count
  // extremely hard.
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
      <li key={path} style={{ margin: '10px 0px' }}>
        <a
          data-test-id={`anchor-${path.replace(/^\//, '')}`}
          href={path}
          style={{ textDecoration: 'none' }}
        >
          <code>{path}</code>
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
      <ul style={{ fontSize: '18pt' }}>
        {renderStack}
      </ul>
    </div>
  )
}

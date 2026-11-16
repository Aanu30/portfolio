import { StrictMode } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import '@fontsource-variable/geist/index.css'
import '@fontsource-variable/geist-mono/index.css'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import './styles.css'

import Layout from './components/Layout'
import Home from './home/Home'
import NotFound from './pages/NotFound'

// Development only: ?shot renders a still version of the page for taking screenshots.
if (import.meta.env.DEV && new URLSearchParams(location.search).has('shot')) {
  document.documentElement.classList.add('shot')
}

// Project pages load on demand, so the homepage stays light.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'spread', lazy: page(() => import('./pages/SpreadPage')) },
      { path: 'paper', lazy: page(() => import('./pages/PaperPage')) },
      { path: 'ghosts', lazy: page(() => import('./pages/GhostsPage')) },
      { path: 'poker', lazy: page(() => import('./pages/PokerPage')) },
      { path: 'prosperity', lazy: page(() => import('./pages/ProsperityPage')) },
      { path: 'pricer', lazy: page(() => import('./pages/PricerPage')) },
      { path: 'chess', lazy: page(() => import('./pages/ChessPage')) },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useReveal } from '../lib/hooks'
import Nav from './Nav'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // Land at the top of a new page, or at the section named in the link.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const go = () => document.getElementById(hash.slice(1))?.scrollIntoView()
    go()
    const timer = window.setTimeout(go, 150)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  useReveal(pathname)

  return (
    <>
      <Nav />
      <main>
        <Outlet />
      </main>
      <footer className="site">
        <div className="wrap">
          <span>© 2026 Aarin Bhatt</span>
          <span>Turning uncertainty into edge.</span>
        </div>
      </footer>
    </>
  )
}

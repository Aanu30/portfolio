import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useReveal } from '../lib/hooks'
import { trackPointerGlow } from '../lib/motion'
import Backdrop from './Backdrop'
import Nav from './Nav'

// Two homepage sections were renamed. Links that still use the old names land on the new ones.
const RENAMED: Record<string, string> = { work: 'projects', scoreboard: 'achievements' }

export default function Layout() {
  const { pathname, hash } = useLocation()

  // Land at the top of a new page, or at the section named in the link.
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    const id = hash.slice(1)
    const go = () => document.getElementById(RENAMED[id] ?? id)?.scrollIntoView()
    go()
    const timer = window.setTimeout(go, 150)
    return () => window.clearTimeout(timer)
  }, [pathname, hash])

  useReveal(pathname)
  useEffect(() => trackPointerGlow(), [])

  return (
    <>
      <Backdrop />
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

import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { Location } from 'react-router-dom'
import { useLevel } from '../lib/hooks'

// In the order the sections appear on the homepage.
const LINKS = [
  ['About', '/#about'],
  ['Achievements', '/#achievements'],
  ['Experience', '/#experience'],
  ['Projects', '/#projects'],
  ['Lessons', '/#lessons'],
  ['Contact', '/#contact'],
] as const

export default function Nav() {
  const [level, setLevel] = useLevel()
  const [scrolled, setScrolled] = useState(false)
  // The homepage section being read, so its link can be marked.
  const [reading, setReading] = useState<string | null>(null)
  const progress = useRef<HTMLSpanElement>(null)
  const location = useLocation()
  const onHome = location.pathname === '/'
  // The phone menu remembers where it was opened and counts as open only while you are still
  // there, so it closes whenever the page or section changes.
  const [openedAt, setOpenedAt] = useState<Location | null>(null)
  const open = openedAt === location

  useEffect(() => {
    let queued = 0
    const update = () => {
      queued = 0
      setScrolled(window.scrollY > 24)
      // The bar across the top grows with how far down the page you are.
      const distance = document.documentElement.scrollHeight - window.innerHeight
      const done = distance > 0 ? Math.min(1, window.scrollY / distance) : 0
      if (progress.current) progress.current.style.transform = `scaleX(${done.toFixed(4)})`
      // The last section whose top has passed the upper third of the screen is the one being read.
      let current: string | null = null
      if (onHome) {
        for (const [, to] of LINKS) {
          const section = document.getElementById(to.slice(2))
          if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.35) current = to
        }
        // At the very bottom the last section may be too short to reach that line.
        if (distance > 0 && window.scrollY >= distance - 2) current = LINKS[LINKS.length - 1][1]
      }
      setReading(current)
    }
    const onScroll = () => {
      if (!queued) queued = requestAnimationFrame(update)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(queued)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [onHome])

  return (
    <header className={'nav' + (scrolled || open ? ' scrolled' : '')}>
      <span className="progress" ref={progress} aria-hidden="true" />
      <div className="wrap">
        <Link className="brand" to="/" aria-label="Aarin Bhatt, home">
          <i aria-hidden="true">
            <b />
            <b />
          </i>
          Aarin Bhatt
        </Link>
        <nav className={open ? 'open' : ''} aria-label="Sections">
          {LINKS.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className={reading === to ? 'on' : undefined}
              aria-current={reading === to ? 'location' : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="level" role="group" aria-label="Reading level">
          <span className="level-l">Explain it in</span>
          <div className="seg">
            <button type="button" aria-pressed={level === 'plain'} onClick={() => setLevel('plain')}>
              Plain English
            </button>
            <button type="button" aria-pressed={level === 'quant'} onClick={() => setLevel('quant')}>
              Quant
            </button>
          </div>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpenedAt(open ? null : location)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}

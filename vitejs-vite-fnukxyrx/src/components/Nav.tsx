import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLevel } from '../lib/hooks'

const LINKS = [
  ['Work', '/#work'],
  ['Lessons', '/#lessons'],
  ['Experience', '/#experience'],
  ['Scoreboard', '/#scoreboard'],
  ['About', '/#about'],
  ['Contact', '/#contact'],
] as const

export default function Nav() {
  const [level, setLevel] = useLevel()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the phone menu whenever the page or section changes.
  useEffect(() => setOpen(false), [location])

  return (
    <header className={'nav' + (scrolled || open ? ' scrolled' : '')}>
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
            <Link key={to} to={to}>
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
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  )
}

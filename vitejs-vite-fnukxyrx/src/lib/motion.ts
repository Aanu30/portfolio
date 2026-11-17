// Small pieces of movement shared by every page: big numbers that count to their value as
// they scroll into view, a soft glow that follows the pointer across cards, and demos that
// show a little of what they do the first time they are on screen.

import { reducedMotion } from './dom'

/** The big figures: headline strip, project numbers, the Junction block and the quick facts. */
export const COUNT_TARGETS = ['.proof-grid b', '.stats b', '.feature-results b', '.glance b']

// Where a placing such as "3rd" may climb up from a lower placing. Elsewhere it stays still:
// "3rd XI" in the quick facts is the name of a cricket team, not a result.
const RANK_TARGETS = '.proof-grid b, .stats b, .feature-results b'

const DURATION = 1300

type Moving = { from: number; to: number; decimals: number; grouped: boolean; rank: boolean }
type Piece = string | Moving

const NUMBER = /(\d[\d,]*(?:\.\d+)?)(st|nd|rd|th)?/g

function rankSuffix(n: number) {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return 'th'
  return ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'
}

/** Splits text into the parts that stay put and the numbers that move. Null if nothing moves. */
function split(text: string, ranks: boolean): Piece[] | null {
  const pieces: Piece[] = []
  let moving = false
  let last = 0
  for (const match of text.matchAll(NUMBER)) {
    const [whole, digits, suffix] = match
    const at = match.index
    const to = Number(digits.replace(/,/g, ''))
    const before = text.slice(0, at)
    const after = text.slice(at + whole.length)
    let from = 0
    if (suffix) {
      if (!ranks) continue
      from = to + 9 // a placing climbs: 12th, 11th ... 3rd
    } else if (/top\s*$/i.test(before) && after.startsWith('%')) {
      from = 100 // "Top 10%" narrows down from the whole field
    }
    if (from === to) continue
    pieces.push(text.slice(last, at), {
      from,
      to,
      decimals: digits.includes('.') ? digits.split('.')[1].length : 0,
      grouped: digits.includes(','),
      rank: Boolean(suffix),
    })
    last = at + whole.length
    moving = true
  }
  if (!moving) return null
  pieces.push(text.slice(last))
  return pieces
}

/** `t` runs from 0 to 1. Numbers going up, and placings, slow down as they arrive. */
function show(piece: Moving, t: number) {
  const settles = piece.rank || piece.to > piece.from
  const progress = settles ? 1 - Math.pow(1 - t, 3) : t
  const value = piece.from + (piece.to - piece.from) * progress
  if (piece.rank) {
    const n = Math.round(value)
    return n + rankSuffix(n)
  }
  if (piece.grouped) {
    return value.toLocaleString('en-GB', {
      minimumFractionDigits: piece.decimals,
      maximumFractionDigits: piece.decimals,
    })
  }
  return piece.decimals ? value.toFixed(piece.decimals) : String(Math.round(value))
}

/**
 * Counts every number inside `el` up (or down) to the value written in the page. The text
 * always ends exactly as it was written, even if the browser stops drawing part-way.
 */
export function countUp(el: HTMLElement) {
  const ranks = el.matches(RANK_TARGETS)
  const jobs: { node: Text; written: string; pieces: Piece[] }[] = []
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const written = node.nodeValue ?? ''
    const pieces = split(written, ranks)
    if (pieces) jobs.push({ node: node as Text, written, pieces })
  }
  if (!jobs.length) return

  let done = false
  const paint = (progress: number) =>
    jobs.forEach((job) => {
      job.node.nodeValue = job.pieces.map((p) => (typeof p === 'string' ? p : show(p, progress))).join('')
    })
  const finish = () => {
    if (done) return
    done = true
    jobs.forEach((job) => {
      job.node.nodeValue = job.written
    })
  }

  const started = performance.now()
  paint(0)
  const tick = (now: number) => {
    if (done) return
    const t = Math.min(1, (now - started) / DURATION)
    if (t >= 1) return finish()
    paint(t)
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  // A hidden tab draws no frames, so a timer makes sure the written value always comes back.
  window.setTimeout(finish, DURATION + 500)
}

/** Cards that light up softly under the pointer. The styles read --px and --py. */
const GLOW_TARGETS = '.feature, .edu article, .quote, .card, .lessons article, .demo'

export function trackPointerGlow() {
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
    const card = event.target.closest<HTMLElement>(GLOW_TARGETS)
    if (!card) return
    const box = card.getBoundingClientRect()
    card.style.setProperty('--px', `${event.clientX - box.left}px`)
    card.style.setProperty('--py', `${event.clientY - box.top}px`)
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  return () => window.removeEventListener('pointermove', onMove)
}

/**
 * The first time a demo is properly on screen it shows a little of what it does, unprompted.
 * A slider marked data-peek glides to that value and back to where it was; a button marked
 * data-peek is pressed that many times. Anything the visitor does inside the demo stops it.
 */
export function peekOnFirstSight(root: HTMLElement) {
  if (reducedMotion()) return () => {}
  let frame = 0
  let wait = 0
  let presses = 0
  let stopped = false

  const play = () => {
    const control = root.querySelector<HTMLElement>('[data-peek]')
    if (!control || stopped) return
    const peek = Number(control.dataset.peek)
    if (control instanceof HTMLInputElement) {
      const home = Number(control.value)
      const started = performance.now()
      const move = (value: number) => {
        control.value = String(value)
        control.dispatchEvent(new Event('input', { bubbles: true }))
      }
      const tick = (now: number) => {
        if (stopped) return
        const t = Math.min(1, (now - started) / 2800)
        if (t >= 1) return move(home)
        move(home + (peek - home) * Math.pow(Math.sin(Math.PI * t), 2)) // out and back
        frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    } else {
      const press = () => {
        if (stopped || presses >= peek) return
        presses++
        control.click()
        wait = window.setTimeout(press, 380)
      }
      press()
    }
  }

  // "On screen" means some of it has reached the upper 60% of the window.
  const watcher = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      watcher.disconnect()
      wait = window.setTimeout(play, 450)
    },
    { rootMargin: '0px 0px -40% 0px' },
  )
  watcher.observe(root)

  const stop = () => {
    stopped = true
    cancelAnimationFrame(frame)
    window.clearTimeout(wait)
    watcher.disconnect()
    root.removeEventListener('pointerdown', stop)
    root.removeEventListener('keydown', stop)
  }
  root.addEventListener('pointerdown', stop)
  root.addEventListener('keydown', stop)
  return stop
}

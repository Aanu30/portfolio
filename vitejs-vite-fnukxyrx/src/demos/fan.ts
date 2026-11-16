import { clamp, gauss, reducedMotion } from '../lib/dom'

// The opening animation: many simulated futures leave one starting point, and where they
// end up builds a histogram on the right. A distribution, not a point estimate.

type Path = { ys: number[]; finish: number; done: boolean; progress: number }
type Geometry = { x0: number; x1: number; y0: number; sd: number; wide: boolean }

const PATHS = 150
const STEPS = 80
const BINS = 25
const DRAW_MS = 5200
const HOLD_MS = 4200
const FADE_MS = 900
const AMBER = '#F0B23E'
const LABEL_FONT = '10.5px "Geist Mono Variable", ui-monospace, Menlo, monospace'

export function mountFan(canvas: HTMLCanvasElement, hero: HTMLElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { stop() {}, restart() {} }
  const still = reducedMotion()

  let W = 0
  let H = 0
  let geo: Geometry = { x0: 0, x1: 0, y0: 0, sd: 1, wide: true }
  let paths: Path[] = []
  let bins: number[] = []
  let shown: number[] = []
  let highlight = 0
  let startedAt = 0
  let endedAt = 0
  let visible = true
  let frame = 0

  function size() {
    const r = hero.getBoundingClientRect()
    W = r.width
    H = r.height
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    geo =
      W > 1040
        ? { x0: W * 0.5, x1: W - 84, y0: H * 0.5, sd: H * 0.15, wide: true }
        : { x0: W * 0.07, x1: W - 46, y0: H - 122, sd: 38, wide: false }
  }

  function deal() {
    paths = []
    bins = new Array(BINS).fill(0)
    shown = new Array(BINS).fill(0)
    for (let i = 0; i < PATHS; i++) {
      const ys = [0]
      let y = 0
      for (let t = 1; t <= STEPS; t++) {
        y += gauss() / Math.sqrt(STEPS)
        ys.push(y)
      }
      paths.push({ ys, finish: DRAW_MS * (0.6 + 0.4 * Math.random()), done: false, progress: 0 })
    }
    // Highlight a path that ends a little above where it started.
    let bestGap = Infinity
    paths.forEach((p, i) => {
      const gap = Math.abs(p.ys[STEPS] + 0.95)
      if (gap < bestGap) {
        bestGap = gap
        highlight = i
      }
    })
    startedAt = performance.now()
    endedAt = 0
  }

  const binOf = (v: number) => clamp(Math.floor(((v + 2.6) / 5.2) * BINS), 0, BINS - 1)

  /** Traces one path up to fractional step f and returns the position of its head. */
  function trace(p: Path, f: number, dx: number): [number, number] {
    const n = Math.floor(f)
    const frac = f - n
    ctx!.beginPath()
    ctx!.moveTo(geo.x0, geo.y0)
    for (let t = 1; t <= n; t++) ctx!.lineTo(geo.x0 + t * dx, geo.y0 + p.ys[t] * geo.sd)
    let hx = geo.x0 + n * dx
    let hy = geo.y0 + p.ys[n] * geo.sd
    if (n < STEPS) {
      hx = geo.x0 + f * dx
      hy = geo.y0 + (p.ys[n] + (p.ys[n + 1] - p.ys[n]) * frac) * geo.sd
      ctx!.lineTo(hx, hy)
    }
    return [hx, hy]
  }

  function pill(x: number, y: number, w: number, h: number, r: number) {
    ctx!.beginPath()
    if (typeof ctx!.roundRect === 'function') ctx!.roundRect(x, y, w, h, r)
    else ctx!.rect(x, y, w, h)
    ctx!.fill()
  }

  function draw(now: number) {
    const c = ctx!
    const elapsed = now - startedAt
    c.clearRect(0, 0, W, H)

    let alpha = 1
    if (endedAt && !still) {
      const since = now - endedAt
      if (since > HOLD_MS) alpha = 1 - clamp((since - HOLD_MS) / FADE_MS, 0, 1)
      if (since > HOLD_MS + FADE_MS) {
        deal()
        frame = requestAnimationFrame(draw)
        return
      }
    }
    c.globalAlpha = alpha
    c.lineJoin = 'round'
    c.lineCap = 'round'

    // where things are expected to stay
    c.setLineDash([3, 7])
    c.strokeStyle = 'rgba(255,255,255,.17)'
    c.lineWidth = 1
    c.beginPath()
    c.moveTo(geo.x0, geo.y0)
    c.lineTo(geo.x1, geo.y0)
    c.stroke()
    c.setLineDash([])

    const dx = (geo.x1 - geo.x0) / STEPS
    let allDone = true
    c.strokeStyle = 'rgba(232,236,244,.085)'
    c.lineWidth = 1
    paths.forEach((p, i) => {
      let progress = still ? 1 : clamp(elapsed / p.finish, 0, 1)
      progress = 1 - (1 - progress) * (1 - progress)
      p.progress = progress
      if (progress >= 1 && !p.done) {
        p.done = true
        bins[binOf(p.ys[STEPS])]++
      }
      if (!p.done) allDone = false
      if (i !== highlight) {
        trace(p, progress * STEPS, dx)
        c.stroke()
      }
    })

    const star = paths[highlight]
    c.save()
    c.strokeStyle = AMBER
    c.lineWidth = 1.9
    c.shadowColor = 'rgba(240,178,62,.55)'
    c.shadowBlur = 10
    const head = trace(star, star.progress * STEPS, dx)
    c.stroke()
    c.restore()
    c.fillStyle = AMBER
    c.beginPath()
    c.arc(head[0], head[1], 3.4, 0, 7)
    c.fill()

    // where they land
    const binHeight = (5.2 * geo.sd) / BINS
    const unit = geo.wide ? 3.5 : 2.1
    c.fillStyle = 'rgba(240,178,62,.42)'
    for (let b = 0; b < BINS; b++) {
      shown[b] = still ? bins[b] : shown[b] + (bins[b] - shown[b]) * 0.16
      const len = shown[b] * unit
      if (len < 0.4) continue
      const y = geo.y0 + (-2.6 + (b * 5.2) / BINS) * geo.sd
      pill(geo.x1 + 8, y + 1, len, Math.max(1, binHeight - 2), 2)
    }

    // the starting point
    c.fillStyle = '#F2F3F5'
    c.beginPath()
    c.arc(geo.x0, geo.y0, 3.2, 0, 7)
    c.fill()
    c.strokeStyle = 'rgba(242,243,245,.25)'
    c.lineWidth = 1
    c.beginPath()
    c.arc(geo.x0, geo.y0, 8, 0, 7)
    c.stroke()

    if (geo.wide) {
      c.font = LABEL_FONT
      c.textBaseline = 'middle'
      c.fillStyle = 'rgba(128,134,145,.95)'
      c.textAlign = 'right'
      c.fillText('TODAY', geo.x0 - 16, geo.y0)
      c.fillText('WHERE THEY END UP', W - 22, geo.y0 - 2.6 * geo.sd - 14)
      if (star.done) {
        const text = 'ONE POSSIBLE FUTURE'
        const width = c.measureText(text).width
        const x = head[0] - 20 - width
        const y = head[1] - 28
        c.fillStyle = 'rgba(8,9,11,.84)'
        pill(x - 9, y - 10, width + 18, 20, 10)
        c.fillStyle = 'rgba(240,178,62,.98)'
        c.textAlign = 'left'
        c.fillText(text, x, y + 0.5)
      }
    }

    if (allDone && !endedAt) endedAt = now
    c.globalAlpha = 1
    if (visible && !still) frame = requestAnimationFrame(draw)
  }

  function start() {
    cancelAnimationFrame(frame)
    size()
    deal()
    frame = requestAnimationFrame(draw)
  }

  let resizeTimer = 0
  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(start, 140)
  }
  window.addEventListener('resize', onResize)

  // Stop drawing while the hero is off screen.
  const observer = new IntersectionObserver((entries) => {
    const nowVisible = entries[0].isIntersecting
    if (nowVisible && !visible) {
      visible = true
      frame = requestAnimationFrame(draw)
    } else if (!nowVisible) {
      visible = false
      cancelAnimationFrame(frame)
    }
  })
  observer.observe(hero)

  document.fonts?.ready.then(start)
  start()

  return {
    restart: start,
    stop() {
      cancelAnimationFrame(frame)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      observer.disconnect()
    },
  }
}

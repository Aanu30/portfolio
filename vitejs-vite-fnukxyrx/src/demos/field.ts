import { clamp, gauss, reducedMotion } from '../lib/dom'

// The page's living background: slow random walks drifting behind everything, the same idea
// as the opening fan spread across the whole site. They leave a short trail, shift a little
// as the page scrolls, and brighten and reach towards the pointer when it comes near.

type Walker = { x: number; y: number; vx: number; vy: number; depth: number; warm: boolean; trail: number[] }

const TRAIL_POINTS = 22
const TRAIL_EVERY = 4 // frames between trail points
const REACH = 150 // how close the pointer has to be, in pixels
const EDGE = 24 // walkers leave and re-enter this far outside the screen

export function mountField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx || reducedMotion()) return () => {}

  let W = 0
  let H = 0
  let walkers: Walker[] = []
  let frame = 0
  let count = 0
  let heroHeight = 0
  const pointer = { x: 0, y: 0, near: false }

  const spawn = (): Walker => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: 0,
    vy: 0,
    depth: 0.35 + Math.random() * 0.65,
    warm: Math.random() < 0.16,
    trail: [],
  })

  function size() {
    W = window.innerWidth
    H = window.innerHeight
    const dpr = Math.min(1.5, window.devicePixelRatio || 1)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    walkers = Array.from({ length: clamp(Math.round((W * H) / 21000), 18, 80) }, spawn)
  }

  function draw() {
    const c = ctx!
    count++
    // The opening section has its own animation, so the field fades in below it.
    if (count % 30 === 1) heroHeight = document.getElementById('top')?.offsetHeight ?? 0
    const strength = heroHeight ? clamp((window.scrollY - heroHeight * 0.3) / (heroHeight * 0.5), 0, 1) : 1
    c.clearRect(0, 0, W, H)

    for (const w of walkers) {
      w.vx = (w.vx + gauss() * 0.11) * 0.97
      w.vy = (w.vy + gauss() * 0.11) * 0.97
      w.x += w.vx * w.depth
      w.y += w.vy * w.depth
      if (w.x < -EDGE || w.x > W + EDGE || w.y < -EDGE || w.y > H + EDGE) {
        w.x = ((w.x + EDGE + W + 2 * EDGE) % (W + 2 * EDGE)) - EDGE
        w.y = ((w.y + EDGE + H + 2 * EDGE) % (H + 2 * EDGE)) - EDGE
        w.trail = []
      }
      if (count % TRAIL_EVERY === 0) {
        w.trail.push(w.x, w.y)
        if (w.trail.length > TRAIL_POINTS * 2) w.trail.splice(0, 2)
      }
      if (strength < 0.01) continue

      // Nearer walkers move further as the page scrolls, which gives the field some depth.
      const span = H + 2 * EDGE
      const shift = window.scrollY * w.depth * 0.08
      const place = (y: number) => ((((y - shift + EDGE) % span) + span) % span) - EDGE
      const tone = w.warm ? '240,178,62' : '226,231,240'
      const headY = place(w.y)

      c.lineWidth = 1
      for (let i = 2; i < w.trail.length; i += 2) {
        const y0 = place(w.trail[i - 1])
        const y1 = place(w.trail[i + 1])
        if (Math.abs(y1 - y0) > H / 2) continue // the trail wrapped round the screen edge
        c.strokeStyle = `rgba(${tone},${((i / w.trail.length) * 0.2 * strength * w.depth).toFixed(3)})`
        c.beginPath()
        c.moveTo(w.trail[i - 2], y0)
        c.lineTo(w.trail[i], y1)
        c.stroke()
      }

      let glow = 0
      if (pointer.near) {
        const distance = Math.hypot(pointer.x - w.x, pointer.y - headY)
        if (distance < REACH) {
          glow = 1 - distance / REACH
          c.strokeStyle = `rgba(240,178,62,${(glow * 0.32 * strength).toFixed(3)})`
          c.beginPath()
          c.moveTo(w.x, headY)
          c.lineTo(pointer.x, pointer.y)
          c.stroke()
        }
      }
      c.fillStyle = `rgba(${glow > 0 ? '240,178,62' : tone},${((0.3 + 0.3 * w.depth + glow * 0.4) * strength).toFixed(3)})`
      c.beginPath()
      c.arc(w.x, headY, 0.9 + w.depth * 0.8 + glow, 0, 7)
      c.fill()
    }
    frame = requestAnimationFrame(draw)
  }

  const onMove = (event: PointerEvent) => {
    pointer.near = event.pointerType === 'mouse'
    pointer.x = event.clientX
    pointer.y = event.clientY
  }
  const onLeave = () => {
    pointer.near = false
  }
  let resizeTimer = 0
  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(size, 160)
  }
  // Stop drawing while the tab is in the background.
  const onVisibility = () => {
    cancelAnimationFrame(frame)
    if (!document.hidden) frame = requestAnimationFrame(draw)
  }

  window.addEventListener('pointermove', onMove, { passive: true })
  document.documentElement.addEventListener('pointerleave', onLeave)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)
  size()
  frame = requestAnimationFrame(draw)

  return () => {
    cancelAnimationFrame(frame)
    window.clearTimeout(resizeTimer)
    window.removeEventListener('pointermove', onMove)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('resize', onResize)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

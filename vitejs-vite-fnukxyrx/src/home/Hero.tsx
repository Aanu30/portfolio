import { useEffect, useRef, useState } from 'react'
import { mountFan } from '../demos/fan'
import { reducedMotion } from '../lib/dom'

export default function Hero() {
  // The pieces of the opening slide in once, while the page loads. After that the "intro"
  // marker is dropped so that nothing replays, for example when the reading level is switched.
  const [arrived, setArrived] = useState(false)
  const hero = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const copy = useRef<HTMLDivElement>(null)
  const photo = useRef<HTMLElement>(null)
  const fan = useRef<ReturnType<typeof mountFan> | null>(null)

  useEffect(() => {
    if (!hero.current || !canvas.current || !copy.current || !photo.current) return
    fan.current = mountFan(canvas.current, hero.current, copy.current, photo.current)
    return () => fan.current?.stop()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setArrived(true), 2400)
    return () => window.clearTimeout(timer)
  }, [])

  // Two small touches of movement: the opening drifts up and fades as you scroll away from it,
  // and the faint grid behind it lights up around the pointer. The styles read --away, --gx, --gy.
  useEffect(() => {
    const el = hero.current
    if (!el || reducedMotion()) return
    let queued = 0
    const onScroll = () => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        el.style.setProperty('--away', Math.min(1, window.scrollY / el.offsetHeight).toFixed(3))
      })
    }
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const box = el.getBoundingClientRect()
      el.style.setProperty('--gx', `${(((event.clientX - box.left) / box.width) * 100).toFixed(1)}%`)
      el.style.setProperty('--gy', `${(((event.clientY - box.top) / box.height) * 100).toFixed(1)}%`)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(queued)
      window.removeEventListener('scroll', onScroll)
      el.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <section className={arrived ? 'hero' : 'hero intro'} id="top" ref={hero}>
      <canvas ref={canvas} aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="hero-copy" ref={copy}>
          <span className="pill">Open to 2027 internships and graduate roles</span>
          {/* Each line of the name sits in its own window so it can slide up into view. */}
          <h1 aria-label="Aarin Bhatt">
            <span className="line" aria-hidden="true">
              <span>Aarin</span>
            </span>
            <span className="line" aria-hidden="true">
              <span>Bhatt</span>
            </span>
          </h1>
          <p className="tag">
            Turning uncertainty into <em>edge.</em>
          </p>
          <p className="lede plain">
            Hi, I'm Aarin. I'm in my final year of Data Science at the London School of Economics, and I've
            interned at BP and BlackRock. Outside of degree work I'm usually building something: mostly pricing and
            trading models, which I then test to see if the results are skill or luck.
          </p>
          <p className="lede quant">
            Final-year BSc Data Science at LSE, predicted First Class Honours, with internships at BP and
            BlackRock. I work on market making, optimal quoting under constraints, and inference on small samples.
          </p>
          <div className="cta">
            <a className="btn pri arrow" href="#projects">
              See my projects
            </a>
            <a className="btn" href="#spread-demo">
              Play a demo
            </a>
          </div>
          <p className="note">
            <i />
            <span>
              150 simulated futures from one starting point. Nobody knows which one happens, so I plan for all of
              them.
              <button type="button" onClick={() => fan.current?.restart()}>
                Run it again
              </button>
            </span>
          </p>
        </div>
        <figure className="hero-photo" ref={photo}>
          <img src="/portrait.jpg" alt="Aarin Bhatt" width="1095" height="1436" fetchPriority="high" />
          <figcaption>London · LSE Data Science</figcaption>
        </figure>
      </div>
    </section>
  )
}

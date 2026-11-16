import { useEffect, useRef } from 'react'
import { mountFan } from '../demos/fan'

export default function Hero() {
  const hero = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const fan = useRef<ReturnType<typeof mountFan> | null>(null)

  useEffect(() => {
    if (!hero.current || !canvas.current) return
    fan.current = mountFan(canvas.current, hero.current)
    return () => fan.current?.stop()
  }, [])

  return (
    <section className="hero" id="top" ref={hero}>
      <canvas ref={canvas} aria-hidden="true" />
      <div className="wrap">
        <div className="hero-copy">
          <span className="pill">Open to 2027 internships and graduate roles</span>
          <h1>
            Aarin
            <br />
            Bhatt
          </h1>
          <p className="tag">
            Turning uncertainty into <em>edge.</em>
          </p>
          <p className="lede plain">
            Final-year Data Science at LSE. I build pricing and trading models, then test whether the results are
            skill or luck.
          </p>
          <p className="lede quant">
            Final-year BSc Data Science at LSE. Market making, optimal quoting under constraints, and inference on
            small samples.
          </p>
          <div className="cta">
            <a className="btn pri arrow" href="#work">
              See the work
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
      </div>
    </section>
  )
}

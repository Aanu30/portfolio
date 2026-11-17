import type { Mount } from '../components/Demo'
import { POKER, POWER, SESSIONS } from '../data/poker'
import { clamp, fillRange, gbp, isNarrow, linePath, q, reducedMotion, svg } from '../lib/dom'

// "Replay my 36 nights": a bootstrap you can run by hand. Each replay draws 36 sessions
// at random from the real ones, with repeats, and adds them up.

const signed = (v: number) => (v > 0 ? '+' : v < 0 ? '−' : '') + '£' + Math.abs(v)

export const mountPokerReplay: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body flip">
      <div class="demo-main">
        <div class="pk-head">
          <span class="k">Running total across 36 sessions</span>
          <div class="acts"><button class="btn pri" data-r="one" data-peek="6" type="button">Deal one replay</button><button class="btn" data-r="many" type="button">Deal 1,000</button><button class="btn ghost" data-r="reset" type="button">Reset</button></div>
        </div>
        <div data-r="chart" class="chart"></div>
        <p class="fine">A replay draws 36 nights at random from the ones I actually played, repeats allowed, and adds them up. The amber line is what really happened.</p>
      </div>
      <div class="demo-side right">
        <span class="k">Where the replays ended</span>
        <div data-r="hist" class="chart" style="margin-top:12px"></div>
        <div class="bigread"><b data-r="pct" class="num"></b><span data-r="pct-l"></span></div>
      </div>
    </div>
    <div class="verdicts">
      <div><span class="k">Classic significance test</span><b>Not proven</b>
        <p class="plain">With no edge at all, a run this good would still turn up about 1 time in 4.</p>
        <p class="quant">One-sample t-test, t = 1.21, p = 0.23. Fails to reject at 5%.</p></div>
      <div><span class="k">10,000 replays</span><b>About 9 in 10 end in profit</b>
        <p class="plain">Redraw the same nights again and again and the total is nearly always positive.</p>
        <p class="quant">Bootstrap, B = 10,000: 88.6% of resampled means are positive.</p></div>
      <div><span class="k">Bayesian estimate</span><b>89% likely the edge is real</b>
        <p class="plain">Start with no opinion, then update on the results.</p>
        <p class="quant">Conjugate model, posterior P(μ &gt; 0) = 88.6%, robust to the prior.</p></div>
      <div><span class="k">Why they disagree: not enough nights</span><b><span data-r="pow" class="num"></span> chance a classic test spots it</b>
        <label class="ctl"><span>Sessions played</span><output data-r="n-o" class="num"></output>
          <input type="range" data-r="n" min="36" max="400" step="1" value="36" aria-label="Number of sessions played"></label>
        <div class="gauge" aria-hidden="true"><i data-r="gauge"></i><u></u></div>
        <p data-r="pow-say"></p></div>
    </div>`

  const n = SESSIONS.length
  const cumulative = [0]
  SESSIONS.forEach((v) => cumulative.push(cumulative[cumulative.length - 1] + v))

  // running total, with replays drawn faintly behind the real path
  const narrow = isNarrow(root)
  const W = narrow ? 400 : 640
  const H = narrow ? 270 : 300
  const m = { l: 54, r: 20, t: 14, b: 34 }
  const LOW = -400
  const HIGH = 900
  const x = (i: number) => m.l + (i / n) * (W - m.l - m.r)
  const y = (v: number) => H - m.b - ((clamp(v, LOW, HIGH) - LOW) / (HIGH - LOW)) * (H - m.t - m.b)
  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Running profit over 36 poker sessions, with random replays' }, q(root, '[data-r=chart]'))
  for (const v of [-300, 0, 300, 600, 900]) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v ? 'gl' : 'gl zero' }, chart)
    svg('text', { x: m.l - 9, y: y(v) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = signed(v)
  }
  for (const i of [0, 12, 24, 36]) {
    svg('text', { x: x(i), y: H - 13, 'text-anchor': i ? (i === 36 ? 'end' : 'middle') : 'start', class: 'tk' }, chart).textContent = i ? 'night ' + i : 'start'
  }
  const ghosts = svg('g', null, chart)
  svg('path', { d: linePath(cumulative.map((v, i) => [x(i), y(v)])), class: 'ln a', 'stroke-width': 2.4 }, chart)
  svg('circle', { cx: x(n), cy: y(cumulative[n]), r: 5.5, class: 'dot a' }, chart)
  svg('text', { x: x(n) - 10, y: y(cumulative[n]) - 13, 'text-anchor': 'end', class: 'val' }, chart).textContent = `what happened: +${gbp(POKER.total)}`

  // histogram of where the replays ended
  const HW = 300
  const HH = 190
  const hm = { l: 8, r: 8, t: 8, b: 26 }
  const FIRST = -400
  const WIDTH = 50
  const BINS = 27
  const hist = svg('svg', { viewBox: `0 0 ${HW} ${HH}`, role: 'img', 'aria-label': 'Where the replays ended' }, q(root, '[data-r=hist]'))
  const hx = (v: number) => hm.l + ((v - FIRST) / (WIDTH * BINS)) * (HW - hm.l - hm.r)
  const base = HH - hm.b
  svg('line', { x1: hm.l, x2: HW - hm.r, y1: base, y2: base, class: 'gl zero' }, hist)
  for (const v of [-300, 0, 300, 600, 900]) {
    svg('text', { x: hx(v), y: HH - 8, 'text-anchor': 'middle', class: 'tk' }, hist).textContent = signed(v)
  }
  const bars: SVGRectElement[] = []
  const titles: SVGTitleElement[] = []
  for (let b = 0; b < BINS; b++) {
    const from = FIRST + b * WIDTH
    const rect = svg('rect', { x: hx(from) + 1, y: hm.t, width: Math.max(1, hx(from + WIDTH) - hx(from) - 2), height: base - hm.t, rx: 2, class: 'bar ' + (from >= 0 ? 'up' : 'dn') }, hist)
    rect.style.transform = 'scaleY(0)'
    titles.push(svg('title', null, rect))
    bars.push(rect)
  }
  svg('line', { x1: hx(0), x2: hx(0), y1: hm.t, y2: base + 4, class: 'guide' }, hist)

  let counts: number[] = []
  let total = 0
  let profitable = 0
  const still = reducedMotion()

  function replay() {
    const path = [0]
    let sum = 0
    for (let i = 0; i < n; i++) {
      sum += SESSIONS[Math.floor(Math.random() * n)]
      path.push(sum)
    }
    return path
  }

  function add(path: number[], show: boolean, animate: boolean) {
    const end = path[n]
    total++
    if (end > 0) profitable++
    counts[clamp(Math.floor((end - FIRST) / WIDTH), 0, BINS - 1)]++
    if (!show) return
    const line = svg('path', { d: linePath(path.map((v, i) => [x(i), y(v)])), class: 'ghost' }, ghosts)
    if (animate && !still) {
      const length = line.getTotalLength()
      line.style.strokeDasharray = String(length)
      line.style.strokeDashoffset = String(length)
      line.style.stroke = 'rgba(242,243,245,.75)'
      line.getBoundingClientRect()
      line.style.transition = 'stroke-dashoffset .7s ease-out, stroke .9s ease .6s'
      line.style.strokeDashoffset = '0'
      line.style.stroke = 'rgba(235,238,245,.11)'
    }
    while (ghosts.childNodes.length > 80) ghosts.removeChild(ghosts.firstChild!)
  }

  function update() {
    const top = Math.max(1, ...counts)
    bars.forEach((rect, b) => {
      rect.style.transform = `scaleY(${(counts[b] / top).toFixed(4)})`
      const from = FIRST + b * WIDTH
      titles[b].textContent = `${gbp(from, 0)} to ${gbp(from + WIDTH, 0)}: ${counts[b].toLocaleString('en-GB')} replays`
    })
    q(root, '[data-r=pct]').textContent = total ? ((profitable / total) * 100).toFixed(total < 20 ? 0 : 1) + '%' : '–'
    q(root, '[data-r=pct-l]').textContent = total
      ? `of ${total.toLocaleString('en-GB')} ${total === 1 ? 'replay' : 'replays'} ended in profit`
      : 'Deal a replay to start.'
  }

  function reset() {
    counts = new Array(BINS).fill(0)
    total = 0
    profitable = 0
    ghosts.textContent = ''
    update()
  }

  q(root, '[data-r=one]').addEventListener('click', () => {
    add(replay(), true, true)
    update()
  })
  q(root, '[data-r=many]').addEventListener('click', () => {
    for (let i = 0; i < 1000; i++) add(replay(), i % 25 === 0, false)
    update()
  })
  q(root, '[data-r=reset]').addEventListener('click', reset)

  // how many sessions before a classic test would notice an edge this size
  const slider = q<HTMLInputElement>(root, '[data-r=n]')
  const target = POKER.sessionsFor80
  function powerAt(k: number) {
    if (k === n) return POKER.powerNow / 100
    let i = 0
    while (i < POWER.length - 2 && POWER[i + 1][0] < k) i++
    const [n0, p0] = POWER[i]
    const [n1, p1] = POWER[i + 1]
    return p0 + (p1 - p0) * clamp((k - n0) / (n1 - n0), 0, 1)
  }
  function drawPower() {
    const k = Number(slider.value)
    const p = powerAt(k)
    fillRange(slider)
    q(root, '[data-r=n-o]').textContent = String(k)
    q(root, '[data-r=pow]').textContent = (p * 100).toFixed(1) + '%'
    q(root, '[data-r=gauge]').style.width = p * 100 + '%'
    q(root, '[data-r=pow-say]').textContent =
      k === n
        ? 'I have played 36. My edge per night is small next to the swings, so a classic test would miss it four times in five. Drag to add sessions.'
        : k < target
          ? `At ${k} sessions the swings average out a little more. Still short of the usual 80% bar.`
          : `From ${target} sessions it clears the usual 80% bar. That is ${target - n} more nights of poker than I have logged.`
  }
  slider.addEventListener('input', drawPower)

  drawPower()
  reset()
  return () => {}
}

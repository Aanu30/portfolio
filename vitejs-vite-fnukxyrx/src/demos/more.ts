import type { Mount } from '../components/Demo'
import { SESSIONS } from '../data/poker'
import { clamp, eur, fillRange, gauss, gbp, isNarrow, linePath, mulberry, q, set, svg } from '../lib/dom'

// Demos for the smaller project pages: the Prosperity line-finder, the Monte Carlo
// option pricer, the alpha-beta pruning walkthrough and the poker session chart.

// ---------------------------------------------------------------- Prosperity

const TICKS = 60
const TRUE_START = 100
const TRUE_RISE = 0.25
const NOISE = 2.2
const HALF_GAP = 1.5

/** Find the straight-line rule under noisy prices, then see what a quoting bot earns on it. */
export const mountProsperity: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>These are 60 prices for one product.</b> There is a simple rule underneath. Move the line until it fits, and watch what a bot quoting around your line would earn.</p>
        <label class="ctl"><span>Where the line starts</span><output data-r="a-o" class="num"></output>
          <input type="range" data-r="a" min="90" max="112" step="0.5" value="107" aria-label="Starting price of your line"></label>
        <label class="ctl"><span>How much it rises each step</span><output data-r="b-o" class="num"></output>
          <input type="range" data-r="b" min="-0.2" max="0.6" step="0.01" value="0" aria-label="Rise per step of your line"></label>
        <div class="reads" style="grid-template-columns:1fr 1fr">
          <div><small>The bot's profit on your line</small><b data-r="mine" class="num"></b></div>
          <div><small>On the hidden rule</small><b data-r="best" class="num"></b></div>
        </div>
        <div class="acts"><button class="btn" data-r="reveal" type="button">Show the hidden rule</button><button class="btn ghost" data-r="new" type="button">New prices</button></div>
      </div>
      <div class="demo-main">
        <div data-r="chart" class="chart"></div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  const narrow = isNarrow(root)
  const W = narrow ? 400 : 620
  const H = narrow ? 290 : 320
  const m = { l: 40, r: 16, t: 16, b: 30 }
  const LOW = 88
  const HIGH = 126
  const x = (t: number) => m.l + (t / (TICKS - 1)) * (W - m.l - m.r)
  const y = (p: number) => H - m.b - ((clamp(p, LOW, HIGH) - LOW) / (HIGH - LOW)) * (H - m.t - m.b)
  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Prices over time with your fitted line' }, q(root, '[data-r=chart]'))
  for (const p of [90, 100, 110, 120]) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(p), y2: y(p), class: 'gl' }, chart)
    svg('text', { x: m.l - 9, y: y(p) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = String(p)
  }
  svg('text', { x: m.l, y: H - 10, class: 'tk' }, chart).textContent = 'time →'
  const dots = svg('g', null, chart)
  const truth = svg('line', { class: 'guide dash', opacity: 0, 'stroke-width': 1.5 }, chart)
  const mine = svg('line', { class: 'ln a' }, chart)

  const startInput = q<HTMLInputElement>(root, '[data-r=a]')
  const riseInput = q<HTMLInputElement>(root, '[data-r=b]')
  let prices: number[] = []
  let seed = 7
  let revealed = false

  const fair = (t: number) => TRUE_START + TRUE_RISE * t
  /** What a bot earns buying HALF_GAP below a line and selling HALF_GAP above it. */
  function profit(start: number, rise: number) {
    let total = 0
    prices.forEach((price, t) => {
      const line = start + rise * t
      if (price <= line - HALF_GAP) total += fair(t) - (line - HALF_GAP)
      else if (price >= line + HALF_GAP) total += line + HALF_GAP - fair(t)
    })
    return total
  }

  function deal() {
    const rand = mulberry(seed)
    prices = Array.from({ length: TICKS }, (_, t) => fair(t) + gauss(rand) * NOISE)
    dots.textContent = ''
    prices.forEach((p, t) => svg('circle', { cx: x(t), cy: y(p), r: 2.6, fill: 'rgba(235,238,245,.5)' }, dots))
    set(truth, { x1: x(0), y1: y(fair(0)), x2: x(TICKS - 1), y2: y(fair(TICKS - 1)) })
    draw()
  }

  function draw() {
    const start = Number(startInput.value)
    const rise = Number(riseInput.value)
    fillRange(startInput)
    fillRange(riseInput)
    q(root, '[data-r=a-o]').textContent = start.toFixed(1)
    q(root, '[data-r=b-o]').textContent = (rise >= 0 ? '+' : '−') + Math.abs(rise).toFixed(2)
    set(mine, { x1: x(0), y1: y(start), x2: x(TICKS - 1), y2: y(start + rise * (TICKS - 1)) })
    truth.setAttribute('opacity', revealed ? '1' : '0')
    const earned = profit(start, rise)
    const possible = profit(TRUE_START, TRUE_RISE)
    q(root, '[data-r=mine]').textContent = eur(earned)
    q(root, '[data-r=best]').textContent = revealed ? eur(possible) : '?'
    const gap = start + rise * (TICKS / 2) - fair(TICKS / 2)
    const tilt = rise - TRUE_RISE
    let verdict: string
    if (earned >= 0.9 * possible) verdict = 'That is the rule. The bot now buys a little below what the product is worth and sells a little above, again and again.'
    else if (Math.abs(tilt) > 0.08 && Math.abs(gap) < 2.5) verdict = 'Right height, wrong slope. The line is fine in the middle and wrong at both ends.'
    else if (gap > 0) verdict = 'Your line sits too high, so the bot keeps buying for more than the product is worth.'
    else verdict = 'Your line sits too low, so the bot keeps selling for less than the product is worth.'
    q(root, '[data-r=say]').innerHTML =
      `${verdict}<small>A bot like this is only as good as its idea of what the product is worth.</small>`
  }

  startInput.addEventListener('input', draw)
  riseInput.addEventListener('input', draw)
  const revealBtn = q<HTMLButtonElement>(root, '[data-r=reveal]')
  revealBtn.addEventListener('click', () => {
    revealed = !revealed
    revealBtn.textContent = revealed ? 'Hide the hidden rule' : 'Show the hidden rule'
    draw()
  })
  q(root, '[data-r=new]').addEventListener('click', () => {
    seed++
    deal()
  })
  deal()
  return () => {}
}

// ---------------------------------------------------------------- option pricer

const S0 = 100
const STRIKE = 100
const RATE = 0.05
const VOL = 0.2
const DISCOUNT = Math.exp(-RATE)
const EXACT_CALL = 10.4506 // Black-Scholes
const EXACT_GAP = S0 - STRIKE * DISCOUNT // call minus put must equal this: 4.8771
const MAX_SIMS = 1_024_000

/** Price a call and a put by simulation and watch the estimates settle on the formula. */
export const mountPricer: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>A share costs 100 today.</b> An option lets you buy it for 100 in a year. Simulate thousands of possible years, see what the option pays in each, and average.</p>
        <div data-r="paths" class="chart"></div>
        <div class="acts">
          <button class="btn pri" data-r="more" type="button">Simulate 1,000 more</button>
          <button class="btn" data-r="x4" type="button">Use 4 times as many</button>
          <button class="btn ghost" data-r="reset" type="button">Start again</button>
        </div>
      </div>
      <div class="demo-main">
        <div data-r="chart" class="chart"></div>
        <div class="pr-nums">
          <div><small>Simulations</small><b data-r="n" class="num"></b></div>
          <div><small>Call price, give or take</small><b data-r="call" class="num"></b></div>
          <div class="mine"><small>Put price (my addition)</small><b data-r="put" class="num"></b></div>
          <div class="mine"><small>Call minus put (theory: 4.8771)</small><b data-r="parity" class="num"></b></div>
        </div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  // a sketch of some simulated years
  const PW = 300
  const PH = 130
  const paths = svg('svg', { viewBox: `0 0 ${PW} ${PH}`, 'aria-hidden': 'true' }, q(root, '[data-r=paths]'))
  const py = (s: number) => PH - 8 - ((clamp(s, 60, 160) - 60) / 100) * (PH - 16)
  svg('line', { x1: 0, x2: PW, y1: py(STRIKE), y2: py(STRIKE), class: 'guide dash' }, paths)
  const pathGroup = svg('g', null, paths)
  svg('text', { x: 2, y: 11, class: 'tk' }, paths).textContent = 'dashed line: the buy price of 100'
  function sketch() {
    pathGroup.textContent = ''
    const steps = 24
    for (let i = 0; i < 26; i++) {
      let s = S0
      const pts = [[0, py(s)]]
      for (let t = 1; t <= steps; t++) {
        s *= Math.exp((RATE - VOL * VOL / 2) / steps + VOL * Math.sqrt(1 / steps) * gauss())
        pts.push([(t / steps) * PW, py(s)])
      }
      svg('path', { d: linePath(pts), fill: 'none', stroke: s > STRIKE ? 'rgba(240,178,62,.6)' : 'rgba(235,238,245,.18)', 'stroke-width': 1 }, pathGroup)
    }
  }

  // the estimate against the number of simulations
  const narrow = isNarrow(root)
  const W = narrow ? 400 : 620
  const H = narrow ? 250 : 270
  const m = { l: 46, r: 18, t: 20, b: 34 }
  const LOW = 9.4
  const HIGH = 11.5
  const x = (n: number) => m.l + ((Math.log10(n) - 2.85) / 3.2) * (W - m.l - m.r)
  const y = (v: number) => H - m.b - ((clamp(v, LOW, HIGH) - LOW) / (HIGH - LOW)) * (H - m.t - m.b)
  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Estimated call price against number of simulations' }, q(root, '[data-r=chart]'))
  for (const v of [9.5, 10, 10.5, 11, 11.5]) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'gl' }, chart)
    svg('text', { x: m.l - 9, y: y(v) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = v.toFixed(1)
  }
  for (const [n, name] of [[1e3, '1,000'], [1e4, '10,000'], [1e5, '100,000'], [1e6, '1,000,000']] as const) {
    svg('text', { x: x(n), y: H - 12, 'text-anchor': n === 1e6 ? 'end' : 'middle', class: 'tk' }, chart).textContent = narrow && n === 1e5 ? '' : name
  }
  svg('text', { x: m.l, y: 11, class: 'tk lab' }, chart).textContent = 'Estimated call price, with its error bar'
  svg('line', { x1: m.l, x2: W - m.r, y1: y(EXACT_CALL), y2: y(EXACT_CALL), class: 'guide dash' }, chart)
  svg('text', { x: W - m.r, y: y(EXACT_CALL) - 6, 'text-anchor': 'end', class: 'tk hi' }, chart).textContent = 'textbook formula: 10.4506'
  const marks = svg('g', null, chart)

  let n = 0
  let sumCall = 0
  let sumCall2 = 0
  let sumPut = 0
  let sumPut2 = 0

  function simulate(count: number) {
    const drift = RATE - (VOL * VOL) / 2
    for (let i = 0; i < count; i++) {
      const end = S0 * Math.exp(drift + VOL * gauss())
      const call = Math.max(end - STRIKE, 0) * DISCOUNT
      const put = Math.max(STRIKE - end, 0) * DISCOUNT
      sumCall += call
      sumCall2 += call * call
      sumPut += put
      sumPut2 += put * put
    }
    n += count
  }

  const stat = (sum: number, sum2: number) => {
    const mean = sum / n
    return { mean, error: 2 * Math.sqrt(Math.max(0, sum2 / n - mean * mean) / n) }
  }

  function update() {
    const call = stat(sumCall, sumCall2)
    const put = stat(sumPut, sumPut2)
    svg('line', { x1: x(n), x2: x(n), y1: y(call.mean + call.error), y2: y(call.mean - call.error), stroke: 'rgba(240,178,62,.55)', 'stroke-width': 2, 'stroke-linecap': 'round' }, marks)
    svg('circle', { cx: x(n), cy: y(call.mean), r: 4.5, class: 'dot a' }, marks)
    q(root, '[data-r=n]').textContent = n.toLocaleString('en-GB')
    q(root, '[data-r=call]').textContent = `${call.mean.toFixed(3)} ± ${call.error.toFixed(3)}`
    q(root, '[data-r=put]').textContent = `${put.mean.toFixed(3)} ± ${put.error.toFixed(3)}`
    q(root, '[data-r=parity]').textContent = (call.mean - put.mean).toFixed(4)
    const inside = Math.abs(call.mean - EXACT_CALL) <= call.error
    q(root, '[data-r=say]').innerHTML =
      `${inside ? 'The textbook answer sits inside the error bar.' : 'The textbook answer is just outside the error bar this time. That happens about 1 run in 20.'} The error bar is ± ${call.error.toFixed(3)} now.` +
      `<small>Use four times as many simulations and the error bar halves, every time. The price itself keeps jumping around inside it.</small>`
    q<HTMLButtonElement>(root, '[data-r=x4]').disabled = n * 4 > MAX_SIMS
    q<HTMLButtonElement>(root, '[data-r=more]').disabled = n + 1000 > MAX_SIMS
  }

  function reset() {
    n = 0
    sumCall = sumCall2 = sumPut = sumPut2 = 0
    marks.textContent = ''
    sketch()
    simulate(1000)
    update()
  }

  q(root, '[data-r=more]').addEventListener('click', () => {
    sketch()
    simulate(1000)
    update()
  })
  q(root, '[data-r=x4]').addEventListener('click', () => {
    sketch()
    simulate(n * 3)
    update()
  })
  q(root, '[data-r=reset]').addEventListener('click', reset)
  reset()
  return () => {}
}

// The identity the put side has to satisfy: call minus put equals S0 minus the discounted strike.
export const PARITY_GAP = EXACT_GAP

// ---------------------------------------------------------------- chess pruning

const LEAVES = [
  [4, 6, 5],
  [3, 9, 8],
  [7, 2, 1],
]
const MOVES = ['A', 'B', 'C']

type Step = { seen: [number, number][]; cut: [number, number][]; values: (number | null)[]; best: number | null; text: string }

/** The alpha-beta search on this small tree, written out one look at a time. */
const STEPS: Step[] = [
  { seen: [], cut: [], values: [null, null, null], best: null, text: 'I have three moves: A, B and C. For each one, my opponent will pick the reply that is worst for me. The numbers at the bottom say how good each final position is for me, but I have not looked at any yet.' },
  { seen: [[0, 0]], cut: [], values: [null, null, null], best: null, text: 'Start with move A. Their first reply leaves me on 4.' },
  { seen: [[0, 0], [0, 1]], cut: [], values: [null, null, null], best: null, text: 'Their second reply leaves me on 6. They would not choose that: 4 is worse for me.' },
  { seen: [[0, 0], [0, 1], [0, 2]], cut: [], values: [4, null, null], best: 0, text: 'Their third reply gives 5. So if I play A, they answer with the first reply and I get 4. Move A is worth 4.' },
  { seen: [[0, 0], [0, 1], [0, 2], [1, 0]], cut: [[1, 1], [1, 2]], values: [4, 3, null], best: 0, text: 'Now move B. Their first reply already holds me to 3, which is worse than the 4 I get from A. Whatever the other two replies are, I will not play B. Skip them.' },
  { seen: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], cut: [[1, 1], [1, 2]], values: [4, 3, null], best: 0, text: 'Move C. Their first reply gives me 7. That beats 4, so C might still be better. Keep looking.' },
  { seen: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [2, 1]], cut: [[1, 1], [1, 2], [2, 2]], values: [4, 3, 2], best: 0, text: 'Their second reply holds me to 2. Worse than 4 again, so C is out and the last reply never needs checking.' },
  { seen: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0], [2, 1]], cut: [[1, 1], [1, 2], [2, 2]], values: [4, 3, 2], best: 0, text: 'Done: play A. I reached the right answer after looking at 6 of the 9 positions. A real engine does this many moves deep, where skipping branches saves almost all of the work.' },
]

export const mountChess: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>How does an engine choose a move without checking everything?</b> Step through a tiny example: three moves for me, three replies to each.</p>
        <div class="acts" style="margin-top:0">
          <button class="btn pri" data-r="next" type="button">Next step</button>
          <button class="btn ghost" data-r="reset" type="button">Start again</button>
        </div>
        <div class="reads" style="grid-template-columns:1fr 1fr">
          <div><small>Positions looked at</small><b data-r="seen" class="num"></b></div>
          <div><small>Positions skipped</small><b data-r="cut" class="num"></b></div>
        </div>
      </div>
      <div class="demo-main">
        <div data-r="chart" class="chart"></div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  const W = 620
  const H = 290
  const tree = svg('svg', { viewBox: `0 0 ${W} ${H}`, class: 'tree', role: 'img', 'aria-label': 'A small game tree being searched' }, q(root, '[data-r=chart]'))
  const rootXY = [352, 40]
  const moveX = [182, 352, 522]
  const leafX = (i: number, j: number) => moveX[i] - 54 + j * 54
  svg('text', { x: 8, y: 40, class: 'tk', style: 'text-anchor:start' }, tree).textContent = 'me'
  svg('text', { x: 8, y: 132, class: 'tk', style: 'text-anchor:start' }, tree).textContent = 'my move'
  svg('text', { x: 8, y: 232, class: 'tk', style: 'text-anchor:start' }, tree).textContent = 'their reply'

  const moveEdges: SVGLineElement[] = []
  const moveNodes: SVGGElement[] = []
  const leafEdges: SVGLineElement[][] = [[], [], []]
  const leafNodes: SVGGElement[][] = [[], [], []]
  MOVES.forEach((_, i) => {
    moveEdges.push(svg('line', { x1: rootXY[0], y1: rootXY[1], x2: moveX[i], y2: 132, class: 'edge' }, tree))
    LEAVES[i].forEach((_, j) => leafEdges[i].push(svg('line', { x1: moveX[i], y1: 132, x2: leafX(i, j), y2: 232, class: 'edge' }, tree)))
  })
  const rootNode = svg('g', { class: 'seen' }, tree)
  svg('circle', { cx: rootXY[0], cy: rootXY[1], r: 20, class: 'node' }, rootNode)
  const rootText = svg('text', { x: rootXY[0], y: rootXY[1] }, rootNode)
  MOVES.forEach((name, i) => {
    const g = svg('g', null, tree)
    svg('circle', { cx: moveX[i], cy: 132, r: 22, class: 'node' }, g)
    svg('text', { x: moveX[i], y: 132 }, g).textContent = name
    moveNodes.push(g)
    LEAVES[i].forEach((value, j) => {
      const leaf = svg('g', null, tree)
      svg('circle', { cx: leafX(i, j), cy: 232, r: 18, class: 'node' }, leaf)
      svg('text', { x: leafX(i, j), y: 232 }, leaf).textContent = String(value)
      leafNodes[i].push(leaf)
    })
  })

  let step = 0
  const has = (list: [number, number][], i: number, j: number) => list.some(([a, b]) => a === i && b === j)

  function draw() {
    const s = STEPS[step]
    MOVES.forEach((name, i) => {
      const value = s.values[i]
      const decided = value !== null
      moveNodes[i].setAttribute('class', s.best === i && step === STEPS.length - 1 ? 'best' : decided ? 'seen' : '')
      moveNodes[i].querySelector('text')!.textContent = decided ? `${name}: ${value}` : name
      moveEdges[i].style.stroke = s.best === i && step === STEPS.length - 1 ? '#F0B23E' : ''
      LEAVES[i].forEach((_, j) => {
        const seen = has(s.seen, i, j)
        const cut = has(s.cut, i, j)
        leafNodes[i][j].setAttribute('class', cut ? 'cut hidden' : seen ? 'seen' : 'hidden')
        leafEdges[i][j].style.opacity = cut ? '0.25' : ''
        leafEdges[i][j].style.strokeDasharray = cut ? '3 4' : ''
      })
    })
    rootText.textContent = step === STEPS.length - 1 ? '4' : '?'
    rootNode.setAttribute('class', step === STEPS.length - 1 ? 'best' : 'seen')
    q(root, '[data-r=seen]').textContent = `${s.seen.length} of 9`
    q(root, '[data-r=cut]').textContent = String(s.cut.length)
    q(root, '[data-r=say]').textContent = s.text
    q<HTMLButtonElement>(root, '[data-r=next]').disabled = step === STEPS.length - 1
  }

  q(root, '[data-r=next]').addEventListener('click', () => {
    step = Math.min(STEPS.length - 1, step + 1)
    draw()
  })
  q(root, '[data-r=reset]').addEventListener('click', () => {
    step = 0
    draw()
  })
  draw()
  return () => {}
}

// ---------------------------------------------------------------- poker sessions

/** Every logged session as a bar: winning nights above the line, losing nights below. */
export const mountSessions: Mount = (root) => {
  const narrow = isNarrow(root)
  const W = narrow ? 400 : 1100
  const H = narrow ? 240 : 300
  const m = { l: 50, r: 12, t: 16, b: 30 }
  const LOW = -100
  const HIGH = 150
  const n = SESSIONS.length
  const slot = (W - m.l - m.r) / n
  const y = (v: number) => H - m.b - ((clamp(v, LOW, HIGH) - LOW) / (HIGH - LOW)) * (H - m.t - m.b)
  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Profit or loss for each of the 36 sessions' }, root)
  root.classList.add('chart')
  for (const v of [-100, -50, 0, 50, 100, 150]) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v ? 'gl' : 'gl zero' }, chart)
    svg('text', { x: m.l - 9, y: y(v) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = (v > 0 ? '+' : v < 0 ? '−' : '') + '£' + Math.abs(v)
  }
  SESSIONS.forEach((v, i) => {
    const top = Math.min(y(v), y(0))
    const bar = svg('rect', { x: m.l + i * slot + slot * 0.18, y: top, width: slot * 0.64, height: Math.max(1.5, Math.abs(y(v) - y(0))), rx: 2, class: v >= 0 ? 'fill-up' : 'fill-dn' }, chart)
    svg('title', null, bar).textContent = `Session ${i + 1}: ${v >= 0 ? '+' : ''}${gbp(v)}`
  })
  for (const i of [1, 12, 24, 36]) {
    svg('text', { x: m.l + (i - 0.5) * slot, y: H - 10, 'text-anchor': 'middle', class: 'tk' }, chart).textContent = 'night ' + i
  }
  return () => {}
}

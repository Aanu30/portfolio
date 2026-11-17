import type { Mount } from '../components/Demo'
import { FIG2, FIG2_KINK } from '../data/paper'
import { clamp, fillRange, isNarrow, linePath, q, qa, set, svg } from '../lib/dom'

// "Be the dealer": how the bid moves as stock held approaches the risk limit, under a
// hard limit (the paper's model) and under the textbook gradual charge.

/** Linear interpolation into the precomputed curves at inventory share f. */
function at(f: number): number[] {
  let i = 0
  while (i < FIG2.length - 2 && FIG2[i + 1][0] < f) i++
  const a = FIG2[i]
  const b = FIG2[i + 1]
  const t = clamp((f - a[0]) / (b[0] - a[0] || 1), 0, 1)
  return a.map((v, j) => v + (b[j] - v) * t)
}

export const mountDealer: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>You are the dealer.</b> You already hold some stock. Your risk limit says how much more you can take on. Drag to fill up, and watch what your prices do.</p>
        <div class="seg wide" role="group" aria-label="Which model sets the prices">
          <button data-mode="hard" aria-pressed="true" type="button">My model: hard limit</button>
          <button data-mode="pen" aria-pressed="false" type="button">Textbook: gradual</button>
        </div>
        <label class="ctl"><span>Stock already held</span><output data-r="out" class="num"></output>
          <input type="range" data-r="q" data-peek="0.93" min="0" max="0.995" step="0.005" value="0.3" aria-label="Stock held as a share of the limit"></label>
        <div data-r="ladder" class="ladder"></div>
      </div>
      <div class="demo-main">
        <div data-r="chart" class="chart"></div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  const narrow = isNarrow(root)
  const W = narrow ? 400 : 620
  const H = narrow ? 290 : 310
  const m = { l: 40, r: narrow ? 78 : 104, t: 26, b: 40 }
  const TOP = 8
  const x = (f: number) => m.l + f * (W - m.l - m.r)
  const y = (v: number) => H - m.b - (clamp(v, 0, TOP) / TOP) * (H - m.t - m.b)

  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'How far below fair value the dealer bids as stock held approaches the limit' }, q(root, '[data-r=chart]'))
  for (const v of [0, 2, 4, 6, 8]) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v ? 'gl' : 'gl zero' }, chart)
    svg('text', { x: m.l - 9, y: y(v) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = String(v)
  }
  for (const f of narrow ? [0, 0.5, 1] : [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    svg('text', { x: x(f), y: H - 16, 'text-anchor': 'middle', class: 'tk' }, chart).textContent = Math.round(f * 100) + '%'
  }
  svg('text', { x: m.l, y: 12, class: 'tk lab plain' }, chart).textContent = narrow ? 'How far below fair value it bids' : 'How far below fair value the dealer bids (price steps)'
  svg('text', { x: m.l, y: 12, class: 'tk lab quant' }, chart).textContent = 'Bid half-spread δ_b (ticks) against q / q_max'
  svg('text', { x: x(0.5), y: H - 2, 'text-anchor': 'middle', class: 'tk' }, chart).textContent = 'stock held, as a share of the limit'
  svg('line', { x1: x(FIG2_KINK), x2: x(FIG2_KINK), y1: y(TOP) + 4, y2: y(0), class: 'guide dash' }, chart)
  svg('text', { x: x(FIG2_KINK) - 6, y: y(TOP) + 16, 'text-anchor': 'end', class: 'tk lab' }, chart).textContent = narrow ? 'limit bites' : 'the limit starts to bite'
  const hard = FIG2.filter((r) => r[1] <= TOP).map((r) => [x(r[0]), y(r[1])])
  hard.push([x(0.9985), y(TOP)])
  svg('path', { d: linePath(FIG2.map((r) => [x(r[0]), y(r[4])])), class: 'ln s2' }, chart)
  svg('path', { d: linePath(hard), class: 'ln s1', 'stroke-width': 2.25 }, chart)
  svg('text', { x: x(1) + 8, y: y(FIG2[FIG2.length - 1][4]) + 4, class: 'tk lab' }, chart).textContent = 'textbook'
  svg('text', { x: x(1) + 8, y: y(TOP) + 4, class: 'tk hi' }, chart).textContent = 'hard limit'
  svg('text', { x: x(1) + 8, y: y(TOP) + 18, class: 'tk' }, chart).textContent = 'stops buying'
  const dotPen = svg('circle', { r: 5, class: 'dot s2' }, chart)
  const dotHard = svg('circle', { r: 5, class: 'dot s1' }, chart)

  // the price ladder: where the dealer buys and sells around fair value
  const LW = 280
  const LH = 196
  const mid = 74
  const step = 10.5
  const ladder = svg('svg', { viewBox: `0 0 ${LW} ${LH}`, role: 'img', 'aria-label': "The dealer's buying and selling prices" }, q(root, '[data-r=ladder]'))
  const band = svg('rect', { x: 58, width: 128, fill: 'rgba(240,178,62,.10)', rx: 3 }, ladder)
  svg('line', { x1: 50, x2: 192, y1: mid, y2: mid, class: 'guide dash' }, ladder)
  svg('text', { x: 6, y: mid - 3, class: 'tk' }, ladder).textContent = 'fair'
  svg('text', { x: 6, y: mid + 10, class: 'tk' }, ladder).textContent = '100.00'
  const askLine = svg('line', { x1: 58, x2: 186, stroke: '#F2F3F5', 'stroke-width': 2, 'stroke-linecap': 'round' }, ladder)
  const bidLine = svg('line', { x1: 58, x2: 186, stroke: '#F0B23E', 'stroke-width': 2, 'stroke-linecap': 'round' }, ladder)
  const askValue = svg('text', { x: 198, class: 'tk hi' }, ladder)
  const bidValue = svg('text', { x: 198, class: 'tk hi' }, ladder)
  const askLabel = svg('text', { x: 198, class: 'tk' }, ladder)
  const bidLabel = svg('text', { x: 198, class: 'tk' }, ladder)
  const gapLabel = svg('text', { x: 122, 'text-anchor': 'middle', class: 'tk lab' }, ladder)

  const input = q<HTMLInputElement>(root, '[data-r=q]')
  const buttons = qa<HTMLButtonElement>(root, '[data-mode]')
  let mode: 'hard' | 'pen' = 'hard'

  function draw() {
    const f = Number(input.value)
    const row = at(f)
    fillRange(input)
    q(root, '[data-r=out]').textContent = Math.round(f * 100) + '% of limit'
    set(dotHard, { cx: x(f), cy: y(row[1]), r: mode === 'hard' ? 7 : 4.5 })
    set(dotPen, { cx: x(f), cy: y(row[4]), r: mode === 'pen' ? 7 : 4.5 })

    const bid = mode === 'hard' ? row[1] : row[4]
    const ask = Math.max(0, mode === 'hard' ? row[2] : row[5])
    const withdrawn = bid > 10.5
    const askY = mid - ask * step
    const bidY = mid + Math.min(bid, 10.5) * step
    set(askLine, { y1: askY, y2: askY })
    set(bidLine, { y1: bidY, y2: bidY, 'stroke-dasharray': withdrawn ? '2 6' : 'none' })
    set(band, { y: askY, height: Math.max(0, bidY - askY) })
    set(askValue, { y: askY - 1 })
    askValue.textContent = (100 + ask / 100).toFixed(3)
    set(askLabel, { y: askY - 13 })
    askLabel.textContent = 'you sell at'
    set(bidValue, { y: bidY + 11 })
    bidValue.textContent = withdrawn ? 'not buying' : (100 - bid / 100).toFixed(3)
    set(bidLabel, { y: bidY + 23 })
    bidLabel.textContent = withdrawn ? '' : 'you buy at'
    set(gapLabel, { y: (askY + bidY) / 2 + 4 })
    gapLabel.textContent = bidY - askY > 26 ? 'your gap' : ''

    let verdict: string
    let extra: string
    if (mode === 'pen') {
      verdict = 'The textbook dealer shades its prices a little with every unit, whether the limit is close or not.'
      extra = 'Its charge for risk is fixed in advance. Switch to the hard limit and compare.'
    } else if (f < FIG2_KINK) {
      verdict = 'Plenty of room. The limit costs nothing yet, so the prices do not move at all.'
      extra = 'Keep dragging. Nothing changes until about 60%.'
    } else if (f < 0.95) {
      verdict = 'The limit is in sight. Every extra unit now uses up scarce room, so the dealer pays less to buy and accepts less to sell.'
      extra = 'This is the kink: flat, then steep. The textbook line never does this.'
    } else {
      verdict = 'Almost out of room. The dealer sells at fair value just to get lighter, and all but stops buying.'
      extra = 'In the paper the price of the limit goes to infinity here.'
    }
    q(root, '[data-r=say]').innerHTML = `${verdict}<small>${extra}</small>`
  }

  input.addEventListener('input', draw)
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      mode = b.dataset.mode === 'pen' ? 'pen' : 'hard'
      buttons.forEach((o) => o.setAttribute('aria-pressed', String(o === b)))
      draw()
    }),
  )
  draw()
  return () => {}
}

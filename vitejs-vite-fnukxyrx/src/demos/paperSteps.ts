import type { Mount } from '../components/Demo'
import { FIG3, FIG3_KINK } from '../data/paper'
import { clamp, fillRange, isNarrow, linePath, q, set, svg } from '../lib/dom'

// Two demos for the paper's walkthrough: why a gap exists at all (the Glosten-Milgrom
// two-value example), and the shared-budget prediction (the paper's Figure 3).

/** A share is worth 110 or 90. A fraction of the people trading with you know which. */
export const mountInformed: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>A share is worth either 110 or 90, and you don't know which.</b> Some of the people who trade with you do. Set how many.</p>
        <label class="ctl"><span>Traders who know more than you</span><output data-r="out" class="num"></output>
          <input type="range" data-r="pi" min="0" max="1" step="0.01" value="0.2" aria-label="Share of traders who know the true value"></label>
        <div class="reads">
          <div><small>You sell at</small><b data-r="ask" class="num"></b></div>
          <div><small>You buy at</small><b data-r="bid" class="num"></b></div>
          <div><small>Your gap</small><b data-r="gap" class="num"></b></div>
        </div>
      </div>
      <div class="demo-main">
        <div data-r="chart" class="chart"></div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  const narrow = isNarrow(root)
  const W = narrow ? 400 : 620
  const H = 250
  const m = { l: 78, r: narrow ? 96 : 130, t: 18, b: 18 }
  const y = (price: number) => m.t + ((112 - price) / 24) * (H - m.t - m.b)
  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Buying and selling prices between the two possible values' }, q(root, '[data-r=chart]'))
  for (const [price, name] of [[110, 'worth 110'], [90, 'worth 90']] as const) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(price), y2: y(price), class: 'gl zero' }, chart)
    svg('text', { x: m.l - 10, y: y(price) + 3.5, 'text-anchor': 'end', class: 'tk lab' }, chart).textContent = name
  }
  svg('line', { x1: m.l, x2: W - m.r, y1: y(100), y2: y(100), class: 'guide dash' }, chart)
  svg('text', { x: m.l - 10, y: y(100) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = 'average 100'
  const band = svg('rect', { x: m.l + 30, width: W - m.l - m.r - 60, fill: 'rgba(240,178,62,.10)', rx: 3 }, chart)
  const askLine = svg('line', { x1: m.l + 30, x2: W - m.r - 30, stroke: '#F2F3F5', 'stroke-width': 2.25, 'stroke-linecap': 'round' }, chart)
  const bidLine = svg('line', { x1: m.l + 30, x2: W - m.r - 30, stroke: '#F0B23E', 'stroke-width': 2.25, 'stroke-linecap': 'round' }, chart)
  const askText = svg('text', { x: W - m.r - 18, class: 'tk hi' }, chart)
  const bidText = svg('text', { x: W - m.r - 18, class: 'tk hi' }, chart)

  const input = q<HTMLInputElement>(root, '[data-r=pi]')
  function draw() {
    const share = Number(input.value)
    const ask = 100 + 10 * share
    const bid = 100 - 10 * share
    fillRange(input)
    q(root, '[data-r=out]').textContent = Math.round(share * 100) + ' in 100'
    q(root, '[data-r=ask]').textContent = ask.toFixed(1)
    q(root, '[data-r=bid]').textContent = bid.toFixed(1)
    q(root, '[data-r=gap]').textContent = (ask - bid).toFixed(1)
    set(askLine, { y1: y(ask), y2: y(ask) })
    set(bidLine, { y1: y(bid), y2: y(bid) })
    set(band, { y: y(ask), height: Math.max(0, y(bid) - y(ask)) })
    set(askText, { y: y(ask) - 7 })
    set(bidText, { y: y(bid) + 15 })
    askText.textContent = 'you sell at ' + ask.toFixed(1)
    bidText.textContent = 'you buy at ' + bid.toFixed(1)
    const verdict =
      share === 0
        ? 'Nobody knows more than you, so you need no gap at all.'
        : share >= 0.99
          ? 'Everyone knows more than you. The only safe prices are the extremes: sell at 110, buy at 90.'
          : 'The better-informed traders only take your price when it is wrong in their favour. The gap is how you earn that loss back from everyone else.'
    q(root, '[data-r=say]').innerHTML =
      `${verdict}<small class="plain">This gap exists even if you take no risk and make no profit on average.</small><small class="quant">ask = E[V | buy] = 100 + 10π, bid = 100 − 10π, spread = 20π. With π = 0.2 the spread is 4.</small>`
  }
  input.addEventListener('input', draw)
  draw()
  return () => {}
}

/** Interpolates the two-instrument curves at inventory share f. */
function at(f: number): number[] {
  let i = 0
  while (i < FIG3.length - 2 && FIG3[i + 1][0] < f) i++
  const a = FIG3[i]
  const b = FIG3[i + 1]
  const t = clamp((f - a[0]) / (b[0] - a[0] || 1), 0, 1)
  return a.map((v, j) => v + (b[j] - v) * t)
}

/** Two unrelated products share one limit. Fill up on the first and watch the second. */
export const mountShared: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>You trade two unrelated products against one shared risk limit.</b> You hold none of product 2. Now fill up on product 1.</p>
        <label class="ctl"><span>Stock held in product 1</span><output data-r="out" class="num"></output>
          <input type="range" data-r="q" min="0" max="0.985" step="0.005" value="0.3" aria-label="Stock held in product 1 as a share of the limit"></label>
        <div class="reads" style="grid-template-columns:1fr 1fr">
          <div><small>Product 2's gap, my model</small><b data-r="hard" class="num"></b></div>
          <div><small>Product 2's gap, textbook</small><b data-r="pen" class="num"></b></div>
        </div>
      </div>
      <div class="demo-main">
        <div data-r="chart" class="chart"></div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  const narrow = isNarrow(root)
  const W = narrow ? 400 : 620
  const H = narrow ? 280 : 300
  const m = { l: 40, r: narrow ? 78 : 104, t: 26, b: 40 }
  const LOW = 1.8
  const HIGH = 4.2
  const x = (f: number) => m.l + f * (W - m.l - m.r)
  const y = (v: number) => H - m.b - ((clamp(v, LOW, HIGH) - LOW) / (HIGH - LOW)) * (H - m.t - m.b)
  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': "Product 2's gap as product 1 fills up" }, q(root, '[data-r=chart]'))
  for (const v of [2, 2.5, 3, 3.5, 4]) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: 'gl' }, chart)
    svg('text', { x: m.l - 9, y: y(v) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = v.toFixed(1)
  }
  for (const f of narrow ? [0, 0.5, 1] : [0, 0.2, 0.4, 0.6, 0.8, 1]) {
    svg('text', { x: x(f), y: H - 16, 'text-anchor': 'middle', class: 'tk' }, chart).textContent = Math.round(f * 100) + '%'
  }
  svg('text', { x: m.l, y: 12, class: 'tk lab plain' }, chart).textContent = "Product 2's gap from fair value (price steps)"
  svg('text', { x: m.l, y: 12, class: 'tk lab quant' }, chart).textContent = 'Instrument 2 half-spread (ticks) against q₁ / q_max'
  svg('text', { x: x(0.5), y: H - 2, 'text-anchor': 'middle', class: 'tk' }, chart).textContent = 'stock held in product 1, as a share of the limit'
  svg('line', { x1: x(FIG3_KINK), x2: x(FIG3_KINK), y1: y(HIGH) + 4, y2: y(LOW), class: 'guide dash' }, chart)
  svg('text', { x: x(FIG3_KINK) - 6, y: y(HIGH) + 16, 'text-anchor': 'end', class: 'tk lab' }, chart).textContent = narrow ? 'limit bites' : 'the shared limit starts to bite'
  const hard = FIG3.filter((r) => r[3] <= HIGH).map((r) => [x(r[0]), y(r[3])])
  hard.push([x(0.98), y(HIGH)])
  svg('path', { d: linePath(FIG3.map((r) => [x(r[0]), y(r[4])])), class: 'ln s2' }, chart)
  svg('path', { d: linePath(hard), class: 'ln s1', 'stroke-width': 2.25 }, chart)
  svg('text', { x: x(1) + 8, y: y(FIG3[0][4]) + 4, class: 'tk lab' }, chart).textContent = 'textbook'
  svg('text', { x: x(1) + 8, y: y(HIGH) + 4, class: 'tk hi' }, chart).textContent = 'my model'
  const dotPen = svg('circle', { r: 5, class: 'dot s2' }, chart)
  const dotHard = svg('circle', { r: 7, class: 'dot s1' }, chart)

  const input = q<HTMLInputElement>(root, '[data-r=q]')
  function draw() {
    const f = Number(input.value)
    const row = at(f)
    fillRange(input)
    q(root, '[data-r=out]').textContent = Math.round(f * 100) + '% of limit'
    q(root, '[data-r=hard]').textContent = row[3].toFixed(2)
    q(root, '[data-r=pen]').textContent = row[4].toFixed(2)
    set(dotHard, { cx: x(f), cy: y(row[3]) })
    set(dotPen, { cx: x(f), cy: y(row[4]) })
    const verdict =
      f < FIG3_KINK
        ? 'There is room under the limit, so product 2 is untouched in both models.'
        : 'Nothing has happened to product 2, yet its prices have widened: the limit it shares with product 1 is running out. The textbook model says this never happens.'
    q(root, '[data-r=say]').innerHTML =
      `${verdict}<small>That difference is the prediction. It can be checked against a real trading desk's records.</small>`
  }
  input.addEventListener('input', draw)
  draw()
  return () => {}
}

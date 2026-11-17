import type { Mount } from '../components/Demo'
import { clamp, eur, fillRange, isNarrow, linePath, q, svg } from '../lib/dom'

// A simplified version of the Spread pricing rule, run on request R00002 from the live
// final: Vantaa to Helsinki, list price €26.00, expected driver fee €18.27. The bot
// quoted €28.00 for it.

const LIST = 26
const RIVAL = 0.155 // log of the rival's typical level relative to list
const SHARPNESS = 0.1 // how sharply dealers switch on price
const FEE = 18.27
const BASE_COST = 18.6 // fee plus a small allowance for late deliveries

const accept = (p: number) => 1 / (1 + Math.exp((Math.log(p / LIST) - RIVAL) / SHARPNESS))
const scarcity = (u: number) => (0.25 * FEE * Math.max(0, u - 0.6)) / (1 - u)
const cost = (u: number) => BASE_COST + scarcity(u)
const expected = (p: number, u: number) => accept(p) * (p - cost(u))

function best(u: number) {
  let price = 19
  let value = -Infinity
  for (let p = 19; p <= 90; p += 0.05) {
    const v = expected(p, u)
    if (v > value) {
      value = v
      price = p
    }
  }
  return { price, value }
}

export const mountSpreadQuote: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>A dealer wants a car moved from Vantaa to Helsinki, next day.</b> The list price is €26.00 and a driver will cost you about €18.27. A rival is quoting too, and you can't see their price.</p>
        <label class="ctl"><span>Your price</span><output data-r="price-o" class="num"></output>
          <input type="range" data-r="price" data-peek="31" min="19" max="42" step="0.1" value="22" aria-label="Your price in euros"></label>
        <label class="ctl"><span>Local drivers already booked</span><output data-r="u-o" class="num"></output>
          <input type="range" data-r="u" min="0" max="0.94" step="0.01" value="0.2" aria-label="Share of local drivers already booked"></label>
        <div class="mini"><svg data-r="mini" viewBox="0 0 118 46" aria-hidden="true"></svg><span>The best price as drivers run out: flat, then steep.</span></div>
        <div class="acts"><button class="btn" data-r="reveal" type="button">Show the best price</button></div>
      </div>
      <div class="demo-main">
        <div data-r="chart" class="chart"></div>
        <div class="reads">
          <div><small>Chance the dealer says yes</small><b data-r="r1" class="num"></b></div>
          <div><small>Profit if they do</small><b data-r="r2" class="num"></b></div>
          <div><small>Average profit per quote</small><b data-r="r3" class="num"></b></div>
        </div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  const narrow = isNarrow(root)
  const W = narrow ? 400 : 620
  const H = narrow ? 270 : 290
  const m = { l: 46, r: 18, t: 22, b: 36 }
  const X0 = 19
  const X1 = 42
  const Y0 = -1.6
  const Y1 = 7.6
  const x = (p: number) => m.l + ((p - X0) / (X1 - X0)) * (W - m.l - m.r)
  const y = (v: number) => H - m.b - ((v - Y0) / (Y1 - Y0)) * (H - m.t - m.b)

  const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Average profit per quote at each price' }, q(root, '[data-r=chart]'))
  const grad = svg('linearGradient', { id: 'sp-fill', x1: 0, y1: 0, x2: 0, y2: 1 }, svg('defs', null, chart))
  svg('stop', { offset: 0, 'stop-color': '#F0B23E', 'stop-opacity': 0.26 }, grad)
  svg('stop', { offset: 1, 'stop-color': '#F0B23E', 'stop-opacity': 0 }, grad)
  for (const v of [0, 2, 4, 6]) {
    svg('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v ? 'gl' : 'gl zero' }, chart)
    svg('text', { x: m.l - 9, y: y(v) + 3.5, 'text-anchor': 'end', class: 'tk' }, chart).textContent = '€' + v
  }
  for (let p = 20; p <= 40; p += narrow ? 5 : 4) {
    svg('text', { x: x(p), y: H - 13, 'text-anchor': 'middle', class: 'tk' }, chart).textContent = '€' + p
  }
  svg('text', { x: m.l, y: 11, class: 'tk lab' }, chart).textContent = narrow
    ? 'Average profit per quote'
    : 'Average profit per quote, at each price you could ask'
  const area = svg('path', { fill: 'url(#sp-fill)' }, chart)
  const curve = svg('path', { class: 'ln a' }, chart)
  const costLine = svg('line', { class: 'guide dash' }, chart)
  const costText = svg('text', { class: 'tk', 'text-anchor': 'middle' }, chart)
  const ring = svg('circle', { r: 9, class: 'ring' }, chart)
  const ringText = svg('text', { class: 'tk hi', 'text-anchor': 'middle' }, chart)
  const guide = svg('line', { class: 'guide' }, chart)
  const dot = svg('circle', { r: 6.5, class: 'dot a' }, chart)
  const label = svg('text', { class: 'val', 'text-anchor': 'middle' }, chart)

  // small chart: the best price against how many drivers are booked
  const mini = q<SVGSVGElement>(root, '[data-r=mini]')
  const mx = (u: number) => 4 + (u / 0.94) * 110
  const my = (p: number) => 42 - ((clamp(p, 26, 50) - 26) / 24) * 38
  const curvePts: number[][] = []
  for (let u = 0; u <= 0.9401; u += 0.02) curvePts.push([mx(u), my(best(u).price)])
  svg('line', { x1: mx(0.6), x2: mx(0.6), y1: 2, y2: 44, class: 'guide dash' }, mini)
  svg('path', { d: linePath(curvePts), class: 'ln a', 'stroke-width': 1.75 }, mini)
  const miniDot = svg('circle', { r: 4, class: 'dot a' }, mini)

  const priceInput = q<HTMLInputElement>(root, '[data-r=price]')
  const bookedInput = q<HTMLInputElement>(root, '[data-r=u]')
  const text = (name: string, value: string) => (q(root, `[data-r=${name}]`).textContent = value)
  let revealed = false
  let touched = false

  function draw() {
    const p = Number(priceInput.value)
    const u = Number(bookedInput.value)
    const c = cost(u)
    const b = best(u)
    const e = expected(p, u)
    fillRange(priceInput)
    fillRange(bookedInput)
    text('price-o', eur(p))
    text('u-o', Math.round(u * 100) + '%')

    const line: number[][] = []
    const positive: number[][] = []
    for (let price = X0; price <= X1 + 1e-9; price += 0.25) {
      const v = expected(price, u)
      if (v >= Y0) line.push([x(price), y(Math.min(v, Y1))])
      if (v >= 0) positive.push([x(price), y(Math.min(v, Y1))])
    }
    curve.setAttribute('d', linePath(line))
    area.setAttribute(
      'd',
      positive.length > 1
        ? `M${positive[0][0].toFixed(1)} ${y(0).toFixed(1)}` +
            positive.map((pt) => `L${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join('') +
            `L${positive[positive.length - 1][0].toFixed(1)} ${y(0).toFixed(1)}Z`
        : '',
    )

    const costVisible = c <= X1 && c >= X0 + 0.4
    costLine.setAttribute('opacity', costVisible ? '1' : '0')
    costText.setAttribute('opacity', costVisible ? '1' : '0')
    if (costVisible) {
      for (const [k, v] of Object.entries({ x1: x(c), x2: x(c), y1: y(0) - 34, y2: y(0) + 8 })) costLine.setAttribute(k, String(v))
      costText.setAttribute('x', String(x(c)))
      costText.setAttribute('y', String(y(0) + 22))
      costText.textContent = 'your cost'
    }

    const dotY = y(clamp(e, Y0, Y1))
    for (const [k, v] of Object.entries({ x1: x(p), x2: x(p), y1: m.t + 6, y2: H - m.b })) guide.setAttribute(k, String(v))
    dot.setAttribute('cx', String(x(p)))
    dot.setAttribute('cy', String(dotY))
    label.setAttribute('x', String(clamp(x(p), m.l + 34, W - m.r - 34)))
    label.setAttribute('y', String(Math.max(m.t + 2, dotY - 14)))
    label.textContent = eur(e) + ' avg'

    const showBest = revealed && b.price <= X1
    ring.setAttribute('opacity', showBest ? '1' : '0')
    ringText.setAttribute('opacity', showBest ? '1' : '0')
    if (showBest) {
      ring.setAttribute('cx', String(x(b.price)))
      ring.setAttribute('cy', String(y(b.value)))
      ringText.setAttribute('x', String(clamp(x(b.price), m.l + 40, W - m.r - 40)))
      ringText.setAttribute('y', String(y(b.value) - 30))
      ringText.textContent = 'best ' + eur(b.price)
    }
    miniDot.setAttribute('cx', String(mx(u)))
    miniDot.setAttribute('cy', String(my(b.price)))

    text('r1', Math.round(accept(p) * 100) + '%')
    text('r2', eur(p - c))
    text('r3', eur(e))

    const near = Math.abs(e - b.value) <= Math.max(0.06, 0.02 * b.value)
    let verdict: string
    if (p <= c) verdict = 'Below what the job costs you. You would lose money on every car you win.'
    else if (near) verdict = 'That is the sweet spot. Ask more and too many dealers walk; ask less and you give money away.'
    else if (e < 0.62 * b.value && p < b.price) verdict = 'Too cheap. The dealer says yes nearly every time, and you earn very little for it.'
    else if (e < 0.62 * b.value) verdict = 'Too greedy. The rival is probably cheaper, so the dealer goes elsewhere.'
    else if (p < b.price) verdict = 'Close. You could ask for a little more.'
    else verdict = 'Close. A slightly lower price would win more jobs.'

    let extra = ''
    if (u >= 0.6) {
      extra =
        b.price > X1
          ? 'Drivers are so short that the best price is off the chart. The right move is to quote high and expect to lose this car.'
          : 'Drivers are running short, so every job out of this town now costs more and the best price has moved up. Past 97% booked my bot stopped quoting altogether.'
    } else if (revealed) {
      extra = `Best in this simplified model: ${eur(b.price)}. On the day, my bot quoted €28.00 for this request.`
    } else if (!touched) {
      extra = 'Drag the price. Higher earns more per job but wins fewer jobs.'
    }
    q(root, '[data-r=say]').innerHTML = verdict + (extra ? `<small>${extra}</small>` : '')
  }

  const onInput = () => {
    touched = true
    draw()
  }
  priceInput.addEventListener('input', onInput)
  bookedInput.addEventListener('input', onInput)
  const revealBtn = q<HTMLButtonElement>(root, '[data-r=reveal]')
  revealBtn.addEventListener('click', () => {
    revealed = !revealed
    revealBtn.textContent = revealed ? 'Hide the best price' : 'Show the best price'
    draw()
  })

  // dragging on the chart sets the price too
  let dragging = false
  const pick = (ev: PointerEvent) => {
    const r = chart.getBoundingClientRect()
    const px = ((ev.clientX - r.left) / r.width) * W
    priceInput.value = clamp(X0 + ((px - m.l) / (W - m.l - m.r)) * (X1 - X0), X0, X1).toFixed(1)
    onInput()
  }
  chart.style.cursor = 'ew-resize'
  chart.style.touchAction = 'pan-y'
  chart.addEventListener('pointerdown', (ev) => {
    dragging = true
    chart.setPointerCapture(ev.pointerId)
    pick(ev)
  })
  chart.addEventListener('pointermove', (ev) => dragging && pick(ev))
  chart.addEventListener('pointerup', () => (dragging = false))
  chart.addEventListener('pointercancel', () => (dragging = false))

  draw()
  return () => {}
}

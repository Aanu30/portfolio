import type { Mount } from '../components/Demo'
import { eur, fillRange, gauss, mulberry, q } from '../lib/dom'

// "Run the desk for a day": a small, simplified version of the Spread challenge. Ten
// requests, seven drivers. When you finish, the pricing rule plays the same day with the
// same dealers, rivals and luck, which is how every idea was tested at Junction.

type Request = { from: string; to: string; list: number; fee: number; rival: number; luckAccept: number; luckLate: number }
type Outcome = { price: number | null; won: boolean; late: boolean; margin: number }
type Tally = { margin: number; cars: number; late: number }

const TOWNS = ['Helsinki', 'Espoo', 'Vantaa', 'Tampere', 'Turku', 'Lahti', 'Hyvinkää', 'Jyväskylä', 'Raisio', 'Oulu']
const LISTS = [26, 34, 42, 55, 68, 82, 96]
const DRIVERS = 7
const REQUESTS = 10
const SHARPNESS = 0.1
const TYPICAL_RIVAL = 0.155
const REFUND = 0.5

function makeDay(seed: number): Request[] {
  const rand = mulberry(seed)
  const day: Request[] = []
  for (let i = 0; i < REQUESTS; i++) {
    const from = TOWNS[Math.floor(rand() * TOWNS.length)]
    let to = from
    while (to === from) to = TOWNS[Math.floor(rand() * TOWNS.length)]
    const list = LISTS[Math.floor(rand() * LISTS.length)]
    day.push({ from, to, list, fee: list * (0.62 + 0.16 * rand()), rival: TYPICAL_RIVAL + 0.05 * gauss(rand), luckAccept: rand(), luckLate: rand() })
  }
  return day
}

const chance = (price: number, list: number, rival: number) => 1 / (1 + Math.exp((Math.log(price / list) - rival) / SHARPNESS))
/** Chance a car arrives late, given the share of drivers already booked. */
const lateRisk = (used: number) => 0.01 + (0.55 * Math.max(0, used - 0.6)) / 0.4
/** Drivers charge more once most of them are busy. */
const feeNow = (fee: number, used: number) => fee * (1 + 0.8 * Math.max(0, used - 0.6))

function settle(r: Request, price: number | null, booked: number): Outcome {
  if (price === null || booked >= DRIVERS) return { price: null, won: false, late: false, margin: 0 }
  const used = booked / DRIVERS
  if (r.luckAccept >= chance(price, r.list, r.rival)) return { price, won: false, late: false, margin: 0 }
  const late = r.luckLate < lateRisk(used)
  return { price, won: true, late, margin: price - feeNow(r.fee, used) - (late ? REFUND * price : 0) }
}

// The rule stops booking after five drivers, because past that a late car becomes likely.
const SAFE_SLOTS = 5

// What a free driver is worth for the rest of the day, in euros, by request number (rows)
// and drivers already booked (columns). Worked out backwards from the last request for this
// simplified game. It is the "price of the limit" from the paper: high early in the day
// when many requests are still to come, zero once there are more drivers than requests left.
const SLOT_PRICE = [
  [12.3, 16.4, 21.4, 28.1, 38.8],
  [10.3, 14.6, 19.7, 26.5, 37.3],
  [8.0, 12.5, 17.8, 24.7, 35.6],
  [5.4, 10.1, 15.6, 22.7, 33.7],
  [2.4, 7.1, 12.9, 20.2, 31.5],
  [0.0, 3.5, 9.7, 17.3, 28.9],
  [0.0, 0.0, 5.3, 13.6, 25.6],
  [0.0, 0.0, 0.0, 8.4, 21.3],
  [0.0, 0.0, 0.0, 0.0, 14.8],
  [0.0, 0.0, 0.0, 0.0, 0.0],
]

/** The pricing rule: cost, plus the price of the driver it uses up, plus the best markup. */
function rulePrice(r: Request, booked: number, turn: number): number | null {
  if (booked >= SAFE_SLOTS) return null
  const used = booked / DRIVERS
  const risk = lateRisk(used)
  const cost = feeNow(r.fee, used) + SLOT_PRICE[turn][booked]
  let best = r.list
  let bestValue = -Infinity
  for (let p = r.list * 0.8; p <= r.list * 1.8; p += 0.25) {
    const value = chance(p, r.list, TYPICAL_RIVAL) * (p * (1 - REFUND * risk) - cost)
    if (value > bestValue) {
      bestValue = value
      best = p
    }
  }
  return bestValue > 0 ? Math.round(best) : null
}

function playRule(day: Request[]): Tally {
  const tally = { margin: 0, cars: 0, late: 0 }
  for (const [turn, r] of day.entries()) {
    const o = settle(r, rulePrice(r, tally.cars, turn), tally.cars)
    if (o.won) {
      tally.cars++
      tally.margin += o.margin
      if (o.late) tally.late++
    }
  }
  return tally
}

const onTime = (t: Tally) => (t.cars ? 1 - t.late / t.cars : 0)
const ranked = (t: Tally) => t.cars > 0 && onTime(t) >= 0.9

export const mountSpreadWeek: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <div class="game-top">
          <span class="k" data-r="count"></span>
          <div class="drivers" data-r="drivers"></div>
        </div>
        <div class="req"><h4 data-r="route"></h4><p data-r="facts"></p></div>
        <label class="ctl"><span>Your price</span><output data-r="price-o" class="num"></output>
          <input type="range" data-r="price" step="0.5" aria-label="Your price in euros"></label>
        <div class="reads">
          <div><small>Chance of a yes, if the rival is typical</small><b data-r="r1" class="num"></b></div>
          <div><small>Profit if they say yes</small><b data-r="r2" class="num"></b></div>
          <div><small>Chance it arrives late</small><b data-r="r3" class="num"></b></div>
        </div>
        <div class="acts">
          <button class="btn pri" data-r="quote" type="button">Send quote</button>
          <button class="btn" data-r="pass" type="button">Pass on this one</button>
        </div>
      </div>
      <div class="demo-main">
        <span class="k">Your day so far</span>
        <ol class="log" data-r="log"></ol>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>
    <div class="result" data-r="result" hidden></div>`

  const slider = q<HTMLInputElement>(root, '[data-r=price]')
  const quoteBtn = q<HTMLButtonElement>(root, '[data-r=quote]')
  const passBtn = q<HTMLButtonElement>(root, '[data-r=pass]')
  const log = q(root, '[data-r=log]')
  const result = q(root, '[data-r=result]')
  const text = (name: string, value: string) => (q(root, `[data-r=${name}]`).textContent = value)

  let seed = 1 + Math.floor(Math.random() * 9000)
  let day: Request[] = []
  let index = 0
  let mine: Tally = { margin: 0, cars: 0, late: 0 }

  function drawDrivers() {
    q(root, '[data-r=drivers]').innerHTML =
      Array.from({ length: DRIVERS }, (_, i) => `<i class="${i < mine.cars ? 'busy' : ''}"></i>`).join('') +
      `<span>${DRIVERS - mine.cars} of ${DRIVERS} drivers free</span>`
  }

  function drawRequest() {
    const r = day[index]
    const used = mine.cars / DRIVERS
    text('count', `Request ${index + 1} of ${REQUESTS}`)
    text('route', `${r.from} to ${r.to}`)
    text('facts', `List price ${eur(r.list)}. A driver will cost about ${eur(feeNow(r.fee, used))}${used > 0.6 ? ', more than usual because drivers are short' : ''}.`)
    slider.min = String(Math.round(r.list * 0.8))
    slider.max = String(Math.round(r.list * 1.8))
    slider.value = String(r.list)
    const full = mine.cars >= DRIVERS
    quoteBtn.disabled = full
    drawDrivers()
    drawPrice()
    text(
      'say',
      full
        ? 'Every driver is booked. All you can do now is pass.'
        : used > 0.6
          ? 'Most of your drivers are booked. A car you win now is far more likely to arrive late, and one late car can sink the whole day.'
          : index === 0
            ? 'Price the job. Ask more and you earn more per car, but the dealer is likelier to go with the rival.'
            : 'Next request. You do not have to win every car.',
    )
  }

  function drawPrice() {
    const r = day[index]
    const p = Number(slider.value)
    const used = mine.cars / DRIVERS
    fillRange(slider)
    text('price-o', eur(p))
    text('r1', Math.round(chance(p, r.list, TYPICAL_RIVAL) * 100) + '%')
    text('r2', eur(p - feeNow(r.fee, used)))
    text('r3', Math.round(lateRisk(used) * 100) + '%')
  }

  function record(o: Outcome) {
    const r = day[index]
    const li = document.createElement('li')
    const what =
      o.price === null
        ? 'passed'
        : !o.won
          ? `quoted ${eur(o.price, 0)}, lost to the rival`
          : o.late
            ? `won at ${eur(o.price, 0)}, arrived late`
            : `won at ${eur(o.price, 0)}`
    li.className = o.late ? 'late' : o.won ? 'won' : ''
    li.innerHTML = `<i>${index + 1}</i><span>${r.from} to ${r.to}: ${what}</span><b>${o.won ? eur(o.margin) : '–'}</b>`
    log.appendChild(li)
    log.scrollTop = log.scrollHeight
  }

  function step(price: number | null) {
    const o = settle(day[index], price, mine.cars)
    record(o)
    if (o.won) {
      mine.cars++
      mine.margin += o.margin
      if (o.late) mine.late++
    }
    index++
    if (index < REQUESTS) drawRequest()
    else finish()
  }

  function card(title: string, t: Tally) {
    return `<div><span class="k">${title}</span><b>${eur(t.margin)}</b>
      <p>${t.cars} ${t.cars === 1 ? 'car' : 'cars'} delivered, ${t.cars ? Math.round(onTime(t) * 100) + '% on time' : 'none to be late'}. ${ranked(t) ? 'The day counts.' : 'The day does not count.'}</p></div>`
  }

  function finish() {
    const rule = playRule(day)
    drawDrivers()
    quoteBtn.disabled = true
    passBtn.disabled = true
    text('count', 'Day finished')
    text('say', 'Scroll down for the result.')
    let verdict: string
    if (!mine.cars) verdict = 'You won no cars, so your day does not count. A desk that never trades is not ranked.'
    else if (!ranked(mine)) verdict = 'Your day does not count: fewer than 90% of your cars arrived on time. That is exactly what knocked out 170 of the 228 teams.'
    else if (mine.margin >= rule.margin) verdict = 'You beat my pricing rule on this day. One day proves little, though: at Junction an idea only stayed if it won across many weeks.'
    else verdict = `Your day counts, and my pricing rule made ${eur(rule.margin - mine.margin)} more on the same requests.`
    result.hidden = false
    result.innerHTML =
      card('You', mine) +
      card('My pricing rule, same day', rule) +
      `<p class="verdict">${verdict} Both of you faced the same dealers, the same rival prices and the same luck. That is how every change was tested: the same simulated week, with the idea and without.</p>
       <p class="verdict" style="font-size:14px;color:var(--ink-3)">How the rule plays: it charges extra early in the day, when a free driver is still worth a lot, and it stops taking cars after five because a sixth is likely to arrive late.</p>
       <div class="acts" style="grid-column:1/-1;margin:0"><button class="btn pri" data-r="again" type="button">Play this day again</button><button class="btn" data-r="new" type="button">Deal a new day</button></div>`
    q(root, '[data-r=again]').addEventListener('click', () => start(seed))
    q(root, '[data-r=new]').addEventListener('click', () => start(seed + 1))
  }

  function start(newSeed: number) {
    seed = newSeed
    day = makeDay(seed)
    index = 0
    mine = { margin: 0, cars: 0, late: 0 }
    log.innerHTML = ''
    result.hidden = true
    passBtn.disabled = false
    drawRequest()
  }

  slider.addEventListener('input', drawPrice)
  quoteBtn.addEventListener('click', () => step(Number(slider.value)))
  passBtn.addEventListener('click', () => step(null))
  start(seed)
  return () => {}
}

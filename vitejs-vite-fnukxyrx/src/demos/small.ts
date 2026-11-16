import type { Mount } from '../components/Demo'
import { gauss, linePath, mulberry, q, qa, svg } from '../lib/dom'

// The smaller interactive pieces on the homepage: the three card drawings, the
// Estimathon round and the vaccine-uptake odds builder.

const VW = 330
const VH = 156
const frame = (el: HTMLElement) =>
  svg('svg', { viewBox: `0 0 ${VW} ${VH}`, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' }, el)

/** Prosperity: noisy prices with a straight-line rule underneath. */
export function drawProsperityPreview(el: HTMLElement) {
  const rand = mulberry(11)
  const s = frame(el)
  for (let i = 0; i < 46; i++) {
    svg('circle', { cx: 18 + i * 6.5, cy: 118 - i * 1.75 + gauss(rand) * 9, r: 2.2, fill: 'rgba(235,238,245,.42)' }, s)
  }
  svg('line', { x1: 18, y1: 118, x2: 312, y2: 38.8, class: 'ln a' }, s)
  svg('text', { x: 18, y: 22, class: 'tk' }, s).textContent = 'prices'
  svg('text', { x: 312, y: 142, 'text-anchor': 'end', class: 'tk hi' }, s).textContent = 'the rule underneath'
}

/** Option pricer: an estimate settling on the true price as simulations pile up. */
export function drawPricerPreview(el: HTMLElement) {
  const rand = mulberry(23)
  const s = frame(el)
  const upper: number[][] = []
  const lower: number[][] = []
  const middle: number[][] = []
  let running = 0
  for (let i = 1; i <= 70; i++) {
    running += gauss(rand)
    const px = 18 + i * 4.2
    const band = 46 / Math.sqrt(i)
    upper.push([px, 78 - band])
    lower.push([px, 78 + band])
    middle.push([px, 78 - (running / i) * 30])
  }
  svg('path', { d: linePath(upper) + linePath(lower.reverse()).replace('M', 'L') + 'Z', fill: 'rgba(240,178,62,.10)' }, s)
  svg('line', { x1: 18, x2: 312, y1: 78, y2: 78, class: 'guide dash' }, s)
  svg('path', { d: linePath(middle), class: 'ln a' }, s)
  svg('text', { x: 312, y: 70, 'text-anchor': 'end', class: 'tk hi' }, s).textContent = 'true price 10.45'
  svg('text', { x: 18, y: 22, class: 'tk' }, s).textContent = 'more simulations →'
}

/** Chess engine: a search tree with the skipped branches greyed out. */
export function drawChessPreview(el: HTMLElement) {
  const s = frame(el)
  const root = [165, 24]
  const kids = [
    [72, 70],
    [165, 70],
    [258, 70],
  ]
  kids.forEach((kid, i) => {
    svg('line', { x1: root[0], y1: root[1], x2: kid[0], y2: kid[1], stroke: i ? 'rgba(235,238,245,.34)' : '#F0B23E', 'stroke-width': i ? 1 : 1.75 }, s)
    for (let j = 0; j < 3; j++) {
      const lx = kid[0] - 28 + j * 28
      const cut = i > 0 && j > 0
      const best = i === 0 && j === 1
      svg('line', { x1: kid[0], y1: kid[1], x2: lx, y2: 114, stroke: best ? '#F0B23E' : cut ? 'rgba(235,238,245,.16)' : 'rgba(235,238,245,.34)', 'stroke-width': best ? 1.75 : 1, 'stroke-dasharray': cut ? '3 4' : 'none' }, s)
      svg('circle', { cx: lx, cy: 114, r: 5, fill: cut ? 'none' : best ? '#F0B23E' : 'rgba(235,238,245,.55)', stroke: cut ? 'rgba(235,238,245,.26)' : 'none' }, s)
    }
    svg('circle', { cx: kid[0], cy: kid[1], r: 6, fill: i ? 'rgba(235,238,245,.6)' : '#F0B23E' }, s)
  })
  svg('circle', { cx: root[0], cy: root[1], r: 7, fill: '#F0B23E' }, s)
  svg('text', { x: 18, y: 144, class: 'tk hi' }, s).textContent = 'best line'
  svg('text', { x: 312, y: 144, 'text-anchor': 'end', class: 'tk' }, s).textContent = '4 of 9 lines never examined'
}

// ---------------------------------------------------------------- Estimathon

const QUESTIONS: { ask: string; answer: number }[] = [
  { ask: 'How many bones are in an adult human body?', answer: 206 },
  { ask: 'How long is the River Thames, in kilometres?', answer: 346 },
  { ask: 'How high is Mount Everest, in metres?', answer: 8849 },
  { ask: 'How far away is the Moon on average, in kilometres?', answer: 384400 },
  { ask: 'How many different five-card poker hands are there?', answer: 2598960 },
]

/** Five questions, scored the usual Estimathon way: lower is better, a miss doubles it. */
export const mountEstimathon: Mount = (root) => {
  root.innerHTML =
    `<p><b>An Estimathon asks for a range, not a guess.</b> A narrow range scores better, but every range that misses the answer doubles your whole score. The skill is knowing how sure you really are.</p>` +
    QUESTIONS.map(
      (item, i) => `
      <div class="est-q">
        <span>${i + 1}. ${item.ask}</span>
        <span class="est-in">from <input type="number" inputmode="numeric" data-lo="${i}" aria-label="Low end for question ${i + 1}"> to <input type="number" inputmode="numeric" data-hi="${i}" aria-label="High end for question ${i + 1}"></span>
        <span class="res" data-res="${i}"></span>
      </div>`,
    ).join('') +
    `<div class="acts"><button class="btn pri" data-r="go" type="button">Score my ranges</button></div>
     <p class="try-out" data-r="out" aria-live="polite"></p>`

  q(root, '[data-r=go]').addEventListener('click', () => {
    let hits = 0
    let widths = 0
    QUESTIONS.forEach((item, i) => {
      const lo = Number(q<HTMLInputElement>(root, `[data-lo="${i}"]`).value)
      const hi = Number(q<HTMLInputElement>(root, `[data-hi="${i}"]`).value)
      const res = q(root, `[data-res="${i}"]`)
      const answer = item.answer.toLocaleString('en-GB')
      if (!(lo > 0) || !(hi >= lo)) {
        res.className = 'res miss'
        res.textContent = `No range given. The answer is ${answer}.`
      } else if (lo <= item.answer && item.answer <= hi) {
        hits++
        widths += Math.floor(hi / lo)
        res.className = 'res ok'
        res.textContent = `Caught it: ${answer}. Your top was ${(hi / lo).toFixed(hi / lo < 10 ? 1 : 0)} times your bottom.`
      } else {
        res.className = 'res miss'
        res.textContent = `Missed: the answer is ${answer}.`
      }
    })
    const misses = QUESTIONS.length - hits
    const score = (10 + widths) * 2 ** misses
    const verdict =
      misses === 0 && score <= 22
        ? 'Sharp. Every range landed and they were tight.'
        : misses === 0
          ? 'Every range landed. Tighter ranges would bring the score down.'
          : `${misses === 1 ? 'One miss' : misses + ' misses'}, and each one doubled the score. Wider ranges would have been cheaper.`
    q(root, '[data-r=out]').innerHTML =
      `Score: <b>${score.toLocaleString('en-GB')}</b>, where lower is better and 15 is the best possible. ${verdict}`
  })
  return () => {}
}

// ---------------------------------------------------------------- vaccine uptake

// Odds ratios from the results table of my ST211 report (EVENS 2021 survey). The model
// also fitted religion and region; they are left out because only one level of each was
// labelled in the table.
const FACTORS: { label: string; options: [string, number][] }[] = [
  { label: 'Ethnicity', options: [['White (reference)', 1], ['Black', 0.76], ['Other Asian', 0.82], ['Mixed', 0.99], ['South Asian', 1.23], ['Other', 1.34]] },
  { label: 'Housing', options: [['Owns outright', 1], ['Renting', 0.52], ['Not known', 0.38]] },
  { label: 'Education', options: [['Postgraduate', 1], ['No formal qualifications', 0.44]] },
  { label: 'Health', options: [['Excellent', 1], ['Poor', 1.66]] },
  { label: 'Income band', options: [['Average', 1], ['10 bands higher', 1.15], ['10 bands lower', 0.869]] },
]
const BASELINE = 0.82

export const mountVaccine: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body one"><div class="demo-main">
      <p class="scenario"><b>Build a person, get their odds.</b> This runs on the odds ratios from my results table. Change someone's circumstances and watch the predicted chance move. The thing to notice: housing shifts it further than ethnicity does.</p>
      <div class="picker">${FACTORS.map(
        (f, i) =>
          `<label>${f.label}<select data-f="${i}">${f.options.map(([name, ratio]) => `<option value="${ratio}">${name}</option>`).join('')}</select></label>`,
      ).join('')}</div>
      <div class="prob"><b data-r="p" class="num"></b><span>chance this person was vaccinated</span></div>
      <div class="gauge" aria-hidden="true" style="max-width:420px"><i data-r="bar"></i></div>
      <p class="say" data-r="say" aria-live="polite"></p>
    </div></div>`

  const selects = qa<HTMLSelectElement>(root, 'select')
  const baseOdds = BASELINE / (1 - BASELINE)
  const alone = (ratio: number) => {
    const odds = baseOdds * ratio
    return Math.abs(odds / (1 + odds) - BASELINE)
  }

  function draw() {
    const odds = selects.reduce((acc, s) => acc * Number(s.value), baseOdds)
    const p = odds / (1 + odds)
    q(root, '[data-r=p]').textContent = (p * 100).toFixed(1) + '%'
    q(root, '[data-r=bar]').style.width = p * 100 + '%'
    const housing = alone(Number(selects[1].value))
    const ethnicity = alone(Number(selects[0].value))
    let verdict: string
    if (housing === 0 && ethnicity === 0) {
      verdict = 'The reference person: White, owns outright, postgraduate, excellent health, average income. 82% likely to have been vaccinated.'
    } else if (housing > ethnicity) {
      verdict = `Housing is doing more work than ethnicity here: ${(housing * 100).toFixed(1)} points against ${(ethnicity * 100).toFixed(1)}. That was the finding, and it is why outreach aimed at ethnicity alone would have missed people.`
    } else {
      verdict = `Ethnicity moves it ${(ethnicity * 100).toFixed(1)} points here. Now switch the housing to renting and compare.`
    }
    q(root, '[data-r=say]').innerHTML =
      `${verdict}<small>Population-level associations from one 2021 survey of 14,215 people, not a prediction about any individual.</small>`
  }
  selects.forEach((s) => s.addEventListener('change', draw))
  draw()
  return () => {}
}

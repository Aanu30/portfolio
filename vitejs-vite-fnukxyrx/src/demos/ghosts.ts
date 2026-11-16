import type { Mount } from '../components/Demo'
import { fillRange, mulberry, q } from '../lib/dom'

// How long a sentence lasts on Wikipedia. The half-lives are the measured ones from the
// team's analysis (Kaplan-Meier medians); the dots assume sentences keep disappearing at
// that rate, which is an illustration, not a measurement.

const TOPICS: [string, number][] = [
  ['Åland question', 18.9],
  ['All articles', 18.6],
  ['Anjala League', 17.5],
  ['Winter War', 0.8],
  ['1918 Civil War', 0.8],
  ['Mannerheim', 0.5],
]

export const mountGhosts: Mount = (root) => {
  root.innerHTML = `
    <div class="demo-body">
      <div class="demo-side">
        <p class="scenario"><b>Write 100 sentences into an article. How many are still there later?</b> Pick a topic, then move time forward.</p>
        <span class="k">Years until half the sentences are gone</span>
        <div class="topics" data-r="topics" role="group" aria-label="Topic"></div>
        <label class="ctl"><span>Time since they were written</span><output data-r="t-o" class="num"></output>
          <input type="range" data-r="t" min="0" max="10" step="0.1" value="1" aria-label="Years since the sentences were written"></label>
      </div>
      <div class="demo-main">
        <div class="dots" data-r="dots" aria-hidden="true"></div>
        <div class="gh-read"><b data-r="n" class="num"></b><span>of 100 sentences are still in the article</span></div>
        <p class="say" data-r="say" aria-live="polite"></p>
      </div>
    </div>`

  const topicBox = q(root, '[data-r=topics]')
  const dotBox = q(root, '[data-r=dots]')
  const slider = q<HTMLInputElement>(root, '[data-r=t]')
  let current = 4

  // a fixed random order in which the sentences disappear
  const order = [...Array(100).keys()]
  const rand = mulberry(5)
  for (let i = 99; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  const rank = new Array<number>(100)
  order.forEach((dot, i) => (rank[dot] = i))

  for (let i = 0; i < 100; i++) dotBox.appendChild(document.createElement('i'))
  const dots = [...dotBox.children]

  const buttons = TOPICS.map(([name, years], i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'topic'
    b.innerHTML = `<span>${name}</span><i style="width:${((years / 18.9) * 100).toFixed(1)}%"></i><span>${years.toFixed(1)} yrs</span>`
    b.addEventListener('click', () => {
      current = i
      draw()
    })
    topicBox.appendChild(b)
    return b
  })

  function draw() {
    const t = Number(slider.value)
    const [name, halfLife] = TOPICS[current]
    const left = Math.round(100 * Math.pow(0.5, t / halfLife))
    fillRange(slider)
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)))
    dots.forEach((dot, i) => dot.classList.toggle('gone', rank[i] < 100 - left))

    const months = Math.round(t * 12)
    q(root, '[data-r=t-o]').textContent =
      t === 0
        ? 'the day they were written'
        : t < 1
          ? `${months} ${months === 1 ? 'month' : 'months'} later`
          : `${t % 1 ? t.toFixed(1) : t.toFixed(0)} ${t === 1 ? 'year' : 'years'} later`
    q(root, '[data-r=n]').textContent = String(left)

    const where = name === 'All articles' ? 'Across all 19,742 articles' : `On the ${name} article`
    const verdict =
      halfLife < 2
        ? `${where}, sentences are fought over. Half of what is written is gone within ${halfLife < 0.7 ? 'six' : 'ten'} months.`
        : `${where}, most of what is written simply stays. It takes about ${Math.round(halfLife)} years for half of it to go.`
    q(root, '[data-r=say]').innerHTML =
      `${verdict}<small>The half-lives are measured. The dots are an illustration that assumes sentences keep disappearing at the same rate.</small>`
  }

  slider.addEventListener('input', draw)
  draw()
  return () => {}
}

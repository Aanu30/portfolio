import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Demo, { Mounted } from '../components/Demo'
import { mountDealer } from '../demos/dealer'
import { mountGhosts } from '../demos/ghosts'
import { mountPokerReplay } from '../demos/pokerReplay'
import { drawChessPreview, drawPricerPreview, drawProsperityPreview, mountVaccine } from '../demos/small'
import { mountSpreadQuote } from '../demos/spreadQuote'

type Stat = { big: ReactNode; text: string }

type ChapterProps = {
  id: string
  no: string
  meta: string[]
  title: string
  sub: string
  plain: ReactNode
  quant: ReactNode
  stats: Stat[]
  children: ReactNode
  foot: ReactNode
}

function Chapter({ id, no, meta, title, sub, plain, quant, stats, children, foot }: ChapterProps) {
  return (
    <article className="chapter" id={id}>
      <div className="ch-meta mono rv">
        <b>{no}</b>
        {meta.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <div className="ch-grid rv">
        <div>
          <h3 className="ch-title">
            {title} <em>{sub}</em>
          </h3>
          <p className="lede plain">{plain}</p>
          <p className="lede quant">{quant}</p>
        </div>
        <ul className="stats">
          {stats.map((s) => (
            <li key={s.text}>
              <b>{s.big}</b>
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
      </div>
      {children}
      <div className="ch-foot rv">{foot}</div>
    </article>
  )
}

function Term({ def, children }: { def: string; children: ReactNode }) {
  return (
    <span className="term" tabIndex={0} data-def={def}>
      {children}
    </span>
  )
}

function Preview({ draw }: { draw: (el: HTMLElement) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    draw(el)
    return () => el.replaceChildren()
  }, [draw])
  return <div className="pv" ref={ref} />
}

/** What the rail lists, in page order. Each id is the id of a chapter in Work below. */
const RAIL = [
  { id: 'spread', label: 'Spread' },
  { id: 'paper', label: 'Paper' },
  { id: 'ghosts', label: 'Ghosts' },
  { id: 'poker', label: 'Poker' },
  { id: 'more', label: 'More' },
]

/** The small index on the left edge that tracks which project you are reading. */
function Rail() {
  const [current, setCurrent] = useState(0)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const els = RAIL.map((item) => document.getElementById(item.id))
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setCurrent(els.indexOf(entry.target as HTMLElement))
        }),
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => {
      if (el) observer.observe(el)
    })
    const onScroll = () => {
      const work = document.getElementById('projects')?.getBoundingClientRect()
      setOn(!!work && work.top < window.innerHeight * 0.5 && work.bottom > window.innerHeight * 0.5)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <nav className={'rail' + (on ? ' on' : '')} aria-label="Projects">
      {RAIL.map((item, i) => (
        <a key={item.id} href={'#' + item.id} className={i === current ? 'cur' : ''}>
          {String(i + 1).padStart(2, '0')} {item.label}
        </a>
      ))}
    </nav>
  )
}

export default function Work() {
  const [showModel, setShowModel] = useState(false)

  return (
    <section id="projects">
      <Rail />
      <div className="wrap">
        <div className="sec-intro rv">
          <span className="mono">
            <b>04</b> &nbsp;Projects
          </span>
          <h2 className="big">
            Seven things I've built or run. <em>Each one has something you can try.</em>
          </h2>
        </div>

        <Chapter
          id="spread"
          no="01"
          meta={['Nov 2026', "Junction 2026, Europe's largest hackathon", '48 hours']}
          title="I ran a delivery company for a week."
          sub="I priced it like a market maker."
          plain="Bahn Express set the challenge. Car dealers ask you for a price to move a car, a rival you can't see quotes too, and every job you win needs a freelance driver. Deliver fewer than 90% on time and your week doesn't count. I designed the pricing model and the testing rules, and directed a team of AI coding agents that wrote the code."
          quant="Each request is priced at p* = c / (1 − πr) + P / |P′|: expected cost plus an elasticity markup, with a shadow price μ(u) on driver capacity that is zero below 60% utilisation and pulls the quote at 97%. Acceptance is logistic in log price and learned online with Bayesian shrinkage by dealer, region and day. Every change was tested on paired seeds against a pre-set keep rule of two standard errors."
          stats={[
            { big: 'Top 10%', text: 'of 228 teams. 170 missed the on-time rule or placed no orders.' },
            { big: '€17,130', text: 'margin in the live final, from 463 cars won' },
            { big: '94.4%', text: 'delivered on time, over 34 minutes unattended with zero faults' },
            { big: '+€2,448', text: 'a week from one finding: 60% of drivers lived outside the 30 km circle in the rules' },
          ]}
          foot={
            <>
              <Link className="btn arrow" to="/spread">
                Read the full story and play a whole day
              </Link>
              <a className="btn" href="https://github.com/Aanu30/abquant-spread" target="_blank" rel="noopener">
                Code on GitHub
              </a>
            </>
          }
        >
          <Demo id="spread-demo" title="quote a real request from the final" note="simplified model" mount={mountSpreadQuote} />
        </Chapter>

        <Chapter
          id="paper"
          no="02"
          meta={['Sep to Nov 2026', 'Working paper', 'Written at London Strategic Edge']}
          title="A dealer's prices should hold steady,"
          sub="then jump."
          plain={
            <>
              A{' '}
              <Term def="A trader who always offers both to buy and to sell, and earns the gap between the two prices.">
                market maker
              </Term>{' '}
              is like a currency exchange booth: it buys at one price, sells at a slightly higher one, and keeps the
              gap. That gap has to cover the risk of holding what it has bought. Textbook models charge for the risk
              a little at a time. Real trading desks work to hard limits. My paper puts a price on the limit itself:
              nothing changes while there is room, and prices move sharply as the room runs out.
            </>
          }
          quant="One-period quoting model with fill intensity λ(δ) = A·e^(−kδ). The optimal half-spread is δ* = m + 1/k, marginal cost plus the inverse semi-elasticity. A budget on expected post-fill variance enters through its multiplier, δ* = 1/k + c + μ*ρ. By complementary slackness μ* = 0 while the budget is slack and diverges as it becomes unattainable. A soft penalty is the same Lagrangian with the multiplier frozen. The model nests Avellaneda-Stoikov as γ → 0 and states a shared-budget prediction as a regression test."
          stats={[
            { big: '16', text: 'pages: Market Making Optimisation Theories, What Duality Buys the Dealer' },
            { big: '6', text: 'propositions, each with a proof' },
            { big: '37', text: 'references, from Garman (1976) to current working papers' },
            { big: '1', text: "prediction the standard model doesn't make. The paper states it as a test and says plainly that it hasn't run it." },
          ]}
          foot={
            <>
              <Link className="btn arrow" to="/paper">
                Walk through the argument
              </Link>
              <a className="btn" href="mailto:a.n.bhatt@lse.ac.uk?subject=Market%20making%20paper">
                Request the PDF
              </a>
              <span className="tagchip">Working paper, not peer reviewed</span>
            </>
          }
        >
          <Demo title="be the dealer" note="curves computed from the paper's model" mount={mountDealer} />
        </Chapter>

        <Chapter
          id="ghosts"
          no="03"
          meta={['Nov 2026', "Junction 2026, Europe's largest hackathon", '3rd place, MariaDB track']}
          title="381,459 sentences Wikipedia deleted."
          sub="We brought them back."
          plain="Wikipedia keeps every version of every article but only shows you the latest. For MariaDB's challenge at Junction, our team rebuilt 862,076 versions of 19,742 Finnish history articles and recovered every sentence that was later removed. I led the analysis and the pitch. What we found: contested history gets rewritten far faster. On the 1918 Civil War article, half of what is written is gone within ten months. Across all articles it takes 18 years."
          quant="MariaDB system-versioned tables written with Wikipedia's real revision timestamps, so FOR SYSTEM_TIME AS OF replays any day. Sentence lifetimes come from diffing consecutive revisions, with reverts inside 24 hours filtered out. Kaplan-Meier median survival with live sentences censored (0.8 years against 18.6) and Fightin' Words log-odds on 2,646 deleted against 1,007 surviving sentences. I led the analysis and the pitch; teammates built the app."
          stats={[
            { big: <>3rd <small>place</small></>, text: "in MariaDB's Wikipedia Through Time challenge at Junction 2026, Europe's largest hackathon" },
            { big: '381,459', text: 'deleted sentences recovered from 862,076 versions of 19,742 articles' },
            { big: '23×', text: 'faster rewriting on contested history: a half-life of 0.8 years against 18.6' },
            { big: <>12 <small>of 12</small></>, text: 'language editions of the Winter War article had their busiest month for readers right after Russia invaded Ukraine' },
          ]}
          foot={
            <>
              <Link className="btn arrow" to="/ghosts">
                Read the full story
              </Link>
              <a className="btn" href="https://youtu.be/W_oorNzxkxc" target="_blank" rel="noopener">
                Watch the demo video
              </a>
              <a className="btn" href="https://github.com/salomeshioshvili/ghosts_of_wikipedia" target="_blank" rel="noopener">
                Code on GitHub
              </a>
            </>
          }
        >
          <Demo title="watch history get rewritten" note="half-lives measured in our analysis" mount={mountGhosts} />
        </Chapter>

        <Chapter
          id="poker"
          no="04"
          meta={['2025 to 2026', 'Personal project', 'Python']}
          title="36 nights of poker. Up £274.86."
          sub="Skill, or luck?"
          plain={
            <>
              I logged every session I played and asked the question a trading desk asks of every strategy: is this a
              real <Term def="A real, repeatable advantage, as opposed to a lucky run.">edge</Term>, or a good run?
              Three tests gave three different answers. Working out why was the interesting part.
            </>
          }
          quant="One-sample t-test on session P&L (p = 0.23), MLE comparing normal and Student-t fits, bootstrap with B = 10,000, and a Bayesian conjugate model with prior sensitivity (88.6% posterior probability of a positive edge). The disagreement is a power problem: d = 0.202 gives 21.8% power at n = 36."
          stats={[
            { big: '£274.86', text: 'net profit over 36 logged sessions' },
            { big: '55.6%', text: 'of sessions finished ahead' },
            { big: '89%', text: 'chance the edge is real, on the Bayesian estimate' },
            { big: '159', text: 'more sessions needed before a classic test could confirm it' },
          ]}
          foot={
            <>
              <Link className="btn arrow" to="/poker">
                Read the full analysis
              </Link>
              <a className="btn" href="https://github.com/Aanu30/pokeranalysis" target="_blank" rel="noopener">
                Code on GitHub
              </a>
            </>
          }
        >
          <Demo title="replay my 36 nights" note="my real session results" mount={mountPokerReplay} />
        </Chapter>

        <div className="chapter" id="more">
          <div className="ch-meta mono rv">
            <b>05 to 07</b>
            <span>Each has its own page and demo</span>
          </div>
          <div className="cards3">
            <Link className="card rv" to="/prosperity">
              <Preview draw={drawProsperityPreview} />
              <span className="mono">Apr 2026 · IMC Prosperity</span>
              <h3>
                13,000 people built trading bots. <em>Mine finished in the top 5%.</em>
              </h3>
              <p className="plain">
                A competition run by the trading firm IMC. I built a bot that quotes prices to buy and sell on a
                simulated exchange. One product's price followed a straight-line rule nobody had told us about. I
                spotted it in the charts and built the bot's prices around it.
              </p>
              <p className="quant">
                Market-making bot with inventory management. Fair value from the order book, including a linear
                price equation identified from the price charts. 10+ strategies backtested with bootstrap Sharpe
                intervals and CSCV for overfitting.
              </p>
              <span className="go">Find the fair price →</span>
            </Link>
            <Link className="card rv" to="/pricer">
              <Preview draw={drawPricerPreview} />
              <span className="mono">Jul to Aug 2026 · Exactimo</span>
              <h3>
                Pricing an option with 10,000 <em>imagined futures.</em>
              </h3>
              <p className="plain">
                I co-designed the exercises for a Finance and AI bootcamp. One prices an option by simulating
                thousands of possible futures: I added the put side and the check that the two prices agree. The
                other is an AI agent I designed and wrote for sizing a market. It refuses to give a single number
                until it has attacked its own estimate.
              </p>
              <p className="quant">
                Pure-Python Monte Carlo pricer under GBM: I added put pricing and a put-call parity check matching
                to 4 d.p. Designed and wrote a five-stage LLM market-sizing agent with gated stages, confidence
                labels and a mandatory self-attack step.
              </p>
              <span className="go">Watch the estimate settle →</span>
            </Link>
            <Link className="card rv" to="/chess">
              <Preview draw={drawChessPreview} />
              <span className="mono">2026 · AI Chessathon · Top 10%</span>
              <h3>
                A chess engine that knows <em>what not to think about.</em>
              </h3>
              <p className="plain">
                My entry for AI Chessathon 2026 finished in the top 10%. It looks several moves ahead, and saves
                time by skipping any line of play that can't change its decision.
              </p>
              <p className="quant">
                Alpha-beta search with a transposition table, quiescence search and a tapered incremental
                evaluation, in Python. Top 10% at AI Chessathon 2026.
              </p>
              <span className="go">Watch it prune the tree →</span>
            </Link>
          </div>

          <h4 className="sub rv">Smaller builds</h4>
          <div className="rows rv">
            <div className="row">
              <b>80 in 8</b>
              <span>
                A mental-arithmetic trainer in the format trading firms use to screen applicants: 80 questions, 8
                minutes, marks off for wrong answers.
              </span>
              <a href="https://optiver80-in-8.vercel.app" target="_blank" rel="noopener">
                Play it ↗
              </a>
            </div>
            <div className="row">
              <b>Who got vaccinated?</b>
              <span>
                A study of 14,215 survey responses. Housing and education predicted COVID-19 vaccine uptake better
                than ethnicity did.
              </span>
              <button type="button" aria-expanded={showModel} onClick={() => setShowModel((s) => !s)}>
                {showModel ? 'Close the model' : 'Try the model'}
              </button>
              {showModel && <Mounted className="row-open demo" mount={mountVaccine} />}
            </div>
            <div className="row">
              <b>One shop, three databases</b>
              <span>
                An online shop's data built three ways, with rules that block overselling and a query that
                recommends films from what similar people liked.
              </span>
              <i>SQL · MongoDB · Neo4j</i>
            </div>
            <div className="row">
              <b>AI marking for GCSE students</b>
              <span>
                Project lead at LSE Data Science Society. Before designing it I asked GCSE students how they
                actually study.
              </span>
              <i>Python · Azure OpenAI</i>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

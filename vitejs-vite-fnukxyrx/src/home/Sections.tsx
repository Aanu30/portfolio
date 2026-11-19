import { useState } from 'react'
import type { ReactNode } from 'react'
import { Mounted } from '../components/Demo'
import { mountEstimathon } from '../demos/small'

const EMAIL = 'a.n.bhatt@lse.ac.uk'

function Intro({ no, label, title, sub }: { no: string; label: string; title: string; sub: string }) {
  return (
    <div className="sec-intro rv">
      <span className="mono">
        <b>{no}</b> &nbsp;{label}
      </span>
      <h2 className="big">
        {title} <em>{sub}</em>
      </h2>
    </div>
  )
}

// ---------------------------------------------------------------- lessons

const LESSONS = [
  {
    label: 'The 30 km finding',
    title: 'Check the rule against the data.',
    body: 'The rules said drivers are notified within 30 km, so we only counted drivers inside that circle and turned cars away when they ran short. The bookings said otherwise: 60% of the drivers who took jobs lived further out. Counting them was the biggest gain of the weekend.',
    result: '+€2,448 a week, better in 12 of 12 test weeks',
  },
  {
    label: 'The near miss',
    title: 'A good result at 10pm is not a safe one.',
    body: 'On Saturday night the profit held up on fresh weeks, but one week came in at 90.4% on time, a hair above the cut-off that disqualified 170 teams. Instead of shipping, I added a brake that stops taking same-day cars when ours are piling up unbooked.',
    result: 'Worst week lifted from 90.4% to 94.1%',
  },
  {
    label: 'Saying no to noise',
    title: 'Most improvements are luck.',
    body: 'Overnight, one tweak tested 1.7 standard errors better. Out of eight variants tried, that is about what luck alone produces, so it stayed out. A later fix that looked worth €365 a week on the weeks used to pick it measured €26 on weeks it had never seen.',
    result: '130+ practice weeks played, most ideas rejected',
  },
]

export function Lessons() {
  return (
    <section id="lessons" className="sec">
      <div className="wrap">
        <Intro no="05" label="Lessons" title="Three things the data taught me" sub="in one weekend." />
        <div className="lessons rv">
          {LESSONS.map((l) => (
            <article key={l.label}>
              <span className="mono">{l.label}</span>
              <h3>{l.title}</h3>
              <p>{l.body}</p>
              <span className="res">
                <i />
                {l.result}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- experience

type Job = { when: string; firm: string; role: string; line: string; points: ReactNode[] }

const JOBS: Job[] = [
  {
    when: 'Aug to Oct 2026',
    firm: 'London Strategic Edge',
    role: 'Quantitative Researcher Intern',
    line: 'Wrote a research paper on how market makers should price hard risk limits.',
    points: [
      'Modelled quoted spreads under risk and capital limits as constrained optimisation, solved with the KKT conditions.',
      'Extended the model to options, giving delta, gamma and vega limits their own shadow prices.',
      'Separated what is established in the literature from my own claims, and flagged the working papers as working papers.',
    ],
  },
  {
    when: 'Jul to Aug 2026',
    firm: 'Exactimo',
    role: 'Finance and AI Intern',
    line: 'Co-designed the exercises for a Finance and AI bootcamp.',
    points: [
      'Designed and wrote a market-sizing AI agent with five gated stages and a mandatory self-attack step.',
      'Added put pricing to a pure-Python Monte Carlo option pricer, with put-call parity matching to four decimal places.',
      'Researched how AI is changing finance, then co-designed exercises where students write the method themselves from a blank file.',
      <>
        Exactimo's founder wrote about the internship on the{' '}
        <a href="https://www.lse.ac.uk/statistics/the-measure-of-it-blog/what-is-the-role-of-humans-in-an-ai-world" target="_blank" rel="noopener">
          LSE Department of Statistics blog
        </a>
        .
      </>,
    ],
  },
  {
    when: 'Jul 2025',
    firm: 'Cazenove Capital',
    role: 'Work Insight Week · Schroders Group',
    line: "First place in a trading simulation, and a presentation on gold's place in a client portfolio.",
    points: [
      'Placed 1st as a team in a trading simulation run over quarterly market scenarios, using Sharpe ratios to weigh each decision.',
      'Presented on whether gold still belonged in a client portfolio after a 26% run against 0.8% for global equities.',
    ],
  },
  {
    when: 'Jul 2024',
    firm: 'BlackRock',
    role: 'Technology Intern, Aladdin',
    line: 'First of 8 teams in a Bloomberg trading simulation: a 60% return on £10,000.',
    points: [
      'Our team turned £10,000 into £16,000. Second place made £1,600.',
      'Built Python tools using Sharpe ratios to track rate moves for a portfolio challenge.',
      'Adjusted cash, equity, treasury and commodity exposures as volatility shifted.',
      'Invited back in 2025 to speak on a panel for the next intern cohort.',
    ],
  },
  {
    when: 'Jul 2024',
    firm: 'PGIM',
    role: 'Inspire Work Insight Week',
    line: 'First of 30+ in a trading simulation, and led the team that won the product pitch.',
    points: [
      'Ranked 1st of 30+ in the AmplifyMe trading simulation.',
      'Led the team that designed and pitched Harmony Hub, a productivity app for shift workers, and won the challenge.',
    ],
  },
  {
    when: 'Jul to Aug 2023',
    firm: 'BP',
    role: 'Data Science Intern, DA3S Squad',
    line: 'Automated data extraction in Python and worked with models that predict fuel prices.',
    points: [
      'Wrote Python scripts in Pandas to automate data extraction from text files and structured databases.',
      'Applied machine learning models to hydrocarbon price prediction and visualised the data in Power BI and Azure.',
    ],
  },
  {
    when: '2024 to now',
    firm: 'Teaching',
    role: 'Private tutor · InvestIN facilitator',
    line: 'Tutored 10 to 12 students for A-level Maths, Further Maths and university admissions tests.',
    points: [
      'One-to-one preparation for the MAT and TMUA, the same admissions tests I sat.',
      "Taught sessions on front-end, back-end, robotics and AI to school students on InvestIN's Young Computer Scientist programme in summer 2026.",
    ],
  },
]

const INSIGHTS = ['UBS', 'SIG', 'PIMCO', 'Schroders', 'McKinsey', 'Bloomberg', 'Bank of England', 'Aon']

export function Experience() {
  return (
    <section id="experience" className="sec">
      <div className="wrap">
        <Intro no="03" label="Experience" title="Where I've worked," sub="and what I did there." />
        <div className="xp rv">
          {JOBS.map((job, i) => (
            <details key={job.firm} open={i === 0}>
              <summary>
                <time>{job.when}</time>
                <span className="xp-firm">
                  {job.firm}
                  <small>{job.role}</small>
                </span>
                <span className="xp-line">{job.line}</span>
              </summary>
              <div className="xp-body">
                <ul>
                  {job.points.map((point, j) => (
                    <li key={j}>{point}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
        <div className="chips rv">
          <span className="mono">Insight programmes</span>
          {INSIGHTS.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- achievements

/** Junction 2026 gets its own block above the table: two challenges at the same event. */
const JUNCTION = [
  {
    label: 'First challenge',
    big: (
      <>
        3rd <small>place</small>
      </>
    ),
    name: "MariaDB's Wikipedia Through Time challenge",
    text: 'Our team brought back 381,459 sentences that Wikipedia had deleted. I led the analysis and the pitch.',
    href: '#ghosts',
  },
  {
    label: 'Second challenge',
    big: 'Top 10%',
    name: 'Bahn Express Spread challenge',
    text: 'A simulated car-delivery company to run for a week. I designed the pricing model and priced it like a market maker.',
    href: '#spread',
  },
]

const RESULTS: { year: string; name: string; detail: string; result: string; estimathon?: boolean }[] = [
  { year: '2026', name: 'Global Market Making Games', detail: 'LSE qualifier, Estimathon round', result: '1st of 100+', estimathon: true },
  { year: '2026', name: 'IMC Prosperity', detail: 'Algorithmic trading competition', result: 'Top 5% of about 13,000' },
  { year: '2026', name: 'AI Chessathon', detail: 'Chess engine', result: 'Top 10%' },
  { year: '2026', name: 'UCL Poker Night', detail: 'UNICEF fundraiser', result: 'Final table, top 5 of 150+' },
  { year: '2025', name: 'LSE open', detail: 'Sponsored by Susquehanna', result: 'Final table, top 5 of 100+' },
  { year: '2025', name: 'Cazenove Capital', detail: 'Trading simulation', result: '1st place' },
  { year: '2024', name: 'Bloomberg trading simulation', detail: 'With BlackRock', result: '1st of 8 teams' },
  { year: '2024', name: 'PGIM AmplifyMe', detail: 'Trading simulation', result: '1st of 30+' },
  { year: '2024', name: 'A-levels', detail: 'Maths 95%, Further Maths 91% self-taught, Physics', result: 'A* A* A' },
  { year: '2023', name: 'UKMT Senior Maths Challenge', detail: 'Gold, then Senior Kangaroo Merit', result: 'Top 800 of 110,000' },
  { year: '2023', name: 'Royal Institution', detail: 'Public talk on AI and physical work', result: 'Selected from 50' },
]

const TIMELINE: { year: string; items: string[]; now?: boolean }[] = [
  { year: '2022', items: ['GCSEs: four 9s and four 8s'] },
  { year: '2023', items: ['Data science internship at BP', 'UKMT Gold, then Senior Kangaroo Merit', 'Royal Institution talk on AI'] },
  { year: '2024', items: ['A* A* A, Further Maths self-taught', 'BlackRock: 1st of 8 in a Bloomberg simulation', 'Started Data Science at LSE'] },
  { year: '2025', items: ['Cazenove: 1st in a trading simulation', 'First poker final table', 'Head of Sewa, LSE Hindu Society'] },
  { year: '2026', now: true, items: ['IMC Prosperity: top 5%', 'Exactimo, then London Strategic Edge', 'Estimathon: 1st of 100+', 'Junction: 3rd place in one challenge, top 10% in another'] },
  { year: '2027', items: ['Graduating from LSE', 'Open to internships and graduate roles'] },
]

export function Achievements() {
  const [open, setOpen] = useState(false)
  return (
    <section id="achievements" className="sec">
      <div className="wrap">
        <Intro no="02" label="Achievements" title="Competitions and results," sub="with the denominators." />

        <article className="feature rv">
          <div className="ch-meta mono">
            <b>Junction 2026</b>
            <span>Espoo, Finland · Nov 2026 · 48 hours</span>
          </div>
          <h3>
            Europe's largest hackathon. <em>2,000+ participants.</em>
          </h3>
          <div className="feature-results">
            {JUNCTION.map((j) => (
              <div key={j.name}>
                <span className="mono">{j.label}</span>
                <b>{j.big}</b>
                <strong>{j.name}</strong>
                <p>{j.text}</p>
                <a href={j.href}>See the project →</a>
              </div>
            ))}
          </div>
        </article>

        <div className="sb rv">
          {RESULTS.map((r) => (
            <div className="sb-row" key={r.name + r.detail}>
              <time>{r.year}</time>
              <b>
                {r.name}
                <small>{r.detail}</small>
              </b>
              <strong>{r.result}</strong>
              {r.estimathon ? (
                <button className="btn" type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                  {open ? 'Close' : 'Try a round'}
                </button>
              ) : (
                <span />
              )}
              {r.estimathon && open && <Mounted className="try" mount={mountEstimathon} />}
            </div>
          ))}
        </div>

        <h3 className="sub rv">Year by year</h3>
        <div className="tl rv" aria-label="Timeline">
          {TIMELINE.map((t) => (
            <div key={t.year} className={t.now ? 'now' : undefined}>
              <b>{t.year}</b>
              <ul>
                {t.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- about

const FACTS = [
  ['A*', "Further Maths, self-taught at a school that didn't offer it"],
  ['5', 'languages: English, Gujarati, Hindi, French, Spanish'],
  ['10 to 12', 'students tutored for A-level Maths and admissions tests'],
  ['£800', 'raised for the NHS by running a half-marathon'],
  ['3rd XI', 'LSE cricket, and table tennis for the 2nd team'],
  ['2', 'poker final tables: top 5 of 100+ and top 5 of 150+'],
]

const SOCIETIES = [
  'Head of Data, LSE Valuations Society',
  'Head of Sewa (charity), LSE Hindu Society',
  'Events Officer, 93% Club',
  'LSE Quant Society',
  'LSE AI Society',
]

export function About() {
  return (
    <section id="about" className="sec">
      <div className="wrap">
        <div className="about-grid">
          <div className="about-text rv">
            <span className="mono">
              <b>01</b> &nbsp;About
            </span>
            <h2 className="big">
              I think in distributions, <em>not point estimates.</em>
            </h2>
            <p>
              I study <strong>BSc Data Science at LSE</strong>, a course that takes 4.3% of applicants, and I'm
              predicted First Class Honours.
            </p>
            <p>
              My school didn't offer Further Maths, so <strong>I taught it to myself</strong> and got an A*.
            </p>
            <p className="why">"Do I actually have an edge, or am I just lucky?"</p>
            <p>
              That is the question behind my poker project, and it is the one a trading desk asks of every strategy.
              I like problems where you have to act before you have all the information: pricing a trade, sizing a
              bet, deciding whether a result is real.
            </p>
            <p>Away from a screen it's club cricket and table tennis.</p>
            <div className="chips">
              {SOCIETIES.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
          {/* Beside the text on a laptop, under it on a phone: quick facts, then where he studied. */}
          <div className="about-side">
            <div className="glance rv">
              {FACTS.map(([big, text]) => (
                <div key={text}>
                  <b>{big}</b>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="edu rv">
              <article>
                <span className="mono">2024 to 2027</span>
                <h3>London School of Economics</h3>
                <p>
                  BSc Data Science. Stochastic Processes, Probability and Distribution Theory, Bayesian Inference,
                  Machine Learning, Partial Differential Equations, Algorithms and Data Structures.
                </p>
              </article>
              <article>
                <span className="mono">2022 to 2024</span>
                <h3>Reach Academy Feltham</h3>
                <p>
                  A-levels: Mathematics A* (95%), Further Mathematics A* (91%, self-taught), Physics A. MAT 70,
                  TMUA 6.5.
                </p>
              </article>
            </div>
          </div>
        </div>

        <div className="quotes rv">
          <figure className="quote">
            <p>
              "Aarin showed great curiosity by always asking questions to learn about the details. He rapidly
              powered through online Python courses, impressively showing the rate at which he can learn."
            </p>
            <footer>
              Ruairi Dunne
              <small>Senior Data Scientist at BP · managed Aarin directly</small>
            </footer>
          </figure>
          <figure className="quote">
            <p>
              "Aarin is among the most intelligent people I know, particularly when it comes to math. He is
              extremely dedicated and disciplined when it comes to his work."
            </p>
            <footer>
              Sam Kaushal
              <small>UCL Statistics, Economics and Finance · studied together</small>
            </footer>
          </figure>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------- contact

export function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    const done = () => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    }
    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(done, done)
    else done()
  }
  return (
    <section id="contact" className="contact scene">
      {/* A photo fills the space behind the words. It is decoration, so screen readers skip it. */}
      <img className="scene-photo" src="/scene-talk.jpg" alt="" width="1418" height="1066" loading="lazy" />
      <div className="wrap rv">
        <span className="mono">
          <b>06</b> &nbsp;Contact
        </span>
        <h2>
          Let's <em>talk.</em>
        </h2>
        <p>
          Hiring for trading, quant research or data roles in 2027? Or building something interesting? I'd like to
          hear from you.
        </p>
        <div className="cta">
          <button className="btn pri" type="button" onClick={copy}>
            {copied ? `Copied: ${EMAIL}` : 'Copy email'}
          </button>
          <a className="btn" href="https://linkedin.com/in/aarin-bhatt" target="_blank" rel="noopener">
            LinkedIn
          </a>
          <a className="btn" href="https://github.com/Aanu30" target="_blank" rel="noopener">
            GitHub
          </a>
          <a className="btn" href={`mailto:${EMAIL}?subject=CV%20request`}>
            Request my CV
          </a>
        </div>
      </div>
    </section>
  )
}

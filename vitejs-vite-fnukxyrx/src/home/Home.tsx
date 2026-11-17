import { useTitle } from '../lib/hooks'
import Hero from './Hero'
import { About, Achievements, Contact, Experience, Lessons } from './Sections'
import Work from './Work'

const HEADLINES = [
  { big: <>1st <small>of 100+</small></>, text: 'Estimathon round, Global Market Making Games 2026' },
  { big: 'Top 5%', text: 'of about 13,000 in IMC Prosperity, an algorithmic trading competition' },
  { big: <>3rd <small>place</small></>, text: "and top 10%, in two challenges at Junction 2026, Europe's largest hackathon (2,000+ participants)." },
  { big: <>3 <small>for</small> 3</>, text: 'first places in trading simulations: Bloomberg, PGIM AmplifyMe, Cazenove' },
]

const FIRMS = ['BlackRock', 'BP', 'Cazenove Capital', 'Schroders', 'PGIM', 'UBS', 'SIG', 'PIMCO', 'Bank of England']

export default function Home() {
  useTitle('Aarin Bhatt · Quant trading and research')
  return (
    <>
      <Hero />
      <section className="proof" aria-label="Headline results">
        <div className="wrap">
          <ul className="proof-grid">
            {HEADLINES.map((h) => (
              <li className="rv" key={h.text}>
                <b>{h.big}</b>
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
          <div className="firms">
            <span className="mono">Experience and insight weeks</span>
            {/* The names drift past in a loop. The list is repeated so the loop has no gap;
                only the first copy is read out by screen readers. */}
            <div className="marquee">
              <div className="marquee-track">
                {[0, 1, 2, 3].map((copy) => (
                  <ul key={copy} aria-hidden={copy > 0}>
                    {FIRMS.map((firm) => (
                      <li key={firm}>{firm}</li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Who he is and what he has achieved come first; the projects follow. */}
      <About />
      <Achievements />
      <Experience />
      <Work />
      <Lessons />
      <Contact />
    </>
  )
}

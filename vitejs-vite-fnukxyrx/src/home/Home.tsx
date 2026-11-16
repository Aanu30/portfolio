import { useTitle } from '../lib/hooks'
import Hero from './Hero'
import { About, Contact, Experience, Lessons, Scoreboard } from './Sections'
import Work from './Work'

const HEADLINES = [
  { big: <>1st <small>of 100+</small></>, text: 'Estimathon round, Global Market Making Games 2026' },
  { big: 'Top 5%', text: 'of about 13,000 in IMC Prosperity, an algorithmic trading competition' },
  { big: <>3rd <small>place</small></>, text: "in MariaDB's track at Junction 2026. Also top 11% of 228 teams in the Spread challenge." },
  { big: <>3 <small>for</small> 3</>, text: 'first places in trading simulations: Bloomberg, PGIM AmplifyMe, Cazenove' },
]

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
          <p className="firms">
            <span className="mono">Experience and insight weeks</span>
            BlackRock · BP · Cazenove Capital · Schroders · PGIM · UBS · SIG · PIMCO · Bank of England
          </p>
        </div>
      </section>
      <Work />
      <Lessons />
      <Experience />
      <Scoreboard />
      <About />
      <Contact />
    </>
  )
}

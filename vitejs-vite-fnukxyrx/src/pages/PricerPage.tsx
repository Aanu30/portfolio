import Demo from '../components/Demo'
import { mountPricer } from '../demos/more'
import { Page, Section } from './Shell'

const RULES = [
  ['Rule 1', 'No numbers at all in the first stage. It has to understand the market before it counts anything.'],
  ['Rule 2', 'Never a single figure. Every estimate is a range.'],
  ['Rule 3', 'Every figure is labelled high, medium or low confidence, and marked as cited or inferred.'],
  ['Rule 4', 'No more precision than the weakest input supports.'],
  ['Rule 5', 'One stage is spent attacking its own estimate.'],
  ['Rule 6', 'No unnamed sources.'],
]

export default function PricerPage() {
  return (
    <Page
      title="Exactimo: a Finance and AI bootcamp"
      meta={['06', 'Jul to Aug 2026', 'Exactimo', 'Finance and AI Intern']}
      heading="Pricing an option with 10,000"
      sub="imagined futures."
      plain="At Exactimo I helped design a bootcamp on how AI is changing finance. Students learn by building: they write each method themselves, starting from a blank file. I co-designed two of the exercises with the founder."
      quant="Pure-Python Monte Carlo pricer under GBM: I added put pricing and a put-call parity check matching to 4 d.p. Designed and wrote a five-stage LLM market-sizing agent with gated stages, confidence labels and a mandatory self-attack step."
      stats={[
        { big: '2', text: 'exercises co-designed: an option pricer and a market-sizing AI agent' },
        { big: '4 d.p.', text: 'agreement between the two sides of the put-call parity check I added' },
        { big: '5', text: 'gated stages in the agent, one per reply, that it cannot skip' },
        { big: 'LSE', text: 'Department of Statistics blog wrote up the internship' },
      ]}
      next={{ to: '/chess', label: 'A chess engine that knows what not to think about' }}
    >
      <Section
        no="01"
        label="The option pricer"
        title="Simulate the future thousands of times, then average."
        wide={<Demo title="price an option by simulation" note="share at 100, one year, 20% volatility" mount={mountPricer} />}
      >
        <p>
          An option is the right to buy a share later at a price fixed today. What is that right worth? One way to
          find out: simulate thousands of possible futures for the share price, see what the option pays in each
          one, and average.
        </p>
        <p>
          The exercise builds that pricer from first principles in plain Python and checks it against the textbook
          formula. <strong>My additions were the other half:</strong> pricing the matching put option, which is the
          right to sell, and a check that the two prices agree the way theory says they must.
        </p>
      </Section>

      <Section no="02" label="What to notice" title="The error bar is the point.">
        <p>
          Run it a few times. The price jumps around, because it depends on which futures happened to be drawn. The
          size of the error bar doesn't: it halves every time you use four times as many simulations.
        </p>
        <p>One is luck and the other is a property of the method. That is why a simulated price always needs an error bar next to it.</p>
      </Section>

      <Section
        no="03"
        label="The agent"
        title="An AI that isn't allowed to guess."
        wide={
          <ul className="steps5 rv" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
            {RULES.map(([name, rule]) => (
              <li key={name}>
                <b>{name}</b>
                {rule}
              </li>
            ))}
          </ul>
        }
      >
        <p>
          The second exercise is an AI agent for sizing a market: working out how big the demand for something
          really is. Left alone, a language model will happily produce one confident number.
        </p>
        <p>
          I designed and wrote this one to work in five stages, one per reply, with rules it must not break even if
          the user pushes it to hurry.
        </p>
      </Section>

      <Section no="04" label="The principle" title="Doing over reading.">
        <p>
          You can read a method and follow along, but you don't learn it until you have written it yourself and
          found the place where it breaks. So nobody on the course is handed a prompt to paste in. They get a blank
          file.
        </p>
        <p>
          <a href="https://www.lse.ac.uk/statistics/the-measure-of-it-blog/what-is-the-role-of-humans-in-an-ai-world" target="_blank" rel="noopener">
            Exactimo's founder wrote about the internship on the LSE Department of Statistics blog.
          </a>
        </p>
      </Section>
    </Page>
  )
}

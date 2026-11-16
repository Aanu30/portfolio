import Demo from '../components/Demo'
import { mountDealer } from '../demos/dealer'
import { mountInformed, mountShared } from '../demos/paperSteps'
import { Page, Section } from './Shell'

export default function PaperPage() {
  return (
    <Page
      title="Market Making Optimisation Theories"
      meta={['02', 'Sep to Nov 2026', 'Working paper, not peer reviewed', 'Written at London Strategic Edge']}
      heading="A dealer's prices should hold steady,"
      sub="then jump."
      plain="A market maker is like a currency exchange booth: it buys at one price, sells at a slightly higher one, and keeps the gap. That gap has to cover the risk of holding what it has bought. Textbook models charge for the risk a little at a time. Real trading desks work to hard limits. My paper puts a price on the limit itself: nothing changes while there is room, and prices move sharply as the room runs out."
      quant="One-period quoting model with fill intensity λ(δ) = A·e^(−kδ). The optimal half-spread is δ* = m + 1/k, marginal cost plus the inverse semi-elasticity. A budget on expected post-fill variance enters through its multiplier, δ* = 1/k + c + μ*ρ. By complementary slackness μ* = 0 while the budget is slack and diverges as it becomes unattainable. A soft penalty is the same Lagrangian with the multiplier frozen. The model nests Avellaneda-Stoikov as γ → 0 and states a shared-budget prediction as a regression test."
      stats={[
        { big: '16', text: 'pages: Market Making Optimisation Theories, What Duality Buys the Dealer' },
        { big: '6', text: 'propositions, each with a proof' },
        { big: '37', text: 'references, from Garman (1976) to current working papers' },
        { big: '1', text: "prediction the standard model doesn't make, stated as a test the paper has not run" },
      ]}
      next={{ to: '/ghosts', label: 'Ghosts of Wikipedia' }}
    >
      <Section
        no="01"
        label="Step one"
        title="Why there is a gap at all: some people know more than you."
        wide={<Demo title="set how many traders know more" note="the classic two-value example" mount={mountInformed} />}
      >
        <p className="plain">
          A market maker quotes two prices: one to buy at and one to sell at. Suppose a share is worth either 110 or
          90, and you don't know which. Some of the people trading with you do. They buy from you when it is worth
          110 and sell to you when it is worth 90, so you lose to them every time.
        </p>
        <p className="plain">The gap between your two prices is how you earn that back from everyone else.</p>
        <p className="quant">
          Glosten and Milgrom (1985): the ask is the expected value given the next trade is a buy, the bid the
          expected value given a sell. With V ∈ {'{'}110, 90{'}'} equally likely and a share π of informed traders,
          ask = 100 + 10π and bid = 100 − 10π. A risk-neutral dealer with no inventory and zero expected profit
          still quotes a spread of 20π.
        </p>
      </Section>

      <Section no="02" label="Step two" title="Charge your cost, plus a markup.">
        <p>
          Widen your prices and each trade earns more, but fewer people trade. The best gap is your cost per trade
          plus a markup, and the markup depends on one thing only: how quickly customers walk away as you widen.
        </p>
        <p className="formula">
          best gap = cost per trade + 1 ÷ k
          <small>
            k measures how fast orders dry up as the gap widens. Every cost the desk faces goes into the first term
            and simply adds up: being picked off by better-informed traders, fees, and the price of any limit that is
            biting.
          </small>
        </p>
        <p className="quant">
          For fill intensity λ(δ) = A·e^(−kδ), expected profit (δ − m)·λ(δ) peaks at δ* = m + 1/k. As risk aversion
          γ → 0 the Avellaneda-Stoikov total spread tends to 2/k, which is two sides of this markup with m = 0. The
          standard result is nested, not contradicted.
        </p>
      </Section>

      <Section
        no="03"
        label="Step three"
        title="A limit costs nothing until it bites."
        wide={<Demo title="be the dealer" note="curves computed from the paper's model" mount={mountDealer} />}
      >
        <p>
          Textbook models charge the dealer for risk on every unit it holds, a little at a time. A real desk has a
          limit instead. My paper works out the price of that limit: zero while there is room, then rising steeply
          as the room runs out.
        </p>
        <p>So prices should sit still, then jump. Drag the slider and compare the two models.</p>
      </Section>

      <Section no="04" label="Step four" title="The textbook charge is a frozen version of the same thing.">
        <p>
          The two approaches turn out to be one family. A fixed charge for risk sets the price of risk and lets the
          amount held vary. A limit sets the amount and lets the price vary.
        </p>
        <p>
          In my model the price of the limit is something the maths produces. It moves with how volatile the market
          is, and with how much of the limit the rest of the book has already used.
        </p>
        <p className="quant">
          Proposition 5: maximising Π − γ̃G solves the constrained problem for the budget R = G(ℓ^γ̃), and its quotes
          obey the same rule with μ* replaced by γ̃. The penalty is a Lagrangian with the multiplier frozen at a
          calibrated value.
        </p>
      </Section>

      <Section
        no="05"
        label="Step five"
        title="The prediction: two unrelated products should widen together."
        wide={<Demo title="fill up on one product, watch the other" note="curves computed from the paper's model" mount={mountShared} />}
      >
        <p>
          This is the part that can be checked against real data. If two products share one risk limit, filling up
          on the first should widen prices on the second, even though nothing about the second has changed. The
          textbook model says that never happens.
        </p>
        <p className="callout">
          <b>The paper states this as a test and does not run it.</b> Running it needs a trading desk's own records
          of its quotes and holdings, which I don't have.
        </p>
      </Section>

      <Section no="06" label="Honesty" title="What is established, and what is my claim.">
        <p>
          The building blocks are textbook: optimisation under constraints, the idea that a binding limit has a
          price, and the classic market-making models. What I could not find in the papers I checked is the reading
          itself: treating a desk's limits as constraints whose prices mechanically move its quotes, and the
          shared-limit prediction that follows.
        </p>
        <p>
          The model covers a single period. Whether the result survives in a full model that runs through time is
          left open, and the paper says so. It is a working paper and has not been peer reviewed.
        </p>
        <details className="callout" style={{ marginTop: 18 }}>
          <summary style={{ cursor: 'pointer', color: 'var(--ink)' }}>Read the abstract</summary>
          <p style={{ marginTop: 12, fontSize: 15 }}>
            Market making is usually formalised as stochastic optimal control in which inventory risk enters the
            objective as a penalty. Desks, however, manage inventory with limits. This paper treats the dealer's
            quoting problem as a constrained optimisation problem and asks what duality adds. In a one-period model
            with exponentially decaying fill intensity, the optimal half-spread is marginal cost plus the reciprocal
            of the semi-elasticity of the fill rate, and every cost enters the marginal cost additively. A budget on
            expected post-fill risk is a convex constraint in fill intensities; its multiplier is the internal price
            of risk capacity and enters the quote through the marginal budget consumption of the fill. The
            multiplier is zero while the budget is slack and diverges as the budget becomes unattainable, so spreads
            are flat in the interior and steep near the limit. A soft inventory penalty is the same Lagrangian with
            the multiplier frozen at a constant. For instruments with independent fundamentals the penalty model
            separates across instruments, whereas a shared budget makes their quotes comove once it binds. The paper
            states this prediction as a regression test but does not perform it.
          </p>
        </details>
        <p style={{ marginTop: 22 }}>
          <a className="btn pri" href="mailto:a.n.bhatt@lse.ac.uk?subject=Market%20making%20paper" style={{ border: 0 }}>
            Request the PDF
          </a>
        </p>
      </Section>
    </Page>
  )
}

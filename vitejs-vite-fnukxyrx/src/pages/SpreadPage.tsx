import Demo from '../components/Demo'
import { mountSpreadWeek } from '../demos/spreadWeek'
import { Bars, Page, Section } from './Shell'

// Margin shown on the console at the start of each simulated day of the live final.
const FINAL = [0, 71, 2247, 4601, 9765, 14121, 15142, 15142, 17160, 17130]
const FINAL_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'End']

function FinalChart() {
  const W = 1100
  const H = 280
  const m = { l: 62, r: 20, t: 18, b: 32 }
  const x = (i: number) => m.l + (i / (FINAL.length - 1)) * (W - m.l - m.r)
  const y = (v: number) => H - m.b - (v / 18000) * (H - m.t - m.b)
  const line = FINAL.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('')
  return (
    <div className="chart rv">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Margin building up during the live final">
        {[0, 6000, 12000, 18000].map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} className={v ? 'gl' : 'gl zero'} />
            <text x={m.l - 10} y={y(v) + 3.5} textAnchor="end" className="tk">
              €{v.toLocaleString('en-GB')}
            </text>
          </g>
        ))}
        {FINAL_LABELS.map((label, i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor="middle" className="tk">
            {label}
          </text>
        ))}
        <path d={`${line}L${x(FINAL.length - 1)} ${y(0)}L${x(0)} ${y(0)}Z`} fill="rgba(240,178,62,.08)" />
        <path d={line} className="ln a" />
        <circle cx={x(FINAL.length - 1)} cy={y(17130)} r="5.5" className="dot a" />
        <text x={x(FINAL.length - 1) - 12} y={y(17130) - 14} textAnchor="end" className="val">
          €17,130 at the close
        </text>
      </svg>
    </div>
  )
}

export default function SpreadPage() {
  return (
    <Page
      title="Spread: pricing car deliveries like a market maker"
      meta={['01', 'Nov 2026', "Junction 2026, Europe's largest hackathon", 'Bahn Express Spread challenge']}
      heading="I ran a delivery company for a week."
      sub="I priced it like a market maker."
      plain="Bahn Express set the challenge. Car dealers ask you for a price to move a car, a rival you can't see quotes too, and every job you win needs a freelance driver. Deliver fewer than 90% on time and your week doesn't count. I designed the pricing model and the testing rules, and directed a team of AI coding agents that wrote the code."
      quant="Each request is priced at p* = c / (1 − πr) + P / |P′|: expected cost plus an elasticity markup, with a shadow price μ(u) on driver capacity that is zero below 60% utilisation and pulls the quote at 97%. Acceptance is logistic in log price and learned online with Bayesian shrinkage by dealer, region and day. Every change was tested on paired seeds against a pre-set keep rule of two standard errors."
      stats={[
        { big: 'Top 10%', text: 'of 228 teams. 170 missed the on-time rule or placed no orders.' },
        { big: '€17,130', text: 'margin in the live final, from 463 cars won' },
        { big: '94.4%', text: 'delivered on time, over 34 minutes unattended with zero faults' },
        { big: '130+', text: 'simulated practice weeks played to test ideas, most of which were rejected' },
      ]}
      next={{ to: '/paper', label: 'The paper behind the pricing rule' }}
    >
      <Section no="01" label="The challenge" title="One simulated week, and two things you can't see.">
        <p>
          Spread simulates a week at Bahn Express, a Finnish car-delivery company. Dealers ask for a price to move a
          car. A competitor you never see quotes too, and the dealer takes the better offer. Every car you win has to
          be handed to a freelance driver, at a fee you set.
        </p>
        <ul>
          <li>
            <strong>Two hidden things.</strong> You never see the rival's price, or the lowest fee a driver would
            accept. You only see your own wins, losses and bookings.
          </li>
          <li>
            <strong>A hard floor.</strong> Finish the week with fewer than 90% of cars on time and you are not ranked
            at all.
          </li>
          <li>
            <strong>Too few drivers.</strong> A town can run nearly dry, so winning every car is a mistake: each one
            takes a driver from another.
          </li>
          <li>
            <strong>A live clock.</strong> In the final, one hour passed every 18 seconds. Each quote had 4.5 seconds.
          </li>
        </ul>
      </Section>

      <Section
        no="02"
        label="The idea"
        title="A delivery firm is a market maker."
        wide={
          <div className="tbl-wrap rv">
            <table className="tbl">
              <thead>
                <tr>
                  <th>In my paper, a dealer making markets</th>
                  <th>In Spread, a delivery firm</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>The gap quoted above the market price</td>
                  <td>The price quoted against the rival's level</td>
                </tr>
                <tr>
                  <td>How fast orders dry up as the gap widens</td>
                  <td>The chance a dealer says yes at each price</td>
                </tr>
                <tr>
                  <td>A risk limit that costs nothing while there is room</td>
                  <td>A town's drivers: free to use until 60% are promised</td>
                </tr>
                <tr>
                  <td>The quote is withdrawn at the limit</td>
                  <td>No real quote once 97% of drivers are promised</td>
                </tr>
                <tr>
                  <td>A shared limit moves prices together</td>
                  <td>Every route out of a short town gets dearer together</td>
                </tr>
              </tbody>
            </table>
          </div>
        }
      >
        <p>
          I had just written a paper on how market makers set prices when they work to hard limits, and this
          challenge had the same shape. The dealer is the customer. The rival's price is the market price. Drivers
          are the stock that runs out.
        </p>
        <p>
          So one rule priced every request: charge what the job costs, add a markup that depends on how quickly
          dealers walk away, and add a charge for using up scarce drivers.
        </p>
        <p className="formula">
          price = cost ÷ (1 − π·r) + P ÷ |P′|
          <small>
            Cost is the expected driver fee, plus the risk of a late delivery, plus the charge for scarce drivers. π
            is the chance the car is late and r the share of the price refunded if it is. P is the chance the dealer
            says yes.
          </small>
        </p>
      </Section>

      <Section
        no="03"
        label="Play it"
        title="Run the desk for a day."
        wide={<Demo title="ten requests, seven drivers" note="a simplified day, not the real simulator" mount={mountSpreadWeek} />}
      >
        <p>
          Price each job, or pass. When you finish, my pricing rule plays exactly the same day, so the two results
          can be compared fairly.
        </p>
        <p>The thing to watch: once most of your drivers are booked, every extra car is likely to arrive late.</p>
      </Section>

      <Section
        no="04"
        label="What worked"
        title="Three findings carried the result."
        wide={
          <Bars
            rows={[
              { label: 'Counting drivers beyond the 30 km circle', value: '+€2,448 a week', share: 1 },
              { label: 'Sending two cars in one job', value: '+€1,641 a week', share: 0.67 },
              { label: "A brake when today's drivers are used up", value: '+€359 a week', share: 0.147 },
            ]}
          />
        }
      >
        <p>
          Each one was measured the same way: play the same simulated weeks twice, with the change and without, and
          keep it only if the gain was clearly more than chance and no week fell near the 90% line.
        </p>
        <p>
          Most ideas failed that test, including some I liked. A discount to build trust with dealers lost about €900
          a week. Offering jobs directly to drivers got 4 acceptances from 666 offers. A fee schedule that raised
          fees over time lost about €9,000 a week, because drivers learn to wait for the raise.
        </p>
      </Section>

      <Section
        no="05"
        label="The numbers"
        title="From the starter kit to the live final."
        wide={
          <>
            <div className="tbl-wrap rv">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Who was pricing</th>
                    <th className="r">Margin per week</th>
                    <th className="r">On time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>The starter bot that came with the kit</td>
                    <td className="r">−€72,613</td>
                    <td className="r">45.5%</td>
                  </tr>
                  <tr>
                    <td>The organisers' own system, in practice weeks</td>
                    <td className="r">about €12,850</td>
                    <td className="r">96.7%</td>
                  </tr>
                  <tr>
                    <td>Our bot, across 134 practice weeks</td>
                    <td className="r">€16,183</td>
                    <td className="r">95.9%</td>
                  </tr>
                  <tr>
                    <td>Our bot, in the live final</td>
                    <td className="r">€17,130</td>
                    <td className="r">94.4%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <span className="k" style={{ margin: '40px 0 10px' }}>
              Margin during the live final, day by day
            </span>
            <FinalChart />
          </>
        }
      >
        <p>
          In practice weeks the bot beat the figure the organisers published for their own system by about 25%. The
          final then ran live for 34 minutes with nobody touching it: €45,494 of revenue, €27,242 in driver fees and
          €1,062 in late refunds.
        </p>
        <p>
          That placed us in the top 10% of 228 teams. For scale, tenth place made €19,084 and first place €22,931.
        </p>
      </Section>

      <Section no="06" label="My part" title="What I did, and what I'd do next.">
        <p className="callout">
          <b>The code was written by AI coding agents</b> (Claude Code, Codex and others) working in set roles:
          developer, reviewer, auditor and coordinator. I framed the problem, designed the pricing model and the
          testing rules, decided what to keep and what to reject, and approved every code change and every live run.
        </p>
        <p>
          If I had the weekend again I would spend the overnight hours on the driver side. The price side sits close
          to its best. But a car sent alone cost 1.08 times the typical fee, a car in a pair cost 0.76, and 37% of
          our cars still went out alone.
        </p>
        <p>
          <a href="https://github.com/Aanu30/abquant-spread" target="_blank" rel="noopener">
            The code, the test logs and the write-up are on GitHub.
          </a>
        </p>
      </Section>
    </Page>
  )
}

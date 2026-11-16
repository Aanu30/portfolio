import Demo, { Mounted } from '../components/Demo'
import { BY_GAME } from '../data/poker'
import { mountSessions } from '../demos/more'
import { mountPokerReplay } from '../demos/pokerReplay'
import { Page, Section } from './Shell'

export default function PokerPage() {
  return (
    <Page
      title="Poker: skill, or luck?"
      meta={['04', '2025 to 2026', 'Personal project', 'Python']}
      heading="36 nights of poker. Up £274.86."
      sub="Skill, or luck?"
      plain="I logged every session I played and asked the question a trading desk asks of every strategy: is this a real edge, or a good run? Three tests gave three different answers. Working out why was the interesting part."
      quant="One-sample t-test on session P&L (p = 0.23), MLE comparing normal and Student-t fits, bootstrap with B = 10,000, and a Bayesian conjugate model with prior sensitivity (88.6% posterior probability of a positive edge). The disagreement is a power problem: d = 0.202 gives 21.8% power at n = 36."
      stats={[
        { big: '£274.86', text: 'net profit over 36 logged sessions' },
        { big: '55.6%', text: 'of sessions finished ahead' },
        { big: '89%', text: 'chance the edge is real, on the Bayesian estimate' },
        { big: '159', text: 'more sessions needed before a classic test could confirm it' },
      ]}
      next={{ to: '/prosperity', label: 'IMC Prosperity: a bot in the top 5%' }}
    >
      <Section
        no="01"
        label="The question"
        title="Am I actually good at this, or have I just been lucky?"
        wide={
          <>
            <span className="k rv" style={{ marginBottom: 10 }}>
              Every session: profit above the line, loss below
            </span>
            <Mounted className="rv" mount={mountSessions} />
          </>
        }
      >
        <p>
          I started playing seriously in 2025 and logged the result of every session: first in a spreadsheet, then
          properly. After 36 sessions I was up £274.86.
        </p>
        <p>
          That could mean I have an edge. It could also be a lucky run that turns tomorrow. Those two stories look
          the same on a bank statement, and they need different tools to tell apart.
        </p>
      </Section>

      <Section
        no="02"
        label="Play it"
        title="Replay the same 36 nights."
        wide={<Demo title="replay my 36 nights" note="my real session results" mount={mountPokerReplay} />}
      >
        <p>
          One way to ask whether a result is luck: shuffle it. Draw 36 nights at random from the ones I really
          played and add them up, then do it again thousands of times. If I had no edge, about half of those
          replays would lose money.
        </p>
      </Section>

      <Section
        no="03"
        label="Four methods"
        title="One small sample, four answers."
        wide={
          <div className="tbl-wrap rv">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>What it asks</th>
                  <th>What it said</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Significance test</td>
                  <td>If I had no edge, how often would I see a run this good?</td>
                  <td>About 1 time in 4 (p = 0.23). Not proven.</td>
                </tr>
                <tr>
                  <td>Fitting the shape</td>
                  <td>Do my results follow a bell curve, or something with fatter tails?</td>
                  <td>Fatter tails fit better: poker has rare huge wins and losses.</td>
                </tr>
                <tr>
                  <td>10,000 replays</td>
                  <td>If I redraw the same nights, how often do I come out ahead?</td>
                  <td>88.6% of the time.</td>
                </tr>
                <tr>
                  <td>Bayesian estimate</td>
                  <td>Given the results, how likely is it that my edge is above zero?</td>
                  <td>88.6%, and it barely moves when the starting assumption changes.</td>
                </tr>
              </tbody>
            </table>
          </div>
        }
      >
        <p>
          The methods seem to disagree: one says "not proven" and two say "probably real". They are answering
          slightly different questions, and with only 36 sessions there is room for both to be right.
        </p>
      </Section>

      <Section
        no="04"
        label="Why they disagree"
        title="A small signal in a lot of noise."
        wide={
          <ul className="stats four rv">
            <li>
              <b>£7.64</b>
              <span>average profit per session</span>
            </li>
            <li>
              <b>£37.79</b>
              <span>typical swing either way in one session</span>
            </li>
            <li>
              <b>21.8%</b>
              <span>chance a classic test would detect an edge this size after 36 sessions</span>
            </li>
            <li>
              <b>£176.40</b>
              <span>the worst fall from a peak along the way</span>
            </li>
          </ul>
        }
      >
        <p>
          My average win is small next to how much a single night can swing. That makes a real edge hard to tell
          from luck. With 36 sessions, a classic test would spot an edge this size only about one time in five.
        </p>
        <p>It would take 159 more sessions to reach the usual 80% standard. Until then the honest answer is: probably, not certainly.</p>
      </Section>

      <Section
        no="05"
        label="By game"
        title="Where the results came from."
        wide={
          <div className="tbl-wrap rv">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Game</th>
                  <th className="r">Sessions</th>
                  <th className="r">Profit</th>
                  <th className="r">Sessions won</th>
                  <th className="r">p-value</th>
                </tr>
              </thead>
              <tbody>
                {BY_GAME.map((g) => (
                  <tr key={g.game}>
                    <td>{g.game}</td>
                    <td className="r">{g.sessions}</td>
                    <td className="r">£{g.profit.toFixed(2)}</td>
                    <td className="r">{g.winRate.toFixed(1)}%</td>
                    <td className="r">{g.p.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      >
        <p>
          The Poker Society games are where the result is strongest, but seven sessions is very little to go on.
          Games with friends are close to break-even.
        </p>
      </Section>

      <Section no="06" label="Why it matters" title="It is the question a trading desk asks every day.">
        <p>
          A strategy that made money for 36 days might be good, or might be lucky. The useful answer here is not a
          confident yes or no. It is knowing how much data it would take to find out, and not betting bigger until
          then.
        </p>
        <p>
          <a href="https://github.com/Aanu30/pokeranalysis" target="_blank" rel="noopener">
            The analysis code and the session data are on GitHub.
          </a>
        </p>
      </Section>
    </Page>
  )
}

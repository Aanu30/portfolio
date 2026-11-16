import Demo from '../components/Demo'
import { mountProsperity } from '../demos/more'
import { Page, Section } from './Shell'

export default function ProsperityPage() {
  return (
    <Page
      title="IMC Prosperity"
      meta={['05', 'Apr 2026', 'IMC Prosperity 4', 'Algorithmic trading competition']}
      heading="13,000 people built trading bots."
      sub="Mine finished in the top 5%."
      plain="A competition run by the trading firm IMC. I built a bot that quotes prices to buy and sell on a simulated exchange. One product's price followed a straight-line rule nobody had told us about. I spotted it in the charts and built the bot's prices around it."
      quant="Market-making bot with inventory management. Fair value from the order book, including a linear price equation identified from the price charts. 10+ strategies backtested with bootstrap Sharpe intervals and CSCV for overfitting."
      stats={[
        { big: 'Top 5%', text: 'of about 13,000 participants' },
        { big: '10+', text: 'strategies built and tested before choosing' },
        { big: '2', text: 'kinds of round: a bot trading on its own, and trading by hand' },
        { big: 'Python', text: 'for the bot, the backtests and the dashboard' },
      ]}
      next={{ to: '/pricer', label: 'Pricing an option with 10,000 imagined futures' }}
    >
      <Section no="01" label="What it is" title="Write a bot, let it trade, see where you rank.">
        <p>
          IMC is a trading firm, and Prosperity is its yearly competition. You write a program that trades made-up
          products against other programs on a simulated exchange. Some rounds you trade by hand instead.
        </p>
        <p>
          I built a market-making bot. It constantly offers to buy a little below what it thinks a product is worth
          and to sell a little above, and earns the gap each time both happen.
        </p>
      </Section>

      <Section
        no="02"
        label="Play it"
        title="One product followed a rule nobody mentioned."
        wide={<Demo title="find the rule under the noise" note="an illustration, not the competition data" mount={mountProsperity} />}
      >
        <p>
          A bot like that is only as good as its idea of what the product is worth. Looking at the price charts for
          one product, I noticed the price was tracking a straight line. That wasn't in the brief.
        </p>
        <p>I fitted a line to it, used that as the fair price, and built the bot's quotes around it. Try it yourself.</p>
      </Section>

      <Section no="03" label="Testing" title="Trying ten ideas without fooling myself.">
        <p>
          I went through more than ten strategies, testing each on past data before trusting it. The danger in
          testing lots of ideas is that one will look good by luck alone.
        </p>
        <p className="plain">
          So my tests reported a range for how well each strategy might do, not a single number, and checked how
          likely the best-looking one was to be a fluke.
        </p>
        <p className="quant">
          The backtesting dashboard reported Monte Carlo bootstrap confidence intervals on Sharpe, and used
          combinatorially symmetric cross-validation (López de Prado) to estimate the probability of backtest
          overfitting.
        </p>
      </Section>

      <Section no="04" label="By hand" title="The manual rounds were harder.">
        <p>
          In the rounds traded by hand, nothing could be worked out in advance. You had to spot the pattern as it
          happened and act on it straight away.
        </p>
      </Section>
    </Page>
  )
}

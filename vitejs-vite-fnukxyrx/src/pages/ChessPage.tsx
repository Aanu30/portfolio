import Demo from '../components/Demo'
import { mountChess } from '../demos/more'
import { Page, Section } from './Shell'

export default function ChessPage() {
  return (
    <Page
      title="A chess engine for AI Chessathon"
      meta={['07', '2026', 'AI Chessathon', 'Python']}
      heading="A chess engine that knows"
      sub="what not to think about."
      plain="My entry for AI Chessathon 2026 finished in the top 10%. It looks several moves ahead, and saves time by skipping any line of play that can't change its decision."
      quant="Alpha-beta search with a transposition table, quiescence search and a tapered incremental evaluation, in Python. Top 10% at AI Chessathon 2026."
      stats={[
        { big: 'Top 10%', text: 'at AI Chessathon 2026' },
        { big: 'Look ahead', text: 'searches several moves deep and skips lines that cannot matter' },
        { big: 'Remember', text: 'keeps a table of positions it has already judged' },
        { big: 'Stay calm', text: 'never stops thinking in the middle of an exchange of pieces' },
      ]}
      next={{ to: '/spread', label: 'I ran a delivery company for a week' }}
    >
      <Section no="01" label="The problem" title="There are too many games to check them all.">
        <p>
          Chess has more possible games than anyone could ever count. An engine can't look at everything, so most of
          the skill is in deciding what to ignore.
        </p>
      </Section>

      <Section
        no="02"
        label="Play it"
        title="Watch it skip the lines that can't matter."
        wide={<Demo title="step through a tiny search" note="a toy example of alpha-beta pruning" mount={mountChess} />}
      >
        <p>
          The idea is simple. If I already have a move that guarantees me a decent result, then the moment I find one
          reply that makes another move worse than that, I can stop looking at that move altogether.
        </p>
      </Section>

      <Section no="03" label="What else it does" title="Three more ways it saves time.">
        <ul>
          <li>
            <strong>It remembers.</strong> The same position can be reached by different orders of moves. The engine
            stores positions it has already judged so none is worked out twice.
          </li>
          <li>
            <strong>It finishes the fight.</strong> It won't stop thinking halfway through an exchange of pieces. It
            keeps going until the position is quiet.
          </li>
          <li>
            <strong>It adjusts as the game goes on.</strong> What makes a position good shifts gradually from opening
            to endgame, and the score is updated move by move instead of recalculated from scratch.
          </li>
        </ul>
        <p>
          <a href="https://github.com/Aanu30/aichessathon" target="_blank" rel="noopener">
            The engine's code is on GitHub.
          </a>
        </p>
      </Section>
    </Page>
  )
}

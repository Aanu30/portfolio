# aarinbhatt.com

My personal site: the work I've done in trading, quantitative research and data science, with something you can try for each project.

**Live:** [aarinbhatt.com](https://aarinbhatt.com)

## What's on it

- **An opening animation** that simulates 150 possible futures from one starting point and builds a histogram of where they end up.
- **A reading-level switch.** Every project is explained in plain English, with a "Quant" setting that swaps in the technical version.
- **Seven projects, each with a demo:**
  - Spread (Junction 2026): quote a real request from the final, then run a simplified desk for a day against the pricing rule.
  - A working paper on market making: a five-step walkthrough ending in the shared-budget prediction.
  - Ghosts of Wikipedia: how long a sentence survives on contested and uncontested topics.
  - Poker: replay 36 logged sessions to see how often they end in profit.
  - IMC Prosperity: find the straight-line rule under noisy prices.
  - An option pricer: watch a Monte Carlo estimate settle on the Black-Scholes price.
  - A chess engine: step through alpha-beta pruning on a small tree.
- A scoreboard with an Estimathon round you can play, experience, and contact details.

## Stack

- React 19, TypeScript, Vite, React Router
- No chart or UI libraries. The charts and demos are drawn directly to SVG and canvas.
- Self-hosted fonts: Geist, Geist Mono and Instrument Serif
- Deployed on Vercel

## Run locally

```bash
git clone https://github.com/Aanu30/portfolio.git
cd portfolio/vitejs-vite-fnukxyrx
npm install
npm run dev
```

`npm run build` type-checks and builds the production site into `dist/`.

## Where things are

| Path | What it holds |
| --- | --- |
| `src/home/` | The homepage sections |
| `src/pages/` | One page per project |
| `src/demos/` | The interactive pieces. Each one draws itself into an element and returns a clean-up function |
| `src/data/` | The numbers behind the demos |
| `src/lib/` | Shared helpers and hooks |

## Where the numbers come from

- `src/data/paper.ts` holds curves computed from the model in my market-making paper.
- `src/data/poker.ts` holds my logged session results and the statistics computed from them.
- The Spread quote demo uses a real request from the final-run log in [abquant-spread](https://github.com/Aanu30/abquant-spread). The "run the desk for a day" game is a simplified illustration, not the competition simulator.

Built with the help of Claude Code.

## Contact

- **Email:** a.n.bhatt@lse.ac.uk
- **LinkedIn:** [linkedin.com/in/aarin-bhatt](https://linkedin.com/in/aarin-bhatt)
- **GitHub:** [github.com/Aanu30](https://github.com/Aanu30)

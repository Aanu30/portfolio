import Demo from '../components/Demo'
import { mountGhosts } from '../demos/ghosts'
import { Bars, Page, Section } from './Shell'

export default function GhostsPage() {
  return (
    <Page
      title="Ghosts of Wikipedia"
      meta={['03', 'Nov 2026', 'Junction hackathon, Espoo, Finland', '3rd place, MariaDB track']}
      heading="381,459 sentences Wikipedia deleted."
      sub="We brought them back."
      plain="Wikipedia keeps every version of every article but only shows you the latest. For MariaDB's challenge at Junction, our team rebuilt 862,076 versions of 19,742 Finnish history articles and recovered every sentence that was later removed. I led the analysis and the pitch. What we found: contested history gets rewritten far faster."
      quant="MariaDB system-versioned tables written with Wikipedia's real revision timestamps, so FOR SYSTEM_TIME AS OF replays any day. Sentence lifetimes come from diffing consecutive revisions, with reverts inside 24 hours filtered out. Kaplan-Meier median survival with live sentences censored (0.8 years against 18.6) and Fightin' Words log-odds on 2,646 deleted against 1,007 surviving sentences. I led the analysis and the pitch; teammates built the app."
      stats={[
        { big: <>3rd <small>place</small></>, text: "in MariaDB's Wikipedia Through Time challenge, at one of Europe's largest hackathons" },
        { big: '381,459', text: 'deleted sentences recovered from 862,076 versions of 19,742 articles' },
        { big: '23×', text: 'faster rewriting on contested history: a half-life of 0.8 years against 18.6' },
        { big: <>12 <small>of 12</small></>, text: 'language editions of the Winter War article had their busiest month for readers right after Russia invaded Ukraine' },
      ]}
      next={{ to: '/poker', label: '36 nights of poker: skill, or luck?' }}
    >
      <Section
        no="01"
        label="The idea"
        title="Wikipedia remembers everything. It just doesn't show you."
        wide={
          <Bars
            rows={[
              { label: 'Article versions rebuilt, back to 2002', value: '862,076', share: 0.71 },
              { label: 'Sentence lifetimes tracked', value: '1,209,532', share: 1 },
              { label: 'Deleted sentences recovered', value: '381,459', share: 0.315 },
              { label: 'Reverts filtered out as vandalism', value: '46,972', share: 0.039, tone: 'mute' },
            ]}
          />
        }
      >
        <p>
          Every edit to every Wikipedia article is kept, but readers only ever see the latest version. MariaDB's
          challenge at Junction asked teams to do something with that history.
        </p>
        <p>
          We rebuilt every version of 19,742 Finnish history articles and followed each sentence from the edit that
          wrote it to the edit that removed it. The whole run took 2 hours 5 minutes on a laptop.
        </p>
        <p>
          The result is a research tool. Open an article and the deleted sentences reappear in place, each with when
          it was written, when it went, and what replaced it.
        </p>
      </Section>

      <Section
        no="02"
        label="Play it"
        title="How long does a sentence last?"
        wide={<Demo title="watch history get rewritten" note="half-lives measured in our analysis" mount={mountGhosts} />}
      >
        <p>
          It depends heavily on the topic. On most articles, what gets written stays for years. On articles about
          contested events, it is gone within months.
        </p>
      </Section>

      <Section no="03" label="Findings" title="What the deleted sentences showed.">
        <ul>
          <li>
            <strong>Contested history is rewritten 23 times faster.</strong> Half of what is written about the 1918
            Civil War is gone within ten months. Across all articles it takes 18 years.
          </li>
          <li>
            <strong>Words disappear, not just sentences.</strong> One politically loaded term appears in 38 deleted
            sentences of the Civil War article and in none of the ones that survive.
          </li>
          <li>
            <strong>A source vanished too.</strong> One history of 1917 to 1918 is cited in 73 deleted sentences and
            no surviving ones.
          </li>
          <li>
            <strong>The past gets busy when the present does.</strong> All 12 language editions of the Winter War
            article had their busiest month for readers in March 2022, right after Russia invaded Ukraine.
          </li>
          <li>
            <strong>Names are fought over.</strong> Across 12 Wikipedias, pages about Russia and Ukraine were renamed
            46 times, 13 of those were undone, and pages were locked 24 times.
          </li>
        </ul>
      </Section>

      <Section no="04" label="Method" title="How the numbers were made.">
        <ul>
          <li>Each version of an article is split into sentences. Comparing one version with the next shows which sentences were born and which died.</li>
          <li>Vandalism doesn't count: a change undone within 24 hours is ignored.</li>
          <li>A removed sentence is sorted into typo fix, rewrite or erased, by comparing it with what replaced it.</li>
          <li>
            <span className="plain">
              Half-lives use the method doctors use for patient survival: a sentence that is still there today
              counts as "not gone yet", not as "lasts for ever".
            </span>
            <span className="quant">
              Half-lives are Kaplan-Meier median survival times over sentence lifetimes, excluding typo fixes and
              reverts, with sentences alive at the data cut-off treated as censored.
            </span>
          </li>
          <li>
            <span className="plain">Which words were deleted more than they were kept is measured with a standard method from political science.</span>
            <span className="quant">Deleted against surviving vocabulary uses Fightin' Words weighted log-odds with an informative Dirichlet prior (Monroe, Colaresi and Quinn, 2008), flagged at |z| &gt; 1.96.</span>
          </li>
          <li>Language models translated and summarised, but every number comes from Wikipedia's own records.</li>
        </ul>
      </Section>

      <Section
        no="05"
        label="The team"
        title="Who did what."
        wide={
          <div className="video rv">
            <iframe
              src="https://www.youtube-nocookie.com/embed/W_oorNzxkxc"
              title="Ghosts of Wikipedia demo video"
              loading="lazy"
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        }
      >
        <p className="callout">
          <b>Ghosts of Wikipedia was a team project</b> by Adarsh, Dana, Salome and me, entered as team Chrysalis. My
          part was the analysis and the findings above, and delivering the pitch and the demo. My teammates built the
          app.
        </p>
        <p>
          <a href="https://github.com/salomeshioshvili/ghosts_of_wikipedia" target="_blank" rel="noopener">
            The team's code is on GitHub.
          </a>{' '}
          The video below is the team's demo of the tool.
        </p>
      </Section>
    </Page>
  )
}

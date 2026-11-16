import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTitle } from '../lib/hooks'

export type Stat = { big: ReactNode; text: string }

type PageProps = {
  title: string
  meta: string[]
  heading: string
  sub: string
  plain: ReactNode
  quant: ReactNode
  stats: Stat[]
  next: { to: string; label: string }
  children: ReactNode
}

/** The frame every project page shares: way back, headline, numbers, sections, next project. */
export function Page({ title, meta, heading, sub, plain, quant, stats, next, children }: PageProps) {
  useTitle(`${title} · Aarin Bhatt`)
  return (
    <article className="page">
      <div className="wrap">
        <Link className="back" to="/#work">
          ← All work
        </Link>
        <div className="ch-meta mono">
          {meta.map((m, i) => (i === 0 ? <b key={m}>{m}</b> : <span key={m}>{m}</span>))}
        </div>
        <h1 className="page-title">
          {heading} <em>{sub}</em>
        </h1>
        <div className="page-head">
          <div>
            <p className="lede plain">{plain}</p>
            <p className="lede quant">{quant}</p>
          </div>
          <ul className="stats">
            {stats.map((s) => (
              <li key={s.text}>
                <b>{s.big}</b>
                <span>{s.text}</span>
              </li>
            ))}
          </ul>
        </div>
        {children}
        <div className="next">
          <span className="mono">Next project</span>
          <Link className="big-link" to={next.to}>
            {next.label} →
          </Link>
        </div>
      </div>
    </article>
  )
}

type SectionProps = {
  no: string
  label: string
  title: ReactNode
  children?: ReactNode
  /** Full-width content under the text: a demo, a table, a chart. */
  wide?: ReactNode
}

export function Section({ no, label, title, children, wide }: SectionProps) {
  return (
    <section className="psec">
      <div className="psec-head rv">
        <div>
          <span className="mono">
            <b>{no}</b> &nbsp;{label}
          </span>
          <h2>{title}</h2>
        </div>
        <div className="prose">{children}</div>
      </div>
      {wide}
    </section>
  )
}

/** Horizontal bars for a short list of numbers. `share` is each bar's length from 0 to 1. */
export function Bars({ rows }: { rows: { label: string; value: string; share: number; tone?: 'neg' | 'mute' }[] }) {
  return (
    <div className="hbars rv">
      {rows.map((r) => (
        <div className="hbar" key={r.label}>
          <span>{r.label}</span>
          <i className={r.tone} style={{ width: `${Math.max(1, r.share * 100)}%` }} />
          <b>{r.value}</b>
        </div>
      ))}
    </div>
  )
}

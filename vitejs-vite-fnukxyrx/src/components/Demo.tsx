import { useEffect, useRef } from 'react'
import { peekOnFirstSight } from '../lib/motion'

/** A demo draws itself into `root` and returns a function that tidies up. */
export type Mount = (root: HTMLElement) => () => void

type Props = {
  title: string
  note?: string
  mount: Mount
  id?: string
}

/** Runs a demo inside a plain element, for pieces that bring their own frame. */
export function Mounted({ mount, className }: { mount: Mount; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = mount(el)
    return () => {
      stop()
      el.replaceChildren()
    }
  }, [mount])
  return <div className={className} ref={ref} />
}

/** The framed "Try it" panel every interactive piece sits in. */
export default function Demo({ title, note, mount, id }: Props) {
  const body = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = body.current
    if (!el) return
    const stop = mount(el)
    const stopPeek = peekOnFirstSight(el)
    return () => {
      stopPeek()
      stop()
      el.replaceChildren()
    }
  }, [mount])

  return (
    <div className="demo rv" id={id}>
      <div className="demo-bar">
        <span className="mono">
          <b>Try it</b> · {title}
        </span>
        {note && <span className="mono dim">{note}</span>}
      </div>
      <div ref={body} />
    </div>
  )
}

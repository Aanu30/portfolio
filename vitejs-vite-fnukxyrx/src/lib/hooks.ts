import { useCallback, useEffect, useState } from 'react'

export type Level = 'plain' | 'quant'

/**
 * The reading level for the whole site. It lives on <html data-level> so plain CSS can
 * show the right copy, including text drawn inside the demos.
 */
export function useLevel(): [Level, (level: Level) => void] {
  const [level, setState] = useState<Level>(() =>
    document.documentElement.dataset.level === 'quant' ? 'quant' : 'plain',
  )
  const setLevel = useCallback((next: Level) => {
    document.documentElement.dataset.level = next
    try {
      localStorage.setItem('ab-level', next)
    } catch {
      /* storage can be unavailable in private windows */
    }
    setState(next)
  }, [])
  return [level, setLevel]
}

/** Fades sections in as they scroll into view. Re-runs when the page changes. */
export function useReveal(key: string) {
  useEffect(() => {
    const check = () => {
      const limit = window.innerHeight * 0.93
      document.querySelectorAll<HTMLElement>('.rv:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) el.classList.add('in')
      })
    }
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    check()
    const timer = window.setInterval(check, 400)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
      window.clearInterval(timer)
    }
  }, [key])
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}

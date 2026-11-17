import { useCallback, useEffect, useState } from 'react'
import { reducedMotion } from './dom'
import { COUNT_TARGETS, countUp } from './motion'

export type Level = 'plain' | 'quant'

// Big numbers that have not counted up yet.
const UNCOUNTED = COUNT_TARGETS.map((target) => `${target}:not([data-counted])`).join(', ')

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

/**
 * Brings sections in as they scroll into view, and starts the big numbers counting the first
 * time each one is on screen. Re-runs when the page changes.
 */
export function useReveal(key: string) {
  useEffect(() => {
    const still = reducedMotion()
    const check = () => {
      const limit = window.innerHeight * 0.93
      document.querySelectorAll<HTMLElement>('.rv:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) el.classList.add('in')
      })
      if (still) return
      document.querySelectorAll<HTMLElement>(UNCOUNTED).forEach((el) => {
        const box = el.getBoundingClientRect()
        if (box.top < limit && box.bottom > 0) {
          el.dataset.counted = 'yes'
          countUp(el)
        }
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

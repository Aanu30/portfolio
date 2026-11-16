// Small helpers shared by the interactive demos. The demos draw straight to SVG and
// canvas, so these keep that code short.

const NS = 'http://www.w3.org/2000/svg'

type Attrs = Record<string, string | number>

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  parent?: Element,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, tag)
  if (attrs) for (const k in attrs) el.setAttribute(k, String(attrs[k]))
  if (parent) parent.appendChild(el)
  return el
}

/** Sets several attributes at once. */
export function set(el: Element, attrs: Attrs) {
  for (const k in attrs) el.setAttribute(k, String(attrs[k]))
}

/** querySelector that throws instead of returning null, scoped to a root. */
export function q<T extends Element = HTMLElement>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel)
  if (!el) throw new Error(`Missing element: ${sel}`)
  return el
}

export const qa = <T extends Element = HTMLElement>(root: ParentNode, sel: string): T[] => [
  ...root.querySelectorAll<T>(sel),
]

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

const money = (sym: string, x: number, d = 2) =>
  (x < 0 ? '−' : '') +
  sym +
  Math.abs(x).toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d })

export const eur = (x: number, d = 2) => money('€', x, d)
export const gbp = (x: number, d = 2) => money('£', x, d)

/** Paints the filled part of a range input's track. */
export function fillRange(input: HTMLInputElement) {
  const min = Number(input.min)
  const max = Number(input.max)
  input.style.setProperty('--p', ((Number(input.value) - min) / (max - min)) * 100 + '%')
}

/** Seeded random numbers, so a "day" or a drawing can be replayed exactly. */
export function mulberry(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One draw from a standard normal distribution. */
export function gauss(rand: () => number = Math.random) {
  let u = 0
  let v = 0
  while (!u) u = rand()
  while (!v) v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** SVG path through a list of [x, y] points. */
export const linePath = (pts: number[][]) =>
  pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('')

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Charts use a narrower drawing on phones so labels stay readable. */
export const isNarrow = (root: HTMLElement) => root.getBoundingClientRect().width < 560

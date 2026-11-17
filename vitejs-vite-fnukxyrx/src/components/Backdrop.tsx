import { useEffect, useRef } from 'react'
import { mountField } from '../demos/field'

/** The moving background that sits behind every page. */
export default function Backdrop() {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => (canvas.current ? mountField(canvas.current) : undefined), [])
  return <canvas className="backdrop" ref={canvas} aria-hidden="true" />
}

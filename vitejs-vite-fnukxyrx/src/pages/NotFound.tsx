import { Link } from 'react-router-dom'
import { useTitle } from '../lib/hooks'

export default function NotFound() {
  useTitle('Page not found · Aarin Bhatt')
  return (
    <article className="page">
      <div className="wrap" style={{ minHeight: '60svh' }}>
        <span className="mono">
          <b>404</b> &nbsp;Not found
        </span>
        <h1 className="page-title" style={{ marginTop: 18 }}>
          That page doesn't exist. <em>Probability zero.</em>
        </h1>
        <Link className="btn pri arrow" to="/">
          Back to the homepage
        </Link>
      </div>
    </article>
  )
}

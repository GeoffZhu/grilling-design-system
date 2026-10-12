import type { ReactNode } from 'react'
import './system.css'

export function EmberCard({ index, title, description, status, active = false, readout, action, children, variant = 'default' }: { index?: string; title: string; description?: string; status?: string; active?: boolean; readout?: string; action?: ReactNode; children?: ReactNode; variant?: 'default' | 'signal' }) {
  return <article className="eo-card eo-scope" data-variant={variant}>
    <div className="eo-card-header">{index && <span className="eo-card-index">{index}</span>}{status && <span className="eo-card-status" data-active={active || undefined}>{status}</span>}</div>
    <h3 className="eo-card-title">{title}</h3>{description && <p className="eo-card-description">{description}</p>}{children}
    {(readout || action) && <footer className="eo-card-footer">{readout && <span className="eo-readout">{readout}</span>}{action}</footer>}
  </article>
}

export default EmberCard

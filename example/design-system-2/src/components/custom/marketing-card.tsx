import type { ReactNode } from 'react'
import './marketing.css'

type MarketingCardProps = {
  label?: string
  title: string
  description?: string
  value?: string
  action?: ReactNode
  variant?: 'feature' | 'project' | 'pricing'
  children?: ReactNode
}

export function MarketingCard({ label, title, description, value, action, variant = 'feature', children }: MarketingCardProps) {
  return <article className="marketing-card marketing-surface" data-variant={variant}>
    {label && <span className="marketing-card-label">{label}</span>}
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {children}
    {(value || action) && <footer className="marketing-card-footer">{value && <strong className="marketing-card-value">{value}</strong>}{action}</footer>}
  </article>
}

export function MarketingCardGrid({ children }: { children: ReactNode }) {
  return <div className="marketing-card-grid">{children}</div>
}

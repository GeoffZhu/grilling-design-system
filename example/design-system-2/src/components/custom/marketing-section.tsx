import type { ReactNode } from 'react'
import './marketing.css'

type MarketingSectionProps = {
  eyebrow?: string
  title?: string
  description?: string
  tone?: 'default' | 'raised' | 'quiet'
  children: ReactNode
  id?: string
}

export function MarketingSection({ eyebrow, title, description, tone = 'default', children, id }: MarketingSectionProps) {
  return <section className="marketing-section marketing-surface" data-tone={tone} id={id}>
    <div className="marketing-section-inner">
      {(eyebrow || title || description) && <div className="marketing-section-heading">
        <div>{eyebrow && <p className="marketing-eyebrow">{eyebrow}</p>}{title && <h2>{title}</h2>}</div>
        {description && <p className="marketing-section-description">{description}</p>}
      </div>}
      {children}
    </div>
  </section>
}

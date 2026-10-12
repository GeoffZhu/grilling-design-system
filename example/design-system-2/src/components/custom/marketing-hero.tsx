import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { MarketingLinkButton } from './marketing-button'
import './marketing.css'

type MarketingHeroProps = {
  eyebrow?: string
  title: string
  description: string
  primaryAction?: { label: string; href: string }
  secondaryAction?: { label: string; href: string }
  visual?: ReactNode
}

export function MarketingHero({ eyebrow = 'Example SaaS · Brand homepage', title, description, primaryAction, secondaryAction, visual }: MarketingHeroProps) {
  return <section className="marketing-hero marketing-surface">
    <div className="marketing-hero-copy">
      <p className="marketing-eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="marketing-hero-description">{description}</p>
      {(primaryAction || secondaryAction) && <div className="marketing-hero-actions">
        {primaryAction && <MarketingLinkButton href={primaryAction.href} size="lg" trailingIcon={<ArrowRight aria-hidden="true" />}>{primaryAction.label}</MarketingLinkButton>}
        {secondaryAction && <MarketingLinkButton href={secondaryAction.href} size="lg" variant="secondary">{secondaryAction.label}</MarketingLinkButton>}
      </div>}
    </div>
    <div className="marketing-hero-visual">{visual ?? <div className="marketing-orbit-panel"><span className="marketing-card-label">Tonight's project orbit</span><div className="marketing-orbit-value">12</div><div className="marketing-orbit-meta"><span>3 awaiting review</span><span>8 completed this week</span></div></div>}</div>
  </section>
}

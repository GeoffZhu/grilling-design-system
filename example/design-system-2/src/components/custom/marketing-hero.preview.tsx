import { MarketingHero } from './marketing-hero'

export default function MarketingHeroPreview() {
  return <div style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--surface-radius)' }}>
    <MarketingHero title="Keep every project moving on a clear path" description="Bring planning, reviews, and delivery into one shared workspace. This page demonstrates the design language and does not make a real product claim." primaryAction={{ label: 'Enter workspace', href: '#workspace' }} secondaryAction={{ label: 'View projects', href: '#projects' }} />
  </div>
}

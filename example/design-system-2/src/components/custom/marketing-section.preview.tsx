import { MarketingSection } from './marketing-section'

export default function MarketingSectionPreview() {
  return <div style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--surface-radius)' }}>
    <MarketingSection eyebrow="Clear collaboration" title="Expansive expression and focused work, each with its own rhythm" description="The section aligns content width, heading relationships, and responsive spacing while preserving the distinct role of each area." tone="raised">
      <div style={{ minHeight: 120, border: '1px dashed var(--border)', borderRadius: 16, display: 'grid', placeItems: 'center', color: 'var(--muted-foreground)' }}>Content area</div>
    </MarketingSection>
  </div>
}

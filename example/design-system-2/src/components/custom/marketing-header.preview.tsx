import { MarketingHeader } from './marketing-header'

export default function MarketingHeaderPreview() {
  return <div style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--surface-radius)', overflow: 'hidden' }}>
    <MarketingHeader items={[{ label: 'Capabilities', href: '#capabilities' }, { label: 'How it works', href: '#workflow' }, { label: 'Design language', href: '#design' }]} />
  </div>
}

import { MarketingFooter } from './marketing-footer'

export default function MarketingFooterPreview() {
  return <div style={{ width: '100%', overflow: 'hidden', borderRadius: 'var(--surface-radius)' }}><MarketingFooter groups={[
    { title: 'Product', links: [{ label: 'Project overview', href: '#projects' }, { label: 'Review queue', href: '#reviews' }] },
    { title: 'Resources', links: [{ label: 'Design language', href: '#design' }, { label: 'Component directory', href: '#components' }] },
    { title: 'About', links: [{ label: 'Example notes', href: '#about' }] },
  ]} /></div>
}

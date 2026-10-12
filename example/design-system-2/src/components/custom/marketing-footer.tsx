import './marketing.css'

export type MarketingFooterGroup = { title: string; links: { label: string; href: string }[] }

type MarketingFooterProps = {
  brand?: string
  description?: string
  groups?: MarketingFooterGroup[]
}

export function MarketingFooter({ brand = 'Starry Current', description = 'An illustrative brand used to demonstrate the design system, not a real service.', groups = [] }: MarketingFooterProps) {
  return <footer className="marketing-footer marketing-surface">
    <div className="marketing-footer-inner">
      <div className="marketing-footer-brand"><a className="marketing-brand" href="#"><span className="marketing-brand-mark" aria-hidden="true" />{brand}</a><p>{description}</p></div>
      {groups.map(group => <nav className="marketing-footer-group" aria-label={group.title} key={group.title}><h3>{group.title}</h3>{group.links.map(link => <a href={link.href} key={link.href}>{link.label}</a>)}</nav>)}
    </div>
    <div className="marketing-footer-bottom"><span>© 2026 {brand} · Design system example</span><span>Dark mode · Desktop and Mobile Web</span></div>
  </footer>
}

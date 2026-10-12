import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MarketingLinkButton } from './marketing-button'
import './marketing.css'

export type MarketingNavItem = { label: string; href: string }

type MarketingHeaderProps = {
  brand?: string
  homeHref?: string
  items?: MarketingNavItem[]
  actionLabel?: string
  actionHref?: string
}

export function MarketingHeader({ brand = 'Starry Current', homeHref = '#', items = [], actionLabel = 'Enter workspace', actionHref = '#workspace' }: MarketingHeaderProps) {
  const [open, setOpen] = useState(false)
  return <header className="marketing-header marketing-surface" data-open={open}>
    <a className="marketing-brand" href={homeHref}><span className="marketing-brand-mark" aria-hidden="true" />{brand}</a>
    <nav className="marketing-nav" aria-label="Brand navigation">
      {items.map(item => <a href={item.href} key={item.href} onClick={() => setOpen(false)}>{item.label}</a>)}
    </nav>
    <div className="marketing-header-actions">
      <MarketingLinkButton href="#projects" variant="ghost" size="sm">View projects</MarketingLinkButton>
      <MarketingLinkButton href={actionHref} size="sm">{actionLabel}</MarketingLinkButton>
      <button className="marketing-menu-trigger" type="button" aria-expanded={open} aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(value => !value)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
    </div>
  </header>
}

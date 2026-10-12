import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { EmberButton } from './button'
import { OrbitMark } from './icon'
import './system.css'

export type HeaderLink = { label: string; href: string; current?: boolean }

export function EmberHeader({ links, actionLabel = 'Open console', onAction }: { links: HeaderLink[]; actionLabel?: string; onAction?: () => void }) {
  const [open, setOpen] = useState(false)
  return <header className="eo-header eo-scope">
    <a className="eo-brand" href="#top" aria-label="Ember Orbit home"><span className="eo-icon"><OrbitMark /></span><span>EMBER / ORBIT</span></a>
    <nav className="eo-nav" id="ember-navigation" data-open={open || undefined} aria-label="Primary navigation">{links.map(link => <a className="eo-nav-link" href={link.href} aria-current={link.current ? 'page' : undefined} onClick={() => setOpen(false)} key={link.href}>{link.label}</a>)}</nav>
    <div className="eo-header-actions">
      <button className="eo-icon-button eo-menu-toggle" type="button" aria-expanded={open} aria-controls="ember-navigation" aria-label={open ? 'Close navigation' : 'Open navigation'} onClick={() => setOpen(value => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
      <EmberButton size="small" onClick={onAction}>{actionLabel}</EmberButton>
    </div>
  </header>
}

export default EmberHeader

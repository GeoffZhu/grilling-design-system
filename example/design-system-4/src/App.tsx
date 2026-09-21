import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { Github, Menu, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import IntegratedPreview from './IntegratedPreview'
import { componentEntries, ComponentPreview } from './FullGallery'
import tokens from '../tokens.json'
import { text } from './review-copy'
import './gallery.css'

function readComponent() {
  return new URLSearchParams(window.location.search).get('component')
}

function go(component?: string) {
  const url = component ? `?component=${encodeURIComponent(component)}` : window.location.pathname
  window.history.pushState({}, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

export default function App() {
  const presentation = new URLSearchParams(window.location.search).get('presentation') === '1' || window.location.hash === '#presentation'
  if (presentation) return <IntegratedPreview presentation />
  return <Catalog />
}

function Catalog() {
  const [component, setComponent] = useState(readComponent)
  const [query, setQuery] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const active = componentEntries.find(item => item.name === component)
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? componentEntries.filter(item => `${item.title} ${item.category}`.toLowerCase().includes(needle)) : componentEntries
  }, [query])
  const categories = useMemo(() => {
    const standard = [text['Actions'],text['Inputs'],text['Navigation'],text['Overlays'],text['Feedback'],text['Data display'],text['Layout'],text['Messaging'],text['Utilities'],text['Custom components']]
    const custom = Array.from(new Set(componentEntries.map(item => item.category))).filter(category => !standard.includes(category))
    return [...standard.filter(category => componentEntries.some(item => item.category === category)), ...custom]
  }, [])

  useEffect(() => {
    const sync = () => { setComponent(readComponent()); setMobileNav(false) }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  const navigate = (event: MouseEvent<HTMLAnchorElement>, name?: string) => {
    event.preventDefault()
    go(name)
  }

  const sidebar = <div className="catalog-sidebar-inner">
    <div className="catalog-search"><Search aria-hidden="true"/><Input value={query} onChange={event => setQuery(event.target.value)} placeholder={text['Search components']} aria-label={text['Search components']} /></div>
    <nav aria-label={text['Component navigation']}>
      <a className={!active ? 'sidebar-link active' : 'sidebar-link'} href={window.location.pathname} onClick={event => navigate(event)}>{text['Components overview']}</a>
      {categories.map(category => {
        const items = filtered.filter(item => item.category === category)
        if (!items.length) return null
        return <section className="sidebar-group" key={category}><h2>{category}</h2>{items.map(item => <a className={active?.name === item.name ? 'sidebar-link active' : 'sidebar-link'} href={`?component=${item.name}`} onClick={event => navigate(event, item.name)} key={item.name}>{item.title}</a>)}</section>
      })}
      {!filtered.length && <p className="sidebar-empty">{text['No components found']}</p>}
    </nav>
  </div>

  return <div className="catalog-app">
    <header className="catalog-header">
      <button className="mobile-menu" type="button" onClick={() => setMobileNav(true)} aria-label={text['Open component navigation']}><Menu aria-hidden="true"/></button>
      <a className="wordmark" href={window.location.pathname} onClick={event => navigate(event)}>{tokens.name}</a>
      <a className="github-link" href="https://github.com/GeoffZhu/grilling-design-system" target="_blank" rel="noreferrer" aria-label="GitHub"><Github aria-hidden="true"/></a>
    </header>

    <div className="catalog-layout">
      <aside className="catalog-sidebar">{sidebar}</aside>
      {mobileNav && <div className="mobile-nav-layer"><button className="mobile-nav-backdrop" onClick={() => setMobileNav(false)} aria-label={text['Close component navigation']} /><aside className="mobile-nav-panel"><div className="mobile-nav-header"><span>{text['Components']}</span><button type="button" onClick={() => setMobileNav(false)} aria-label={text['Close component navigation']}><X aria-hidden="true"/></button></div>{sidebar}</aside></div>}

      <main className="catalog-main">
        {active ? <ComponentPage entry={active} navigate={navigate} /> : <Overview navigate={navigate} />}
      </main>
    </div>
  </div>
}

function Overview({ navigate }: { navigate: (event: MouseEvent<HTMLAnchorElement>, name?: string) => void }) {
  return <>
    <div className="page-heading">
      <p className="eyebrow">{text['Design system']}</p>
      <h1>{text['Components']}</h1>
      <p>{text['Browse every component in this design system. Select one to inspect its visual treatment and interaction states.']}</p>
    </div>
    <section className="overview-key-visual" data-slot="integrated-preview" aria-labelledby="key-visual-title">
      <div className="section-heading"><h2 id="key-visual-title">完整工作台</h2><span>主视觉</span></div>
      <IntegratedPreview />
    </section>
    <section className="component-directory" aria-labelledby="all-components">
      <div className="section-heading"><h2 id="all-components">{text['All components']}</h2><span>{componentEntries.length}</span></div>
      <div className="component-index">{componentEntries.map(item => <a href={`?component=${item.name}`} onClick={event => navigate(event, item.name)} key={item.name}><span>{item.title}</span><small>{item.category}</small></a>)}</div>
    </section>
  </>
}

function ComponentPage({ entry, navigate }: { entry: (typeof componentEntries)[number], navigate: (event: MouseEvent<HTMLAnchorElement>, name?: string) => void }) {
  const index = componentEntries.indexOf(entry)
  const previous = componentEntries[index - 1]
  const next = componentEntries[index + 1]
  return <>
    <nav className="breadcrumbs" aria-label={text['Breadcrumb']}><a href={window.location.pathname} onClick={event => navigate(event)}>{text['Components']}</a><span>/</span><span>{entry.title}</span></nav>
    <div className="page-heading component-heading"><p className="eyebrow">{entry.category}</p><h1>{entry.title}</h1><p>{entry.description}</p></div>
    <section className="component-demo" aria-labelledby="preview-heading"><div className="demo-heading"><h2 id="preview-heading">{text['Preview']}</h2><span>{text['Interactive']}</span></div><div className="demo-canvas"><ComponentPreview entry={entry} /></div></section>
    <nav className="component-pagination" aria-label={text['Component pagination']}>
      {previous ? <a href={`?component=${previous.name}`} onClick={event => navigate(event, previous.name)}><small>{text['Previous']}</small><span>{previous.title}</span></a> : <span />}
      {next && <a className="next" href={`?component=${next.name}`} onClick={event => navigate(event, next.name)}><small>{text['Next']}</small><span>{next.title}</span></a>}
    </nav>
  </>
}

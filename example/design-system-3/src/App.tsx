import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { Check, Clock3, Github, Menu, Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CatBackdrop } from '@/components/custom/cat-backdrop'
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
    <CatBackdrop variant="page" className="catalog-hero">
      <p className="eyebrow">Amber Tuxedo · {text['Design system']}</p>
      <h1>柔和轮廓，<br />敏锐焦点。</h1>
      <p>以暖白、炭黑与琥珀黄构成清晰层级，让卡通猫自然出现在页面与卡片背景中。</p>
      <div className="catalog-hero-actions">
        <Button asChild><a href="#all-components">浏览全部组件</a></Button>
        <Button asChild variant="outline"><a href="?component=cat-backdrop" onClick={event => navigate(event, 'cat-backdrop')}>查看猫背景组件</a></Button>
      </div>
    </CatBackdrop>
    <section className="catalog-scene" aria-label="猫背景组件示例">
      <CatBackdrop variant="card">
        <span className="catalog-tag">下一项</span>
        <h2>晚餐后补充饮水</h2>
        <p><Clock3 aria-hidden="true" />预计 20:00 · 约 150 ml</p>
        <Button size="icon" className="catalog-check" aria-label="标记完成"><Check aria-hidden="true" /></Button>
      </CatBackdrop>
      <article className="catalog-progress">
        <span>今日进度</span>
        <strong>3 / 5</strong>
        <Progress value={60} aria-label="今日进度百分之六十" />
        <p>再完成两项，就能收好今天的记录。</p>
      </article>
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

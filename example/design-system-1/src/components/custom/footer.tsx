import { OrbitMark } from './icon'
import './system.css'

export type FooterGroup = { title: string; links: { label: string; href: string }[] }

export function EmberFooter({ groups, note = 'A Marketing component system built from precise linework, technical labels, and high-contrast actions.' }: { groups: FooterGroup[]; note?: string }) {
  return <footer className="eo-footer eo-scope"><div className="eo-footer-inner"><div><a className="eo-brand" href="#top"><span className="eo-icon"><OrbitMark /></span><span>EMBER / ORBIT</span></a><p className="eo-footer-summary">{note}</p></div>{groups.map(group => <div key={group.title}><h3>{group.title}</h3><div className="eo-footer-links">{group.links.map(link => <a href={link.href} key={link.href}>{link.label}</a>)}</div></div>)}</div><div className="eo-footer-bottom"><span>© 2026 Ember Orbit</span><span>STATUS / DESIGN SYSTEM READY</span></div></footer>
}

export default EmberFooter

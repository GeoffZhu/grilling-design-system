import type { ReactNode } from 'react'
import { EmberButton } from './button'
import './system.css'

export function OrbitVisual() {
  return <div className="eo-orbit-visual" aria-hidden="true"><span className="eo-orbit-ring"/><span className="eo-orbit-ring"/><span className="eo-orbit-ring"/><span className="eo-orbit-planet"/><span className="eo-orbit-node n1"/><span className="eo-orbit-node n2"/><span className="eo-orbit-node n3"/></div>
}

export function EmberHero({ eyebrow = 'ORBITAL INTERFACE / COMPONENT SYSTEM', title = <><span>SEE EVERY</span><em>CRITICAL TURN</em></>, description, primaryLabel = 'Explore components', secondaryLabel = 'View design rules', onPrimary, onSecondary, visual }: { eyebrow?: string; title?: ReactNode; description: string; primaryLabel?: string; secondaryLabel?: string; onPrimary?: () => void; onSecondary?: () => void; visual?: ReactNode }) {
  return <section className="eo-hero eo-scope"><div className="eo-hero-inner">
    <aside className="eo-hero-telemetry" aria-label="Orbital telemetry"><p className="eo-eyebrow">TRAJECTORY / 07–23</p><div className="eo-telemetry-row"><span>Thrust vector</span><strong>78.42°</strong></div><div className="eo-telemetry-row"><span>Orbit stability</span><strong>96.8%</strong></div><div className="eo-telemetry-row"><span>Relative velocity</span><strong>12.04</strong></div></aside>
    <div className="eo-hero-core">{visual ?? <OrbitVisual/>}<div className="eo-hero-copy"><p className="eo-eyebrow">{eyebrow}</p><h1 className="eo-hero-title">{title}</h1><p className="eo-hero-description">{description}</p><div className="eo-hero-actions"><EmberButton variant="primary" onClick={onPrimary}>{primaryLabel}</EmberButton><EmberButton variant="ghost" onClick={onSecondary}>{secondaryLabel}</EmberButton></div></div></div>
    <aside className="eo-hero-telemetry" data-side="right" aria-label="System status"><p className="eo-eyebrow">ONLINE STATUS</p><ol className="eo-signal-list"><li data-active="true"><span>01</span>Navigation core</li><li><span>02</span>Signal array</li><li><span>03</span>Mission archive</li></ol></aside>
  </div></section>
}

export default EmberHero

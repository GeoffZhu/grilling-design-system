import { EmberIcon, IconButton, OrbitMark } from './icon'

export default function IconPreview() {
  return <div className="eo-scope" style={{display:'grid',gap:28,width:'min(100%,680px)'}}><div style={{display:'flex',alignItems:'center',gap:22,flexWrap:'wrap'}}>{(['add','search','back','check','settings','target'] as const).map(name => <div style={{display:'grid',justifyItems:'center',gap:8,color:'var(--accent)'}} key={name}><EmberIcon name={name}/><span style={{font:'500 10px/1 IBM Plex Mono,monospace',color:'var(--muted-foreground)'}}>{name}</span></div>)}</div><div style={{display:'flex',alignItems:'center',gap:16}}><span className="eo-icon" style={{width:52,height:52,color:'var(--primary)'}}><OrbitMark title="Orbit brand mark"/></span><IconButton label="Search"><EmberIcon name="search"/></IconButton><IconButton label="Settings"><EmberIcon name="settings"/></IconButton></div></div>
}

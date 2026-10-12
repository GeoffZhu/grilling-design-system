import { ArrowUpRight } from 'lucide-react'
import { EmberButton } from './button'
import { EmberCard } from './card'

export default function CardPreview() {
  return <div className="eo-card-grid eo-scope" style={{width:'100%'}}><EmberCard index="01 / ACTIVE" title="Navigation core" description="Concentrates the primary action and critical readings on one clear trajectory." status="Online" active readout="VECTOR 78.42°" action={<EmberButton size="small" variant="ghost" icon={<ArrowUpRight/>}>View</EmberButton>}/><EmberCard index="02 / SIGNAL" title="Signal array" description="Low-priority information stays quiet until a change needs emphasis." status="Standby" readout="SYNC 96.8%" variant="signal"/><EmberCard index="03 / ARCHIVE" title="Mission archive" description="Compact summaries share one border, label, and numeric hierarchy." status="Synced" readout="FILES 024"/></div>
}

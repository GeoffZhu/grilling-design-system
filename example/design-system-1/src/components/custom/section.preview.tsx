import { EmberSection } from './section'
import { EmberCard } from './card'

export default function SectionPreview() {
  return <div style={{width:'100%',border:'1px solid var(--border)'}}><EmberSection eyebrow="02 / SYSTEM MODULES" title="Keep every signal on its own trajectory" description="An open primary narrative can coexist with compact supporting data. Section aligns content width, vertical rhythm, and heading relationships."><div className="eo-card-grid"><EmberCard index="01" title="Navigation core" description="Carries the primary action and current position." status="Online" active/><EmberCard index="02" title="Signal array" description="Organizes compact readings and status changes." status="Standby"/><EmberCard index="03" title="Mission archive" description="Presents scannable content summaries." status="Synced"/></div></EmberSection></div>
}

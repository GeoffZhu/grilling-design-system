import { EmberHeader } from '@/components/custom/header'
import { EmberHero } from '@/components/custom/hero'
import { EmberSection } from '@/components/custom/section'
import { EmberCard } from '@/components/custom/card'
import { EmberButton } from '@/components/custom/button'
import { EmberFooter } from '@/components/custom/footer'

export default function IntegratedPreview() {
  const scrollToSystems = () => document.querySelector('#preview-systems')?.scrollIntoView({ behavior: 'smooth' })
  return <div className="eo-scope" id="top">
    <EmberHeader links={[{label:'Systems',href:'#preview-systems',current:true},{label:'Archive',href:'#preview-archive'},{label:'Contact',href:'#preview-contact'}]} actionLabel="Explore components" onAction={scrollToSystems}/>
    <EmberHero description="A Marketing design system built from precise linework, technical labels, and high-contrast actions." primaryLabel="Explore components" secondaryLabel="View design rules" onPrimary={scrollToSystems}/>
    <EmberSection id="preview-systems" eyebrow="02 / SYSTEM MODULES" title="Every signal follows its own trajectory" description="An open primary narrative can coexist with compact supporting data. Saturated color is reserved for actions, selections, and critical readings."><div className="eo-card-grid"><EmberCard index="01" title="Navigation core" description="Carries the primary action and current position." status="Online" active readout="VECTOR 78.42°" action={<EmberButton size="small" variant="ghost">View</EmberButton>}/><EmberCard index="02" title="Signal array" description="Organizes compact readings and status changes." status="Standby" readout="SYNC 96.8%" variant="signal"/><EmberCard index="03" title="Mission archive" description="Presents scannable content summaries." status="Synced" readout="FILES 024"/></div></EmberSection>
    <EmberFooter groups={[{title:'System',links:[{label:'Components',href:'#preview-systems'},{label:'Design rules',href:'#design'}]},{title:'Information',links:[{label:'About',href:'#about'},{label:'Contact',href:'#preview-contact'}]}]} />
  </div>
}

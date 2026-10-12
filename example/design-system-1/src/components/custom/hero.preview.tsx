import { EmberHero } from './hero'

export default function HeroPreview() {
  return <div style={{width:'100%',overflow:'hidden',border:'1px solid var(--border)'}}><EmberHero description="A Marketing design system built from precise linework, technical labels, and high-contrast actions." onPrimary={() => document.querySelector('.component-directory')?.scrollIntoView({behavior:'smooth'})}/></div>
}

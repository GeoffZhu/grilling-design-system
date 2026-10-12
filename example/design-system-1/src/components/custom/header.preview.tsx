import { EmberHeader } from './header'

export default function HeaderPreview() {
  return <div style={{width:'100%',border:'1px solid var(--border)',background:'var(--background)'}}><EmberHeader links={[{label:'Systems',href:'#systems',current:true},{label:'Archive',href:'#archive'},{label:'Contact',href:'#contact'}]} onAction={() => window.alert('Demo console opened.')}/></div>
}

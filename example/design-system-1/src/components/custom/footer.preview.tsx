import { EmberFooter } from './footer'

export default function FooterPreview() {
  return <div style={{width:'100%',border:'1px solid var(--border)'}}><EmberFooter groups={[{title:'System',links:[{label:'Components',href:'#components'},{label:'Design rules',href:'#design'}]},{title:'Information',links:[{label:'About',href:'#about'},{label:'Contact',href:'#contact'}]}]} /></div>
}

import { EmberContactForm, EmberInput } from './input-form'

export default function InputFormPreview() {
  return <div className="eo-scope" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:40,width:'100%',alignItems:'start'}}><EmberContactForm/><div style={{display:'grid',gap:18}}><EmberInput label="Read-only reading" value="NAV–CORE / 01" readOnly help="Displays a system identifier that cannot be edited."/><EmberInput label="Error state" defaultValue="orbit@" error="Enter a complete email address, such as name@example.com."/></div></div>
}

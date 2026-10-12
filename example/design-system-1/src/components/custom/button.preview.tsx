import { useState } from 'react'
import { ArrowUpRight, Radio } from 'lucide-react'
import { EmberButton } from './button'

export default function ButtonPreview() {
  const [loading, setLoading] = useState(false)
  return <div className="eo-scope" style={{display:'grid',gap:24,width:'min(100%,680px)'}}><div style={{display:'flex',flexWrap:'wrap',gap:12}}><EmberButton variant="primary" icon={<ArrowUpRight aria-hidden="true"/>}>Explore components</EmberButton><EmberButton>View trajectory</EmberButton><EmberButton variant="ghost">Design rules</EmberButton><EmberButton iconOnly icon={<Radio aria-hidden="true"/>} aria-label="Scan signal"/></div><div style={{display:'flex',flexWrap:'wrap',gap:12}}><EmberButton size="small">Compact action</EmberButton><EmberButton disabled>Unavailable</EmberButton><EmberButton loading={loading} onClick={() => {setLoading(true); window.setTimeout(() => setLoading(false), 900)}}>{loading ? 'Synchronizing' : 'Demo loading'}</EmberButton></div></div>
}

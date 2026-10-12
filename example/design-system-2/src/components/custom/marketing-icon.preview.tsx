import { ArrowLeft, Check, Plus, Search, Settings } from 'lucide-react'
import { MarketingIcon, MarketingStarMark } from './marketing-icon'

export default function MarketingIconPreview() {
  return <div className="marketing-preview-stack"><div className="marketing-preview-row"><MarketingIcon icon={Plus} label="Add" tone="primary" /><MarketingIcon icon={Search} label="Search" /><MarketingIcon icon={ArrowLeft} label="Back" /><MarketingIcon icon={Check} label="Complete" /><MarketingIcon icon={Settings} label="Settings" tone="quiet" /></div><div className="marketing-preview-row"><MarketingStarMark /><span style={{ color: 'var(--muted-foreground)' }}>The warm star mark is decorative or status-related and never replaces an action icon.</span></div></div>
}

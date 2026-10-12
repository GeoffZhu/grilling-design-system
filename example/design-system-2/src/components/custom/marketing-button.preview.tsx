import { ArrowRight, Plus } from 'lucide-react'
import { MarketingButton, MarketingLinkButton } from './marketing-button'

export default function MarketingButtonPreview() {
  return <div className="marketing-preview-stack">
    <div className="marketing-preview-row"><MarketingButton leadingIcon={<Plus />}>New project</MarketingButton><MarketingButton variant="secondary">View projects</MarketingButton><MarketingButton variant="ghost">Do later</MarketingButton></div>
    <div className="marketing-preview-row"><MarketingButton size="sm">Small button</MarketingButton><MarketingButton size="lg" trailingIcon={<ArrowRight />}>Enter workspace</MarketingButton><MarketingButton loading>Processing</MarketingButton><MarketingButton disabled>Unavailable</MarketingButton></div>
    <MarketingLinkButton href="#marketing-button-preview" variant="secondary" trailingIcon={<ArrowRight />}>Link action</MarketingLinkButton>
  </div>
}

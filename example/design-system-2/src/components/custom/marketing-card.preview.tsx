import { ArrowUpRight } from 'lucide-react'
import { MarketingButton } from './marketing-button'
import { MarketingCard, MarketingCardGrid } from './marketing-card'

export default function MarketingCardPreview() {
  return <div style={{ width: '100%' }}><MarketingCardGrid>
    <MarketingCard label="Project orbit" title="See priorities before moving work forward" description="The primary card supports a longer title without giving every item equal emphasis." value="12" action={<MarketingButton size="sm" variant="secondary" trailingIcon={<ArrowUpRight />}>View</MarketingButton>} />
    <MarketingCard label="Awaiting review" title="3 projects" description="The earliest deadline is today at 18:30." value="03" />
    <MarketingCard label="Completed this week" title="Keep a steady rhythm" description="Example data is used only to demonstrate information hierarchy." value="08" variant="project" />
  </MarketingCardGrid></div>
}

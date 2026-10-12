import type { LucideIcon } from 'lucide-react'
import './marketing.css'

type MarketingIconProps = {
  icon: LucideIcon
  label?: string
  tone?: 'default' | 'primary' | 'quiet'
  className?: string
}

export function MarketingIcon({ icon: Icon, label, tone = 'default', className = '' }: MarketingIconProps) {
  const content = <span className={`marketing-icon ${className}`.trim()} data-tone={tone} aria-hidden={label ? undefined : 'true'}><Icon /></span>
  if (!label) return content
  return <span role="img" aria-label={label}>{content}</span>
}

export function MarketingStarMark() {
  return <span className="marketing-star-mark" aria-hidden="true" />
}

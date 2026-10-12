import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './marketing.css'

type MarketingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function MarketingButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon,
  trailingIcon,
  disabled,
  ...props
}: MarketingButtonProps) {
  return <button
    className={`marketing-button ${className}`.trim()}
    data-variant={variant}
    data-size={size}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    {...props}
  >
    {loading ? <span className="marketing-button-spinner" aria-hidden="true" /> : leadingIcon}
    <span>{loading ? 'Processing…' : children}</span>
    {!loading && trailingIcon}
  </button>
}

type MarketingLinkButtonProps = {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  ariaLabel?: string
}

export function MarketingLinkButton({ href, children, variant = 'primary', size = 'md', className = '', leadingIcon, trailingIcon, ariaLabel }: MarketingLinkButtonProps) {
  return <a className={`marketing-button ${className}`.trim()} data-variant={variant} data-size={size} href={href} aria-label={ariaLabel}>
    {leadingIcon}<span>{children}</span>{trailingIcon}
  </a>
}

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './system.css'

export type EmberButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'default' | 'small'
  loading?: boolean
  icon?: ReactNode
  iconOnly?: boolean
}

export function EmberButton({ variant = 'secondary', size = 'default', loading = false, icon, iconOnly = false, disabled, children, ...props }: EmberButtonProps) {
  return <button className="eo-button eo-scope" data-variant={variant} data-size={size} data-icon-only={iconOnly || undefined} aria-busy={loading || undefined} disabled={disabled || loading} {...props}>
    {loading ? <span className="eo-button-spinner" aria-hidden="true" /> : icon}
    {!iconOnly && <span>{children}</span>}
  </button>
}

export default EmberButton

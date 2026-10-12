import type { ButtonHTMLAttributes, ReactNode, SVGProps } from 'react'
import { Crosshair, Search, Settings, ArrowLeft, Check, Plus } from 'lucide-react'
import './system.css'

export type EmberIconName = 'add' | 'search' | 'back' | 'check' | 'settings' | 'target'

const icons = { add: Plus, search: Search, back: ArrowLeft, check: Check, settings: Settings, target: Crosshair }

export function EmberIcon({ name, label, ...props }: { name: EmberIconName; label?: string } & SVGProps<SVGSVGElement>) {
  const Glyph = icons[name]
  return <span className="eo-icon" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}><Glyph {...props} /></span>
}

export function OrbitMark({ title = 'Ember Orbit' }: { title?: string }) {
  return <svg className="eo-orbit-mark" viewBox="0 0 32 32" role="img" aria-label={title}><circle cx="16" cy="16" r="7" fill="none" stroke="currentColor"/><ellipse cx="16" cy="16" rx="14" ry="6" fill="none" stroke="currentColor" transform="rotate(-18 16 16)"/><path d="M16 1v6M16 25v6M1 16h6M25 16h6" stroke="currentColor"/><circle cx="16" cy="16" r="2" fill="currentColor" stroke="none"/></svg>
}

export function IconButton({ label, children, ...props }: { label: string; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="eo-icon-button eo-scope" type="button" aria-label={label} {...props}>{children}</button>
}

export default EmberIcon

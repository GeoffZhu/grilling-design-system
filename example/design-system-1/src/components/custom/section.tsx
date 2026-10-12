import type { HTMLAttributes, ReactNode } from 'react'
import './system.css'

export function EmberSection({ eyebrow, title, description, children, className = '', ...props }: { eyebrow?: string; title?: string; description?: string; children: ReactNode } & HTMLAttributes<HTMLElement>) {
  return <section className={`eo-section eo-scope ${className}`} {...props}><div className="eo-section-inner">
    {(title || description) && <div className="eo-section-heading"><div>{eyebrow && <p className="eo-eyebrow">{eyebrow}</p>}{title && <h2 className="eo-section-title">{title}</h2>}</div>{description && <p className="eo-section-description">{description}</p>}</div>}
    {children}
  </div></section>
}

export default EmberSection

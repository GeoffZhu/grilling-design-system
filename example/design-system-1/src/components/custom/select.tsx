import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import './system.css'

export type EmberSelectOption = { value: string; label: string; disabled?: boolean }
export type EmberSelectProps = { label: string; options: EmberSelectOption[]; value?: string; defaultValue?: string; placeholder?: string; name?: string; required?: boolean; disabled?: boolean; error?: string; onValueChange?: (value: string) => void }

export function EmberSelect({ label, options, value, defaultValue = '', placeholder = 'Select an option', name, required, disabled, error, onValueChange }: EmberSelectProps) {
  const generatedId = useId(); const triggerId = `${generatedId}-trigger`; const listId = `${generatedId}-list`; const errorId = `${generatedId}-error`
  const rootRef = useRef<HTMLDivElement>(null); const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false); const [internalValue, setInternalValue] = useState(defaultValue); const [highlighted, setHighlighted] = useState(0); const [popupStyle, setPopupStyle] = useState<CSSProperties>({})
  const selectedValue = value ?? internalValue; const selected = options.find(option => option.value === selectedValue)
  const enabled = options.map((option, index) => ({ option, index })).filter(item => !item.option.disabled)
  const choose = (nextValue: string) => { if (value === undefined) setInternalValue(nextValue); onValueChange?.(nextValue); setOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()) }
  const move = (direction: 1 | -1) => { const current = Math.max(0, enabled.findIndex(item => item.index === highlighted)); const next = enabled[(current + direction + enabled.length) % enabled.length]; if (next) setHighlighted(next.index) }
  const handleKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) { event.preventDefault(); if (!open) setOpen(true); if (event.key === 'Home') setHighlighted(enabled[0]?.index ?? 0); else if (event.key === 'End') setHighlighted(enabled.at(-1)?.index ?? 0); else move(event.key === 'ArrowDown' ? 1 : -1); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (!open) { setOpen(true); const current = options.findIndex(option => option.value === selectedValue); setHighlighted(current >= 0 ? current : enabled[0]?.index ?? 0) } else { const option = options[highlighted]; if (option && !option.disabled) choose(option.value) } }
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false) }
    if (open && event.key.length === 1 && /\S/.test(event.key)) { const match = options.findIndex(option => !option.disabled && option.label.toLowerCase().startsWith(event.key.toLowerCase())); if (match >= 0) setHighlighted(match) }
  }
  useEffect(() => { const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node) && !(event.target as Element).closest?.(`#${CSS.escape(listId)}`)) setOpen(false) }; document.addEventListener('pointerdown', close); return () => document.removeEventListener('pointerdown', close) }, [listId])
  useEffect(() => { if (!open) return; const place = () => { const rect = triggerRef.current?.getBoundingClientRect(); if (!rect) return; const popupHeight = Math.min(244, options.length * 42 + 12); const top = rect.bottom + 6 + popupHeight <= window.innerHeight - 8 ? rect.bottom + 6 : Math.max(8, rect.top - popupHeight - 6); setPopupStyle({ left: Math.max(8, rect.left), top, width: Math.min(rect.width, window.innerWidth - 16) }) }; place(); window.addEventListener('resize', place); window.addEventListener('scroll', place, true); return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) } }, [open, options.length])
  useEffect(() => { const form = rootRef.current?.closest('form'); if (!form) return; const reset = () => setInternalValue(defaultValue); form.addEventListener('reset', reset); return () => form.removeEventListener('reset', reset) }, [defaultValue])
  const popup = open ? createPortal(<div className="eo-select-popup eo-scope" style={popupStyle} id={listId} role="listbox" aria-labelledby={`${triggerId}-label`}>{options.map((option, index) => <div id={`${generatedId}-option-${index}`} className="eo-select-option" role="option" aria-selected={option.value === selectedValue} aria-disabled={option.disabled || undefined} data-highlighted={index === highlighted || undefined} onPointerMove={() => !option.disabled && setHighlighted(index)} onClick={() => !option.disabled && choose(option.value)} key={option.value}><span>{option.label}</span>{option.value === selectedValue ? <Check className="eo-icon" aria-hidden="true"/> : <span className="eo-select-option-mark" aria-hidden="true"/>}</div>)}</div>, document.body) : null
  return <div className="eo-select eo-scope" ref={rootRef}><label className="eo-field-label" id={`${triggerId}-label`} htmlFor={triggerId}>{label}</label>{name && <input type="hidden" name={name} value={selectedValue}/>}<button ref={triggerRef} id={triggerId} className="eo-select-trigger" type="button" role="combobox" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-activedescendant={open ? `${generatedId}-option-${highlighted}` : undefined} aria-labelledby={`${triggerId}-label ${triggerId}`} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} aria-required={required} data-open={open || undefined} disabled={disabled} onClick={() => setOpen(next => !next)} onKeyDown={handleKey}><span>{selected?.label ?? placeholder}</span><span className="eo-select-disclosure" aria-hidden="true"><ChevronDown/></span></button>{popup}{error && <p className="eo-field-error" id={errorId}>{error}</p>}</div>
}

export default EmberSelect

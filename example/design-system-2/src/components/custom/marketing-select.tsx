import { useId } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import './marketing.css'

export type MarketingSelectOption = { label: string; value: string; disabled?: boolean }

type MarketingSelectProps = {
  label: string
  options: MarketingSelectOption[]
  placeholder?: string
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  name?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export function MarketingSelect({ label, options, placeholder = 'Select an option', value, defaultValue, onValueChange, name, required, disabled, error }: MarketingSelectProps) {
  const id = useId()
  const items = options.map(option => ({ label: option.label, value: option.value }))
  return <div className="marketing-field marketing-surface">
    <span className="marketing-field-label" id={`${id}-label`}>{label}</span>
    <SelectPrimitive.Root items={items} value={value} defaultValue={defaultValue} onValueChange={onValueChange} name={name} required={required} disabled={disabled}>
      <SelectPrimitive.Trigger className="marketing-select-trigger" aria-labelledby={`${id}-label`} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-error` : undefined}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon render={<span className="marketing-select-trigger-icon" aria-hidden="true"><ChevronDown /></span>} />
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner className="marketing-select-positioner" sideOffset={6} align="start">
          <SelectPrimitive.Popup className="marketing-select-popup">
            <SelectPrimitive.List>
              {options.map(option => <SelectPrimitive.Item className="marketing-select-item" key={option.value} value={option.value} disabled={option.disabled}>
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="marketing-select-item-indicator"><Check aria-hidden="true" /></SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>)}
            </SelectPrimitive.List>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
    {error && <p className="marketing-field-error" id={`${id}-error`}>{error}</p>}
  </div>
}

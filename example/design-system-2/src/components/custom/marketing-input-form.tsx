import { useId, useState, type FormHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import './marketing.css'

type MarketingInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  hint?: string
  error?: string
}

export function MarketingInput({ label, hint, error, id: idProp, className = '', ...props }: MarketingInputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined
  return <div className="marketing-field marketing-surface">
    <label className="marketing-field-label" htmlFor={id}>{label}</label>
    <input className={`marketing-input ${className}`.trim()} id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={describedBy} {...props} />
    {hint && <p className="marketing-field-hint" id={`${id}-hint`}>{hint}</p>}
    {error && <p className="marketing-field-error" id={`${id}-error`}>{error}</p>}
  </div>
}

export function MarketingForm({ children, className = '', ...props }: FormHTMLAttributes<HTMLFormElement> & { children: ReactNode }) {
  return <form className={`marketing-form marketing-surface ${className}`.trim()} {...props}>{children}</form>
}

export function MarketingNewsletterForm() {
  const [message, setMessage] = useState('')
  return <MarketingForm onSubmit={event => { event.preventDefault(); setMessage('Demo submission recorded. No real subscription was sent.') }}>
    <MarketingInput label="Work email" type="email" placeholder="name@example.com" required hint="This component demo does not send a real email." />
    <div className="marketing-form-actions"><button className="marketing-button" type="submit">Submit demo</button></div>
    <div className="marketing-form-status" aria-live="polite">{message}</div>
  </MarketingForm>
}

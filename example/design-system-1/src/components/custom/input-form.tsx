import { useId, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { EmberButton } from './button'
import './system.css'

type FieldMeta = { label: string; help?: string; error?: string }

export function EmberInput({ label, help, error, id: providedId, ...props }: FieldMeta & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId(); const id = providedId ?? generatedId
  const descriptionId = `${id}-description`
  return <div className="eo-field eo-scope"><label className="eo-field-label" htmlFor={id}>{label}</label><input className="eo-input" id={id} aria-invalid={Boolean(error)} aria-describedby={(help || error) ? descriptionId : undefined} {...props}/>{(help || error) && <p className={error ? 'eo-field-error' : 'eo-field-help'} id={descriptionId}>{error ?? help}</p>}</div>
}

export function EmberTextarea({ label, help, error, id: providedId, ...props }: FieldMeta & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId(); const id = providedId ?? generatedId
  const descriptionId = `${id}-description`
  return <div className="eo-field eo-scope"><label className="eo-field-label" htmlFor={id}>{label}</label><textarea className="eo-textarea" id={id} aria-invalid={Boolean(error)} aria-describedby={(help || error) ? descriptionId : undefined} {...props}/>{(help || error) && <p className={error ? 'eo-field-error' : 'eo-field-help'} id={descriptionId}>{error ?? help}</p>}</div>
}

export function EmberContactForm() {
  const [email, setEmail] = useState(''); const [status, setStatus] = useState('')
  const invalid = email.length > 0 && !/^\S+@\S+\.\S+$/.test(email)
  const submit = (event: FormEvent) => { event.preventDefault(); if (!email || invalid) { setStatus('Enter a complete email address.'); return } setStatus('Demo submitted. No message was sent.') }
  return <form className="eo-form eo-scope" onSubmit={submit} noValidate><EmberInput label="Name" name="name" placeholder="e.g. Alex Morgan" required/><EmberInput label="Email" name="email" type="email" value={email} onChange={event => { setEmail(event.target.value); setStatus('') }} placeholder="name@example.com" error={invalid ? 'Enter a complete email address, such as name@example.com.' : undefined} required/><EmberTextarea label="Project brief" name="message" placeholder="Describe the page you want to design or improve." help="This is a component demo. No message will be sent."/><div className="eo-form-actions"><EmberButton variant="primary" type="submit">Submit demo</EmberButton>{status && <p className="eo-form-status" role="status">{status}</p>}</div></form>
}

export default EmberContactForm

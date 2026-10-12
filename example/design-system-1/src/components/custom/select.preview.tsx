import { useState } from 'react'
import { EmberButton } from './button'
import { EmberSelect } from './select'

const options = [{value:'nav',label:'Navigation core / NAV–CORE'},{value:'signal',label:'Signal array / SIGNAL–02'},{value:'archive',label:'Mission archive / ARCHIVE–03'},{value:'locked',label:'Locked channel / LOCKED',disabled:true}]

export default function SelectPreview() {
  const [value, setValue] = useState('nav'); const [submitted, setSubmitted] = useState('')
  return <form className="eo-form eo-scope" onSubmit={event => {event.preventDefault(); setSubmitted(`Selected: ${value}`)}} onReset={() => {setValue('nav'); setSubmitted('')}}><EmberSelect label="System channel" name="channel" options={options} value={value} onValueChange={setValue} required/><div className="eo-form-actions"><EmberButton variant="primary" type="submit">Confirm channel</EmberButton><EmberButton type="reset">Reset</EmberButton>{submitted && <p className="eo-form-status" role="status">{submitted}</p>}</div></form>
}

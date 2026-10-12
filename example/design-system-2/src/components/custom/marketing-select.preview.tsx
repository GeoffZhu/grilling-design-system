import { useState } from 'react'
import { MarketingSelect } from './marketing-select'

const options = [
  { label: 'Brand Design team', value: 'brand' },
  { label: 'Product Experience team', value: 'product' },
  { label: 'Unavailable external team', value: 'external', disabled: true },
  { label: 'Cross-functional team with a long name for checking popup width and wrapping', value: 'long' },
]

export default function MarketingSelectPreview() {
  const [value, setValue] = useState<string | null>('brand')
  return <div className="marketing-preview-stack" style={{ width: 'min(100%, 480px)' }}><MarketingSelect label="Responsible team" options={options} value={value} onValueChange={setValue} name="team" required /><MarketingSelect label="Invalid state" options={options} error="Choose an available team." /></div>
}

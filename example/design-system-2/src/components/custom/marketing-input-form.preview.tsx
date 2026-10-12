import { MarketingInput, MarketingNewsletterForm } from './marketing-input-form'

export default function MarketingInputFormPreview() {
  return <div className="marketing-preview-stack"><MarketingNewsletterForm /><MarketingInput label="Project name" defaultValue="Autumn launch plan" error="Include the responsible team in the project name." /></div>
}

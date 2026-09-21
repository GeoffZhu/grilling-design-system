// GRILLING_INTEGRATED_PREVIEW_PLACEHOLDER: replace this docs-only gallery composition
// with the confirmed Key Visual and remove this marker before delivery. This file may
// compose delivered ui/custom components, but must never become a component catalog or
// registry item and must not be listed in custom-components.json.
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { text } from './review-copy'

export default function IntegratedPreview() {
  return <div className="integrated-preview-placeholder">
    <div className="integrated-preview-copy">
      <Badge>{text['Design system']}</Badge>
      <h2>{text['A complete screen using the same components']}</h2>
      <p>{text['Replace this starter with the confirmed Key Visual before delivery.']}</p>
      <div className="integrated-preview-actions">
        <Button>{text['Save changes']}<ArrowRight aria-hidden="true" /></Button>
        <Button variant="outline">{text['Secondary']}</Button>
      </div>
    </div>
    <Card className="integrated-preview-card">
      <CardHeader>
        <CardTitle>{text['Changes saved']}</CardTitle>
        <CardDescription>{text['A workbench for comparing type, geometry and interaction states.']}</CardDescription>
      </CardHeader>
      <CardContent className="form-stack">
        <Input aria-label={text['Name']} placeholder={text['Enter a name']} />
        <Progress value={72} aria-label="72%" />
      </CardContent>
      <CardFooter>
        <CheckCircle2 aria-hidden="true" />
        <span>{text['Completed']}</span>
      </CardFooter>
    </Card>
  </div>
}

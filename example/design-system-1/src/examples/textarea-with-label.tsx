import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function TextareaWithLabel() {
  return (
    <div className="grid w-full gap-3">
      <Label htmlFor="message">留言</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  )
}

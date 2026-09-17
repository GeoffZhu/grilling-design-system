import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"

export default function KbdButton() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <Button variant="outline" size="sm" className="pr-2">
        确认 <Kbd>⏎</Kbd>
      </Button>
      <Button variant="outline" size="sm" className="pr-2">
        取消 <Kbd>Esc</Kbd>
      </Button>
    </div>
  )
}

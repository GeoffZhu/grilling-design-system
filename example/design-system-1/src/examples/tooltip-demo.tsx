import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TooltipDemo() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">悬停查看</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>添加到组件库</p>
      </TooltipContent>
    </Tooltip>
  )
}

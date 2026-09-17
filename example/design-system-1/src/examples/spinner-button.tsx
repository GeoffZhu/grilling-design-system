import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function SpinnerButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled size="sm">
        <Spinner />
        正在加载…
      </Button>
      <Button variant="outline" disabled size="sm">
        <Spinner />
        请稍候
      </Button>
      <Button variant="secondary" disabled size="sm">
        <Spinner />
        正在处理
      </Button>
    </div>
  )
}

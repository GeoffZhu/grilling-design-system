import { Check, Clock3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CatBackdrop } from "./cat-backdrop"

export default function CatBackdropPreview() {
  return (
    <div className="grid w-full gap-5">
      <CatBackdrop variant="page">
        <p className="mb-3 text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
          今日陪伴
        </p>
        <h2 className="max-w-md text-3xl font-bold sm:text-4xl">
          把每一次照护，变成安心的小事。
        </h2>
        <p className="mt-4 max-w-sm text-muted-foreground">
          用清楚的记录掌握饮水、进食与日常状态。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button>开始记录</Button>
          <Button variant="outline">查看今日计划</Button>
        </div>
      </CatBackdrop>

      <CatBackdrop variant="card" className="max-w-xl">
        <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
          下一项
        </span>
        <h3 className="mt-4 text-xl font-bold">晚餐后补充饮水</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="size-4" aria-hidden="true" />
          预计 20:00 · 约 150 ml
        </p>
        <Button size="icon" className="mt-6" aria-label="标记完成">
          <Check aria-hidden="true" />
        </Button>
      </CatBackdrop>
    </div>
  )
}

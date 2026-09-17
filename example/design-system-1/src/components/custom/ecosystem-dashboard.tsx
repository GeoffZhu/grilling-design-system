import { useState } from "react"
import type { Workshop } from "./workshop-schedule"
import { WorkshopSchedule } from "./workshop-schedule"
import { EngagementChart } from "./engagement-chart"
import { BrandFocusCard } from "./brand-focus-card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import "./organic-components.css"

export function EcosystemDashboard() {
  const [selected, setSelected] = useState<Workshop | null>(null)
  return (
    <main className="ecosystem-dashboard">
      <WorkshopSchedule onOpen={setSelected} />
      <div className="dashboard-lower">
        <BrandFocusCard />
        <EngagementChart />
      </div>
      <Dialog open={Boolean(selected)} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selected?.module}</DialogTitle><DialogDescription>{selected?.instructor} · {selected?.date} · {selected?.time}</DialogDescription></DialogHeader>
          <p className="dialog-note">课程信息已准备好。你可以继续编辑安排，或关闭窗口返回列表。</p>
        </DialogContent>
      </Dialog>
    </main>
  )
}

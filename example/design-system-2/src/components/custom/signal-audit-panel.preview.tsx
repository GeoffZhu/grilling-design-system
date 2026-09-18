import { useState } from "react"
import { toast } from "sonner"
import { SignalAuditPanel } from "./signal-audit-panel"

export default function SignalAuditPanelPreview() {
  const [loading, setLoading] = useState(false)
  const run = () => {
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      toast.success("策略简报已生成")
    }, 700)
  }

  return <SignalAuditPanel
    score={87}
    metrics={[
      { label: "定位强度", value: 92 },
      { label: "信息层级", value: 76, tone: "accent" },
      { label: "发布准备度", value: 84, tone: "neutral" },
    ]}
    signalGap="定价叙事"
    nextMove="梳理转化路径"
    loading={loading}
    onAction={run}
  />
}

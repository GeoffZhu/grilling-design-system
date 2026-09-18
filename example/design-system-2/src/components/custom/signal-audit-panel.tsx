import { ArrowUpRight, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "cn"
import "./signal-audit-panel.css"

export type SignalMetric = {
  label: string
  value: number
  tone?: "primary" | "accent" | "neutral"
}

export type SignalAuditPanelProps = {
  title?: string
  status?: string
  score: number
  metrics: SignalMetric[]
  signalGap?: string
  nextMove?: string
  actionLabel?: string
  loading?: boolean
  className?: string
  onAction?: () => void
}

export function SignalAuditPanel({
  title = "实时品牌信号审计",
  status = "活动中",
  score,
  metrics,
  signalGap,
  nextMove,
  actionLabel = "生成策略简报",
  loading = false,
  className,
  onAction,
}: SignalAuditPanelProps) {
  return (
    <section className={cn("signal-audit", className)} aria-label={title}>
      <div className="signal-audit__orbit" aria-hidden="true"><span /></div>
      <header className="signal-audit__header">
        <div className="signal-audit__live"><i aria-hidden="true" />{title}</div>
        <span className="signal-audit__status">{status}</span>
      </header>

      <div className="signal-audit__score">
        <span className="signal-audit__label">清晰度评分</span>
        <strong>{score}<small>%</small></strong>
      </div>

      <div className="signal-audit__metrics">
        {metrics.map((metric) => (
          <div className="signal-audit__metric" key={metric.label}>
            <div><span>{metric.label}</span><b>{metric.value}%</b></div>
            <div className="signal-audit__track"><i className={`is-${metric.tone ?? "primary"}`} style={{ width: `${Math.max(0, Math.min(100, metric.value))}%` }} /></div>
          </div>
        ))}
      </div>

      {(signalGap || nextMove) && <div className="signal-audit__insights">
        {signalGap && <div><span className="signal-audit__label">信号缺口</span><p>{signalGap}</p></div>}
        {nextMove && <div><span className="signal-audit__label">下一步</span><p>{nextMove}</p></div>}
      </div>}

      <footer className="signal-audit__footer">
        <span>{actionLabel}</span>
        <Button size="icon" aria-label={actionLabel} disabled={loading} onClick={onAction}>
          {loading ? <LoaderCircle className="animate-spin" /> : <ArrowUpRight />}
        </Button>
      </footer>
    </section>
  )
}

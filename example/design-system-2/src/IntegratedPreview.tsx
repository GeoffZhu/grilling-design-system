import { ArrowRight, ArrowUpRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignalAuditPanel } from "@/components/custom/signal-audit-panel"
import "./integrated-preview.css"

export default function IntegratedPreview() {
  return <main className="signal-page">
    <section className="signal-story">
      <div className="signal-brand"><i /> AI 品牌洞察工作室</div>
      <div className="signal-story__body">
        <h1><span>解读信号。</span><span>设计<em className="editorial-accent">系统。</em></span></h1>
        <p>我们把分散的产品、市场与品牌输入，转化为更鲜明的定位、更一致的识别系统，以及可以直接发布的数字体验。</p>
        <div className="signal-stats">
          <div><strong>87%</strong><span>清晰度提升</span></div>
          <div><strong>14D</strong><span>审计周期</span></div>
          <div><strong>3X</strong><span>发布聚焦</span></div>
        </div>
        <div className="signal-actions">
          <Button size="lg">开始品牌审计 <ArrowUpRight /></Button>
          <Button variant="ghost" size="lg">查看系统 <Play /></Button>
        </div>
      </div>
      <div className="signal-rail">EMBER SIGNAL — BRAND INTELLIGENCE SYSTEM</div>
    </section>

    <section className="signal-workspace">
      <div className="signal-workspace__rings" aria-hidden="true"><i /></div>
      <div className="signal-index">SIGNAL / 04</div>
      <SignalAuditPanel
        score={87}
        metrics={[
          { label: "定位强度", value: 92 },
          { label: "信息层级", value: 76, tone: "accent" },
          { label: "发布准备度", value: 84, tone: "neutral" },
        ]}
        signalGap="定价叙事"
        nextMove="梳理转化路径"
      />
      <a className="signal-next" href="#next">查看下一个信号 <ArrowRight /></a>
    </section>
  </main>
}

import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import "./organic-components.css"

export function BrandFocusCard({ onExplore }: { onExplore?: () => void }) {
  return (
    <section className="brand-focus" aria-labelledby="brand-focus-title">
      <div className="brand-mark"><span aria-hidden="true">◒</span> EcoSphere</div>
      <div className="network-orb" aria-hidden="true">
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>
      <h2 id="brand-focus-title">让知识<br />自然生长。</h2>
      <div className="brand-actions">
        <Button type="button" variant="outline" size="icon" aria-label="播放介绍"><Play aria-hidden="true" /></Button>
        <Button type="button" variant="outline" size="icon" aria-label="探索 EcoSphere" onClick={onExplore}><ArrowRight aria-hidden="true" /></Button>
        <p>加入生态学习网络<br />共同连接与成长</p>
      </div>
    </section>
  )
}

import { useState } from "react"
import "./organic-components.css"

const series = {
  "7天": [58, 41, 85, 49, 66],
  "30天": [68, 52, 74, 63, 82],
} as const
const labels = ["周一", "周二", "周三", "周四", "周五"]

export function EngagementChart({ initialRange = "7天" }: { initialRange?: keyof typeof series }) {
  const [range, setRange] = useState<keyof typeof series>(initialRange)
  const values = series[range]
  return (
    <section className="engagement-card" aria-labelledby="engagement-title">
      <div className="engagement-heading">
        <div><p className="organic-kicker">参与趋势</p><h2 id="engagement-title">每周参与度</h2></div>
        <div className="range-tabs" role="group" aria-label="数据周期">
          {(Object.keys(series) as Array<keyof typeof series>).map(item => <button type="button" aria-pressed={range === item} className={range === item ? "active" : ""} onClick={() => setRange(item)} key={item}>{item}</button>)}
        </div>
      </div>
      <div className="bar-chart" role="img" aria-label={`${range}参与度：${labels.map((label, index) => `${label}${values[index]}%`).join("，")}`}>
        {values.map((value, index) => (
          <div className={`bar-column ${index === 2 ? "is-highlight" : ""}`} key={labels[index]}>
            <div className="bar-track"><span className="bar-value" style={{ height: `${value}%` }}>{index === 2 && <b>{value}</b>}</span></div>
            <small>{labels[index]}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

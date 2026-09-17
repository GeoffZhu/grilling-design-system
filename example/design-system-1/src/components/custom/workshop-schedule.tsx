import { BarChart3, Clock3, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import "./organic-components.css"

export type Workshop = {
  id: string
  instructor: string
  role: string
  initials: string
  module: string
  level: "入门" | "进阶" | "高级"
  date: string
  time: string
}

const defaultWorkshops: Workshop[] = [
  { id: "systems", instructor: "林墨", role: "系统生态顾问", initials: "林", module: "可持续系统", level: "进阶", date: "11 月 14 日", time: "09:00–11:00" },
  { id: "architecture", instructor: "周岚", role: "绿色建筑师", initials: "周", module: "绿色建筑", level: "高级", date: "11 月 16 日", time: "11:00–13:00" },
  { id: "energy", instructor: "陈野", role: "能源顾问", initials: "陈", module: "再生能源", level: "入门", date: "11 月 19 日", time: "14:00–16:00" },
  { id: "data", instructor: "艾青", role: "数据科学家", initials: "艾", module: "生态数据分析", level: "进阶", date: "11 月 22 日", time: "16:00–18:00" },
]

export function WorkshopSchedule({
  items = defaultWorkshops,
  onOpen,
}: {
  items?: Workshop[]
  onOpen?: (workshop: Workshop) => void
}) {
  return (
    <section className="workshop-schedule" aria-labelledby="workshop-schedule-title">
      <div className="schedule-heading">
        <div>
          <p className="organic-kicker">学习计划</p>
          <h2 id="workshop-schedule-title"><span>生态技术</span><span>工作坊</span></h2>
        </div>
        <div className="schedule-stats" aria-label="课程数据">
          <p><strong>18k+</strong><span>全球参与者</span></p>
          <p><strong>88%</strong><span>课程完成率</span></p>
        </div>
      </div>

      <div className="schedule-table" role="table" aria-label="工作坊日程">
        <div className="schedule-header" role="row">
          <span role="columnheader">讲师</span><span role="columnheader">课程</span><span role="columnheader">级别</span><span role="columnheader">日期</span><span role="columnheader">时间</span><span aria-hidden="true" />
        </div>
        <div role="rowgroup" className="schedule-body">
          {items.map((item, index) => (
            <div className="schedule-row" role="row" key={item.id}>
              <div className="instructor" role="cell"><span className={`avatar-tone avatar-tone-${index + 1}`} aria-hidden="true">{item.initials}</span><span><strong>{item.instructor}</strong><small>{item.role}</small></span></div>
              <strong className="module" role="cell">{item.module}</strong>
              <div role="cell"><span className="level-pill"><BarChart3 aria-hidden="true" />{item.level}</span></div>
              <span role="cell" className="date-cell"><small>日期</small>{item.date}</span>
              <span role="cell" className="time-cell"><Clock3 aria-hidden="true" /><span><small>时间</small>{item.time}</span></span>
              <div role="cell"><Button type="button" variant="ghost" size="icon" aria-label={`打开${item.module}的操作`} onClick={() => onOpen?.(item)}><MoreHorizontal aria-hidden="true" /></Button></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { defaultWorkshops }

import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, Menu, Plus, Search, Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import './integrated-preview.css'

const tasks = [
  { title: '确认场地布置', owner: '林澄', date: '9 月 22 日', tone: 'blue' },
  { title: '整理嘉宾名单', owner: '周宁', date: '9 月 24 日', tone: 'pink' },
  { title: '检查现场物料', owner: '陈屿', date: '9 月 25 日', tone: 'orange' },
]

export default function IntegratedPreview({ presentation = false }: { presentation?: boolean }) {
  const [query, setQuery] = useState('')
  const [completed, setCompleted] = useState<string[]>([])
  const visibleTasks = tasks.filter(task => task.title.includes(query.trim()))
  const toggleTask = (title: string) => setCompleted(current => current.includes(title) ? current.filter(item => item !== title) : [...current, title])

  return <div data-slot="integrated-preview" className={presentation ? 'playform-preview playform-presentation' : 'playform-preview overview-workspace'}>
    <section className="playform-workspace" aria-label="夏日开放日项目工作台">
      <aside className="playform-rail" aria-label="项目导航">
        <a className="playform-logo" href="#workspace-top" aria-label="返回项目首页">P</a>
        <nav>
          <a className="is-active" href="#tasks" aria-label="任务"><CalendarDays aria-hidden="true" /><span>任务</span></a>
          <a href="#settings" aria-label="设置"><Settings2 aria-hidden="true" /><span>设置</span></a>
        </nav>
        <Button variant="secondary" size="icon" aria-label="打开菜单"><Menu aria-hidden="true" /></Button>
      </aside>
      <div className="playform-main" id="workspace-top">
        <header className="playform-header">
          <div><p>创意工作台</p><h1>夏日开放日</h1></div>
          <div className="playform-header-actions">
            <label className="playform-search"><span className="sr-only">搜索任务</span><Search aria-hidden="true" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索任务" /></label>
            <Button><Plus aria-hidden="true" />新建任务</Button>
          </div>
        </header>
        <div className="playform-summary-grid">
          <article className="playform-progress-card"><div className="playform-card-heading"><div><p>本周进度</p><strong>{42 + completed.length * 14}%</strong></div><Badge variant="secondary">进展顺利</Badge></div><Progress value={42 + completed.length * 14} aria-label="本周任务完成进度" /><small>完成任务后，进度会立即更新。</small></article>
          <article className="playform-note"><span className="playform-sticker" aria-hidden="true"><i /><i /><i /></span><p>下一场活动</p><h2>把重要细节收拢到一起。</h2><a href="#tasks">查看今日安排 <ArrowRight aria-hidden="true" /></a></article>
        </div>
        <section className="playform-tasks" id="tasks" aria-labelledby="task-title">
          <div className="playform-section-heading"><div><p>今日安排</p><h2 id="task-title">优先任务</h2></div><span>{visibleTasks.length} 项</span></div>
          <div className="playform-task-list">
            {visibleTasks.map(task => { const done = completed.includes(task.title); return <button aria-pressed={done} className={done ? 'playform-task is-done' : 'playform-task'} type="button" onClick={() => toggleTask(task.title)} key={task.title}><span className={`playform-task-mark ${task.tone}`}>{done && <Check aria-hidden="true" />}</span><span className="playform-task-copy"><strong>{task.title}</strong><small>{task.owner}</small></span><span className="playform-task-date">{task.date}</span><ArrowRight className="playform-task-arrow" aria-hidden="true" /></button> })}
            {!visibleTasks.length && <div className="playform-empty">没有找到任务。试试更短的关键词。</div>}
          </div>
        </section>
      </div>
    </section>
  </div>
}

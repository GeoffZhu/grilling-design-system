import { ArrowUpRight, CalendarDays, CheckCircle2, CircleDot, Clock3, FolderKanban, LayoutDashboard, MessageSquareText, Plus, Search, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { MarketingCard, MarketingCardGrid } from '@/components/custom/marketing-card'
import { MarketingFooter } from '@/components/custom/marketing-footer'
import { MarketingHeader } from '@/components/custom/marketing-header'
import { MarketingHero } from '@/components/custom/marketing-hero'
import { MarketingNewsletterForm } from '@/components/custom/marketing-input-form'
import { MarketingSection } from '@/components/custom/marketing-section'

const navItems = [
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'How it works', href: '#workspace' },
  { label: 'Design language', href: '#design-language' },
]

function WorkspacePreview() {
  return <div className="starry-workspace" aria-label="Project management interface example">
    <aside className="starry-workspace-sidebar">
      <div className="starry-workspace-brand"><span aria-hidden="true" />Starry Current</div>
      <nav aria-label="Workspace navigation">
        <a className="active" href="#workspace"><LayoutDashboard aria-hidden="true" />Project overview</a>
        <a href="#reviews"><MessageSquareText aria-hidden="true" />Review queue</a>
        <a href="#calendar"><CalendarDays aria-hidden="true" />Team calendar</a>
        <a href="#projects"><FolderKanban aria-hidden="true" />All projects</a>
      </nav>
    </aside>
    <div className="starry-workspace-main">
      <header className="starry-workspace-toolbar">
        <div><span>Workspace</span><h3>Project overview</h3></div>
        <div className="starry-workspace-actions"><div className="starry-workspace-search"><Search aria-hidden="true" /><Input aria-label="Search projects" placeholder="Search projects" /></div><Button><Plus aria-hidden="true" />New project</Button></div>
      </header>
      <div className="starry-stat-grid">
        <Card><CardHeader><CardDescription>In progress</CardDescription><CardTitle>12</CardTitle></CardHeader><CardContent><Progress value={68} aria-label="In-progress projects at 68 percent" /><span>3 added this week</span></CardContent></Card>
        <Card><CardHeader><CardDescription>Awaiting review</CardDescription><CardTitle>03</CardTitle></CardHeader><CardContent><Clock3 aria-hidden="true" /><span>Earliest deadline · 18:30</span></CardContent></Card>
        <Card><CardHeader><CardDescription>Completed this week</CardDescription><CardTitle>08</CardTitle></CardHeader><CardContent><CheckCircle2 aria-hidden="true" /><span>7 completed on time</span></CardContent></Card>
      </div>
      <Card className="starry-project-list">
        <CardHeader><div><CardTitle>Recent projects</CardTitle><CardDescription>Ordered by the next action required</CardDescription></div><Button variant="ghost" size="sm">View all<ArrowUpRight aria-hidden="true" /></Button></CardHeader>
        <CardContent>
          <div className="starry-project-row"><CircleDot aria-hidden="true" /><div><strong>Autumn launch plan</strong><span>Brand and Product teams · Today, 18:30</span></div><Badge>Awaiting review</Badge></div>
          <div className="starry-project-row"><Sparkles aria-hidden="true" /><div><strong>Star Map mobile update</strong><span>Experience team · Tomorrow, 11:00</span></div><Badge variant="secondary">In progress</Badge></div>
        </CardContent>
      </Card>
    </div>
  </div>
}

export default function IntegratedPreview() {
  return <div className="starry-integrated-page">
    <MarketingHeader items={navItems} />
    <MarketingHero
      title="Keep every project moving on a clear path"
      description="Bring planning, reviews, and delivery into one shared workspace. Starry Current is an illustrative SaaS used to demonstrate this design system, not a real product claim."
      primaryAction={{ label: 'Enter workspace', href: '#workspace' }}
      secondaryAction={{ label: 'View projects', href: '#capabilities' }}
      visual={<div className="marketing-orbit-panel"><span className="marketing-card-label">Tonight's project orbit</span><div className="marketing-orbit-value">12</div><div className="marketing-orbit-meta"><span>3 awaiting review</span><span>8 completed this week</span></div></div>}
    />
    <MarketingSection id="capabilities" eyebrow="Clear collaboration" title="Expansive expression and focused work, each with its own rhythm" description="The brand area establishes direction, while the management interface keeps tasks clear and actionable. Both share the same warm–cool palette and type hierarchy without repeating one decorative treatment across every component.">
      <MarketingCardGrid>
        <MarketingCard label="Project orbit" title="See priorities before moving work forward" description="See active work, pending reviews, and approaching deadlines in one view." value="12" action={<Button variant="outline" size="sm">View example<ArrowUpRight aria-hidden="true" /></Button>} />
        <MarketingCard label="Awaiting review" title="3 projects" description="Use explicit status and timing details to sequence reviews." value="03" />
        <MarketingCard label="Completed this week" title="Keep a steady rhythm" description="Example data is used only to demonstrate information hierarchy." value="08" variant="project" />
      </MarketingCardGrid>
    </MarketingSection>
    <MarketingSection id="workspace" tone="quiet" eyebrow="Real component composition" title="Enter a calm, precise workspace" description="The sidebar, cards, buttons, inputs, badges, and progress indicators all use delivered components rather than one-off imitations created for the Key Visual.">
      <WorkspacePreview />
    </MarketingSection>
    <MarketingSection id="design-language" tone="raised" eyebrow="Example contact form" title="Complete an action with clear feedback" description="Submission only displays a result in this demo. It does not imply that an account was created or a real subscription was sent.">
      <MarketingNewsletterForm />
    </MarketingSection>
    <MarketingFooter groups={[
      { title: 'Product', links: [{ label: 'Project overview', href: '#workspace' }, { label: 'Review queue', href: '#workspace' }] },
      { title: 'Resources', links: [{ label: 'Design language', href: '#design-language' }, { label: 'Component directory', href: '#components' }] },
      { title: 'About', links: [{ label: 'Example notes', href: '#capabilities' }] },
    ]} />
  </div>
}

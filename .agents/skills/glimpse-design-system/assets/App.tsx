import { useState } from 'react'
import { Plus, Search, Settings, Check, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import FullGallery from './FullGallery'
import tokens from '../tokens.json'
import { text } from './review-copy'
import './gallery.css'

// Neutral review workbench. Replace with a composition derived from the input.
export default function App() {
  const [gallery, setGallery] = useState(location.hash === '#all')
  const [reminders, setReminders] = useState(true)
  const [name, setName] = useState('')
  const [mode, setMode] = useState(tokens.mode)
  const colorNames: Record<string, string> = { primary: text['Primary color'], secondary: text['Secondary color'], accent: text['Accent color'], foreground: text['Text color'] }
  const alternate = (tokens as typeof tokens & { alternate?: { mode: string } }).alternate
  return <div className="app-shell">
    <header className="app-header"><a className="wordmark" href="#core" onClick={() => setGallery(false)}>{tokens.name}</a>
      <nav className="header-actions" aria-label={text["Component views"]}>
        {alternate && <Button variant="outline" onClick={() => { const next = mode === tokens.mode ? alternate.mode : tokens.mode; document.documentElement.classList.remove(mode); document.documentElement.classList.add(next); setMode(next) }}>{text[mode] || mode}</Button>}
        <Button variant="ghost" onClick={() => { setGallery(!gallery); location.hash = gallery ? 'core' : 'all' }}>{gallery ? text["Core components"] : text["All components"]}</Button>
      </nav>
    </header>
    {gallery ? <main className="full-gallery"><h1>{text["Component library"]}</h1><FullGallery /></main> : <main className="specimen">
      <div className="specimen-title"><div><h1>{text["Core components"]}</h1><p>{text["A workbench for comparing type, geometry and interaction states."]}</p></div>
        <div className="palette" aria-label={text["Theme palette"]}>{['primary', 'secondary', 'accent', 'foreground'].map(color => <span key={color} style={{ background: 'var(--' + color + ')' }} title={colorNames[color]} />)}</div>
      </div>
      <div className="specimen-grid">
        <section className="specimen-section"><h2>{text["Actions"]}</h2><div className="form-stack">
          <div className="row start"><Button onClick={() => toast.success(text["Changes saved"])}>{text["Save changes"]}</Button><Button variant="secondary">{text["Secondary"]}</Button><Button variant="outline">{text["Cancel"]}</Button></div>
          <div className="row start"><Button size="sm">{text["Compact"]}</Button><Button size="icon" aria-label={text["Add item"]}><Plus /></Button><Button variant="ghost" size="icon" aria-label={text["Search"]}><Search /></Button></div>
          <div className="row start"><Button disabled>{text["Unavailable"]}</Button><Button disabled variant="outline"><LoaderCircle aria-hidden="true" />{text["Saving changes"]}</Button></div>
          <h3>{text["Icons"]}</h3><div className="row start">{[Plus, Search, Settings, Check].map((Icon, index) => <Icon key={index} style={{ width: tokens.icons.size, height: tokens.icons.size }} aria-hidden="true" />)}</div><p className="specimen-caption">{tokens.icons.family}</p>
        </div></section>
        <section className="specimen-section"><h2>{text["Form controls"]}</h2><div className="form-stack">
          <Label htmlFor="name">{text["Name"]}</Label><Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={text["Enter a name"]} />
          <Label htmlFor="email">{text["Email"]}</Label><Input id="email" type="email" aria-invalid="true" aria-describedby="email-error" defaultValue="example" /><p id="email-error" className="error">{text["Enter a complete email address, such as you@example.com."]}</p>
          <div className="row"><Label htmlFor="reminders">{text["Reminders"]}</Label><Switch id="reminders" checked={reminders} onCheckedChange={setReminders} /></div>
          <div className="row start"><Checkbox id="updates" /><Label htmlFor="updates">{text["Receive updates"]}</Label></div>
        </div></section>
        <section className="specimen-section"><h2>{text["Selection and overlays"]}</h2><div className="form-stack">
          <Tabs defaultValue="week"><TabsList><TabsTrigger value="week">{text["Week"]}</TabsTrigger><TabsTrigger value="month">{text["Month"]}</TabsTrigger></TabsList><TabsContent value="week">{text["Weekly view"]}</TabsContent><TabsContent value="month">{text["Monthly view"]}</TabsContent></Tabs>
          <Dialog><DialogTrigger asChild><Button variant="outline">{text["Edit preferences"]}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{text["Edit preferences"]}</DialogTitle><DialogDescription>{text["Choose which updates you receive."]}</DialogDescription></DialogHeader><div className="row start"><Checkbox id="dialog-updates" defaultChecked /><Label htmlFor="dialog-updates">{text["Receive updates"]}</Label></div><DialogFooter><DialogClose asChild><Button onClick={() => toast.success(text["Preferences saved"])}>{text["Save preferences"]}</Button></DialogClose></DialogFooter></DialogContent></Dialog>
        </div></section>
      </div>
    </main>}
    <Toaster containerAriaLabel={text["Notifications"]} />
  </div>
}

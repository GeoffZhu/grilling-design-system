import fs from 'node:fs';
import path from 'node:path';
import { MARKETING_COMPONENTS } from '../../skills/grilling-design-system/scripts/product.js';
import { COLOR_KEYS } from '../../skills/grilling-design-system/scripts/theme.js';

export function tokens() {
  const colors = Object.fromEntries(COLOR_KEYS.map(key => [key, key.endsWith('foreground') ? '#111111' : '#FFFFFF']));
  Object.assign(colors, { primary: '#174A3C', 'primary-foreground': '#FFFFFF', foreground: '#111111', destructive: '#AA2222', border: '#CCD8D1', input: '#77877D', ring: '#174A3C' });
  return { name: 'Field Notes', slug: 'field-notes', mode: 'light', colors, radius: 12,
    font: { family: 'system-ui', heading: 'system-ui', bodySize: 16, headingWeight: 700 },
    spacing: { unit: 4, controlHeight: 44 }, icons: { family: 'Lucide', size: 20, stroke: 2 },
    motion: { duration: 160, easing: 'ease-out' }, shadow: 'none' };
}
const put = (root, rel, text) => { const file = path.join(root, rel); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); };

export function marketingFixture(output) {
  const components = {
    button: ['Button', 'export function Button({children,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className="brand-button" {...props}>{children}</button>}'],
    header: ['Header', 'export function Header(){const [open,setOpen]=useState(false);return <header className="brand-header"><a href="#home">Field Notes</a><button className="nav-toggle" aria-label="Toggle navigation" aria-expanded={open} onClick={()=>setOpen(!open)}>Menu</button><nav className={open?"brand-nav open":"brand-nav"}><a href="#features">Features</a><a href="#contact">Contact</a></nav></header>}'],
    hero: ['Hero', 'export function Hero({children}:PropsWithChildren){return <section className="brand-hero" id="home"><p>Simple tools for good work</p><h1>Make space for your next idea.</h1><p>A focused workspace that helps teams think clearly and build together.</p>{children}</section>}'],
    section: ['Section', 'export function Section({children,...props}:HTMLAttributes<HTMLElement>){return <section className="brand-section" {...props}>{children}</section>}'],
    card: ['Card', 'export function Card(){return <article className="brand-card"><h3>A calmer workflow</h3><p>Keep decisions, notes and next steps together.</p></article>}'],
    footer: ['Footer', 'export function Footer(){return <footer className="brand-footer"><span>Field Notes</span><a href="#contact">Contact</a></footer>}'],
    'input-form': ['InputForm', 'export function InputForm(){const [sent,setSent]=useState(false);return <form className="brand-form" onSubmit={e=>{e.preventDefault();setSent(true)}}><label htmlFor="email">Work email</label><input id="email" type="email" required placeholder="you@example.com"/><button className="brand-button">Join the list</button>{sent&&<p role="status">Thanks for joining.</p>}</form>}'],
    select: ['Select', 'export function Select(){return <label className="brand-select">Team size<select defaultValue="small"><option value="small">1–10 people</option><option value="large">11–50 people</option></select></label>}'],
    icon: ['Icon', 'export function Icon(){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Completed" role="img"><path d="m5 12 4 4L19 6"/></svg>}'],
  };
  const entries = MARKETING_COMPONENTS.map(name => {
    const [symbol, body] = components[name];
    const file = 'src/components/custom/' + name + '.tsx';
    put(output, file, 'import { useState } from "react";\nimport type { ButtonHTMLAttributes, PropsWithChildren, HTMLAttributes } from "react";\nimport "./brand.css";\n' + body + '\n');
    const preview = 'src/components/custom/' + name + '.preview.tsx';
    put(output, preview, 'import { ' + symbol + ' } from "./' + name + '";\nexport default function Preview(){return <' + symbol + '>' + (['button','hero','section'].includes(name) ? 'Explore' : '') + '</' + symbol + '>}');
    return { name, title: symbol, description: 'Custom ' + name + ' example', files: [file], preview: { path: preview } };
  });
  put(output, 'src/components/custom/brand.css', '.brand-header,.brand-footer{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px}.brand-header a,.brand-footer a{color:var(--foreground)}.brand-nav{display:flex;gap:24px}.nav-toggle{display:none}.brand-hero{padding:clamp(24px,6vw,64px);background:#edf3ee}.brand-hero h1{font-size:clamp(32px,4vw,52px);line-height:1.1;max-width:16ch}.brand-section{padding:32px 24px}.brand-button{background:var(--primary);color:var(--primary-foreground);border:0;border-radius:var(--control-radius);min-height:44px;padding:10px 22px;cursor:pointer}.brand-button:focus-visible,.brand-form input:focus-visible,.brand-select select:focus-visible{outline:2px solid var(--ring);outline-offset:3px}.brand-card{border:1px solid var(--border);border-radius:var(--radius);padding:24px}.brand-form{display:flex;flex-direction:column;gap:12px;max-width:400px}.brand-form input,.brand-select select{min-height:44px;border:1px solid var(--border);border-radius:8px;padding:10px;width:100%;background:var(--background);color:var(--foreground)}.brand-select{display:grid;gap:8px;max-width:300px}.brand-form input:user-invalid{border-color:var(--destructive)}@media(max-width:600px){.nav-toggle{display:block;min-height:44px}.brand-header{flex-wrap:wrap}.brand-nav{display:none;width:100%}.brand-nav.open{display:flex}.brand-footer{flex-wrap:wrap}}');
  put(output, 'custom-components.json', JSON.stringify({ components: entries }));
  put(output, 'src/IntegratedPreview.tsx', 'import { Button } from "@/components/custom/button";\nimport { Header } from "@/components/custom/header";\nimport { Hero } from "@/components/custom/hero";\nimport { Section } from "@/components/custom/section";\nimport { Card } from "@/components/custom/card";\nimport { Footer } from "@/components/custom/footer";\nimport { InputForm } from "@/components/custom/input-form";\nimport { Select } from "@/components/custom/select";\nimport { Icon } from "@/components/custom/icon";\nexport default function IntegratedPreview(){return <div><Header/><Hero><Button onClick={()=>document.getElementById("contact")?.scrollIntoView()}>Get started</Button></Hero><Section id="features"><Icon/><Card/></Section><Section id="contact"><h2>Stay in the loop</h2><InputForm/><Select/></Section><Footer/></div>}');
  return entries;
}

#!/usr/bin/env python3
"""Build real shadcn source, themed gallery and an installable registry."""
import argparse
import html
from concurrent.futures import ThreadPoolExecutor
import json
from pathlib import Path
import re
import shutil
import subprocess
import time
from urllib.request import urlopen, Request

from studio import read, write, digest, save
from theme import validate, css, contrast, geometry
from language import translated_copy

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
ORIGIN = 'https://ui.shadcn.com/r/styles/new-york-v4/'
CORE = ['button','card','badge','input','label','checkbox','switch','tabs','dialog',
        'progress','avatar','select','slider','textarea','tooltip','sonner']

def fetch(name, cache):
    target=cache/(name+'.json')
    if target.exists(): return read(target)
    error=None
    for attempt in range(3):
        try:
            with urlopen(Request(ORIGIN+name+'.json',headers={'User-Agent':'Glimpse/1.0'}),timeout=45) as r:
                data=json.load(r)
            write(target,data)
            return data
        except Exception as e:
            error=e
            time.sleep(attempt+1)
    raise RuntimeError('Cannot fetch official shadcn item '+name+': '+str(error))

def filename(source):
    prefix='registry/new-york-v4/'
    if not source.startswith(prefix): raise ValueError('Unexpected upstream path '+source)
    rel=source[len(prefix):]
    if rel.startswith('ui/'): return 'src/components/'+rel
    if rel.startswith('examples/'): return 'src/'+rel
    if rel.startswith(('blocks/','internal/')): return 'src/'+rel
    if rel.startswith(('hooks/','lib/')): return 'src/'+rel
    raise ValueError('Unsupported upstream file '+source)

def transform(content):
    return (content.replace('@/registry/new-york-v4/ui/', '@/components/ui/')
            .replace('@/registry/new-york-v4/', '@/')
            .replace('from "next-themes"','from "@/lib/theme-mode"')
            .replace('from "next/image"','from "@/lib/next-image"')
            .replace('from "next/link"','from "@/lib/next-link"')
            .replace('from "@tabler/icons-react"','from "@/lib/tabler-icons"'))

def theme_example(name, content):
    # Upstream examples may demonstrate a fixed palette. Preserve their states
    # while making the gallery follow the selected design system's semantics.
    replacements = {
        'checkbox-demo': {
            'dark:has-[[aria-checked=true]]:border-blue-900': '',
            'dark:has-[[aria-checked=true]]:bg-blue-950': '',
            'dark:data-[state=checked]:border-blue-700': '',
            'dark:data-[state=checked]:bg-blue-700': '',
            'has-[[aria-checked=true]]:border-blue-600': 'has-[[aria-checked=true]]:border-primary',
            'has-[[aria-checked=true]]:bg-blue-50': 'has-[[aria-checked=true]]:bg-primary/5',
            'data-[state=checked]:border-blue-600': 'data-[state=checked]:border-primary',
            'data-[state=checked]:bg-blue-600': 'data-[state=checked]:bg-primary',
            'data-[state=checked]:text-white': 'data-[state=checked]:text-primary-foreground',
        },
        'badge-demo': {
            'dark:bg-blue-600': '',
            'bg-blue-500 text-white': 'bg-primary text-primary-foreground',
        },
        'toggle-demo': {
            'fill-blue-500': 'fill-primary',
            'stroke-blue-500': 'stroke-primary',
        },
    }
    for source, target in replacements.get(name, {}).items():
        content = content.replace(source, target)
    return content

def dependencies(items):
    result={}
    for item in items:
        for dep in item.get('dependencies',[])+item.get('devDependencies',[]):
            match=re.match(r'^(@[^/]+/[^@]+|[^@]+)(?:@(.+))?$',dep)
            if not match: raise ValueError('Unsupported dependency '+dep)
            name,version=match.groups()
            result[name]=version or 'latest'
    return result

def collect(names, cache):
    items={}
    pending=set(names)|{'utils'}
    while pending:
        with ThreadPoolExecutor(max_workers=8) as pool:
            batch=list(pool.map(lambda n:fetch(n,cache),sorted(pending)))
        pending=set()
        for item in batch:
            items[item['name']]=item
            for dep in item.get('registryDependencies',[]):
                if dep.startswith(('http','@')): raise ValueError('Unexpected registry dependency '+dep)
                if dep not in items: pending.add(dep)
        pending-=items.keys()
    return items

def scaffold(output, language='en', title='Glimpse Design System'):
    output.mkdir(parents=True,exist_ok=True)
    (output/'src').mkdir(exist_ok=True)
    (output/'index.html').write_text('<!doctype html><html lang="'+html.escape(language)+'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>')
    (output/'vite.config.ts').write_text('import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nimport { fileURLToPath, URL } from "node:url";\nexport default defineConfig({base:"./",plugins:[react(),tailwindcss()],resolve:{alias:{"@":fileURLToPath(new URL("./src",import.meta.url))}}});\n')
    write(output/'tsconfig.json',{'compilerOptions':{'target':'ES2022','lib':['ES2022','DOM','DOM.Iterable'],'module':'ESNext','moduleResolution':'Bundler','jsx':'react-jsx','strict':True,'skipLibCheck':True,'allowSyntheticDefaultImports':True,'esModuleInterop':True,'resolveJsonModule':True,'noEmit':True,'baseUrl':'.','paths':{'@/*':['./src/*']}},'include':['src','vite.config.ts']})
    write(output/'components.json',{'$schema':'https://ui.shadcn.com/schema.json','style':'new-york','rsc':False,'tsx':True,'tailwind':{'config':'','css':'src/index.css','baseColor':'neutral','cssVariables':True,'prefix':''},'iconLibrary':'lucide','aliases':{'components':'@/components','utils':'@/lib/utils','ui':'@/components/ui','lib':'@/lib','hooks':'@/hooks'}})

def document(output,t,state,snapshot,checks):
    lines=['# '+t['name']+' — Design standard','',
           'Status: '+('SIMULATED APPROVAL (validation only)' if state and state['simulation'] else 'Approved' if state else 'Draft'),'',
           '## Source and intent','',t.get('rationale','Image-derived style; see the interpretation and saved review rounds.'),'',
           'Input: session/inspiration image. UI references preserve visible visual language and extend observed components. Non-UI references translate visual characteristics.','',
           '## Platforms and modes','',
           'PC Web: core specimen targets 1440 × 900. Mobile Web: verify 390 px and 360 px, allow vertical scrolling. Breakpoint: 768 px. Full gallery may scroll.','',
           'Primary mode: '+t['mode']+'. '+('Explicitly requested alternate mode: '+t['alternate']['mode'] if t.get('alternate') else 'No alternate mode is included.'),'',
           '## Color tokens','', '| Token | Value |','| --- | --- |']
    lines += ['| --'+k+' | '+v+' |' for k,v in t['colors'].items()]
    if t.get('alternate'):
        lines+=['','### Alternate mode','','| Token | Value |','| --- | --- |']+['| --'+k+' | '+v+' |' for k,v in t['alternate']['colors'].items()]
    lines+=['','## Typography, spacing, shape and icons','',
            '- Body font: '+t['font']['family']+'; '+str(t['font']['bodySize'])+' px.',
            '- Heading font: '+t['font']['heading']+'; weight '+str(t['font']['headingWeight'])+'.',
            '- Spacing base: '+str(t['spacing']['unit'])+' px; use multiples for component and layout rhythm.',
            '- Control height: '+str(t['spacing']['controlHeight'])+' px. Touch targets at least 44 × 44 px; never shrink content just to fit a specimen.',
            '- Radius base: '+str(t['radius'])+' px. Control '+str(geometry(t)['controlRadius'])+' px; surface '+str(geometry(t)['surfaceRadius'])+' px; overlay '+str(geometry(t)['overlayRadius'])+' px. Shadow: '+t['shadow']+'.',
            '- Body leading '+str(geometry(t)['bodyLineHeight'])+'; heading leading '+str(geometry(t)['headingLineHeight'])+'; heading tracking '+str(geometry(t)['headingTracking'])+' em; label weight '+str(geometry(t)['labelWeight'])+'.',
            '- Control inline padding '+str(geometry(t)['controlPadding'])+' px; icon gap '+str(geometry(t)['iconGap'])+' px. Compact shadcn sizes retain their proportions; coarse-pointer targets are at least 44 px.',
            '- Switch: default track 44 × 24 px with 18 px thumb; small track 36 × 20 px with 14 px thumb. Both use 3 px insets and a separate transparent hit area of at least 44 × 44 px. Reserve room for the hit area; do not stretch the track using generic touch minimum sizes.',
            '- Icon family: '+t['icons']['family']+'; '+str(t['icons']['size'])+' px; stroke '+str(t['icons']['stroke'])+'. Icons share geometry and optical weight. Decorative illustrations are separate from action icons.',
            '- Animation: '+str(t['motion']['duration'])+' ms, '+t['motion']['easing']+'. Honor prefers-reduced-motion.',
            '- Use semantic color variables; do not hardcode image colors in reusable components.','',
            '## Components and states','',
            'Official shadcn items use their upstream public API and accessible primitives. Apply the shared semantic theme; preserve labels, keyboard navigation, focus management and disabled/invalid semantics.','',
            'Validate default, hover, focus, active, disabled, invalid and loading where applicable. Forms pair visible labels with error descriptions. Dialogs trap and return focus; icon buttons require accessible names.','',
            'Registry snapshot: '+snapshot['url']+'; fetched '+snapshot['fetchedAt']+'.','',
            '| Component | Source |','| --- | --- |']
    lines += ['| '+n+' | shadcn/ui |' for n in snapshot['ui']]
    custom=sorted(p.stem for p in (output/'src/components/custom').glob('*.tsx')) if (output/'src/components/custom').exists() else []
    lines += ['| '+n+' | Image-derived custom component |' for n in custom]
    lines+=['','## Accessibility evidence','','Numeric checks below cover token pairs, not blanket WCAG certification. Browser evidence must also cover labels, keyboard, focus and layout.','','| Mode | Pair | Ratio | Minimum | Result |','| --- | --- | --- | --- | --- |']
    lines += ['| '+r['mode']+' | '+r['pair']+' | '+str(r['ratio'])+' | '+str(r['minimum'])+' | '+('Pass' if r['passAA'] else 'FAIL')+' |' for r in contrast(t)]
    lines+=['','## Verification','']+[ '- '+k+': '+str(v) for k,v in checks.items()]
    lines+=['','## Usage and maintenance','',
            'Run npm install, then npm run dev. Build with npm run build. Open the core specimen and the full component gallery.','',
            'Copy src/components, src/hooks and src/lib with their dependencies, and import src/index.css once. Or serve public/r over HTTP and run npx shadcn@4.21.0 add <base-url>/all.json in a Tailwind 4 shadcn project. The registry adds src/glimpse-theme.css and imports it into the configured CSS.','',
            'The registry and tokens describe the same theme as this document. Keep tokens.json as the parameter source; regenerate code and this file after approved changes. Do not hand-edit DESIGN.md to disguise a divergence.','',
            'When changing color, font, spacing, radius, icons or motion: reopen the saved session, identify affected components, revise foundations, review key components, and approve a fresh integrated preview. Preserve revision history.','',
            '## Decisions','']
    if state:
        lines += ['- '+h['stage']+' / '+h['action']+': '+str(h.get('optionId') or '')+' '+h.get('feedback','')+' '+h.get('combination','')+' '+h.get('derivation','') for h in state['history']]
    if (output/'IMAGE-COMPONENTS.md').exists():
        lines+=['','## Image-specific components','','See IMAGE-COMPONENTS.md for the preserved component APIs, usage and image-specific design rules.']
    if (output/'design-notes.md').exists():
        lines+=['','## Additional approved rules','',(output/'design-notes.md').read_text()]
    if (output/'design-intent.md').exists():
        lines+=['','## Visual intent','',(output/'design-intent.md').read_text()]
    (output/'DESIGN.md').write_text('\n'.join(lines)+'\n')

def registry(output,items,t,package):
    files=[]
    files.append({'path':'SHADCN-LICENSE.txt','target':'SHADCN-LICENSE.txt','type':'registry:file','content':(ASSETS/'SHADCN-LICENSE.txt').read_text()})
    for path in sorted((output/'src').rglob('*')):
        if not path.is_file() or path.suffix not in ['.tsx','.ts','.css','.svg','.json']: continue
        rel=path.relative_to(output).as_posix()
        if not rel.startswith(('src/components/','src/hooks/','src/lib/','src/assets/')) and rel!='src/theme-overrides.css': continue
        kind='registry:file' if path.suffix not in ['.tsx','.ts'] else 'registry:ui' if '/ui/' in rel else 'registry:hook' if '/hooks/' in rel else 'registry:lib' if '/lib/' in rel else 'registry:component'
        files.append({'path':rel,'type':kind,'target':rel,'content':path.read_text()})
    theme=css(t).replace('@import "tailwindcss";\n','').replace('@import "tw-animate-css";\n','').replace('@import "shadcn/tailwind.css";\n','')
    if (output/'src/theme-overrides.css').exists(): theme='@import "./theme-overrides.css";\n'+theme
    files.append({'path':'src/glimpse-theme.css','target':'src/glimpse-theme.css','type':'registry:file','content':theme})
    deps=[name+'@'+version for name,version in package['dependencies'].items() if name not in ['react','react-dom']]
    item={'$schema':'https://ui.shadcn.com/schema/registry-item.json','name':'all','type':'registry:block',
          'title':t['name'],'description':'Themed shadcn collection with image-derived components. See DESIGN.md for approval status.',
          'dependencies':deps,'files':files,'css':{'@import "./glimpse-theme.css"':{},'@import "tw-animate-css"':{},'@import "shadcn/tailwind.css"':{}}}
    write(output/'public/r/all.json',item)
    write(output/'registry.json',{'$schema':'https://ui.shadcn.com/schema/registry.json','name':'glimpse','homepage':'https://ui.shadcn.com','items':[item]})

def build(args):
    output=args.output.resolve(); cache=args.cache.resolve(); cache.mkdir(parents=True,exist_ok=True)
    state=read(args.session/'session.json') if args.session else None
    language=args.language or (state or {}).get('language')
    if not language: raise ValueError('Pass --language using the user’s main language')
    labels=translated_copy(language, read(args.ui_copy) if args.ui_copy else None, 'library-copy.json')
    if args.deliver:
        if not state or state['status'] not in ['approved','delivered']:
            raise ValueError('Delivery requires explicit approval of the latest preview')
        t=state['accepted']['foundations']['tokens']
        if digest(t)!=state['approval']['tokenHash']: raise ValueError('Approval is stale')
    else:
        if not args.tokens: raise ValueError('Provide --tokens for a draft')
        t=read(args.tokens)
    validate(t)
    failures=[r for r in contrast(t) if not r['passAA']]
    if failures: raise ValueError('Fix failing token contrasts before generating: '+json.dumps(failures))
    if args.deliver and not args.build: raise ValueError('Delivery requires --build')
    previous=read(output/'package.json') if (output/'package.json').exists() else {}
    scaffold(output, language, labels['Glimpse Design System'])
    (output/'src/review-copy.ts').write_text('export const text: Record<string, string> = '+json.dumps(labels,ensure_ascii=False)+';\n')
    shutil.copy2(ASSETS/'SHADCN-LICENSE.txt',output/'SHADCN-LICENSE.txt')
    upstream=fetch('registry',cache)
    names=[i['name'] for i in upstream['items'] if i['type']=='registry:ui'] if args.full or args.deliver else CORE
    available={i['name']:i for i in upstream['items']}
    demos=[]
    if args.full or args.deliver:
        for name in names:
            candidate=name+'-demo' if name+'-demo' in available else 'chart-bar-demo' if name=='chart' else None
            if candidate: demos.append(candidate)
    items=collect(names+demos,cache)
    for item in items.values():
        for file in item.get('files',[]):
            if not file.get('content'): continue
            target=output/filename(file['path']); target.parent.mkdir(parents=True,exist_ok=True)
            content=theme_example(item['name'],transform(file['content']))
            if item['name'].startswith('chart-') and item['type'] in ['registry:example','registry:block']:
                palette={}
                def chart_color(match):
                    color=match.group(1)
                    if color not in palette: palette[color]=len(palette)%5+1
                    return 'color: "var(--chart-'+str(palette[color])+')"'
                content=re.sub(r'color:\s*"(#[0-9a-fA-F]{3,8})"',chart_color,content)
            target.write_text(content)
    (output/'src/lib').mkdir(parents=True,exist_ok=True)
    (output/'src/lib/next-image.tsx').write_text('import type { ImgHTMLAttributes } from "react";\nexport default function Image({fill,priority,quality,...props}:ImgHTMLAttributes<HTMLImageElement>&{fill?:boolean;priority?:boolean;quality?:number}){return <img {...props} style={{...(fill?{width:"100%",height:"100%",objectFit:"cover" as const}:{}),...props.style}}/>;}\n')
    (output/'src/lib/next-link.tsx').write_text('import type { AnchorHTMLAttributes } from "react";\nexport default function Link(props:AnchorHTMLAttributes<HTMLAnchorElement>){return <a {...props}/>;}\n')
    (output/'src/lib/theme-mode.ts').write_text('import { useEffect, useState } from "react";\nexport function useTheme(){const read=()=>document.documentElement.classList.contains("dark")?"dark":"light";const [theme,setTheme]=useState(read);useEffect(()=>{const observer=new MutationObserver(()=>setTheme(read()));observer.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});return ()=>observer.disconnect()},[]);return {theme};}\n')
    # Upstream example icons use Tabler while the delivered system uses one Lucide family.
    icon_names=set()
    for path in (output/'src/examples').glob('*.tsx'):
        for block in re.findall(r'import\s*\{([^}]+)\}\s*from\s*[\"\']@/lib/tabler-icons[\"\']',path.read_text()):
            icon_names.update(n.strip() for n in block.split(',') if n.strip())
    icon_map={'IconSearch':'Search','IconArrowUp':'ArrowUp','IconCheck':'Check','IconCopy':'Copy','IconCreditCard':'CreditCard','IconFolderCode':'FolderCode','IconInfoCircle':'Info','IconPlus':'Plus','IconBrandGithub':'Github'}
    (output/'src/lib/tabler-icons.tsx').write_text('export { '+', '.join(icon_map.get(n,'Circle')+' as '+n for n in sorted(icon_names))+' } from "lucide-react";\n')
    deps=dependencies(items.values())
    deps.update({'react':'^19.1.0','react-dom':'^19.1.0','class-variance-authority':'^0.7.1','lucide-react':'^0.468.0','cn':'latest','radix-ui':'latest','tw-animate-css':'latest','shadcn':'4.21.0'})
    deps.update(previous.get('dependencies',{}))
    package={'name':'glimpse-design-system','version':'0.1.0','private':True,'type':'module',
             'scripts':{'dev':'vite --host 127.0.0.1','build':'tsc --noEmit && vite build','preview':'vite preview --host 127.0.0.1'},
             'dependencies':deps,'devDependencies':{'typescript':'^5.8.3','vite':'^6.4.1','@vitejs/plugin-react':'^4.7.0','tailwindcss':'^4.1.0','@tailwindcss/vite':'^4.1.0','@types/react':'^19.1.0','@types/react-dom':'^19.1.0','@types/node':'^22.0.0'}}
    package['devDependencies'].update(previous.get('devDependencies',{}))
    package['scripts'].update(previous.get('scripts',{}))
    write(output/'package.json',package);write(output/'tokens.json',t)
    (output/'src/index.css').write_text(css(t))
    imports=['import React from "react";','import { createRoot } from "react-dom/client";','import { TooltipProvider } from "@/components/ui/tooltip";','import App from "./App";','import "./index.css";']
    if (output/'src/theme-overrides.css').exists(): imports.append('import "./theme-overrides.css";')
    imports+=['document.documentElement.classList.add('+json.dumps(t['mode'])+');','createRoot(document.getElementById("root")!).render(<React.StrictMode><TooltipProvider><App /></TooltipProvider></React.StrictMode>);']
    (output/'src/main.tsx').write_text('\n'.join(imports)+'\n')
    if not (output/'src/App.tsx').exists(): shutil.copy2(ASSETS/'App.tsx',output/'src/App.tsx')
    if not (output/'src/gallery.css').exists(): shutil.copy2(ASSETS/'gallery.css',output/'src/gallery.css')
    demo_imports=['import { Suspense, lazy } from "react";', 'import { text } from "./review-copy";']
    demo_entries=[]
    for i,name in enumerate(demos):
        item=items[name]
        path=next((f for f in item.get('files',[]) if 'export default' in f.get('content','')),None)
        if not path: continue
        file=filename(path['path'])[4:].removesuffix('.tsx')
        demo_imports.append('const D'+str(i)+'=lazy(()=>import("./'+file+'"));')
        demo_entries.append('<section className="gallery-item" id="'+name+'"><h3>'+name.removesuffix('-demo')+'</h3><Suspense fallback={<p>{text["Loading…"]}</p>}><D'+str(i)+' /></Suspense></section>')
    if args.full or args.deliver:
        shutil.copy2(ASSETS/'SupplementalGallery.tsx',output/'src/SupplementalGallery.tsx')
        demo_imports.append('import SupplementalGallery from "./SupplementalGallery";')
        demo_entries.append('<SupplementalGallery/>')
    demo_imports.append('export default function FullGallery(){return <div className="gallery-grid">'+''.join(demo_entries)+'</div>;}')
    (output/'src/FullGallery.tsx').write_text('\n'.join(demo_imports))
    snapshot={'url':ORIGIN+'registry.json','fetchedAt':time.strftime('%Y-%m-%d',time.gmtime()),'sha256':digest(upstream),'ui':names,'demos':demos,
              'items':{n:digest(items[n]) for n in sorted(items)}}
    write(output/'shadcn-snapshot.json',snapshot)
    checks=state['round'].get('checks',{}) if state else {}
    write(output/'contrast-report.json',contrast(t))
    document(output,t,state,snapshot,checks)
    if args.install:
        subprocess.run(['npm','install','--no-audit','--no-fund'],cwd=output,check=True)
        # Freeze resolved direct dependencies for registry consumers.
        lock=read(output/'package-lock.json')
        for dep in package['dependencies']:
            resolved=lock.get('packages',{}).get('node_modules/'+dep,{}).get('version')
            if resolved: package['dependencies'][dep]=resolved
        write(output/'package.json',package)
        subprocess.run(['npm','install','--package-lock-only','--no-audit','--no-fund'],cwd=output,check=True)
    registry(output,items,t,package)
    if args.build: subprocess.run(['npm','run','build'],cwd=output,check=True)
    if args.deliver:
        if not args.build: raise ValueError('Delivery requires --build')
        state['status']='delivered';state['delivery']={'path':str(output),'tokenHash':digest(t),'componentCount':len(names),'snapshotHash':snapshot['sha256']}
        save(args.session,state)
    print(json.dumps({'output':str(output),'components':len(names),'tokenHash':digest(t),'demos':len(demos)},indent=2))

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--cache',type=Path,default=Path('.glimpse-cache'))
    p.add_argument('--tokens',type=Path)
    p.add_argument('--session',type=Path)
    p.add_argument('--full',action='store_true')
    p.add_argument('--deliver',action='store_true')
    p.add_argument('--install',action='store_true')
    p.add_argument('--build',action='store_true')
    p.add_argument('--language', help='User language; defaults to the saved session language')
    p.add_argument('--ui-copy', type=Path, help='Translated library-copy.json keys for another language')
    args=p.parse_args()
    try: build(args)
    except (ValueError,RuntimeError,subprocess.CalledProcessError) as e: p.exit(1,str(e)+'\n')

if __name__=='__main__':main()

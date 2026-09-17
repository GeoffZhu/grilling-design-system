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
from urllib.request import urlopen, Request, getproxies

from studio import read, write, digest, save
from theme import validate, css, contrast
from design_document import document
from language import translated_copy
from project import resolve_project, find_web_project

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
ORIGIN = 'https://ui.shadcn.com/r/styles/new-york-v4/'
TEMP_NAMESPACE = Path('.tmp') / 'grilling-design-system'
MARKER = TEMP_NAMESPACE / 'standalone-owner'
CORE = ['button','card','badge','input','label','checkbox','switch','tabs','dialog',
        'progress','avatar','select','slider','textarea','tooltip','sonner']
COMPONENT_CATEGORIES = {
    'button':'Actions','button-group':'Actions','toggle':'Actions','toggle-group':'Actions',
    'input':'Inputs','input-group':'Inputs','input-otp':'Inputs','textarea':'Inputs','checkbox':'Inputs',
    'radio-group':'Inputs','select':'Inputs','native-select':'Inputs','switch':'Inputs','slider':'Inputs',
    'form':'Inputs','field':'Inputs','label':'Inputs',
    'breadcrumb':'Navigation','menubar':'Navigation','navigation-menu':'Navigation','pagination':'Navigation',
    'tabs':'Navigation','sidebar':'Navigation','command':'Navigation',
    'alert-dialog':'Overlays','context-menu':'Overlays','dialog':'Overlays','drawer':'Overlays',
    'dropdown-menu':'Overlays','hover-card':'Overlays','popover':'Overlays','sheet':'Overlays','tooltip':'Overlays',
    'alert':'Feedback','empty':'Feedback','progress':'Feedback','skeleton':'Feedback','sonner':'Feedback','spinner':'Feedback',
    'aspect-ratio':'Data display','attachment':'Data display','avatar':'Data display','badge':'Data display',
    'bubble':'Messaging','marker':'Messaging','message':'Messaging','message-scroller':'Messaging',
    'card':'Data display','chart':'Data display','item':'Data display','table':'Data display','calendar':'Data display',
    'accordion':'Layout','carousel':'Layout','collapsible':'Layout','resizable':'Layout','scroll-area':'Layout','separator':'Layout',
    'direction':'Utilities','kbd':'Utilities',
}
SUPPLEMENTAL_PREVIEWS = {
    'form':'FormDemo','direction':'DirectionDemo','attachment':'AttachmentDemo','bubble':'BubbleDemo',
    'marker':'MarkerDemo','message':'MessageDemo','message-scroller':'MessageScrollerDemo',
}
GLOBAL_COMPONENT_HOSTS = {
    'sonner': {
        'import': 'import { Toaster } from "@/components/ui/sonner";',
        'render': '<Toaster />',
    },
}
MAX_VISUAL_EXAMPLES = 8
VISUAL_VARIANTS = {
    'button':['default','secondary','destructive','outline','ghost','link','with-icon','loading'],
    'badge':['default','secondary','destructive','outline'],
    'input':['disabled','file','with-button','with-label','with-text'],
    'textarea':['disabled','with-button','with-label','with-text'],
    'input-otp':['pattern','separator','controlled'],
    'toggle':['default','outline','disabled','size'],
    'toggle-group':['default','outline','disabled','size'],
    'spinner':['default','button','badge','input-group'],
    'kbd':['default','group','button'],
    'alert':['default','destructive'],
    'checkbox':['default','disabled'],
    'dialog':['close-button'],
    'select':['scrollable'],
}

def component_title(name):
    special={'kbd':'KBD','input-otp':'Input OTP'}
    return special.get(name, ' '.join(part.capitalize() for part in name.split('-')))

def main_source(tokens, component_names, has_theme_overrides=False):
    """Render the entry point and mount singleton hosts required by included components."""
    imports=['import React from "react";','import { createRoot } from "react-dom/client";','import { TooltipProvider } from "@/components/ui/tooltip";','import App from "./App";','import "./index.css";']
    hosts=[]
    for name, host in GLOBAL_COMPONENT_HOSTS.items():
        if name in component_names:
            imports.append(host['import'])
            hosts.append(host['render'])
    if has_theme_overrides:
        imports.append('import "./theme-overrides.css";')
    tree='<TooltipProvider><App />'+''.join(hosts)+'</TooltipProvider>'
    imports += [
        'document.documentElement.classList.add('+json.dumps(tokens['mode'])+');',
        'createRoot(document.getElementById("root")!).render(<React.StrictMode>'+tree+'</React.StrictMode>);',
    ]
    return '\n'.join(imports)+'\n'

def examples_by_component(names, available):
    """Select representative examples without confusing shared prefixes."""
    result={name:[] for name in names}
    candidates=[item['name'] for item in available.values() if item['type']=='registry:example']
    for example in candidates:
        owners=[name for name in names if example==name+'-demo' or example.startswith(name+'-')]
        if not owners: continue
        owner=max(owners,key=len)
        suffix=example.removeprefix(owner+'-')
        if suffix=='demo' or suffix in VISUAL_VARIANTS.get(owner,[]): result[owner].append(example)
    for name, examples in result.items():
        examples.sort(key=lambda item:(item!=name+'-demo', item))
        result[name]=examples[:MAX_VISUAL_EXAMPLES]
    return result

def load_custom_components(output):
    manifest=output/'custom-components.json'
    if not manifest.exists(): return []
    data=read(manifest)
    if not isinstance(data,dict) or not isinstance(data.get('components'),list):
        raise ValueError('custom-components.json must contain a components array')
    result=[];seen=set();root=output.resolve()
    for entry in data['components']:
        if not isinstance(entry,dict): raise ValueError('Each custom component must be an object')
        for key in ['name','title','description','files','preview']:
            if not entry.get(key): raise ValueError('Custom component is missing '+key)
        name=entry['name']
        if not isinstance(name,str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',name):
            raise ValueError('Custom component name must use kebab-case: '+str(name))
        if name in seen: raise ValueError('Duplicate custom component '+name)
        if 'category' in entry: raise ValueError('Custom components use the fixed Custom components category: '+name)
        seen.add(name)
        if not isinstance(entry['files'],list) or not entry['files']:
            raise ValueError('Custom component files must be a non-empty array: '+name)
        preview=entry['preview']
        if not isinstance(preview,dict) or not preview.get('path'):
            raise ValueError('Custom component preview requires path: '+name)
        normalized={**entry,'export':preview.get('export','default'),
                    'dependencies':entry.get('dependencies',[]),
                    'registryDependencies':entry.get('registryDependencies',[])}
        for path_text in entry['files']+[preview['path']]:
            if not isinstance(path_text,str) or not path_text.startswith('src/components/custom/'):
                raise ValueError('Custom component files must stay in src/components/custom/: '+str(path_text))
            path=(output/path_text).resolve()
            if not path.is_relative_to(root) or not path.is_file():
                raise ValueError('Missing custom component file: '+path_text)
        if normalized['export']!='default' and not re.fullmatch(r'[A-Za-z_$][A-Za-z0-9_$]*',normalized['export']):
            raise ValueError('Invalid custom preview export: '+str(normalized['export']))
        if not all(isinstance(value,str) and value for key in ['title','description'] for value in [entry[key]]):
            raise ValueError('Custom component title and description must be strings: '+name)
        if not all(isinstance(value,str) and value for value in normalized['dependencies']+normalized['registryDependencies']):
            raise ValueError('Custom component dependencies must be strings: '+name)
        result.append(normalized)
    return result

def fetch(name, cache):
    target=cache/(name+'.json')
    if target.exists(): return read(target)
    error=None
    for attempt in range(3):
        try:
            with urlopen(Request(ORIGIN+name+'.json',headers={'User-Agent':'Grilling/1.0'}),timeout=45) as r:
                data=json.load(r)
            write(target,data)
            return data
        except Exception as e:
            error=e
            time.sleep(attempt+1)
    hint=''
    proxy=getproxies().get('https')
    if proxy and 'CERTIFICATE_VERIFY_FAILED' in str(error):
        hint='. A system proxy is active ('+proxy+'); if it intercepts TLS, retry with no_proxy="*"'
    raise RuntimeError('Cannot fetch official shadcn item '+name+': '+str(error)+hint)

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

def scaffold(output, language, title):
    output.mkdir(parents=True,exist_ok=True)
    # Written first so an interrupted run is still recognized as this generator's output.
    (output/MARKER).parent.mkdir(parents=True, exist_ok=True)
    (output/MARKER).write_text('Generated by grilling-design-system library.py\n')
    (output/'src').mkdir(exist_ok=True)
    (output/'index.html').write_text('<!doctype html><html lang="'+html.escape(language)+'"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+html.escape(title)+'</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>')
    (output/'vite.config.ts').write_text('import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\nimport tailwindcss from "@tailwindcss/vite";\nimport { fileURLToPath, URL } from "node:url";\nexport default defineConfig({base:"./",plugins:[react(),tailwindcss()],resolve:{alias:{"@":fileURLToPath(new URL("./src",import.meta.url))}}});\n')
    write(output/'tsconfig.json',{'compilerOptions':{'target':'ES2022','lib':['ES2022','DOM','DOM.Iterable'],'module':'ESNext','moduleResolution':'Bundler','jsx':'react-jsx','strict':True,'skipLibCheck':True,'allowSyntheticDefaultImports':True,'esModuleInterop':True,'resolveJsonModule':True,'noEmit':True,'baseUrl':'.','paths':{'@/*':['./src/*']}},'include':['src','vite.config.ts']})
    write(output/'components.json',{'$schema':'https://ui.shadcn.com/schema.json','style':'new-york','rsc':False,'tsx':True,'tailwind':{'config':'','css':'src/index.css','baseColor':'neutral','cssVariables':True,'prefix':''},'iconLibrary':'lucide','aliases':{'components':'@/components','utils':'@/lib/utils','ui':'@/components/ui','lib':'@/lib','hooks':'@/hooks'}})

def registry(output,items,t,package,custom_components):
    artifact_name=t['slug']
    theme_file='src/'+artifact_name+'.css'
    delivered_paths={path for entry in custom_components for path in entry['files']}
    preview_paths={entry['preview']['path'] for entry in custom_components if entry['preview']['path'] not in delivered_paths}
    files=[]
    files.append({'path':'SHADCN-LICENSE.txt','target':'SHADCN-LICENSE.txt','type':'registry:file','content':(ASSETS/'SHADCN-LICENSE.txt').read_text()})
    for path in sorted((output/'src').rglob('*')):
        if not path.is_file() or path.suffix not in ['.tsx','.ts','.css','.svg','.json']: continue
        rel=path.relative_to(output).as_posix()
        if rel in preview_paths: continue
        if not rel.startswith(('src/components/','src/hooks/','src/lib/','src/assets/')) and rel!='src/theme-overrides.css': continue
        kind='registry:file' if path.suffix not in ['.tsx','.ts'] else 'registry:ui' if '/ui/' in rel else 'registry:hook' if '/hooks/' in rel else 'registry:lib' if '/lib/' in rel else 'registry:component'
        files.append({'path':rel,'type':kind,'target':rel,'content':path.read_text()})
    theme=css(t).replace('@import "tailwindcss";\n','').replace('@import "tw-animate-css";\n','').replace('@import "shadcn/tailwind.css";\n','')
    if (output/'src/theme-overrides.css').exists(): theme='@import "./theme-overrides.css";\n'+theme
    files.append({'path':theme_file,'target':theme_file,'type':'registry:file','content':theme})
    deps=[name+'@'+version for name,version in package['dependencies'].items() if name not in ['react','react-dom']]
    item={'$schema':'https://ui.shadcn.com/schema/registry-item.json','name':'all','type':'registry:block',
          'title':t['name'],'description':'Themed shadcn collection with custom components. See DESIGN.md for approval status.',
          'dependencies':deps,'files':files,'css':{'@import "./'+artifact_name+'.css"':{},'@import "tw-animate-css"':{},'@import "shadcn/tailwind.css"':{}}}
    catalog=[item]
    for entry in custom_components:
        custom_files=[]
        for rel in entry['files']:
            path=output/rel
            kind='registry:component' if path.suffix in ['.tsx','.ts'] else 'registry:file'
            custom_files.append({'path':rel,'target':rel,'type':kind,'content':path.read_text()})
        custom_item={'$schema':'https://ui.shadcn.com/schema/registry-item.json','name':entry['name'],
                     'type':'registry:component','title':entry['title'],'description':entry['description'],
                     'files':custom_files}
        if entry['dependencies']: custom_item['dependencies']=entry['dependencies']
        if entry['registryDependencies']: custom_item['registryDependencies']=entry['registryDependencies']
        write(output/'public/r'/(entry['name']+'.json'),custom_item)
        catalog.append(custom_item)
    write(output/'public/r/all.json',item)
    write(output/'registry.json',{'$schema':'https://ui.shadcn.com/schema/registry.json','name':artifact_name,'homepage':'https://ui.shadcn.com','items':catalog})

def build(args):
    context = resolve_project(Path.cwd(), args.output)
    output = Path(context['output'])
    destination_root, _, _ = find_web_project(output)
    generated = (output/MARKER).is_file()
    # Recognize a completed standalone output without relying on any generated name.
    if not generated and (output/'package.json').is_file():
        generated = all((output/path).is_file() for path in ['tokens.json','registry.json','shadcn-snapshot.json'])
    if not generated and (context['mode'] == 'integrated' or destination_root):
        raise ValueError('Existing Web project detected. Integrate components using references/project-output.md; '
                         'this generator creates a standalone Vite application. Use --sources-only to fetch upstream inputs.')
    cache=args.cache.resolve(); cache.mkdir(parents=True,exist_ok=True)
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
    # Fetch every upstream input before writing, so a network failure leaves the output untouched.
    upstream=fetch('registry',cache)
    names=[i['name'] for i in upstream['items'] if i['type']=='registry:ui'] if args.full or args.deliver else CORE
    available={i['name']:i for i in upstream['items']}
    custom_components=load_custom_components(output)
    custom_names={entry['name'] for entry in custom_components}
    collisions=custom_names.intersection(names)
    if collisions: raise ValueError('Custom component names collide with shadcn components: '+', '.join(sorted(collisions)))
    demos=[]
    component_demos={name:[] for name in names}
    if args.full or args.deliver:
        component_demos=examples_by_component(names,available)
        if 'chart' in component_demos and not component_demos['chart'] and 'chart-bar-demo' in available:
            component_demos['chart']=['chart-bar-demo']
        demos=[example for name in names for example in component_demos[name]]
    else:
        for name in names:
            candidate=name+'-demo' if name+'-demo' in available else 'chart-bar-demo' if name=='chart' else None
            if candidate:
                component_demos[name]=[candidate]
                demos.append(candidate)
    items=collect(names+demos,cache)
    previous=read(output/'package.json') if (output/'package.json').exists() else {}
    scaffold(output, language, t['name'])
    (output/'src/review-copy.ts').write_text('export const text: Record<string, string> = '+json.dumps(labels,ensure_ascii=False)+';\n')
    shutil.copy2(ASSETS/'SHADCN-LICENSE.txt',output/'SHADCN-LICENSE.txt')
    # Examples are generated upstream inputs. Remove stale examples when the selected set changes.
    if generated and (output/'src/examples').exists(): shutil.rmtree(output/'src/examples')
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
    deps.update(dependencies({'dependencies':entry['dependencies']} for entry in custom_components))
    deps.update({'react':'^19.1.0','react-dom':'^19.1.0','class-variance-authority':'^0.7.1','lucide-react':'^0.468.0','cn':'latest','radix-ui':'latest','tw-animate-css':'latest','shadcn':'4.21.0'})
    deps.update(previous.get('dependencies',{}))
    package={'name':t['slug'],'version':'0.1.0','private':True,'type':'module',
             'scripts':{'dev':'vite --host 127.0.0.1','build':'tsc --noEmit && vite build','preview':'vite preview --host 127.0.0.1'},
             'dependencies':deps,'devDependencies':{'typescript':'^5.8.3','vite':'^6.4.1','@vitejs/plugin-react':'^4.7.0','tailwindcss':'^4.1.0','@tailwindcss/vite':'^4.1.0','@types/react':'^19.1.0','@types/react-dom':'^19.1.0','@types/node':'^22.0.0'}}
    package['devDependencies'].update(previous.get('devDependencies',{}))
    package['scripts'].update(previous.get('scripts',{}))
    write(output/'package.json',package);write(output/'tokens.json',t)
    (output/'src/index.css').write_text(css(t))
    (output/'src/main.tsx').write_text(main_source(t, names, (output/'src/theme-overrides.css').exists()))
    if not (output/'src/App.tsx').exists(): shutil.copy2(ASSETS/'App.tsx',output/'src/App.tsx')
    if not (output/'src/gallery.css').exists(): shutil.copy2(ASSETS/'gallery.css',output/'src/gallery.css')
    demo_imports=['import { Suspense, lazy } from "react";', 'import type { ComponentType, LazyExoticComponent } from "react";', 'import { text } from "./review-copy";']
    preview_entries={name:[] for name in names}
    for i,name in enumerate(demos):
        item=items[name]
        path=next((f for f in item.get('files',[]) if 'export default' in f.get('content','')),None)
        if not path: continue
        file=filename(path['path'])[4:].removesuffix('.tsx')
        demo_imports.append('const D'+str(i)+'=lazy(()=>import("./'+file+'"));')
        component_name=next((owner for owner, examples in component_demos.items() if name in examples),None)
        if component_name:
            suffix=name.removeprefix(component_name+'-')
            title='Preview' if suffix=='demo' else component_title(suffix)
            preview_entries[component_name].append('{title:'+json.dumps(title)+',Preview:D'+str(i)+'}')
    if args.full or args.deliver:
        shutil.copy2(ASSETS/'SupplementalGallery.tsx',output/'src/SupplementalGallery.tsx')
        supplemental=', '.join(SUPPLEMENTAL_PREVIEWS.values())
        demo_imports.append('import { '+supplemental+' } from "./SupplementalGallery";')
        for name,export in SUPPLEMENTAL_PREVIEWS.items():
            if name in names and not preview_entries[name]:
                preview_entries[name].append('{title:"Preview",Preview:'+export+'}')
    for index,entry in enumerate(custom_components):
        preview_path=entry['preview']['path']
        import_path='@/'+preview_path.removeprefix('src/').rsplit('.',1)[0]
        symbol='CustomPreview'+str(index)
        if entry['export']=='default':
            demo_imports.append('const '+symbol+'=lazy(()=>import('+json.dumps(import_path)+'));')
        else:
            demo_imports.append('const '+symbol+'=lazy(()=>import('+json.dumps(import_path)+').then(module=>({default:module.'+entry['export']+'})));')
        preview_entries[entry['name']]=['{title:"Preview",Preview:'+symbol+'}']
    entries=[{'name':name,'title':component_title(name),'category':labels[COMPONENT_CATEGORIES.get(name,'Utilities')],
              'description':labels['Visual preview, variants and interaction states for this component.']} for name in names]
    entries.extend({'name':entry['name'],'title':entry['title'],'category':labels['Custom components'],'description':entry['description']} for entry in custom_components)
    demo_imports.append('export const componentEntries = '+json.dumps(entries,ensure_ascii=False)+' as const;')
    preview_map=','.join(json.dumps(name)+':['+','.join(preview_entries[name])+']' for name in preview_entries if preview_entries[name])
    demo_imports.append('type PreviewEntry={title:string,Preview:ComponentType|LazyExoticComponent<ComponentType>};')
    demo_imports.append('const previews: Record<string, PreviewEntry[]> = {'+preview_map+'};')
    demo_imports.append('export function ComponentPreview({entry}:{entry:(typeof componentEntries)[number]}){const examples=previews[entry.name]||[];if(!examples.length)return <p className="demo-empty">{text["Preview unavailable"]}</p>;return <div className="component-previews">{examples.map(({title,Preview})=><section className="visual-example" key={title}><h3>{title}</h3><div className="visual-example-canvas"><Suspense fallback={<p className="demo-empty">{text["Loading…"]}</p>}><Preview/></Suspense></div></section>)}</div>}')
    demo_imports.append('export default function FullGallery(){return <div className="gallery-grid">{componentEntries.map(entry=><section className="gallery-item" id={entry.name} key={entry.name}><h3>{entry.title}</h3><ComponentPreview entry={entry}/></section>)}</div>;}')
    (output/'src/FullGallery.tsx').write_text('\n'.join(demo_imports))
    custom_hashes={entry['name']:digest({path:(output/path).read_text() for path in entry['files']}) for entry in custom_components}
    snapshot={'url':ORIGIN+'registry.json','fetchedAt':time.strftime('%Y-%m-%d',time.gmtime()),'sha256':digest(upstream),'ui':names,'custom':[entry['name'] for entry in custom_components],
              'customItems':custom_hashes,'demos':demos,'items':{n:digest(items[n]) for n in sorted(items)}}
    snapshot['deliverySha256']=digest(snapshot)
    write(output/'shadcn-snapshot.json',snapshot)
    checks=state['round'].get('checks',{}) if state else {}
    write(output/'contrast-report.json',contrast(t))
    design_doc=document(output,t,state,snapshot,checks)
    if args.install:
        subprocess.run(['npm','install','--no-audit','--no-fund'],cwd=output,check=True)
        # Freeze resolved direct dependencies for registry consumers.
        lock=read(output/'package-lock.json')
        for dep in package['dependencies']:
            resolved=lock.get('packages',{}).get('node_modules/'+dep,{}).get('version')
            if resolved: package['dependencies'][dep]=resolved
        write(output/'package.json',package)
        subprocess.run(['npm','install','--package-lock-only','--no-audit','--no-fund'],cwd=output,check=True)
    registry(output,items,t,package,custom_components)
    if args.build: subprocess.run(['npm','run','build'],cwd=output,check=True)
    result={'output':str(output),'components':len(names)+len(custom_components),'officialComponents':len(names),'customComponents':len(custom_components),'tokenHash':digest(t),'demos':len(demos),'designDocument':str(design_doc)}
    if design_doc!=output/'DESIGN.md':
        result['notice']='Existing completed DESIGN.md was preserved; merge the refreshed draft into it.'
    if args.deliver:
        if not args.build: raise ValueError('Delivery requires --build')
        # Generation is not delivery: studio.py finish records it after DESIGN.md is complete.
        state['generated']={'path':str(output),'tokenHash':digest(t),'componentCount':len(names)+len(custom_components),'snapshotHash':snapshot['deliverySha256'],
                            'at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
        save(args.session,state)
        result['next']='Complete DESIGN.md, then run studio.py finish with delivery evidence.'
    print(json.dumps(result,indent=2))

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output',type=Path,help='Standalone root; defaults to ./design-system outside Web projects')
    p.add_argument('--cache',type=Path,default=Path('.tmp/grilling-design-system/cache'))
    p.add_argument('--tokens',type=Path)
    p.add_argument('--session',type=Path)
    p.add_argument('--full',action='store_true')
    p.add_argument('--deliver',action='store_true')
    p.add_argument('--install',action='store_true')
    p.add_argument('--build',action='store_true')
    p.add_argument('--sources-only',action='store_true',help='Fetch official inputs for native integration without scaffolding')
    p.add_argument('--language', help='User language; defaults to the saved session language')
    p.add_argument('--ui-copy', type=Path, help='Translated library-copy.json keys for another language')
    args=p.parse_args()
    try:
        if args.sources_only:
            if args.install or args.build or args.deliver:
                raise ValueError('--sources-only cannot install, build, or mark delivery')
            cache=args.cache.resolve(); cache.mkdir(parents=True,exist_ok=True)
            upstream=fetch('registry',cache)
            names=[item['name'] for item in upstream['items'] if item['type']=='registry:ui'] if args.full else CORE
            items=collect(names,cache)
            write(cache/'source-manifest.json',{'url':ORIGIN+'registry.json',
                  'fetchedAt':time.strftime('%Y-%m-%d',time.gmtime()), 'sha256':digest(upstream),
                  'ui':names,'items':{name:digest(item) for name,item in items.items()}})
            print(json.dumps({'cache':str(cache),'components':len(names),'mode':'sources-only'},indent=2))
        else:
            build(args)
    except (ValueError,RuntimeError,subprocess.CalledProcessError) as e: p.exit(1,str(e)+'\n')

if __name__=='__main__':main()

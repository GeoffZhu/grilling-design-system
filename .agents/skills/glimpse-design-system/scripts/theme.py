"""Shared token validation, CSS and contrast reports."""
import re

COLOR_KEYS = ['background','foreground','card','card-foreground','popover','popover-foreground',
              'primary','primary-foreground','secondary','secondary-foreground','muted','muted-foreground',
              'accent','accent-foreground','destructive','border','input','ring',
              'chart-1','chart-2','chart-3','chart-4','chart-5',
              'sidebar','sidebar-foreground','sidebar-primary','sidebar-primary-foreground',
              'sidebar-accent','sidebar-accent-foreground','sidebar-border','sidebar-ring']

def geometry(t):
    """Role-specific geometry; older token files retain their established values."""
    base=t['radius']
    values={'controlRadius':base,'surfaceRadius':base*1.35,'overlayRadius':base,
            'bodyLineHeight':1.5,'headingLineHeight':1.15,'headingTracking':-.035,
            'labelWeight':700,'controlPadding':16,'iconGap':8}
    values.update(t.get('craft',{}))
    return values

def validate(t):
    for k in ['name','mode','colors','radius','font','spacing','icons','motion','shadow']:
        if k not in t: raise ValueError('Missing token group: '+k)
    if t['mode'] not in ['light','dark']: raise ValueError('mode must be light or dark')
    if t.get('alternate') and (t['alternate'].get('mode') not in ['light','dark'] or t['alternate']['mode']==t['mode']):
        raise ValueError('alternate.mode must be the other mode')
    for colors in [t['colors']] + ([t['alternate']['colors']] if t.get('alternate') else []):
        for key in COLOR_KEYS:
            if key not in colors: raise ValueError('Missing color token: '+key)
        for key,value in colors.items():
            if not re.fullmatch(r'[a-z][a-z0-9-]*',key): raise ValueError('Invalid color key')
            if not re.fullmatch(r'#[0-9a-fA-F]{6}', value): raise ValueError('Use six-digit hex colors')
    for group, keys in {'font':['family','heading','bodySize','headingWeight'],
                        'spacing':['unit','controlHeight'], 'icons':['family','size','stroke'],
                        'motion':['duration','easing']}.items():
        for key in keys:
            if key not in t[group]: raise ValueError('Missing '+group+'.'+key)
    for value in [t['font']['family'],t['font']['heading'],t['motion']['easing'],t['shadow']]:
        if any(char in str(value) for char in [';', '{', '}', '<', '>', '\n']):
            raise ValueError('Invalid CSS token')
    for value in [t['radius'],t['font']['bodySize'],t['font']['headingWeight'],
                  t['spacing']['unit'],t['spacing']['controlHeight'],t['icons']['size'],
                  t['icons']['stroke'],t['motion']['duration']]:
        if not isinstance(value,(int,float)) or value < 0: raise ValueError('Invalid numeric token')
    limits={'controlRadius':(0,9999),'surfaceRadius':(0,9999),'overlayRadius':(0,9999),
            'bodyLineHeight':(1,2.5),'headingLineHeight':(.9,2),'headingTracking':(-.1,.2),
            'labelWeight':(100,1000),'controlPadding':(0,64),'iconGap':(0,32)}
    for key,value in t.get('craft',{}).items():
        if key not in limits or isinstance(value,bool) or not isinstance(value,(int,float)) or not limits[key][0]<=value<=limits[key][1]:
            raise ValueError('Invalid craft token: '+key)
    return t

def declarations(t):
    validate(t)
    colors=';'.join('--'+k+':'+v for k,v in t['colors'].items())
    craft=geometry(t)
    details=';'.join('--'+name+':'+str(craft[key])+unit for key,name,unit in [
        ('controlRadius','control-radius','px'),('surfaceRadius','surface-radius','px'),
        ('overlayRadius','overlay-radius','px'),('bodyLineHeight','body-leading',''),
        ('headingLineHeight','heading-leading',''),('headingTracking','heading-tracking','em'),
        ('labelWeight','label-weight',''),('controlPadding','control-padding','px'),('iconGap','icon-gap','px')])
    return colors + ';' + details + ';' + ';'.join([
        '--radius:'+str(t['radius'])+'px', '--font-sans:'+t['font']['family'],
        '--font-heading:'+t['font']['heading'], '--body-size:'+str(t['font']['bodySize'])+'px',
        '--heading-weight:'+str(t['font']['headingWeight']),
        '--spacing-unit:'+str(t['spacing']['unit'])+'px',
        '--control-height:'+str(t['spacing']['controlHeight'])+'px',
        '--icon-size:'+str(t['icons']['size'])+'px', '--icon-stroke:'+str(t['icons']['stroke']),
        '--motion-duration:'+str(t['motion']['duration'])+'ms', '--motion-easing:'+t['motion']['easing'],
        '--design-shadow:'+t['shadow'], 'color-scheme:'+t['mode']])+';'

def css(t, tailwind=True):
    variables=':root{'+declarations(t)+'}\n'
    if t.get('alternate'):
        variables+='.'+t['alternate']['mode']+'{'+ ';'.join('--'+k+':'+v for k,v in t['alternate']['colors'].items())+';color-scheme:'+t['alternate']['mode']+'}\n'
    shared='''
*{box-sizing:border-box}body{margin:0;background:var(--background);color:var(--foreground);font-family:var(--font-sans);font-size:var(--body-size);line-height:var(--body-leading);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
h1,h2,h3{font-family:var(--font-heading);font-weight:var(--heading-weight);letter-spacing:var(--heading-tracking);line-height:var(--heading-leading)}
:where(button,input,textarea,select){font:inherit}button,a,input,textarea,select{touch-action:manipulation}
:where([data-slot="button"],button[data-size][data-variant],[role="button"][data-size][data-variant]){font-weight:var(--label-weight);border-radius:var(--control-radius);transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing);gap:var(--icon-gap)}
:where([data-slot="button"],button[data-size][data-variant],[role="button"][data-size][data-variant]):where([data-size="default"],[data-size="lg"]){min-height:var(--control-height);padding-inline:var(--control-padding)}
:where([data-slot="button"],button[data-size][data-variant],[role="button"][data-size][data-variant]):where([data-size="icon"],[data-size="icon-lg"]){min-height:var(--control-height);min-width:var(--control-height)}
:where([data-slot="input"],[data-slot="select-trigger"],[data-slot="native-select"]):not([data-size="sm"]){min-height:var(--control-height);border-radius:var(--control-radius);padding-inline:var(--control-padding)}
:where([data-slot="label"],[data-slot="tabs-trigger"]){font-weight:var(--label-weight)}
:where([data-slot="card"]){border-radius:var(--surface-radius);box-shadow:var(--design-shadow)}
:where([data-slot="dialog-content"],[data-slot="alert-dialog-content"],[data-slot="popover-content"],[data-slot="dropdown-menu-content"]){border-radius:var(--overlay-radius)}
/* Keep the painted track independent of its transparent 44px hit area. */
:where([data-slot="switch"]){--switch-width:44px;--switch-height:24px;--switch-thumb-size:18px;--switch-inset:3px;position:relative;display:inline-flex;align-items:center;justify-content:flex-start;flex-shrink:0;width:var(--switch-width);height:var(--switch-height);min-width:0;min-height:0;padding:var(--switch-inset);border:0;border-radius:9999px;background-clip:border-box;box-shadow:none;cursor:pointer;transition-property:background-color;transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing)}
:where([data-slot="switch"])[data-size="sm"]{--switch-width:36px;--switch-height:20px;--switch-thumb-size:14px}
:where([data-slot="switch"]):disabled{cursor:not-allowed}
:where([data-slot="switch"])::after{content:"";position:absolute;left:50%;top:50%;width:max(100%,44px);height:max(100%,44px);transform:translate(-50%,-50%)}
:where([data-slot="switch-thumb"]){width:var(--switch-thumb-size);height:var(--switch-thumb-size);flex-shrink:0;translate:0;transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing)}
:where([data-slot="switch-thumb"])[data-state="checked"]{translate:calc(var(--switch-width) - var(--switch-thumb-size) - var(--switch-inset) - var(--switch-inset)) 0}
.lucide{stroke-width:var(--icon-stroke)}
:focus-visible{outline:3px solid var(--ring);outline-offset:3px}
@media(pointer:coarse){:is(button,[role="button"],[role="checkbox"],[role="tab"]):not([role="switch"]){min-height:44px;min-width:44px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
'''
    if not tailwind: return variables+shared
    aliases=';'.join('--color-'+k+':var(--'+k+')' for k in t['colors'])
    aliases+=';--radius-sm:calc(var(--radius)*.6);--radius-md:calc(var(--radius)*.8);--radius-lg:var(--radius);--radius-xl:calc(var(--radius)*1.35);--radius-2xl:calc(var(--radius)*1.6)'
    return '@import "tailwindcss";\n@import "tw-animate-css";\n@import "shadcn/tailwind.css";\n@custom-variant dark (&:is(.dark *));\n@theme inline{'+aliases+';}\n'+variables+'@layer base{*{@apply border-border outline-ring/50;}body{@apply bg-background text-foreground;}}\n'+shared

def luminance(hex_color):
    channels=[int(hex_color[i:i+2],16)/255 for i in (1,3,5)]
    channels=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in channels]
    return sum(a*b for a,b in zip(channels,[.2126,.7152,.0722]))

def contrast(t):
    reports=[]
    for mode,colors in [(t['mode'],t['colors'])]+([(t['alternate']['mode'],t['alternate']['colors'])] if t.get('alternate') else []):
        pairs=[('foreground','background'),('card-foreground','card'),('primary-foreground','primary'),
               ('secondary-foreground','secondary'),('muted-foreground','muted'),
               ('accent-foreground','accent'),('popover-foreground','popover'),('foreground','background'),
               ('destructive','background'),('sidebar-foreground','sidebar'),
               ('sidebar-primary-foreground','sidebar-primary'),('sidebar-accent-foreground','sidebar-accent'),
               ('ring','background'),('input','background')]
        for fg,bg in pairs:
            a,b=sorted([luminance(colors[fg]),luminance(colors[bg])])
            ratio=(b+.05)/(a+.05)
            minimum=3 if fg in ['ring','input'] else 4.5
            reports.append(dict(mode=mode,pair=fg+'/'+bg,ratio=round(ratio,2),minimum=minimum,passAA=ratio>=minimum))
    return reports

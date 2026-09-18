"""Shared token validation, CSS and contrast reports."""
import re

COLOR_KEYS = ['background','foreground','card','card-foreground','popover','popover-foreground',
              'primary','primary-foreground','secondary','secondary-foreground','muted','muted-foreground',
              'accent','accent-foreground','destructive','border','input','ring',
              'chart-1','chart-2','chart-3','chart-4','chart-5',
              'sidebar','sidebar-foreground','sidebar-primary','sidebar-primary-foreground',
              'sidebar-accent','sidebar-accent-foreground','sidebar-border','sidebar-ring']
STATE_RULES = {
    'disabled': ('[data-disabled],[aria-disabled="true"],:disabled', 'opacity:.5;pointer-events:none;cursor:not-allowed'),
    'focus-visible': (':focus-visible,[data-focus-visible]', 'outline:3px solid color-mix(in srgb,var(--ring) 50%,transparent);outline-offset:2px'),
    'invalid': ('[data-invalid],[aria-invalid="true"]', 'border-color:var(--destructive);box-shadow:0 0 0 3px color-mix(in srgb,var(--destructive) 20%,transparent)'),
    'open': ('[data-open],[data-state="open"]', 'opacity:1;animation-duration:var(--motion-duration);animation-timing-function:var(--motion-easing)'),
    'closed': ('[data-closed],[data-state="closed"]', 'opacity:0;animation-duration:var(--motion-duration);animation-timing-function:var(--motion-easing)'),
    'starting-style': ('[data-starting-style]', 'opacity:0;transform:scale(.98)'),
    'ending-style': ('[data-ending-style]', 'opacity:0;transform:scale(.98)'),
    'selected': ('[data-selected]', 'border-color:var(--primary);background-color:var(--accent);color:var(--accent-foreground)'),
    'checked': ('[data-checked]', 'border-color:var(--primary);background-color:var(--primary);color:var(--primary-foreground)'),
    'unchecked': ('[data-unchecked]', 'background-color:var(--background);color:var(--foreground)'),
    'indeterminate': ('[data-indeterminate]', 'border-color:var(--primary);background-color:var(--primary);color:var(--primary-foreground)'),
    'pressed': ('[data-pressed],[aria-pressed="true"]', 'background-color:var(--accent);color:var(--accent-foreground)'),
    'active': ('[data-active]', 'background-color:var(--accent);color:var(--accent-foreground)'),
    'highlighted': ('[data-highlighted]', 'background-color:var(--accent);color:var(--accent-foreground)'),
    'current': ('[aria-current]', 'color:var(--foreground);font-weight:var(--label-weight)'),
    'expanded': ('[data-expanded],[aria-expanded="true"]', 'background-color:var(--accent);color:var(--accent-foreground)'),
    'loading': ('[data-loading],[aria-busy="true"]', 'opacity:.72;cursor:progress'),
    'horizontal': ('[data-horizontal],[aria-orientation="horizontal"]', 'flex-direction:row'),
    'vertical': ('[data-vertical],[aria-orientation="vertical"]', 'flex-direction:column'),
    'side': ('[data-side]', 'transform-origin:var(--transform-origin)'),
}
SOURCE_STATE_PATTERNS = {
    'disabled': (r'(?<![\w-])data-(?:disabled|\[disabled=true\]):', r'(?<![\w-])aria-disabled:'),
    'focus-visible': (r'(?<![\w-])focus-visible:', r'(?<![\w-])data-focus-visible:'),
    'invalid': (r'(?<![\w-])data-invalid:', r'(?<![\w-])aria-invalid:'),
    'open': (r'(?<![\w-])data-(?:open|\[state=open\]):',),
    'closed': (r'(?<![\w-])data-(?:closed|\[state=closed\]):',),
    'starting-style': (r'(?<![\w-])data-starting-style:',),
    'ending-style': (r'(?<![\w-])data-ending-style:',),
    'selected': (r'(?<![\w-])data-(?:selected|\[selected=true\]):',),
    'checked': (r'(?<![\w-])data-checked:',),
    'unchecked': (r'(?<![\w-])data-unchecked:',),
    'indeterminate': (r'(?<![\w-])data-indeterminate:',),
    'pressed': (r'(?<![\w-])data-pressed:', r'(?<![\w-])aria-pressed:'),
    'active': (r'(?<![\w-])data-(?:active|\[active=true\]):',),
    'highlighted': (r'(?<![\w-])data-highlighted:',),
    'current': (r'(?<![\w-])aria-current:',),
    'expanded': (r'(?<![\w-])data-expanded:', r'(?<![\w-])aria-expanded:'),
    'loading': (r'(?<![\w-])data-loading:', r'(?<![\w-])aria-busy:'),
    'horizontal': (r'(?<![\w-])data-horizontal:', r'(?<![\w-])aria-\[orientation=horizontal\]:'),
    'vertical': (r'(?<![\w-])data-vertical:', r'(?<![\w-])aria-\[orientation=vertical\]:'),
    'side': (r'(?<![\w-])data-\[side=(?:top|right|bottom|left)\]:',),
}

def visual_contract(file_groups):
    """Extract the semantic hook contract exposed by fetched Base UI source."""
    content='\n'.join(file.get('content','') for files in file_groups for file in files)
    hooks=sorted(set(re.findall(r'(?<![A-Za-z0-9_-])(cn-[a-z0-9-]+)',content)))
    observed=sorted(name for name,patterns in SOURCE_STATE_PATTERNS.items()
                    if any(re.search(pattern,content) for pattern in patterns))
    return {'hooks':hooks,'requiredStates':STATE_RULES,'observedStates':observed}

def semantic_hook_css(hooks):
    """Give every raw component hook a token-driven baseline before specific rules."""
    if not hooks: return ''
    rules=[]
    for hook in hooks:
        props=semantic_hook_properties(hook)
        if not props: continue
        props=['transition-duration:var(--motion-duration)','transition-timing-function:var(--motion-easing)']+props
        rules.append('.'+hook+'{'+';'.join(props)+';}')
    return '\n'.join(rules)+'\n'

def semantic_hook_properties(hook):
    props=[]
    if hook.endswith(('-size-default','-size-sm','-size-xs','-size-lg')): props.append('min-height:var(--control-height)')
    if hook.endswith('-orientation-responsive'): props.append('gap:var(--spacing-unit)')
    if any(word in hook for word in ['title','label','legend']): props.append('font-weight:var(--label-weight)')
    if any(word in hook for word in ['description','shortcut','caption','value']): props.append('color:var(--muted-foreground)')
    if any(word in hook for word in ['icon','caret','indicator','arrow','ellipsis']):
        props.extend(['color:var(--muted-foreground)','width:var(--icon-size)','height:var(--icon-size)'])
    if any(word in hook for word in ['separator','track','rail','progress']): props.append('background-color:var(--border)')
    if any(word in hook for word in ['content','popup']) and any(word in hook for word in ['dialog','menu','popover','combobox','select','sheet','drawer','tooltip','hover-card']):
        props.extend(['background-color:var(--popover)','color:var(--popover-foreground)'])
    if any(word in hook for word in ['trigger','button','action','link','item','choice','chip','input','close','cancel','previous','next','skip','submit','clear']):
        props.extend(['border-radius:var(--control-radius)','cursor:pointer'])
    if hook.endswith('-variant-outline'): props.append('border-color:var(--border)')
    if hook.endswith('-variant-border'): props.append('border-color:var(--border)')
    if hook.endswith('-variant-default'): props.extend(['background-color:var(--card)','color:var(--card-foreground)'])
    if hook.endswith('-variant-destructive'): props.append('color:var(--destructive)')
    if hook.endswith(('-variant-muted','-variant-secondary','-variant-tinted')): props.append('background-color:var(--muted)')
    if hook.endswith('-variant-ghost'): props.append('background-color:transparent')
    if hook.endswith('-orientation-horizontal'): props.append('flex-direction:row')
    if hook.endswith('-orientation-vertical'): props.append('flex-direction:column')
    if any(word in hook for word in ['content','media','tooltip']): props.append('color:var(--foreground)')
    if hook.endswith(('-content','-media','-tooltip')): props.append('border-radius:var(--surface-radius)')
    if any(word in hook for word in ['skeleton','empty']): props.append('background-color:var(--muted)')
    if 'badge' in hook: props.extend(['background-color:var(--muted)','color:var(--muted-foreground)'])
    if hook.endswith('-avatar'): props.extend(['border-radius:9999px','background-color:var(--muted)'])
    return list(dict.fromkeys(props))

def classify_hooks(hooks, explicit_css):
    explicit=set(re.findall(r'\.([a-z][a-z0-9-]*)',explicit_css))
    inferred=[]; structural=[]; unclassified=[]
    structural_terms=('root','group','list','wrapper','viewport','portal','positioner','header','footer','actions','content','set','gap')
    structural_names={'cn-accordion','cn-breadcrumb','cn-chart','cn-message','cn-message-scroller',
                      'cn-navigation-menu','cn-pagination','cn-scroll-area','cn-slider','cn-table',
                      'cn-table-body','cn-tabs','cn-menu-target','cn-menu-translucent','cn-rtl-flip'}
    for hook in hooks:
        if hook in explicit: continue
        if semantic_hook_properties(hook): inferred.append(hook)
        elif any(term in hook for term in structural_terms) or hook in structural_names:
            structural.append(hook)
        else: unclassified.append(hook)
    return {'explicitHooks':sorted(set(hooks)&explicit),'inferredHooks':sorted(inferred),
            'structuralHooks':sorted(structural),'unclassifiedHooks':sorted(unclassified)}

def state_css(required_states=None):
    names=required_states or STATE_RULES.keys()
    rules=[]
    for name in names:
        selectors,declarations=STATE_RULES[name]
        scoped=','.join('[class*="cn-"]'+selector for selector in selectors.split(','))
        rules.append(scoped+'{'+declarations+';}')
    return '\n'.join(rules)+'\n'

def audit_visual_css(contract, stylesheet, explicit_css):
    defined=set(re.findall(r'\.([a-z][a-z0-9-]*)',stylesheet))
    classes=classify_hooks(contract['hooks'],explicit_css)
    visual_hooks=set(classes['explicitHooks'])|set(classes['inferredHooks'])
    missing_hooks=sorted(visual_hooks-defined)
    missing_states=[]; stateProperties={}
    for name,(selectors,declarations) in contract['requiredStates'].items():
        properties=sorted(set(re.findall(r'([a-z-]+)\s*:',declarations)))
        stateProperties[name]=properties
        if not properties or not any(selector in stylesheet for selector in selectors.split(',')):
            missing_states.append(name)
    return {'coveredHooks':sorted(visual_hooks&defined),**classes,'missingHooks':missing_hooks,
            'stateProperties':stateProperties,'missingStates':missing_states}

def geometry(t):
    """Role-specific geometry; older token files retain their established values."""
    base=t['radius']
    values={'controlRadius':base,'surfaceRadius':base*1.35,'overlayRadius':base,
            'bodyLineHeight':1.5,'headingLineHeight':1.15,'headingTracking':-.035,
            'labelWeight':700,'controlPadding':16,'iconGap':8}
    values.update(t.get('craft',{}))
    return values

def validate(t):
    for k in ['name','slug','mode','colors','radius','font','spacing','icons','motion','shadow']:
        if k not in t: raise ValueError('Missing token group: '+k)
    if not isinstance(t['name'],str) or not t['name'].strip():
        raise ValueError('name must be a non-empty model-authored design name')
    if not isinstance(t['slug'],str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',t['slug']):
        raise ValueError('slug must be a model-authored kebab-case name')
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

def component_css(hooks=None):
    """Style shadcn's raw Base UI semantic hooks from the generated design tokens."""
    return semantic_hook_css(hooks or [])+state_css()+'''
@layer components {
  .cn-font-heading{@apply font-medium;}
  .cn-button{@apply rounded-[var(--control-radius)] border border-transparent bg-clip-padding text-sm font-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:pointer-events-none disabled:opacity-50;}
  .cn-button-variant-default{@apply bg-primary text-primary-foreground hover:opacity-85;} .cn-button-variant-secondary{@apply bg-secondary text-secondary-foreground hover:opacity-85;}
  .cn-button-variant-outline{@apply border-border bg-background hover:bg-muted;} .cn-button-variant-ghost{@apply hover:bg-muted;} .cn-button-variant-destructive{@apply bg-destructive/12 text-destructive hover:bg-destructive/20;} .cn-button-variant-link{@apply text-primary underline-offset-4 hover:underline;}
  .cn-button-size-xs{@apply h-7 gap-1 px-2 text-xs;} .cn-button-size-sm{@apply h-8 gap-1.5 px-3;} .cn-button-size-default{@apply h-[var(--control-height)] gap-[var(--icon-gap)] px-[var(--control-padding)];} .cn-button-size-lg{@apply h-[calc(var(--control-height)+4px)] gap-[var(--icon-gap)] px-[calc(var(--control-padding)+4px)];}
  .cn-button-size-icon-xs{@apply size-7;} .cn-button-size-icon-sm{@apply size-8;} .cn-button-size-icon{@apply size-[var(--control-height)];} .cn-button-size-icon-lg{@apply size-[calc(var(--control-height)+4px)];}
  .cn-input,.cn-textarea,.cn-select-trigger,.cn-native-select{@apply rounded-[var(--control-radius)] border border-input bg-transparent text-sm shadow-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50;}
  .cn-input,.cn-select-trigger,.cn-native-select{@apply h-[var(--control-height)] px-[var(--control-padding)];} .cn-textarea{@apply min-h-20 px-[var(--control-padding)] py-3;}
  .cn-label,.cn-field-label{@apply text-sm font-medium;} .cn-field-description,.cn-card-description,.cn-dialog-description,.cn-alert-dialog-description,.cn-popover-description,.cn-empty-description,.cn-item-description{@apply text-sm text-muted-foreground;} .cn-field-error{@apply text-sm text-destructive;} .cn-field-group{@apply gap-5;} .cn-field{@apply gap-2;}
  .cn-card,.cn-item,.cn-attachment,.cn-alert{@apply rounded-[var(--surface-radius)] border border-border bg-card text-card-foreground shadow-[var(--design-shadow)];}
  .cn-card{@apply gap-4 overflow-hidden py-5;} .cn-card-header,.cn-card-content{@apply px-5;} .cn-card-footer{@apply border-t bg-muted/45 px-5 pt-4;} .cn-card-title,.cn-dialog-title,.cn-alert-dialog-title,.cn-popover-title,.cn-empty-title,.cn-item-title{@apply font-medium;} .cn-item,.cn-attachment{@apply gap-3 p-3;} .cn-alert{@apply gap-1 px-4 py-3;}
  .cn-badge{@apply h-6 gap-1 rounded-full border border-transparent px-2.5 text-xs font-medium;} .cn-badge-variant-default{@apply bg-primary text-primary-foreground;} .cn-badge-variant-secondary{@apply bg-secondary text-secondary-foreground;} .cn-badge-variant-outline{@apply border-border;} .cn-badge-variant-destructive{@apply bg-destructive/12 text-destructive;} .cn-badge-variant-ghost{@apply hover:bg-muted;} .cn-badge-variant-link{@apply text-primary hover:underline;}
  .cn-checkbox,.cn-radio-group-item{@apply size-4 border border-input bg-background text-primary focus-visible:ring-3 focus-visible:ring-ring/50;} .cn-checkbox{@apply rounded-[calc(var(--control-radius)/3)];} .cn-radio-group-item{@apply rounded-full;}
  .cn-switch{@apply h-6 w-11 rounded-full bg-input p-[3px] data-checked:bg-primary;} .cn-switch-thumb{@apply size-[18px] rounded-full bg-background shadow-sm;}
  .cn-tabs-list{@apply h-[var(--control-height)] gap-1 rounded-[var(--control-radius)] bg-muted p-1;} .cn-tabs-trigger{@apply rounded-[calc(var(--control-radius)*.75)] px-3 text-sm text-muted-foreground data-active:bg-background data-active:text-foreground data-active:shadow-sm;}
  .cn-dialog-overlay,.cn-alert-dialog-overlay,.cn-sheet-overlay,.cn-drawer-overlay{@apply bg-black/35 backdrop-blur-xs data-open:animate-in data-closed:animate-out data-open:fade-in-0 data-closed:fade-out-0;}
  .cn-dialog-content,.cn-alert-dialog-content,.cn-sheet-content,.cn-popover-content,.cn-hover-card-content,.cn-select-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content,.cn-combobox-content{@apply rounded-[var(--overlay-radius)] border border-border bg-popover text-popover-foreground shadow-[var(--design-shadow)];}
  .cn-dialog-content,.cn-alert-dialog-content{@apply max-w-[calc(100%-2rem)] gap-4 p-5 sm:max-w-md;} .cn-dialog-header,.cn-alert-dialog-header{@apply gap-2;} .cn-dialog-footer,.cn-alert-dialog-footer{@apply mt-1;} .cn-popover-content,.cn-hover-card-content{@apply w-72 p-4;}
  .cn-select-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content,.cn-combobox-content{@apply min-w-40 p-1;} .cn-select-item,.cn-dropdown-menu-item,.cn-context-menu-item,.cn-menubar-item,.cn-combobox-item,.cn-command-item{@apply gap-2 rounded-[calc(var(--control-radius)*.75)] px-2 py-1.5 text-sm focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground;}
  .cn-select-label,.cn-dropdown-menu-label,.cn-context-menu-label,.cn-menubar-label,.cn-combobox-label{@apply px-2 py-1.5 text-xs font-medium text-muted-foreground;} .cn-select-separator,.cn-dropdown-menu-separator,.cn-context-menu-separator,.cn-menubar-separator,.cn-command-separator{@apply my-1 h-px bg-border;}
  .cn-tooltip-content{@apply rounded-[calc(var(--control-radius)*.65)] bg-foreground px-3 py-1.5 text-xs text-background shadow-sm;} .cn-accordion-item{@apply border-b;} .cn-accordion-trigger{@apply py-4 text-left text-sm font-medium hover:underline;} .cn-accordion-content-inner{@apply pb-4 text-sm;}
  .cn-progress-track,.cn-progress-root{@apply h-2 overflow-hidden rounded-full bg-muted;} .cn-progress-indicator{@apply h-full bg-primary transition-transform;} .cn-slider-track{@apply h-1.5 rounded-full bg-muted;} .cn-slider-range{@apply bg-primary;} .cn-slider-thumb{@apply size-4 rounded-full border-2 border-primary bg-background shadow-sm;}
  .cn-toggle{@apply rounded-[var(--control-radius)] px-3 text-sm hover:bg-muted data-pressed:bg-accent;} .cn-toggle-variant-outline{@apply border border-input;} .cn-table-container{@apply rounded-[var(--surface-radius)] border;} .cn-table-header{@apply bg-muted/50;} .cn-table-row{@apply border-b hover:bg-muted/40;} .cn-table-head,.cn-table-cell{@apply h-10 px-3 text-left text-sm;}
  .cn-skeleton{@apply animate-pulse rounded-[var(--control-radius)] bg-muted;} .cn-separator{@apply shrink-0 bg-border;} .cn-scroll-area-scrollbar{@apply p-0.5;} .cn-scroll-area-thumb{@apply rounded-full bg-border;} .cn-avatar,.cn-avatar-image,.cn-avatar-fallback{@apply rounded-full;} .cn-avatar-fallback{@apply bg-muted text-muted-foreground;}
  .cn-empty{@apply rounded-[var(--surface-radius)] border border-dashed p-8 text-center;} .cn-empty-header{@apply gap-2;} .cn-kbd{@apply rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs;} .cn-sidebar-inner{@apply bg-sidebar text-sidebar-foreground;} .cn-sidebar-menu-button{@apply rounded-[var(--control-radius)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent;} .cn-toast{@apply rounded-[var(--overlay-radius)] border border-border bg-popover text-popover-foreground shadow-[var(--design-shadow)];}
  .cn-calendar{@apply rounded-[var(--surface-radius)] bg-card p-3 text-card-foreground;} .cn-calendar-caption{@apply text-sm font-medium;} .cn-calendar-day-button{@apply size-9 rounded-[var(--control-radius)] text-sm hover:bg-accent data-selected:bg-primary data-selected:text-primary-foreground;} .cn-calendar-dropdown-root{@apply rounded-[var(--control-radius)] border border-input;}
  .cn-command,.cn-command-dialog{@apply overflow-hidden rounded-[var(--overlay-radius)] bg-popover text-popover-foreground;} .cn-command-input-wrapper{@apply border-b px-3;} .cn-command-input{@apply h-[var(--control-height)] w-full bg-transparent text-sm outline-none;} .cn-command-list{@apply max-h-72 overflow-y-auto p-1;} .cn-command-group{@apply p-1 text-foreground;} .cn-command-empty{@apply py-8 text-center text-sm text-muted-foreground;} .cn-command-shortcut{@apply ml-auto text-xs text-muted-foreground;}
  .cn-input-group{@apply rounded-[var(--control-radius)] border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50;} .cn-input-group-addon{@apply gap-2 px-3 text-sm text-muted-foreground;} .cn-input-group-input,.cn-input-group-textarea{@apply border-0 bg-transparent shadow-none outline-none;}
  .cn-navigation-menu-list,.cn-menubar,.cn-pagination-content,.cn-breadcrumb-list{@apply items-center gap-1;} .cn-navigation-menu-trigger,.cn-navigation-menu-link,.cn-menubar-trigger,.cn-pagination-link{@apply rounded-[var(--control-radius)] px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground;} .cn-navigation-menu-content,.cn-navigation-menu-popup{@apply rounded-[var(--overlay-radius)] border border-border bg-popover p-2 text-popover-foreground shadow-[var(--design-shadow)];} .cn-breadcrumb-list{@apply text-sm text-muted-foreground;} .cn-breadcrumb-link{@apply hover:text-foreground;} .cn-breadcrumb-page{@apply text-foreground;}
  .cn-sidebar-header,.cn-sidebar-content,.cn-sidebar-footer{@apply p-2;} .cn-sidebar-group{@apply p-2;} .cn-sidebar-group-label{@apply px-2 text-xs font-medium text-sidebar-foreground/65;} .cn-sidebar-menu{@apply gap-1;} .cn-sidebar-menu-button{@apply min-h-9 gap-2 px-2 text-sm;} .cn-sidebar-menu-sub{@apply ml-4 border-l border-sidebar-border pl-2;} .cn-sidebar-separator{@apply bg-sidebar-border;} .cn-sidebar-inset{@apply bg-background;}
  .cn-questionnaire{@apply gap-5;} .cn-questionnaire-item{@apply gap-3;} .cn-questionnaire-title{@apply text-base font-medium;} .cn-questionnaire-description{@apply text-sm text-muted-foreground;} .cn-questionnaire-choices{@apply gap-2;} .cn-questionnaire-choice{@apply rounded-[var(--surface-radius)] border border-border bg-card p-3 hover:border-primary/60 data-selected:border-primary data-selected:bg-accent;} .cn-questionnaire-choice-title,.cn-questionnaire-choice-label{@apply font-medium;} .cn-questionnaire-actions{@apply gap-2;} .cn-questionnaire-error{@apply text-sm text-destructive;}
  .cn-message,.cn-bubble,.cn-attachment{@apply text-sm;} .cn-message{@apply gap-2;} .cn-message-header,.cn-message-footer{@apply text-xs text-muted-foreground;} .cn-bubble-content{@apply rounded-[var(--surface-radius)] bg-muted px-4 py-2.5;} .cn-bubble-variant-default .cn-bubble-content{@apply bg-primary text-primary-foreground;} .cn-bubble-variant-outline .cn-bubble-content{@apply border border-border bg-background;} .cn-marker{@apply gap-2 text-sm;} .cn-marker-icon{@apply text-primary;} .cn-message-scroller-viewport{@apply overflow-y-auto;} .cn-message-scroller-button{@apply rounded-full bg-primary text-primary-foreground shadow-[var(--design-shadow)];}
  .cn-carousel-previous,.cn-carousel-next{@apply rounded-full border border-border bg-background shadow-sm hover:bg-muted;} .cn-resizable-handle{@apply bg-border focus-visible:ring-2 focus-visible:ring-ring;} .cn-resizable-handle-icon{@apply rounded bg-muted;}
  .cn-drawer-popup,.cn-sheet-content{@apply bg-popover text-popover-foreground shadow-[var(--design-shadow)];} .cn-drawer-header-base,.cn-drawer-footer-base,.cn-sheet-header,.cn-sheet-footer{@apply gap-2 p-5;} .cn-drawer-swipe-handle{@apply mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted;}
}
'''

def css(t, tailwind=True, hooks=None):
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
    return '@import "tailwindcss";\n@import "tw-animate-css";\n@import "shadcn/tailwind.css";\n@custom-variant dark (&:is(.dark *));\n@theme inline{'+aliases+';}\n'+variables+'@layer base{*{@apply border-border outline-ring/50;}body{@apply bg-background text-foreground;}}\n'+shared+component_css(hooks)

def luminance(hex_color):
    channels=[int(hex_color[i:i+2],16)/255 for i in (1,3,5)]
    channels=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in channels]
    return sum(a*b for a,b in zip(channels,[.2126,.7152,.0722]))

def contrast(t):
    reports=[]
    for mode,colors in [(t['mode'],t['colors'])]+([(t['alternate']['mode'],t['alternate']['colors'])] if t.get('alternate') else []):
        pairs=[('foreground','background'),('card-foreground','card'),('primary-foreground','primary'),
               ('secondary-foreground','secondary'),('muted-foreground','muted'),
               ('accent-foreground','accent'),('popover-foreground','popover'),
               ('destructive','background'),('sidebar-foreground','sidebar'),
               ('sidebar-primary-foreground','sidebar-primary'),('sidebar-accent-foreground','sidebar-accent'),
               ('ring','background'),('input','background')]
        for fg,bg in pairs:
            a,b=sorted([luminance(colors[fg]),luminance(colors[bg])])
            ratio=(b+.05)/(a+.05)
            minimum=3 if fg in ['ring','input'] else 4.5
            reports.append(dict(mode=mode,pair=fg+'/'+bg,ratio=round(ratio,2),minimum=minimum,passAA=ratio>=minimum))
    return reports

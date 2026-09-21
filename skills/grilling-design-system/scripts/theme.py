"""Shared token validation, CSS and contrast reports."""
import re

COLOR_KEYS = ['background','foreground','card','card-foreground','popover','popover-foreground',
              'primary','primary-foreground','secondary','secondary-foreground','muted','muted-foreground',
              'accent','accent-foreground','destructive','border','input','ring',
              'chart-1','chart-2','chart-3','chart-4','chart-5',
              'sidebar','sidebar-foreground','sidebar-primary','sidebar-primary-foreground',
              'sidebar-accent','sidebar-accent-foreground','sidebar-border','sidebar-ring']

def truthy_data_selector(name):
    """Match Base UI boolean data attributes when empty or true, never false."""
    if not re.fullmatch(r'[a-z][a-z0-9-]*',name):
        raise ValueError('Invalid data attribute name')
    return f'[data-{name}]:not([data-{name}="false"])'

ACTIVE_DATA = truthy_data_selector('active')
DEFAULT_TAB_ACTIVE = '.cn-tabs-list:not([data-variant="line"]) .cn-tabs-trigger'+ACTIVE_DATA
THEME_SIGNATURE_MATRIX = {
    'actions': {
        'depth': '.cn-button-variant-default,.cn-button-variant-secondary,.cn-button-variant-outline{box-shadow:0 3px 0 color-mix(in srgb,var(--foreground) 22%,transparent)}',
        'color': '.cn-button-variant-default{background-color:var(--primary);color:var(--primary-foreground)}.cn-button-variant-secondary{background-color:var(--secondary);color:var(--secondary-foreground)}',
        'state': '.cn-button-variant-default:active,.cn-button-variant-secondary:active,.cn-button-variant-outline:active,.cn-button[data-pressed="true"]{transform:translateY(2px);box-shadow:0 1px 0 color-mix(in srgb,var(--foreground) 22%,transparent)}',
    },
    'inputs': {
        'depth': '.cn-input:not(.cn-input-group-input),.cn-textarea:not(.cn-input-group-textarea),.cn-select-trigger,.cn-native-select,.cn-input-group:not(.cn-command-input-group){border-width:2px;box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 14%,transparent)}',
        'color': '.cn-input:not(.cn-input-group-input),.cn-textarea:not(.cn-input-group-textarea),.cn-select-trigger,.cn-native-select,.cn-input-group:not(.cn-command-input-group){background-color:var(--card);color:var(--card-foreground)}',
        'state': '.cn-input:not(.cn-input-group-input):focus-visible,.cn-textarea:not(.cn-input-group-textarea):focus-visible,.cn-select-trigger:focus-visible,.cn-native-select:focus-visible,.cn-input-group:not(.cn-command-input-group):focus-within{border-color:var(--ring);box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 14%,transparent),0 0 0 3px color-mix(in srgb,var(--ring) 28%,transparent)}',
    },
    'selection': {
        'depth': '.cn-checkbox,.cn-radio-group-item{border-width:2px;box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 16%,transparent)}',
        'color': '.cn-checkbox[data-checked="true"],.cn-radio-group-item[data-checked="true"],.cn-switch[data-checked]:not([data-checked="false"]){background-color:var(--primary);border-color:var(--primary);color:var(--primary-foreground)}',
        'state': '.cn-checkbox:active,.cn-radio-group-item:active,.cn-switch:active{transform:translateY(1px);filter:saturate(1.08)}',
    },
    'navigation': {
        'depth': '.cn-tabs-list{border:2px solid var(--border);box-shadow:0 3px 0 color-mix(in srgb,var(--foreground) 14%,transparent)}'+DEFAULT_TAB_ACTIVE+',.cn-toggle[data-pressed="true"]{box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 18%,transparent)}',
        'color': DEFAULT_TAB_ACTIVE+',.cn-toggle[data-pressed="true"]{background-color:var(--accent);color:var(--accent-foreground)}',
        'state': '.cn-tabs-trigger:active,.cn-toggle:active{transform:translateY(1px)}',
    },
    'data-display': {
        'depth': '.cn-card,.cn-attachment{box-shadow:var(--design-shadow)}.cn-table-container{box-shadow:0 3px 0 color-mix(in srgb,var(--foreground) 14%,transparent)}.cn-item{box-shadow:none}',
        'color': '.cn-table-header{background-color:color-mix(in srgb,var(--secondary) 55%,var(--card))}.cn-table-row:hover{background-color:color-mix(in srgb,var(--accent) 38%,transparent)}',
        'state': '.cn-card:focus-within,.cn-table-container:focus-within{border-color:var(--ring)}',
    },
    'overlays': {
        'depth': '.cn-dialog-content,.cn-alert-dialog-content,.cn-sheet-content,.cn-popover-content,.cn-hover-card-content,.cn-select-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content,.cn-combobox-content{border-width:2px;box-shadow:var(--design-shadow)}',
        'color': '.cn-dialog-content,.cn-alert-dialog-content,.cn-sheet-content,.cn-popover-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content{background-color:var(--popover);color:var(--popover-foreground)}',
        'state': '.cn-select-item[data-highlighted="true"],.cn-dropdown-menu-item[data-highlighted="true"],.cn-context-menu-item[data-highlighted="true"],.cn-menubar-item[data-highlighted="true"]{background-color:var(--accent);color:var(--accent-foreground)}',
    },
    'feedback': {
        'depth': '.cn-alert,.cn-toast{border-width:2px;box-shadow:var(--design-shadow)}',
        'color': '.cn-alert{border-inline-start:6px solid var(--secondary)}.cn-toast{border-inline-start:6px solid var(--accent)}.cn-progress-track{background-color:var(--secondary)}.cn-progress-indicator{background-color:var(--primary)}',
        'state': '.cn-alert:hover,.cn-toast:hover{border-color:var(--ring)}.cn-progress-indicator{transition-timing-function:var(--motion-easing)}',
    },
}
STATE_RULES = {
    'disabled': ('[data-disabled="true"],[data-disabled]:not([data-disabled="false"]),[aria-disabled="true"],:disabled', 'opacity:.5;pointer-events:none;cursor:not-allowed'),
    'focus-visible': (':focus-visible,[data-focus-visible="true"],[data-focus-visible]:not([data-focus-visible="false"])', 'outline:3px solid color-mix(in srgb,var(--ring) 50%,transparent);outline-offset:2px'),
    'invalid': ('[data-invalid="true"],[data-invalid]:not([data-invalid="false"]),[aria-invalid="true"]', 'border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)'),
    'open': ('[data-open="true"],[data-open]:not([data-open="false"]),[data-state="open"]', 'opacity:1;animation-duration:var(--motion-duration);animation-timing-function:var(--motion-easing)'),
    'closed': ('[data-closed="true"],[data-closed]:not([data-closed="false"]),[data-state="closed"]', 'opacity:0;animation-duration:var(--motion-duration);animation-timing-function:var(--motion-easing)'),
    'starting-style': ('[data-starting-style="true"],[data-starting-style]:not([data-starting-style="false"])', 'opacity:0;transform:scale(.98)'),
    'ending-style': ('[data-ending-style="true"],[data-ending-style]:not([data-ending-style="false"])', 'opacity:0;transform:scale(.98)'),
    # Reflected booleans such as cmdk's data-selected and input-otp's
    # data-active remain present when false. Never style those by presence.
    'selected': ('[data-selected="true"],[data-selected]:not([data-selected="false"])', 'border-color:var(--primary);background-color:var(--accent);color:var(--accent-foreground)'),
    'checked': ('[data-checked="true"],[data-checked]:not([data-checked="false"])', 'border-color:var(--primary);background-color:var(--primary);color:var(--primary-foreground)'),
    'unchecked': ('[data-unchecked="true"],[data-unchecked]:not([data-unchecked="false"])', 'background-color:var(--background);color:var(--foreground)'),
    'indeterminate': ('[data-indeterminate="true"],[data-indeterminate]:not([data-indeterminate="false"])', 'border-color:var(--primary);background-color:var(--primary);color:var(--primary-foreground)'),
    'pressed': ('[data-pressed="true"],[data-pressed]:not([data-pressed="false"]),[aria-pressed="true"]', 'background-color:var(--accent);color:var(--accent-foreground)'),
    'active': (ACTIVE_DATA, 'background-color:var(--accent);color:var(--accent-foreground)'),
    'highlighted': ('[data-highlighted="true"],[data-highlighted]:not([data-highlighted="false"])', 'background-color:var(--accent);color:var(--accent-foreground)'),
    'current': ('[aria-current]:not([aria-current="false"])', 'color:var(--foreground);font-weight:var(--label-weight)'),
    # Expanded describes disclosure state, not selection. Keep its generic rule
    # paint-free; component-specific trigger styles may add a visible treatment.
    'expanded': ('[data-expanded="true"],[data-expanded]:not([data-expanded="false"]),[aria-expanded="true"]', 'transition-duration:var(--motion-duration);transition-timing-function:var(--motion-easing)'),
    'loading': ('[data-loading="true"],[data-loading]:not([data-loading="false"]),[aria-busy="true"]', 'opacity:.72;cursor:progress'),
    'horizontal': ('[data-horizontal="true"],[data-horizontal]:not([data-horizontal="false"]),[aria-orientation="horizontal"]', 'flex-direction:row'),
    'vertical': ('[data-vertical="true"],[data-vertical]:not([data-vertical="false"]),[aria-orientation="vertical"]', 'flex-direction:column'),
    'side': ('[data-side]', 'transform-origin:var(--transform-origin)'),
}

# Paint-bearing states must only target hooks for which the state has that
# visual meaning. ARIA attributes are also used for behavior: cmdk's search
# input, for example, is aria-expanded while its result list is open.
STATE_SCOPES = {
    'invalid': ('.cn-button','.cn-input','.cn-textarea','.cn-select-trigger','.cn-native-select',
                '.cn-checkbox','.cn-radio-group-item','.cn-switch','.cn-input-otp-slot',
                '.cn-input-group','.cn-combobox-input','.cn-combobox-chips'),
    'open': ('.cn-dialog-content','.cn-alert-dialog-content','.cn-sheet-content','.cn-drawer-popup',
             '.cn-popover-content','.cn-hover-card-content','.cn-select-content','.cn-combobox-content',
             '.cn-dropdown-menu-content','.cn-context-menu-content','.cn-menubar-content','.cn-tooltip-content'),
    'closed': ('.cn-dialog-content','.cn-alert-dialog-content','.cn-sheet-content','.cn-drawer-popup',
               '.cn-popover-content','.cn-hover-card-content','.cn-select-content','.cn-combobox-content',
               '.cn-dropdown-menu-content','.cn-context-menu-content','.cn-menubar-content','.cn-tooltip-content'),
    'starting-style': ('.cn-dialog-content','.cn-alert-dialog-content','.cn-sheet-content','.cn-drawer-popup',
                       '.cn-popover-content','.cn-hover-card-content','.cn-select-content','.cn-combobox-content',
                       '.cn-dropdown-menu-content','.cn-context-menu-content','.cn-menubar-content','.cn-tooltip-content'),
    'ending-style': ('.cn-dialog-content','.cn-alert-dialog-content','.cn-sheet-content','.cn-drawer-popup',
                     '.cn-popover-content','.cn-hover-card-content','.cn-select-content','.cn-combobox-content',
                     '.cn-dropdown-menu-content','.cn-context-menu-content','.cn-menubar-content','.cn-tooltip-content'),
    'selected': ('.cn-command-item','.cn-questionnaire-choice','.cn-calendar-day-button'),
    'checked': ('.cn-checkbox','.cn-radio-group-item','.cn-switch'),
    'unchecked': ('.cn-checkbox','.cn-radio-group-item','.cn-switch'),
    'indeterminate': ('.cn-checkbox',),
    'pressed': ('.cn-toggle','.cn-toggle-group-item','.cn-button'),
    'active': ('.cn-tabs-trigger','.cn-sidebar-menu-button','.cn-pagination-link'),
    'highlighted': ('.cn-select-item','.cn-combobox-item','.cn-dropdown-menu-item',
                    '.cn-context-menu-item','.cn-menubar-item'),
    'current': ('.cn-breadcrumb-page','.cn-pagination-link','.cn-navigation-menu-link','.cn-sidebar-menu-button'),
}

# Critical component rules are audited as structure, not merely as class names.
# Keep these fragments as plain CSS declarations/selectors so the audit does not
# depend on Tailwind compiling @apply before generation completes.
STRUCTURAL_REQUIREMENTS = {
    'command-item-layout': ('cn-command-item', ('display:flex', 'align-items:center', 'line-height:1.25rem')),
    'command-selected-truth': ('cn-command-item[data-selected="true"]', ('background-color:var(--accent)',)),
    'otp-slot-geometry': ('cn-input-otp-slot', ('width:var(--control-height)', 'height:var(--control-height)', 'border:1px solid var(--input)')),
    'otp-slot-active-truth': ('cn-input-otp-slot[data-active="true"]', ('z-index:1', 'border-color:var(--ring)')),
    'otp-invalid': ('cn-input-otp:has(.cn-input-otp-input[aria-invalid="true"]) .cn-input-otp-slot', ('border-color:var(--destructive)',)),
    'otp-caret': ('cn-input-otp-caret-line', ('width:1px', 'height:1.25rem')),
    'native-select-appearance': ('cn-native-select', ('appearance:none', 'padding-inline-end:calc(var(--control-padding) + var(--icon-size))')),
    'native-select-icon-position': ('cn-native-select-icon', ('position:absolute', 'right:var(--control-padding)', 'top:50%')),
    'native-select-small': ('cn-native-select[data-size="sm"]', ('height:2rem',)),
    'sheet-overlay-layer': ('cn-sheet-overlay', ('position:fixed', 'inset:0', 'z-index:80')),
    'sheet-content-layer': ('cn-sheet-content', ('position:fixed', 'z-index:81')),
    'switch-checked-track': ('cn-switch[data-checked]:not([data-checked="false"])', ('background-color:var(--primary)',)),
    'switch-checked-thumb': ('cn-switch[data-checked]:not([data-checked="false"]) .cn-switch-thumb', ('transform:translateX(calc(var(--switch-width) - var(--switch-thumb-size) - var(--switch-inset) - var(--switch-inset)))',)),
    'switch-unchecked-thumb': ('cn-switch[data-unchecked]:not([data-unchecked="false"]) .cn-switch-thumb', ('transform:translateX(0)',)),
    'input-group-control-frame': ('cn-input-group > .cn-input-group-input', ('border:0', 'box-shadow:none', 'background:transparent')),
    'input-group-textarea-frame': ('cn-input-group > .cn-input-group-textarea', ('border:0', 'box-shadow:none', 'background:transparent')),
    'input-group-addon-frame': ('cn-input-group > .cn-input-group-addon', ('border:0', 'box-shadow:none', 'background:transparent')),
    'checkbox-root-centering': ('cn-checkbox', ('display:inline-grid', 'place-items:center', 'width:1rem', 'height:1rem', 'min-width:1rem', 'min-height:1rem', 'padding:0', 'line-height:0')),
    'checkbox-indicator-centering': ('cn-checkbox-indicator', ('position:absolute', 'inset:0', 'display:grid', 'place-items:center', 'width:100%', 'height:100%', 'line-height:0', 'pointer-events:none')),
    'checkbox-icon-centering': ('cn-checkbox-indicator > svg', ('display:block', 'width:.75rem', 'height:.75rem', 'margin:auto', 'flex:none')),
    'button-group-frame': ('cn-button-group', ('display:flex', 'width:fit-content', 'max-width:100%', 'align-items:stretch', 'border:2px solid var(--border)', 'border-radius:var(--control-radius)', 'box-shadow:0 3px 0 color-mix(in srgb,var(--foreground) 18%,transparent)', 'overflow:hidden', 'isolation:isolate')),
    'button-group-child-reset': ('cn-button-group > [data-slot]:not([data-slot="button-group-separator"])', ('border:0', 'border-radius:0', 'box-shadow:none', 'margin:0')),
    'button-group-horizontal-separator': ('cn-button-group:not([data-orientation="vertical"]) > [data-slot] + [data-slot]', ('border-inline-start:1px solid var(--border)',)),
    'button-group-vertical-separator': ('cn-button-group[data-orientation="vertical"] > [data-slot] + [data-slot]', ('border-block-start:1px solid var(--border)',)),
    'button-group-focus': ('cn-button-group > [data-slot]:focus-visible', ('position:relative', 'z-index:2', 'outline:2px solid var(--ring)', 'outline-offset:-2px', 'box-shadow:none!important')),
    'button-group-pressed': ('cn-button-group .cn-button:active', ('transform:none', 'box-shadow:none!important')),
    'input-group-frame-clipping': ('cn-input-group', ('overflow:hidden',)),
    'input-group-inline-addon': ('cn-input-group > .cn-input-group-addon[data-align="inline-start"]', ('flex:none', 'min-height:var(--control-height)', 'padding-inline:.75rem', 'border-inline-end:1px solid var(--border)')),
    'input-group-inline-end-addon': ('cn-input-group > .cn-input-group-addon[data-align="inline-end"]', ('flex:none', 'min-height:var(--control-height)', 'padding-inline:.75rem', 'border-inline-start:1px solid var(--border)')),
    'input-group-button-reset': ('cn-input-group-addon .cn-input-group-button', ('border:0', 'box-shadow:none!important', 'margin:0')),
    'input-group-button-addon': ('cn-input-group > .cn-input-group-addon:has(> .cn-input-group-button):not(:has(> :not(.cn-input-group-button)))', ('align-self:stretch', 'padding:0')),
    'input-group-button-fill': ('cn-input-group > .cn-input-group-addon:has(> .cn-input-group-button):not(:has(> :not(.cn-input-group-button))) > .cn-input-group-button', ('height:100%', 'min-height:var(--control-height)', 'border-radius:0', 'padding-inline:.875rem')),
    'input-group-block-layout': ('cn-input-group:has(> .cn-input-group-addon[data-align="block-start"])', ('flex-wrap:wrap', 'align-items:stretch')),
    'input-group-block-addon': ('cn-input-group > .cn-input-group-addon[data-align="block-start"]', ('flex:0 0 100%', 'width:100%', 'min-height:2.5rem', 'padding:.75rem 1rem', 'border-bottom:1px solid var(--border)')),
    'input-group-block-end-addon': ('cn-input-group > .cn-input-group-addon[data-align="block-end"]', ('flex:0 0 100%', 'width:100%', 'min-height:2.5rem', 'padding:.75rem 1rem', 'border-top:1px solid var(--border)')),
    'input-group-textarea-wrapper': ('cn-input-group:has(> .cn-input-group-textarea)', ('flex-direction:column', 'align-items:stretch', 'height:auto', 'min-height:7rem')),
    'input-group-textarea-layout': ('cn-input-group > .cn-input-group-textarea[data-slot="input-group-control"]', ('width:100%', 'min-height:5.5rem', 'flex:1 1 auto', 'padding:1rem')),
    'input-group-invalid-frame': ('cn-input-group:has(> [aria-invalid="true"])', ('border-color:var(--destructive)', 'box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)')),
    'input-group-invalid-control-reset': ('cn-input-group > [aria-invalid="true"]', ('border:0', 'box-shadow:none!important', 'outline:none')),
    'invalid-control-ring': ('cn-input[aria-invalid="true"]', ('border-color:var(--destructive)', 'box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)')),
    'card-field-spacing': ('cn-card-content > .cn-field-group', ('gap:1.25rem',)),
    'card-footer-spacing': ('cn-card > .cn-card-footer', ('gap:.5rem',)),
    'command-input-boundary': ('cn-command-input-wrapper', ('border-bottom:1px solid var(--border)', 'padding:0')),
    'command-input-group-layout': ('cn-command-input-group', ('display:flex', 'align-items:center', 'width:100%', 'border:0', 'box-shadow:none', 'background:transparent')),
    'command-input-layout': ('cn-command-input', ('min-width:0', 'height:var(--control-height)', 'flex:1', 'border:0', 'background:transparent', 'padding-inline:0')),
    'navigation-open-state': ('cn-navigation-menu-trigger[data-popup-open]:not([data-popup-open="false"])', ('background-color:var(--accent)', 'color:var(--accent-foreground)')),
    'navigation-open-icon': ('cn-navigation-menu-trigger[data-popup-open]:not([data-popup-open="false"]) .cn-navigation-menu-trigger-icon', ('transform:rotate(180deg)',)),
    'navigation-link-descendant-hover': ('cn-navigation-menu-link:hover .text-muted-foreground', ('color:var(--accent-foreground)!important',)),
    'navigation-content-link-box': ('cn-navigation-menu-content .cn-navigation-menu-link', ('display:block', 'width:100%')),
    'sidebar-dropdown-trigger': ('cn-sidebar-inner .cn-sidebar-menu-button[data-popup-open]:not([data-popup-open="false"])', ('background-color:var(--sidebar-accent)!important', 'color:var(--sidebar-accent-foreground)!important')),
    'sidebar-dropdown-item-reset': ('cn-sidebar-inner .cn-sidebar-menu-button > .cn-item', ('border:0!important', 'background:transparent!important', 'box-shadow:none!important')),
    'sidebar-dropdown-content': ('cn-sidebar-dropdown-content', ('z-index:75!important', 'width:var(--anchor-width)', 'min-width:min(var(--anchor-width),calc(100vw - 2rem))', 'max-width:calc(100vw - 2rem)')),
    'sidebar-dropdown-positioner': ('cn-dropdown-menu-positioner:has(> .cn-sidebar-dropdown-content)', ('z-index:75!important',)),
    'tabs-active-state': ('cn-tabs-trigger[data-active]:not([data-active="false"])', ('background-color:var(--accent)', 'color:var(--accent-foreground)', 'border-color:var(--border)', 'box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 18%,transparent)')),
    'tabs-inactive-state': ('cn-tabs-trigger[data-active="false"]', ('background-color:transparent', 'border-color:transparent', 'box-shadow:none')),
    'tabs-line-active-state': ('cn-tabs-list[data-variant="line"] .cn-tabs-trigger[data-active]:not([data-active="false"])', ('background-color:transparent', 'border-color:transparent', 'box-shadow:none')),
    'tabs-line-active-color': ('cn-tabs-list[data-variant="line"] .cn-tabs-trigger[data-active]:not([data-active="false"])', ('color:var(--foreground)',)),
    'dialog-close-position': ('cn-dialog-close', ('position:absolute', 'top:1rem', 'right:1rem', 'z-index:1', 'display:inline-grid', 'place-items:center')),
    'dialog-close-clearance': ('cn-dialog-content:has(> .cn-dialog-close)', ('padding-inline-end:3.5rem',)),
    'alert-layout': ('cn-alert', ('display:grid', 'grid-template-columns:minmax(0,1fr) auto', 'align-items:start')),
    'alert-leading-layout': ('cn-alert:has(> svg)', ('grid-template-columns:auto minmax(0,1fr) auto',)),
    'alert-leading-icon': ('cn-alert > svg', ('grid-column:1', 'grid-row:1 / span 2', 'align-self:start')),
    'avatar-default-size': ('cn-avatar[data-size="default"]', ('width:2.5rem', 'height:2.5rem', 'aspect-ratio:1')),
    'avatar-small-size': ('cn-avatar[data-size="sm"]', ('width:2rem', 'height:2rem')),
    'avatar-large-size': ('cn-avatar[data-size="lg"]', ('width:3rem', 'height:3rem')),
    'message-scroller-spacing': ('cn-message-scroller-content', ('gap:.75rem', 'padding-block:.5rem')),
    'collapsible-trigger-hover': ('cn-button[data-slot="collapsible-trigger"]:hover', ('background-color:var(--muted)!important', 'color:var(--foreground)!important')),
    'collapsible-trigger-focus': ('cn-button[data-slot="collapsible-trigger"]:focus-visible', ('background-color:var(--muted)!important', 'color:var(--foreground)!important')),
    'collapsible-trigger-open': ('cn-button[data-slot="collapsible-trigger"][data-panel-open]:not([data-panel-open="false"])', ('background-color:var(--muted)!important', 'color:var(--foreground)!important')),
    'collapsible-trigger-muted-hover': ('cn-button[data-slot="collapsible-trigger"]:hover .text-muted-foreground', ('color:var(--foreground)!important',)),
    'collapsible-trigger-icon-hover': ('cn-button[data-slot="collapsible-trigger"]:hover svg', ('color:var(--foreground)!important', 'stroke:currentColor')),
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
    """Infer only paint/type rules that cannot change a hook's layout.

    Hook names describe source structure, not element semantics. In particular,
    `*-input`, `*-item`, `*-icon`, `*-caret`, and `*-separator` may be wrappers.
    Geometry, cursors, and backgrounds therefore belong in explicit component
    rules below.
    """
    props=[]
    words=set(hook.removeprefix('cn-').split('-'))
    if words & {'title','label','legend'}: props.append('font-weight:var(--label-weight)')
    if words & {'description','shortcut','caption'}: props.append('color:var(--muted-foreground)')
    if hook.endswith('-variant-outline'): props.append('border-color:var(--border)')
    if hook.endswith('-variant-border'): props.append('border-color:var(--border)')
    if hook.endswith('-variant-default'): props.extend(['background-color:var(--card)','color:var(--card-foreground)'])
    if hook.endswith('-variant-destructive'): props.append('color:var(--destructive)')
    if hook.endswith(('-variant-muted','-variant-secondary','-variant-tinted')): props.append('background-color:var(--muted)')
    if hook.endswith('-variant-ghost'): props.append('background-color:transparent')
    if hook.endswith('-avatar'): props.extend(['border-radius:9999px','background-color:var(--muted)'])
    return list(dict.fromkeys(props))

def classify_hooks(hooks, explicit_css):
    explicit=set(re.findall(r'\.([a-z][a-z0-9-]*)',explicit_css))
    inferred=[]; structural=[]; unclassified=[]
    structural_terms={'root','group','list','wrapper','viewport','portal','positioner','header','footer','actions','content','set','gap',
                      'input','item','icon','caret','indicator','arrow','ellipsis','separator','track','rail','progress','trigger',
                      'button','action','link','choice','chip','close','cancel','previous','next','skip','submit','clear','media',
                      'popup','logical','empty','skeleton','value','text','range','thumb','overlay','scroll','sub','option',
                      'size','orientation','variant','align','side','count','reactions','body','cell','head','caption','page',
                      'badge','tooltip','chips','subcontent'}
    structural_names={'cn-accordion','cn-breadcrumb','cn-chart','cn-message','cn-message-scroller',
                      'cn-navigation-menu','cn-pagination','cn-scroll-area','cn-slider','cn-table',
                      'cn-table-body','cn-tabs','cn-menu-target','cn-menu-translucent','cn-rtl-flip'}
    for hook in hooks:
        if hook in explicit: continue
        if semantic_hook_properties(hook): inferred.append(hook)
        elif set(hook.removeprefix('cn-').split('-')) & structural_terms or hook in structural_names:
            structural.append(hook)
        else: unclassified.append(hook)
    return {'explicitHooks':sorted(set(hooks)&explicit),'inferredHooks':sorted(inferred),
            'structuralHooks':sorted(structural),'unclassifiedHooks':sorted(unclassified)}

def state_css(required_states=None):
    names=required_states or STATE_RULES.keys()
    rules=[]
    for name in names:
        selectors,declarations=STATE_RULES[name]
        scopes=STATE_SCOPES.get(name,('[class*="cn-"]',))
        scoped=','.join(scope+selector for scope in scopes for selector in selectors.split(','))
        rules.append(scoped+'{'+declarations+';}')
    return '\n'.join(rules)+'\n'

def state_selectors(name):
    selectors=STATE_RULES[name][0].split(',')
    scopes=STATE_SCOPES.get(name,('[class*="cn-"]',))
    return [scope+selector for scope in scopes for selector in selectors]

def audit_visual_css(contract, stylesheet, explicit_css):
    defined=set(re.findall(r'\.([a-z][a-z0-9-]*)',stylesheet))
    classes=classify_hooks(contract['hooks'],explicit_css)
    visual_hooks=set(classes['explicitHooks'])|set(classes['inferredHooks'])
    missing_hooks=sorted(visual_hooks-defined)
    missing_states=[]; stateProperties={}
    for name,(_,declarations) in contract['requiredStates'].items():
        properties=sorted(set(re.findall(r'([a-z-]+)\s*:',declarations)))
        stateProperties[name]=properties
        if not properties or not any(selector in stylesheet for selector in state_selectors(name)):
            missing_states.append(name)
    compact=re.sub(r'\s+','',stylesheet)
    contract_hooks=set(contract['hooks'])
    applicable={name:(selector,declarations) for name,(selector,declarations) in STRUCTURAL_REQUIREMENTS.items()
                if set(re.findall(r'cn-[a-z0-9-]+',selector)) <= contract_hooks}
    missing_structures=[]
    for name,(selector,declarations) in applicable.items():
        compact_selector=re.sub(r'\s+','',selector)
        blocks=re.findall(r'\.'+re.escape(compact_selector)+r'\{([^}]*)\}',compact)
        if not blocks or not any(all(re.sub(r'\s+','',declaration) in block for declaration in declarations)
                                 for block in blocks):
            missing_structures.append(name)
    return {'coveredHooks':sorted(visual_hooks&defined),**classes,'missingHooks':missing_hooks,
            'stateProperties':stateProperties,'missingStates':missing_states,
            'structuralRequirements':sorted(applicable),'missingStructures':sorted(missing_structures)}

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
/* Structural contracts for components whose upstream classes are behavior-only. */
.cn-command-item{display:flex;align-items:center;gap:var(--icon-gap);min-height:2.25rem;padding:.375rem .5rem;border-radius:calc(var(--control-radius)*.75);font-size:.875rem;line-height:1.25rem;cursor:default}
.cn-command-item[data-selected="true"]{background-color:var(--accent);color:var(--accent-foreground)}
.cn-input-otp-slot{position:relative;display:flex;align-items:center;justify-content:center;width:var(--control-height);height:var(--control-height);border:1px solid var(--input);border-radius:0;background:var(--background)}
.cn-input-otp-slot:first-child{border-start-start-radius:var(--control-radius);border-end-start-radius:var(--control-radius)}
.cn-input-otp-slot:last-child{border-start-end-radius:var(--control-radius);border-end-end-radius:var(--control-radius)}
.cn-input-otp-slot+.cn-input-otp-slot{margin-inline-start:-1px}
.cn-input-otp-slot[data-active="true"]{z-index:1;border-color:var(--ring);box-shadow:0 0 0 3px color-mix(in srgb,var(--ring) 35%,transparent)}
.cn-input-otp[aria-invalid="true"] .cn-input-otp-slot{border-color:var(--destructive)}
.cn-input-otp:has(.cn-input-otp-input[aria-invalid="true"]) .cn-input-otp-slot{border-color:var(--destructive)}
.cn-input-otp[aria-invalid="true"] .cn-input-otp-slot[data-active="true"]{box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}
.cn-input-otp:has(.cn-input-otp-input[aria-invalid="true"]) .cn-input-otp-slot[data-active="true"]{box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}
.cn-input-otp-caret-line{width:1px;height:1.25rem;background-color:var(--foreground);animation:caret-blink 1s steps(2,start) infinite}
@keyframes caret-blink{50%{opacity:0}}
.cn-native-select-wrapper{position:relative;display:inline-flex;width:fit-content}
.cn-native-select{width:100%;height:var(--control-height);appearance:none;padding-inline-start:var(--control-padding);padding-inline-end:calc(var(--control-padding) + var(--icon-size));cursor:pointer}
.cn-native-select[data-size="sm"]{height:2rem;padding-inline-start:.75rem;padding-inline-end:calc(.75rem + var(--icon-size));font-size:.875rem}
.cn-native-select-icon{position:absolute;right:var(--control-padding);top:50%;width:var(--icon-size);height:var(--icon-size);transform:translateY(-50%);color:var(--muted-foreground)}
.cn-native-select-wrapper[data-size="sm"] .cn-native-select-icon{right:.75rem}
.cn-native-select:disabled{cursor:not-allowed}
.cn-sheet-overlay{position:fixed;inset:0;z-index:80}
.cn-sheet-content{position:fixed;z-index:81;display:flex;max-width:100%;flex-direction:column}
.cn-sheet-content[data-side="right"]{inset-block:0;right:0;width:min(24rem,calc(100vw - 2rem))}
.cn-sheet-content[data-side="left"]{inset-block:0;left:0;width:min(24rem,calc(100vw - 2rem))}
.cn-sheet-content[data-side="top"]{inset-inline:0;top:0;max-height:calc(100vh - 2rem)}
.cn-sheet-content[data-side="bottom"]{inset-inline:0;bottom:0;max-height:calc(100vh - 2rem)}
.cn-switch[data-checked]:not([data-checked="false"]){background-color:var(--primary)}
.cn-switch[data-unchecked]:not([data-unchecked="false"]){background-color:var(--input)}
.cn-switch[data-checked]:not([data-checked="false"]) .cn-switch-thumb{transform:translateX(calc(var(--switch-width) - var(--switch-thumb-size) - var(--switch-inset) - var(--switch-inset)));background-color:var(--primary-foreground)}
.cn-switch[data-unchecked]:not([data-unchecked="false"]) .cn-switch-thumb{transform:translateX(0);background-color:var(--background)}
.cn-input-group > .cn-input-group-input{min-width:0;border:0;box-shadow:none;background:transparent;outline:none}
.cn-input-group > .cn-input-group-textarea{min-width:0;border:0;box-shadow:none;background:transparent;outline:none}
.cn-input-group > .cn-input-group-addon{min-width:0;border:0;box-shadow:none;background:transparent}
.cn-input-group > .cn-input-group-input:focus-visible,.cn-input-group > .cn-input-group-textarea:focus-visible{border:0;box-shadow:none;outline:none}
.cn-checkbox{display:inline-grid;place-items:center;width:1rem;height:1rem;min-width:1rem;min-height:1rem;padding:0;line-height:0}
.cn-checkbox-indicator{position:absolute;inset:0;display:grid;place-items:center;width:100%;height:100%;line-height:0;pointer-events:none}
.cn-checkbox-indicator>svg{display:block;width:.75rem;height:.75rem;margin:auto;flex:none}
.cn-command-input-wrapper{border-bottom:1px solid var(--border);padding:0}
.cn-command-input-group{display:flex;align-items:center;width:100%;border:0;box-shadow:none;background:transparent}
.cn-command-input-group:focus-within{border:0;box-shadow:none}
.cn-command-input{min-width:0;height:var(--control-height);flex:1;border:0;background:transparent;padding-inline:0;box-shadow:none}
.cn-command-input-icon{width:var(--icon-size);height:var(--icon-size);flex:none;color:var(--muted-foreground)}
.cn-navigation-menu-trigger[data-popup-open]:not([data-popup-open="false"]){background-color:var(--accent);color:var(--accent-foreground)}
.cn-navigation-menu-trigger[data-popup-open]:not([data-popup-open="false"]) .cn-navigation-menu-trigger-icon{transform:rotate(180deg)}
.cn-navigation-menu-trigger-icon{transition:transform var(--motion-duration) var(--motion-easing)}
.cn-navigation-menu-trigger:hover:not([data-popup-open]),.cn-navigation-menu-trigger:hover[data-popup-open="false"]{background-color:var(--muted);color:var(--foreground)}
.cn-navigation-menu-content .cn-navigation-menu-link{display:block;width:100%}
[data-slot="navigation-menu-content"] [data-slot="navigation-menu-link"]{display:block;width:100%}
.cn-navigation-menu-link:hover .text-muted-foreground{color:var(--accent-foreground)!important}
[data-slot="navigation-menu-link"]:hover .text-muted-foreground{color:var(--accent-foreground)!important}
.cn-navigation-menu-link:focus-visible .text-muted-foreground{color:var(--accent-foreground)!important}
[data-slot="navigation-menu-link"]:focus-visible .text-muted-foreground{color:var(--accent-foreground)!important}
.cn-navigation-menu-link[data-active]:not([data-active="false"]) .text-muted-foreground{color:var(--accent-foreground)!important}
[data-slot="navigation-menu-link"][data-active]:not([data-active="false"]) .text-muted-foreground{color:var(--accent-foreground)!important}
.cn-sidebar-inner .cn-sidebar-menu-button[data-popup-open]:not([data-popup-open="false"]){background-color:var(--sidebar-accent)!important;color:var(--sidebar-accent-foreground)!important}
[data-slot="sidebar-inner"] [data-slot="sidebar-menu-button"][data-popup-open]:not([data-popup-open="false"]){background-color:var(--sidebar-accent)!important;color:var(--sidebar-accent-foreground)!important}
.cn-sidebar-inner .cn-sidebar-menu-button>.cn-item{border:0!important;background:transparent!important;box-shadow:none!important}
[data-slot="sidebar-inner"] [data-slot="sidebar-menu-button"]>[data-slot="item"]{border:0!important;background:transparent!important;box-shadow:none!important}
.cn-sidebar-inner .cn-sidebar-menu-button .cn-item,[data-slot="sidebar-inner"] [data-slot="sidebar-menu-button"] [data-slot="item"]{border:0!important;background:transparent!important;box-shadow:none!important}
.cn-sidebar-inner .cn-sidebar-menu-button>.cn-item:hover,.cn-sidebar-inner .cn-sidebar-menu-button .cn-item:hover,[data-slot="sidebar-inner"] [data-slot="sidebar-menu-button"] [data-slot="item"]:hover{background:transparent!important}
.cn-sidebar-dropdown-content{z-index:75!important;width:var(--anchor-width);min-width:min(var(--anchor-width),calc(100vw - 2rem));max-width:calc(100vw - 2rem)}
[data-slot="dropdown-menu-content"].cn-sidebar-dropdown-content{z-index:75!important;width:var(--anchor-width);min-width:min(var(--anchor-width),calc(100vw - 2rem));max-width:calc(100vw - 2rem)}
.cn-dropdown-menu-positioner:has(>.cn-sidebar-dropdown-content){z-index:75!important}
[data-slot="dropdown-menu-positioner"]:has(>[data-slot="dropdown-menu-content"].cn-sidebar-dropdown-content){z-index:75!important}
.cn-tabs-trigger:not([data-active]),.cn-tabs-trigger[data-active="false"]{background-color:transparent;border-color:transparent;color:var(--muted-foreground);box-shadow:none}
.cn-tabs-trigger[data-active]:not([data-active="false"]){background-color:var(--accent);border-color:var(--border);color:var(--accent-foreground);box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 18%,transparent)}
.cn-tabs-list[data-variant="line"] .cn-tabs-trigger[data-active]:not([data-active="false"]){background-color:transparent;border-color:transparent;color:var(--foreground);box-shadow:none}
.cn-dialog-close{position:absolute;top:1rem;right:1rem;z-index:1;display:inline-grid;place-items:center;border:1px solid transparent;background:transparent;color:var(--muted-foreground)}
.cn-dialog-close:hover{border-color:var(--border);background-color:var(--accent);color:var(--accent-foreground)}
.cn-dialog-close>svg{display:block;width:1rem;height:1rem}
.cn-dialog-content:has(>.cn-dialog-close){padding-inline-end:3.5rem}
.cn-alert{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;column-gap:.75rem;row-gap:.25rem}
.cn-alert:has(> svg){grid-template-columns:auto minmax(0,1fr) auto}
.cn-alert:has(> [data-slot="alert-leading"]){grid-template-columns:auto minmax(0,1fr) auto}
.cn-alert>svg{grid-column:1;grid-row:1 / span 2;align-self:start;width:1.125rem;height:1.125rem;margin-top:.125rem;color:currentColor}
.cn-alert>[data-slot="alert-leading"]{grid-column:1;grid-row:1 / span 2;align-self:start;display:grid;place-items:center;min-width:1.125rem}
.cn-alert:has(> svg)>.cn-alert-title,.cn-alert:has(> svg)>.cn-alert-description,.cn-alert:has(> [data-slot="alert-leading"])>.cn-alert-title,.cn-alert:has(> [data-slot="alert-leading"])>.cn-alert-description{grid-column:2}
.cn-alert-action{grid-column:-2;grid-row:1 / span 2;align-self:start;justify-self:end}
.cn-avatar{width:2.5rem;height:2.5rem;aspect-ratio:1;overflow:hidden}
.cn-avatar[data-size="default"]{width:2.5rem;height:2.5rem;aspect-ratio:1}
.cn-avatar[data-size="sm"]{width:2rem;height:2rem}
.cn-avatar[data-size="lg"]{width:3rem;height:3rem}
.cn-avatar-image,.cn-avatar-fallback{width:100%;height:100%}
.cn-avatar-group-count{width:2.5rem;height:2.5rem;aspect-ratio:1}
.cn-message-scroller-content{gap:.75rem;padding-block:.5rem}
.cn-message-scroller-item{min-width:0}
.cn-button[data-slot="collapsible-trigger"]{color:var(--foreground)}
.cn-button[data-slot="collapsible-trigger"]:hover{background-color:var(--muted)!important;color:var(--foreground)!important}
.cn-button[data-slot="collapsible-trigger"]:focus-visible{background-color:var(--muted)!important;color:var(--foreground)!important}
.cn-button[data-slot="collapsible-trigger"][data-panel-open]:not([data-panel-open="false"]){background-color:var(--muted)!important;color:var(--foreground)!important}
.cn-button[data-slot="collapsible-trigger"]:hover .text-muted-foreground{color:var(--foreground)!important}
.cn-button[data-slot="collapsible-trigger"]:focus-visible .text-muted-foreground{color:var(--foreground)!important}
.cn-button[data-slot="collapsible-trigger"][data-panel-open]:not([data-panel-open="false"]) .text-muted-foreground{color:var(--foreground)!important}
.cn-button[data-slot="collapsible-trigger"]:hover svg{color:var(--foreground)!important;stroke:currentColor}
.cn-button[data-slot="collapsible-trigger"]:focus-visible svg{color:var(--foreground)!important;stroke:currentColor}
.cn-button[data-slot="collapsible-trigger"][data-panel-open]:not([data-panel-open="false"]) svg{color:var(--foreground)!important;stroke:currentColor}
.cn-button[data-slot="collapsible-trigger"][data-panel-open]:not([data-panel-open="false"])>svg:first-of-type{transform:rotate(90deg)}
@layer components {
  .cn-font-heading{@apply font-medium;}
  .cn-button{@apply rounded-[var(--control-radius)] border border-transparent bg-clip-padding text-sm font-medium focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:pointer-events-none disabled:opacity-50;}
  .cn-button-variant-default{@apply bg-primary text-primary-foreground hover:opacity-85;} .cn-button-variant-secondary{@apply bg-secondary text-secondary-foreground hover:opacity-85;}
  .cn-button-variant-outline{@apply border-border bg-background hover:bg-muted;} .cn-button-variant-ghost{@apply hover:bg-muted;} .cn-button-variant-destructive{@apply bg-destructive/12 text-destructive hover:bg-destructive/20;} .cn-button-variant-link{@apply text-primary underline-offset-4 hover:underline;}
  .cn-button-size-xs{@apply h-7 gap-1 px-2 text-xs;} .cn-button-size-sm{@apply h-8 gap-1.5 px-3;} .cn-button-size-default{@apply h-[var(--control-height)] gap-[var(--icon-gap)] px-[var(--control-padding)];} .cn-button-size-lg{@apply h-[calc(var(--control-height)+4px)] gap-[var(--icon-gap)] px-[calc(var(--control-padding)+4px)];}
  .cn-button-size-icon-xs{@apply size-7;} .cn-button-size-icon-sm{@apply size-8;} .cn-button-size-icon{@apply size-[var(--control-height)];} .cn-button-size-icon-lg{@apply size-[calc(var(--control-height)+4px)];}
  .cn-input,.cn-textarea,.cn-select-trigger,.cn-native-select{@apply rounded-[var(--control-radius)] border border-input bg-transparent text-sm shadow-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50;}
  .cn-input,.cn-select-trigger{@apply h-[var(--control-height)] px-[var(--control-padding)];} .cn-textarea{@apply min-h-20 px-[var(--control-padding)] py-3;}
  .cn-label,.cn-field-label{@apply text-sm font-medium;} .cn-field-description,.cn-card-description,.cn-dialog-description,.cn-alert-dialog-description,.cn-popover-description,.cn-empty-description,.cn-item-description{@apply text-sm text-muted-foreground;} .cn-field-error{@apply text-sm text-destructive;} .cn-field-group{@apply gap-5;} .cn-field{@apply gap-2;}
  .cn-card,.cn-attachment,.cn-alert{@apply rounded-[var(--surface-radius)] border border-border bg-card text-card-foreground shadow-[var(--design-shadow)];} .cn-item{@apply rounded-[var(--surface-radius)] border border-border bg-card text-card-foreground shadow-none;}
  .cn-card{@apply gap-4 overflow-hidden py-5;} .cn-card-header,.cn-card-content{@apply px-5;} .cn-card-footer{@apply flex min-h-[calc(var(--control-height)+2rem)] items-center border-t bg-muted/45 px-5 py-4;} .cn-card-title,.cn-dialog-title,.cn-alert-dialog-title,.cn-popover-title,.cn-empty-title,.cn-item-title{@apply font-medium;} .cn-item,.cn-attachment{@apply gap-3 p-3;} .cn-alert{@apply gap-1 px-4 py-3;}
  .cn-badge{@apply h-6 gap-1 rounded-full border border-transparent px-2.5 text-xs font-medium;} .cn-badge-variant-default{@apply bg-primary text-primary-foreground;} .cn-badge-variant-secondary{@apply bg-secondary text-secondary-foreground;} .cn-badge-variant-outline{@apply border-border;} .cn-badge-variant-destructive{@apply bg-destructive/12 text-destructive;} .cn-badge-variant-ghost{@apply hover:bg-muted;} .cn-badge-variant-link{@apply text-primary hover:underline;}
  .cn-checkbox,.cn-radio-group-item{@apply size-4 border border-input bg-background text-primary focus-visible:ring-3 focus-visible:ring-ring/50;} .cn-checkbox{@apply rounded-[calc(var(--control-radius)/3)];} .cn-radio-group-item{@apply rounded-full;}
  .cn-switch{@apply h-6 w-11 rounded-full bg-input p-[3px];} .cn-switch-thumb{@apply size-[18px] rounded-full bg-background shadow-sm;}
  .cn-tabs-list{@apply h-[var(--control-height)] gap-1 rounded-[var(--control-radius)] bg-muted p-1;} .cn-tabs-trigger{@apply rounded-[calc(var(--control-radius)*.75)] px-3 text-sm text-muted-foreground data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm;}
  .cn-dialog-overlay,.cn-alert-dialog-overlay,.cn-sheet-overlay,.cn-drawer-overlay{@apply bg-black/35 backdrop-blur-xs data-open:animate-in data-closed:animate-out data-open:fade-in-0 data-closed:fade-out-0;}
  .cn-dialog-content,.cn-alert-dialog-content,.cn-sheet-content,.cn-popover-content,.cn-hover-card-content,.cn-select-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content,.cn-combobox-content{@apply rounded-[var(--overlay-radius)] border border-border bg-popover text-popover-foreground shadow-[var(--design-shadow)];}
  .cn-dialog-content,.cn-alert-dialog-content{@apply max-w-[calc(100%-2rem)] gap-4 p-5 sm:max-w-md;} .cn-dialog-header,.cn-alert-dialog-header{@apply gap-2;} .cn-dialog-footer,.cn-alert-dialog-footer{@apply mt-1;} .cn-popover-content,.cn-hover-card-content{@apply w-72 p-4;}
  .cn-select-content,.cn-dropdown-menu-content,.cn-context-menu-content,.cn-menubar-content,.cn-combobox-content{@apply min-w-40 p-1;} .cn-select-item,.cn-dropdown-menu-item,.cn-context-menu-item,.cn-menubar-item,.cn-combobox-item{@apply gap-2 rounded-[calc(var(--control-radius)*.75)] px-2 py-1.5 text-sm focus:bg-accent focus:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground;}
  .cn-select-label,.cn-dropdown-menu-label,.cn-context-menu-label,.cn-menubar-label,.cn-combobox-label{@apply px-2 py-1.5 text-xs font-medium text-muted-foreground;} .cn-select-separator,.cn-dropdown-menu-separator,.cn-context-menu-separator,.cn-menubar-separator,.cn-command-separator{@apply my-1 h-px bg-border;}
  .cn-tooltip-content{@apply rounded-[calc(var(--control-radius)*.65)] bg-foreground px-3 py-1.5 text-xs text-background shadow-sm;} .cn-accordion-item{@apply border-b;} .cn-accordion-trigger{@apply py-4 text-left text-sm font-medium hover:underline;} .cn-accordion-content-inner{@apply pb-4 text-sm;}
  .cn-progress-root{@apply flex flex-wrap gap-3;} .cn-progress-track{@apply h-2 overflow-hidden rounded-full bg-muted;} .cn-progress-indicator{@apply h-full bg-primary transition-transform;} .cn-slider-track{@apply h-1.5 rounded-full bg-muted;} .cn-slider-range{@apply bg-primary;} .cn-slider-thumb{@apply size-4 rounded-full border-2 border-primary bg-background shadow-sm;}
  .cn-toggle{@apply rounded-[var(--control-radius)] px-3 text-sm hover:bg-muted data-pressed:bg-accent;} .cn-toggle-variant-outline{@apply border border-input;} .cn-table-container{@apply w-full max-w-full overflow-x-auto rounded-[var(--surface-radius)] border;} .cn-table-header{@apply bg-muted/50;} .cn-table-row{@apply border-b hover:bg-muted/40;} .cn-table-head,.cn-table-cell{@apply h-10 px-3 text-left text-sm;}
  .cn-skeleton{@apply animate-pulse rounded-[var(--control-radius)] bg-muted;} .cn-separator{@apply shrink-0 bg-border;} .cn-scroll-area-scrollbar{@apply p-0.5;} .cn-scroll-area-thumb{@apply rounded-full bg-border;} .cn-avatar,.cn-avatar-image,.cn-avatar-fallback{@apply rounded-full;} .cn-avatar-fallback{@apply bg-muted text-muted-foreground;}
  .cn-empty{@apply rounded-[var(--surface-radius)] border border-dashed p-8 text-center;} .cn-empty-header{@apply gap-2;} .cn-kbd{@apply rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs;} .cn-sidebar-inner{@apply bg-sidebar text-sidebar-foreground;} .cn-sidebar-menu-button{@apply rounded-[var(--control-radius)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent;} .cn-toast{@apply rounded-[var(--overlay-radius)] border border-border bg-popover text-popover-foreground shadow-[var(--design-shadow)];}
  .cn-calendar{--cell-size:max(2.5rem,var(--control-height));@apply rounded-[var(--surface-radius)] bg-card p-3 text-card-foreground;} .cn-calendar-caption{@apply text-sm font-medium;} .cn-calendar-day-button{@apply min-h-[var(--cell-size)] min-w-[var(--cell-size)] rounded-[var(--control-radius)] text-sm hover:bg-accent data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground;} .cn-calendar-dropdown-root{@apply rounded-[var(--control-radius)] border border-input;}
  .cn-command,.cn-command-dialog{@apply overflow-hidden rounded-[var(--overlay-radius)] bg-popover text-popover-foreground;} .cn-command-input-wrapper{@apply border-b;} .cn-command-input-group{@apply px-3;} .cn-command-input{@apply h-[var(--control-height)] w-full bg-transparent text-sm outline-none;} .cn-command-list{@apply max-h-72 overflow-y-auto p-1;} .cn-command-group{@apply p-1 text-foreground;} .cn-command-empty{@apply py-8 text-center text-sm text-muted-foreground;} .cn-command-shortcut{@apply ml-auto text-xs text-muted-foreground;}
  .cn-input-group{@apply rounded-[var(--control-radius)] border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50;} .cn-input-group-addon{@apply gap-2 px-3 text-sm text-muted-foreground;} .cn-input-group-input,.cn-input-group-textarea{@apply border-0 bg-transparent shadow-none outline-none;}
  .cn-navigation-menu-list,.cn-menubar,.cn-pagination-content,.cn-breadcrumb-list{@apply items-center gap-1;} .cn-navigation-menu-trigger,.cn-navigation-menu-link,.cn-menubar-trigger,.cn-pagination-link{@apply rounded-[var(--control-radius)] px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground;} .cn-navigation-menu-content,.cn-navigation-menu-popup{@apply rounded-[var(--overlay-radius)] border border-border bg-popover p-2 text-popover-foreground shadow-[var(--design-shadow)];} .cn-breadcrumb-list{@apply text-sm text-muted-foreground;} .cn-breadcrumb-link{@apply hover:text-foreground;} .cn-breadcrumb-page{@apply text-foreground;}
  .cn-sidebar-header,.cn-sidebar-content,.cn-sidebar-footer{@apply p-2;} .cn-sidebar-group{@apply p-2;} .cn-sidebar-group-label{@apply px-2 text-xs font-medium text-sidebar-foreground/65;} .cn-sidebar-menu{@apply gap-1;} .cn-sidebar-menu-button{@apply min-h-9 gap-2 px-2 text-sm;} .cn-sidebar-menu-sub{@apply ml-4 border-l border-sidebar-border pl-2;} .cn-sidebar-separator{@apply bg-sidebar-border;} .cn-sidebar-inset{@apply bg-background;}
  .cn-questionnaire{@apply gap-5;} .cn-questionnaire-item{@apply gap-3;} .cn-questionnaire-title{@apply text-base font-medium;} .cn-questionnaire-description{@apply text-sm text-muted-foreground;} .cn-questionnaire-choices{@apply gap-2;} .cn-questionnaire-choice{@apply rounded-[var(--surface-radius)] border border-border bg-card p-3 hover:border-primary/60 data-[selected=true]:border-primary data-[selected=true]:bg-accent;} .cn-questionnaire-choice-title,.cn-questionnaire-choice-label{@apply font-medium;} .cn-questionnaire-actions{@apply gap-2;} .cn-questionnaire-error{@apply text-sm text-destructive;}
  .cn-message,.cn-bubble,.cn-attachment{@apply text-sm;} .cn-message{@apply gap-2;} .cn-message-header,.cn-message-footer{@apply text-xs text-muted-foreground;} .cn-bubble-content{@apply rounded-[var(--surface-radius)] bg-muted px-4 py-2.5;} .cn-bubble-variant-default .cn-bubble-content{@apply bg-primary text-primary-foreground;} .cn-bubble-variant-outline .cn-bubble-content{@apply border border-border bg-background;} .cn-marker{@apply gap-2 text-sm;} .cn-marker-icon{@apply text-primary;} .cn-message-scroller-viewport{@apply overflow-y-auto;} .cn-message-scroller-button{@apply rounded-full bg-primary text-primary-foreground shadow-[var(--design-shadow)];}
  .cn-carousel-previous,.cn-carousel-next{@apply rounded-full border border-border bg-background shadow-sm hover:bg-muted;} .cn-resizable-handle{@apply bg-border focus-visible:ring-2 focus-visible:ring-ring;} .cn-resizable-handle-icon{@apply rounded bg-muted;}
  .cn-drawer-popup,.cn-sheet-content{@apply bg-popover text-popover-foreground shadow-[var(--design-shadow)];} .cn-drawer-header-base,.cn-drawer-footer-base,.cn-sheet-header,.cn-sheet-footer{@apply gap-2 p-5;} .cn-drawer-swipe-handle{@apply mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted;}
}
'''+theme_signature_css()

def theme_signature_css():
    """Render the cross-family visual signature after baseline component rules."""
    rules=['/* Theme signature matrix: depth, semantic color and state by component family. */']
    for family,facets in THEME_SIGNATURE_MATRIX.items():
        rules.append('/* '+family+' */')
        rules.extend(facets[key] for key in ['depth','color','state'])
    return '\n'.join(rules)+'\n'+button_group_css()+input_group_composition_css()

def button_group_css():
    """Keep mixed and nested Button Groups visually fused after theme signatures."""
    return '''
.cn-button-group{display:flex;width:fit-content;max-width:100%;align-items:stretch;border:2px solid var(--border);border-radius:var(--control-radius);background:var(--background);box-shadow:0 3px 0 color-mix(in srgb,var(--foreground) 18%,transparent);overflow:hidden;isolation:isolate}
.cn-button-group[data-orientation="vertical"]{flex-direction:column}
.cn-button-group:not([data-orientation="vertical"]){flex-direction:row}
.cn-button-group>.cn-button-group{border:0;border-radius:0;background:transparent;box-shadow:none}
.cn-button-group>[data-slot]:not([data-slot="button-group-separator"]){margin:0;border:0;border-radius:0;box-shadow:none}
.cn-button-group:not([data-orientation="vertical"])>[data-slot]+[data-slot]{border-inline-start:1px solid var(--border)}
.cn-button-group[data-orientation="vertical"]>[data-slot]+[data-slot]{border-block-start:1px solid var(--border)}
.cn-button-group>[data-slot="button-group-separator"]{align-self:stretch;width:1px;height:auto;margin:0;border:0;background:var(--border)}
.cn-button-group[data-orientation="vertical"]>[data-slot="button-group-separator"]{width:auto;height:1px}
.cn-button-group:not([data-orientation="vertical"])>[data-slot]+[data-slot="button-group-separator"]{border-inline-start:0}
.cn-button-group:not([data-orientation="vertical"])>[data-slot="button-group-separator"]+[data-slot]{border-inline-start:0}
.cn-button-group[data-orientation="vertical"]>[data-slot]+[data-slot="button-group-separator"]{border-block-start:0}
.cn-button-group[data-orientation="vertical"]>[data-slot="button-group-separator"]+[data-slot]{border-block-start:0}
.cn-button-group>[data-slot="button-group-text"]{display:flex;min-height:var(--control-height);align-items:center;padding-inline:var(--control-padding);background:var(--muted);color:var(--muted-foreground)}
.cn-button-group>[data-slot]:focus-visible{position:relative;z-index:2;outline:2px solid var(--ring);outline-offset:-2px;box-shadow:none!important}
.cn-button-group .cn-button:active{transform:none;box-shadow:none!important}
'''

def input_group_composition_css():
    """Fuse addons with one frame and keep invalid feedback restrained."""
    return '''
.cn-input-group{overflow:hidden}
.cn-input-group>.cn-input-group-addon[data-align="inline-start"]{flex:none;min-height:var(--control-height);gap:.5rem;padding-inline:.75rem;border-inline-end:1px solid var(--border)}
.cn-input-group>.cn-input-group-addon[data-align="inline-end"]{flex:none;min-height:var(--control-height);gap:.5rem;padding-inline:.75rem;border-inline-start:1px solid var(--border)}
.cn-input-group-addon+.cn-input-group-addon[data-align="inline-start"]{margin-inline-start:-1px}
.cn-input-group-addon[data-align="inline-end"]+.cn-input-group-addon[data-align="inline-end"]{margin-inline-start:-1px}
.cn-input-group-addon .cn-input-group-button{min-height:2rem;margin:0;border:0;border-radius:calc(var(--control-radius)*.65);box-shadow:none!important;padding-inline:.625rem}
.cn-input-group-addon .cn-input-group-button:active{transform:none;box-shadow:none!important}
.cn-input-group>.cn-input-group-addon:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button))){align-self:stretch;padding:0}
.cn-input-group>.cn-input-group-addon[data-align="inline-start"]:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button))){border-inline-start:0;border-inline-end:1px solid var(--border)}
.cn-input-group>.cn-input-group-addon[data-align="inline-end"]:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button))){border-inline-start:1px solid var(--border);border-inline-end:0}
.cn-input-group>.cn-input-group-addon:has(>.cn-input-group-button):not(:has(>:not(.cn-input-group-button)))>.cn-input-group-button{height:100%;min-height:var(--control-height);border-radius:0;padding-inline:.875rem}
.cn-input-group:has(>.cn-input-group-textarea){flex-direction:column;flex-wrap:nowrap;align-items:stretch;height:auto;min-height:7rem}
.cn-input-group:has(>.cn-input-group-addon[data-align="block-start"]){flex-wrap:wrap;align-items:stretch;height:auto}
.cn-input-group:has(>.cn-input-group-addon[data-align="block-end"]){flex-wrap:wrap;align-items:stretch;height:auto}
.cn-input-group>.cn-input-group-addon[data-align="block-start"]{flex:0 0 100%;width:100%;min-height:2.5rem;justify-content:flex-start;gap:.5rem;padding:.75rem 1rem;border-bottom:1px solid var(--border)}
.cn-input-group>.cn-input-group-addon[data-align="block-end"]{flex:0 0 100%;width:100%;min-height:2.5rem;justify-content:flex-start;gap:.5rem;padding:.75rem 1rem;border-top:1px solid var(--border)}
.cn-input-group:has(>.cn-input-group-textarea):has(>.cn-input-group-addon[data-align^="block"]){flex-wrap:nowrap}
.cn-input-group:has(>.cn-input-group-textarea)>.cn-input-group-addon[data-align^="block"]{flex:0 0 auto}
.cn-input-group:has(>.cn-input-group-addon[data-align^="block"])>.cn-input-group-input{width:100%;flex:0 0 100%;padding:.875rem 1rem}
.cn-input-group>.cn-input-group-textarea[data-slot="input-group-control"]{width:100%;min-height:5.5rem;flex:1 1 auto;padding:1rem;line-height:1.5}
.cn-card-content>.cn-field-group{gap:1.25rem}
.cn-card-content>form>.cn-field-group{gap:1.25rem}
.cn-card-content .cn-field{gap:.5rem}
.cn-card>.cn-card-footer{gap:.5rem}
.cn-field-error,.cn-field[data-invalid]>.cn-field-description{margin:0;color:var(--destructive)}
.cn-field[data-invalid]>.cn-field-error,.cn-field[data-invalid]>.cn-field-description{margin-top:.25rem}
.cn-input[aria-invalid="true"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}
.cn-textarea[aria-invalid="true"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}
.cn-select-trigger[aria-invalid="true"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}
.cn-native-select[aria-invalid="true"]{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent);outline:none}
.cn-input-group:has(>[aria-invalid="true"]){border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}
.cn-input-group[data-invalid]:not([data-invalid="false"]){border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}
.cn-input-group:has(>[aria-invalid="true"]):focus-within,.cn-input-group[data-invalid]:not([data-invalid="false"]):focus-within{border-color:var(--destructive);box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)}
.cn-input-group>[aria-invalid="true"]{border:0;box-shadow:none!important;outline:none}
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
.lucide{stroke-width:var(--icon-stroke)}
:focus-visible{outline:3px solid var(--ring);outline-offset:3px}
@media(pointer:coarse){:is(button,[role="button"],[role="tab"]):not([role="switch"]):not([role="checkbox"]){min-height:44px;min-width:44px}}
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

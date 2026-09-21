import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import {
  COMPONENT_CATEGORIES,
  component_catalog_entries,
  component_title,
  examples_by_component,
  load_custom_components,
  prepare_integrated_preview,
  theme_example,
  transform,
} from '../skills/grilling-design-system/scripts/library.js'
import {
  STATE_RULES,
  STRUCTURAL_REQUIREMENTS,
  THEME_SIGNATURE_MATRIX,
  audit_visual_css,
  classify_hooks,
  component_css,
  semantic_hook_properties,
  state_css,
  state_selectors,
  tabs_line_css,
  theme_signature_css,
  truthy_data_selector,
  visual_contract,
} from '../skills/grilling-design-system/scripts/theme.js'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const skill = path.join(repositoryRoot, 'skills/grilling-design-system')
const compact = (value) => value.replace(/\s/g, '')
const declarations = (styles, pattern) => styles.match(pattern)?.[1]

async function withTempDirectory(callback) {
  const root = await mkdtemp(path.join(tmpdir(), 'library-b-'))
  try {
    return await callback(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('line tabs are borderless with safely inset indicator', () => {
  const styles = compact(tabs_line_css())
  const listRule = declarations(styles, /\.cn-tabs-list\[data-variant="line"\]\{([^}]*)\}/)
  const triggerRule = declarations(styles, /\.cn-tabs-list\[data-variant="line"\]\.cn-tabs-trigger\{([^}]*)\}/)
  const indicatorRule = declarations(styles, /\.cn-tabs-list\[data-variant="line"\]\.cn-tabs-trigger::after\{([^}]*)\}/)
  const activeRule = declarations(styles, /\.cn-tabs-list\[data-variant="line"\]\.cn-tabs-trigger\[data-active\]:not\(\[data-active="false"\]\)::after\{([^}]*)\}/)
  for (const rule of [listRule, triggerRule]) {
    assert.ok(rule.includes('border:0'))
    assert.ok(rule.includes('box-shadow:none'))
  }
  assert.ok(indicatorRule.includes('inset-inline:max(.5rem,calc(var(--control-radius)*.5))'))
  assert.ok(indicatorRule.includes('bottom:0'))
  assert.ok(indicatorRule.includes('height:2px'))
  assert.ok(indicatorRule.includes('opacity:0'))
  assert.ok(activeRule.includes('opacity:1'))
  const navigationDepth = THEME_SIGNATURE_MATRIX.navigation.depth
  assert.ok(navigationDepth.includes('.cn-tabs-list:not([data-variant="line"])'))
  assert.ok(!navigationDepth.includes('.cn-tabs-list{border:'))
})

test('button icons have optical caps and OTP resend is explicit', () => {
  const styles = compact(component_css())
  const buttonIcon = declarations(styles, /\.cn-button>:is\(svg,\[data-icon\]\)\{([^}]*)\}/)
  const xsIcon = declarations(styles, /\.cn-button-size-xs>:is\(svg,\[data-icon\]\)\{([^}]*)\}/)
  for (const value of ['width:min(var(--icon-size),1.125rem)', 'height:min(var(--icon-size),1.125rem)', 'flex:none']) {
    assert.ok(buttonIcon.includes(value))
  }
  assert.ok(xsIcon.includes('width:.875rem'))
  assert.equal(theme_example('input-otp-example', '<RefreshCwIcon data-icon="inline-start" />'), '<RefreshCwIcon data-icon="inline-start" className="size-3.5" />')
})

test('navigation link hover promotes muted descendants', () => {
  const styles = compact(component_css())
  const linkBox = declarations(styles, /\.cn-navigation-menu-content\.cn-navigation-menu-link\{([^}]*)\}/)
  assert.ok(linkBox.includes('display:block'))
  assert.ok(linkBox.includes('width:100%'))
  assert.ok(styles.includes('[data-slot="navigation-menu-content"][data-slot="navigation-menu-link"]{display:block;width:100%}'))
  for (const selector of [
    '.cn-navigation-menu-link:hover.text-muted-foreground',
    '.cn-navigation-menu-link:focus-visible.text-muted-foreground',
    '.cn-navigation-menu-link[data-active]:not([data-active="false"]).text-muted-foreground',
  ]) {
    assert.ok(styles.includes(`${selector}{color:var(--accent-foreground)!important}`))
  }
  assert.ok(styles.includes('[data-slot="navigation-menu-link"]:hover.text-muted-foreground{color:var(--accent-foreground)!important}'))
})

test('sidebar dropdown has open trigger flat item and portal geometry', async () => {
  const styles = compact(component_css())
  const trigger = declarations(styles, /\.cn-sidebar-inner\.cn-sidebar-menu-button\[data-popup-open\]:not\(\[data-popup-open="false"\]\)\{([^}]*)\}/)
  const item = declarations(styles, /\.cn-sidebar-inner\.cn-sidebar-menu-button>\.cn-item\{([^}]*)\}/)
  const popup = declarations(styles, /\.cn-sidebar-dropdown-content\{([^}]*)\}/)
  const positioner = declarations(styles, /\.cn-dropdown-menu-positioner:has\(>\.cn-sidebar-dropdown-content\)\{([^}]*)\}/)
  for (const value of ['background-color:var(--sidebar-accent)!important', 'color:var(--sidebar-accent-foreground)!important']) assert.ok(trigger.includes(value))
  for (const value of ['border:0!important', 'background:transparent!important', 'box-shadow:none!important']) assert.ok(item.includes(value))
  for (const value of ['z-index:75!important', 'width:var(--anchor-width)', 'min-width:min(var(--anchor-width),calc(100vw-2rem))', 'max-width:calc(100vw-2rem)']) assert.ok(popup.includes(value))
  assert.ok(positioner.includes('z-index:75!important'))
  assert.ok(styles.includes('[data-slot="sidebar-inner"][data-slot="sidebar-menu-button"][data-popup-open]:not([data-popup-open="false"])'))
  assert.ok(styles.includes('[data-slot="dropdown-menu-positioner"]:has(>[data-slot="dropdown-menu-content"].cn-sidebar-dropdown-content){z-index:75!important}'))
  const gallery = compact(await readFile(path.join(skill, 'assets/gallery.css'), 'utf8'))
  assert.ok(gallery.includes('.visual-example-canvas:has(.cn-navigation-menu),.visual-example-canvas:has(.cn-sidebar-menu-button){overflow:visible}'))
  assert.ok(gallery.includes('.visual-example-canvas:has(.cn-sidebar-inner)[data-slot=example-content]{overflow:visible}'))
})

test('sidebar example marks portaled dropdown and source has positioner hook', () => {
  const source = `function DropdownMenuContent(){return <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"><MenuPrimitive.Popup /></MenuPrimitive.Positioner>}`
  const transformed = transform(source)
  assert.ok(transformed.includes('data-slot="dropdown-menu-positioner"'))
  assert.ok(transformed.includes('className="cn-dropdown-menu-positioner isolate z-50 outline-none"'))
  const sidebar = '<Sidebar><DropdownMenuContent><span>One</span></DropdownMenuContent><DropdownMenuContent><span>Two</span></DropdownMenuContent></Sidebar>'
  const themed = theme_example('sidebar-example', sidebar)
  assert.equal(themed.split('cn-sidebar-dropdown-content').length - 1, 1)
  assert.ok(themed.includes('<DropdownMenuContent className="cn-sidebar-dropdown-content">'))
})

test('dialog close is positioned and visibly interactive', () => {
  const styles = compact(component_css())
  const close = declarations(styles, /\.cn-dialog-close\{([^}]*)\}/)
  const icon = declarations(styles, /\.cn-dialog-close>svg\{([^}]*)\}/)
  for (const value of ['position:absolute', 'top:1rem', 'right:1rem', 'z-index:1', 'display:inline-grid', 'place-items:center']) assert.ok(close.includes(value))
  assert.ok(icon.includes('width:1rem'))
  assert.ok(icon.includes('height:1rem'))
  assert.ok(styles.includes('.cn-dialog-close:hover{border-color:var(--border);background-color:var(--accent);color:var(--accent-foreground)}'))
  assert.ok(styles.includes('.cn-dialog-content:has(>.cn-dialog-close){padding-inline-end:3.5rem}'))
})

test('alert leading area avatar scale and message spacing', async () => {
  const styles = compact(component_css())
  const alert = declarations(styles, /\.cn-alert\{([^}]*)\}/)
  const leading = declarations(styles, /\.cn-alert:has\(>svg\)\{([^}]*)\}/)
  const icon = declarations(styles, /\.cn-alert>svg\{([^}]*)\}/)
  const avatar = declarations(styles, /\.cn-avatar\{([^}]*)\}/)
  const messages = declarations(styles, /\.cn-message-scroller-content\{([^}]*)\}/)
  assert.ok(alert.includes('grid-template-columns:minmax(0,1fr)auto'))
  assert.ok(leading.includes('grid-template-columns:autominmax(0,1fr)auto'))
  for (const value of ['grid-column:1', 'grid-row:1/span2', 'align-self:start', 'width:1.125rem']) assert.ok(icon.includes(value))
  assert.ok(styles.includes('.cn-alert:has(>[data-slot="alert-leading"])'))
  const leadingSlot = declarations(styles, /\.cn-alert>\[data-slot="alert-leading"\]\{([^}]*)\}/)
  for (const value of ['grid-column:1', 'grid-row:1/span2', 'align-self:start', 'display:grid', 'place-items:center', 'min-width:1.125rem']) assert.ok(leadingSlot.includes(value))
  for (const value of ['width:2.5rem', 'height:2.5rem', 'aspect-ratio:1', 'overflow:hidden']) assert.ok(avatar.includes(value))
  assert.ok(styles.includes('.cn-avatar[data-size="sm"]{width:2rem;height:2rem}'))
  assert.ok(styles.includes('.cn-avatar[data-size="lg"]{width:3rem;height:3rem}'))
  assert.ok(messages.includes('gap:.75rem'))
  assert.ok(messages.includes('padding-block:.5rem'))
  const gallery = compact(await readFile(path.join(skill, 'assets/gallery.css'), 'utf8'))
  assert.ok(gallery.includes('.visual-example-canvas:has(.cn-avatar)[data-slot=example-content]{min-height:180px}'))
})

test('collapsible trigger pairs background and foreground for all states', () => {
  const styles = compact(component_css())
  const states = [
    '.cn-button[data-slot="collapsible-trigger"]:hover',
    '.cn-button[data-slot="collapsible-trigger"]:focus-visible',
    '.cn-button[data-slot="collapsible-trigger"][data-panel-open]:not([data-panel-open="false"])',
  ]
  for (const selector of states) {
    const rule = declarations(styles, new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{([^}]*)\\}`))
    assert.ok(rule.includes('background-color:var(--muted)!important'))
    assert.ok(rule.includes('color:var(--foreground)!important'))
  }
  for (const suffix of [':hover', ':focus-visible', '[data-panel-open]:not([data-panel-open="false"])']) {
    assert.ok(styles.includes(`.cn-button[data-slot="collapsible-trigger"]${suffix}.text-muted-foreground{color:var(--foreground)!important}`))
    assert.ok(styles.includes(`.cn-button[data-slot="collapsible-trigger"]${suffix}svg{color:var(--foreground)!important;stroke:currentColor}`))
  }
  assert.ok(styles.includes('[data-panel-open]:not([data-panel-open="false"])>svg:first-of-type{transform:rotate(90deg)}'))
})

test('collapsible example uses Base UI open state and no fixed accent hover', () => {
  const source = `<Button className="group w-full hover:bg-accent hover:text-accent-foreground" />
<Chevron className="transition-transform group-data-[state=open]:rotate-90" />`
  const result = theme_example('collapsible-example', source)
  assert.ok(!result.includes('hover:bg-accent'))
  assert.ok(!result.includes('hover:text-accent-foreground'))
  assert.ok(result.includes('group-data-[panel-open]:rotate-90'))
  assert.ok(!result.includes('group-data-[state=open]'))
})

test('overview places integrated preview before component directory', async () => {
  const app = await readFile(path.join(skill, 'assets/App.tsx'), 'utf8')
  const preview = app.indexOf('data-slot="integrated-preview"')
  const directory = app.indexOf('className="component-directory"')
  assert.notEqual(preview, -1)
  assert.notEqual(directory, -1)
  assert.ok(preview < directory)
  assert.ok(app.includes("import IntegratedPreview from './IntegratedPreview'"))
})

test('delivery rejects unfinished or hidden integrated preview', async () => {
  await withTempDirectory(async (root) => {
    prepare_integrated_preview(root)
    assert.ok((await stat(path.join(root, 'src/IntegratedPreview.tsx'))).isFile())
    assert.throws(() => prepare_integrated_preview(root, true), /confirmed Key Visual/)
    await writeFile(path.join(root, 'src/IntegratedPreview.tsx'), 'import { Button } from "@/components/ui/button"; export default function IntegratedPreview(){return <Button>Key visual</Button>}')
    await writeFile(path.join(root, 'src/App.tsx'), '<section className="component-directory"/><section data-slot="integrated-preview"/>')
    assert.throws(() => prepare_integrated_preview(root, true), /before the component directory/)
    await writeFile(path.join(root, 'src/App.tsx'), '<section data-slot="integrated-preview"/><section className="component-directory"/>')
    prepare_integrated_preview(root, true)
  })
})

test('delivery rejects integrated preview that does not use library components', async () => {
  await withTempDirectory(async (root) => {
    await mkdir(path.join(root, 'src'), { recursive: true })
    await writeFile(path.join(root, 'src/IntegratedPreview.tsx'), 'export default function IntegratedPreview(){return <main>Key visual</main>}')
    await writeFile(path.join(root, 'src/App.tsx'), '<section data-slot="integrated-preview"/><section className="component-directory"/>')
    assert.throws(() => prepare_integrated_preview(root, true), /delivered components/)
  })
})

test('example wrapper drops viewport two column breakpoint', () => {
  const result = theme_example('example', '<div data-slot="example-wrapper" className="grid min-h-screen md:grid-cols-2 gap-8" />')
  assert.ok(!result.includes('md:grid-cols-2'))
  assert.ok(!result.includes('min-h-screen'))
  assert.ok(result.includes('min-h-0'))
})

test('theme signature matrix covers representative families', () => {
  assert.deepEqual(new Set(Object.keys(THEME_SIGNATURE_MATRIX)), new Set(['actions', 'inputs', 'selection', 'navigation', 'data-display', 'overlays', 'feedback']))
  for (const facets of Object.values(THEME_SIGNATURE_MATRIX)) {
    assert.deepEqual(new Set(Object.keys(facets)), new Set(['depth', 'color', 'state']))
    assert.ok(Object.values(facets).every(Boolean))
  }
  const signatures = theme_signature_css()
  for (const hook of ['cn-button', 'cn-input', 'cn-checkbox', 'cn-tabs', 'cn-card', 'cn-item', 'cn-table-container', 'cn-dialog-content', 'cn-dropdown-menu-content', 'cn-alert', 'cn-toast', 'cn-progress-track']) assert.ok(signatures.includes(hook))
  const itemRule = declarations(signatures, /\.cn-item\{([^}]*)\}/)
  assert.ok(itemRule.includes('box-shadow:none'))
  assert.ok(!itemRule.includes('var(--design-shadow)'))
  assert.ok(signatures.includes('background-color:var(--accent)'))
  assert.ok(signatures.includes('color:var(--accent-foreground)'))
  assert.ok(!signatures.includes('background-color:var(--sidebar-accent)'))
  assert.ok(signatures.includes('border-inline-start:6px solid var(--secondary)'))
  assert.ok(signatures.includes('border-inline-start:6px solid var(--accent)'))
})

test('table container owns horizontal overflow', () => {
  const table = declarations(compact(component_css()), /\.cn-table-container\{([^}]*)\}/)
  assert.ok(table.includes('overflow-x-auto'))
  assert.ok(table.includes('max-w-full'))
})

test('semantic hook inference does not guess layout from names', () => {
  const riskyHooks = ['cn-command-item', 'cn-input-otp-input', 'cn-input-otp-caret', 'cn-native-select-icon', 'cn-command-separator']
  const destructive = ['cursor:', 'width:', 'height:', 'background-color:', 'border-radius:']
  for (const hook of riskyHooks) {
    const values = semantic_hook_properties(hook).join(';')
    assert.ok(!destructive.some((property) => values.includes(property)), values)
  }
})

test('boolean state rules exclude explicit false', () => {
  const styles = component_css()
  assert.ok(styles.includes('.cn-command-item[data-selected="true"]'))
  assert.ok(styles.includes('.cn-tabs-trigger[data-active]:not([data-active="false"])'))
  assert.ok(!styles.includes('[class*="cn-"][data-selected]{'))
  assert.ok(!styles.includes('[class*="cn-"][data-active]{'))
  for (const attribute of ['disabled', 'invalid', 'open', 'highlighted', 'expanded', 'loading']) {
    assert.ok(!styles.includes(`[class*="cn-"][data-${attribute}]{`))
    assert.ok(styles.includes(`[data-${attribute}="false"]`))
  }
})

test('invalid state only targets frame owning controls', () => {
  const invalid = state_css(['invalid'])
  const compactInvalid = compact(invalid)
  assert.ok(!invalid.includes('[class*="cn-"]'))
  for (const nonFrame of ['.cn-field[data-invalid', '.cn-field-group[data-invalid', '.cn-field-description[data-invalid', '.cn-field-error[data-invalid']) assert.ok(!compactInvalid.includes(nonFrame))
  for (const frame of ['.cn-button', '.cn-input', '.cn-textarea', '.cn-select-trigger', '.cn-native-select', '.cn-checkbox', '.cn-radio-group-item', '.cn-switch', '.cn-input-otp-slot', '.cn-input-group']) assert.ok(invalid.includes(frame))
  assert.ok(invalid.includes('box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)'))
})

test('Base UI active selector accepts empty and true but rejects false', () => {
  const selector = truthy_data_selector('active')
  assert.equal(selector, '[data-active]:not([data-active="false"])')
  for (const [value, expected] of [['', true], ['true', true], ['false', false]]) assert.equal(value !== 'false', expected, value)
  const active = compact(state_css(['active']))
  const signature = compact(theme_signature_css())
  assert.ok(active.includes(`.cn-tabs-trigger${selector}`))
  assert.ok(signature.includes(`.cn-tabs-trigger${selector}`))
  assert.ok(!signature.includes('.cn-tabs-trigger[data-active="true"]'))
})

test('command input expanded state does not receive accent paint', () => {
  const expanded = state_css(['expanded'])
  assert.ok(component_css().includes('.cn-command-item[data-selected="true"]'))
  assert.ok(!expanded.includes('.cn-command-input'))
  assert.ok(!expanded.includes('background-color:'))
  assert.ok(!expanded.includes('color:'))
  assert.ok(!component_css().includes('[class*="cn-"][aria-expanded="true"]{background'))
})

test('critical components have explicit geometry and states', () => {
  const styles = compact(component_css())
  const expected = [
    '.cn-command-item{display:flex;align-items:center;',
    'line-height:1.25rem;cursor:default',
    '.cn-command-item[data-selected="true"]{background-color:var(--accent);',
    '.cn-input-otp-slot{position:relative;display:flex;align-items:center;justify-content:center;width:var(--control-height);height:var(--control-height);border:1pxsolidvar(--input);',
    '.cn-input-otp-slot+.cn-input-otp-slot{margin-inline-start:-1px}',
    '.cn-input-otp-slot[data-active="true"]{z-index:1;border-color:var(--ring);',
    '.cn-input-otp:has(.cn-input-otp-input[aria-invalid="true"]).cn-input-otp-slot{border-color:var(--destructive)',
    '.cn-input-otp-caret-line{width:1px;height:1.25rem;',
    '.cn-native-select{width:100%;height:var(--control-height);appearance:none;',
    'padding-inline-end:calc(var(--control-padding)+var(--icon-size));',
    '.cn-native-select[data-size="sm"]{height:2rem;',
    '.cn-native-select-icon{position:absolute;right:var(--control-padding);top:50%;',
  ]
  for (const fragment of expected) assert.ok(styles.includes(fragment), fragment)
})

test('visual contract covers every hook and state', () => {
  const files = [[{ content: 'className="cn-button cn-dialog-content data-open:opacity-100 data-highlighted:bg-accent data-disabled:opacity-50 data-starting-style:opacity-0 aria-pressed:bg-accent"' }]]
  const contract = visual_contract(files)
  const styles = component_css(contract.hooks)
  const audit = audit_visual_css(contract, styles, component_css([]))
  assert.deepEqual(contract.hooks, ['cn-button', 'cn-dialog-content'])
  assert.deepEqual(audit.missingHooks, [])
  assert.deepEqual(audit.unclassifiedHooks, [])
  assert.deepEqual(new Set(contract.observedStates), new Set(['open', 'highlighted', 'disabled', 'starting-style', 'pressed']))
  assert.deepEqual(new Set(Object.keys(contract.requiredStates)), new Set(Object.keys(STATE_RULES)))
  for (const [state, markers] of Object.entries(contract.requiredStates)) {
    assert.ok(state_selectors(state).some((marker) => styles.includes(marker)))
    assert.ok(markers[1])
  }
})

test('visual audit rejects missing visible state', () => {
  const contract = { hooks: ['cn-button'], requiredStates: { open: STATE_RULES.open } }
  const audit = audit_visual_css(contract, '.cn-button{color:red}', '.cn-button{color:red}')
  assert.deepEqual(audit.missingStates, ['open'])
  assert.deepEqual(audit.explicitHooks, ['cn-button'])
})

test('visual audit rejects missing critical structure', () => {
  const hooks = ['cn-command-item', 'cn-input-otp', 'cn-input-otp-slot', 'cn-input-otp-caret-line', 'cn-native-select', 'cn-native-select-icon']
  const contract = { hooks, requiredStates: {} }
  const styles = component_css(hooks)
  assert.deepEqual(audit_visual_css(contract, styles, component_css([])).missingStructures, [])
  const broken = styles.replaceAll('display:flex;align-items:center;gap:var(--icon-gap);', 'display:block;')
  assert.ok(audit_visual_css(contract, broken, component_css([])).missingStructures.includes('command-item-layout'))
})

test('visual audit enforces sheet switch and input group structure', () => {
  const hooks = ['cn-sheet-overlay', 'cn-sheet-content', 'cn-switch', 'cn-switch-thumb', 'cn-input-group', 'cn-input-group-input', 'cn-input-group-textarea', 'cn-input-group-addon']
  const contract = { hooks, requiredStates: {} }
  const styles = component_css(hooks)
  assert.deepEqual(audit_visual_css(contract, styles, component_css([])).missingStructures, [])
  for (const [fragment, requirement] of [
    ['z-index:81', 'sheet-content-layer'],
    ['transform:translateX(calc(var(--switch-width) - var(--switch-thumb-size) - var(--switch-inset) - var(--switch-inset)))', 'switch-checked-thumb'],
    ['box-shadow:none', 'input-group-control-frame'],
  ]) {
    assert.ok(audit_visual_css(contract, styles.replaceAll(fragment, ''), component_css([])).missingStructures.includes(requirement))
  }
})

test('visual audit enforces navigation and compound component repairs', () => {
  const hooks = [
    'cn-command-input-wrapper', 'cn-command-input-group', 'cn-command-input', 'cn-input-group-addon',
    'cn-command-group', 'cn-command-item', 'cn-navigation-menu-trigger', 'cn-navigation-menu-trigger-icon',
    'cn-navigation-menu-trigger-icon-glyph', 'cn-select-trigger', 'cn-select-trigger-icon', 'cn-select-trigger-icon-glyph',
    'cn-navigation-menu-content', 'cn-navigation-menu-link', 'cn-sidebar-inner', 'cn-sidebar-menu-button',
    'cn-sidebar-header', 'cn-item', 'cn-sidebar-dropdown-content', 'cn-dropdown-menu-positioner', 'cn-tabs-list',
    'cn-tabs-trigger', 'cn-dialog-close', 'cn-alert', 'cn-avatar', 'cn-message-scroller-content',
  ]
  const contract = { hooks, requiredStates: {} }
  const styles = component_css(hooks)
  assert.deepEqual(audit_visual_css(contract, styles, component_css([])).missingStructures, [])
  const repairs = [
    ['border-bottom:1px solid var(--border)', 'command-input-boundary'],
    ['min-height:3rem;gap:.75rem;padding-inline:1rem', 'command-input-group-layout'],
    ['.cn-command-input-group>.cn-input-group-addon{flex:none;min-height:0;padding:0;border:0;background:transparent}', 'command-input-addon-layout'],
    ['.cn-command-group [cmdk-group-heading]{padding:.375rem .5rem .5rem', 'command-group-heading-spacing'],
    ['.cn-command-group [cmdk-group-items]{display:flex;flex-direction:column;gap:.25rem}', 'command-group-items-spacing'],
    ['min-height:2.75rem;padding:.5rem .625rem;gap:.625rem', 'command-item-rhythm'],
    ['.cn-command-item>svg{display:block;width:1rem;height:1rem;flex:none;align-self:center}', 'command-item-icon-size'],
    ['.cn-select-trigger-icon{display:inline-flex;width:1rem;height:1rem;flex:none;align-items:center;justify-content:center;align-self:center;line-height:0}', 'select-trigger-icon-frame'],
    ['.cn-select-trigger-icon-glyph{display:block;width:1rem;height:1rem;flex:none}', 'select-trigger-icon-glyph'],
    ['.cn-select-trigger{gap:.5rem}', 'select-trigger-icon-gap'],
    ['.cn-navigation-menu-trigger-icon{display:inline-flex;width:1rem;height:1rem;flex:none;align-items:center;justify-content:center;align-self:center;line-height:0}', 'navigation-trigger-icon-frame'],
    ['.cn-navigation-menu-trigger-icon-glyph{display:block;width:1rem;height:1rem;flex:none}', 'navigation-trigger-icon-glyph'],
    ['.cn-navigation-menu-trigger{gap:.5rem}', 'navigation-trigger-icon-gap'],
    ['background-color:var(--accent);color:var(--accent-foreground)', 'navigation-open-state'],
    ['.cn-navigation-menu-link:hover .text-muted-foreground{color:var(--accent-foreground)!important}', 'navigation-link-descendant-hover'],
    ['.cn-navigation-menu-content .cn-navigation-menu-link{display:block;width:100%}', 'navigation-content-link-box'],
    ['background-color:var(--sidebar-accent)!important;color:var(--sidebar-accent-foreground)!important', 'sidebar-dropdown-trigger'],
    ['border:0!important;background:transparent!important;box-shadow:none!important', 'sidebar-dropdown-item-reset'],
    ['.cn-sidebar-dropdown-content{z-index:75!important;width:var(--anchor-width)', 'sidebar-dropdown-content'],
    ['.cn-dropdown-menu-positioner:has(>.cn-sidebar-dropdown-content){z-index:75!important}', 'sidebar-dropdown-positioner'],
    ['.cn-sidebar-header{display:flex;flex-direction:column;gap:.75rem;padding:.75rem}', 'sidebar-header-controls-spacing'],
    ['background-color:var(--accent);border-color:var(--border);color:var(--accent-foreground);box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 18%,transparent)', 'tabs-active-state'],
    ['.cn-tabs-trigger[data-active="false"]{background-color:transparent;border-color:transparent;color:var(--muted-foreground);box-shadow:none}', 'tabs-inactive-state'],
    ['background-color:transparent;border-color:transparent;color:var(--foreground);box-shadow:none', 'tabs-line-active-state'],
    ['color:var(--foreground)', 'tabs-line-active-color'],
    ['.cn-tabs-list[data-variant="line"]{border:0;border-radius:0;background:transparent;box-shadow:none', 'tabs-line-list-frame'],
    ['.cn-tabs-list[data-variant="line"] .cn-tabs-trigger{border:0;border-radius:0;box-shadow:none}', 'tabs-line-trigger-frame'],
    ['inset-inline:max(.5rem,calc(var(--control-radius)*.5));bottom:0;height:2px;border-radius:9999px', 'tabs-line-indicator-inset'],
    ['.cn-tabs-list[data-variant="line"] .cn-tabs-trigger[data-active]:not([data-active="false"])::after{opacity:1}', 'tabs-line-indicator-active'],
    ['position:absolute;top:1rem;right:1rem', 'dialog-close-position'],
    ['grid-template-columns:auto minmax(0,1fr) auto', 'alert-leading-layout'],
    ['.cn-avatar[data-size="default"]{width:2.5rem;height:2.5rem;aspect-ratio:1}', 'avatar-default-size'],
    ['gap:.75rem;padding-block:.5rem', 'message-scroller-spacing'],
  ]
  for (const [fragment, requirement] of repairs) {
    const broken = styles.replaceAll(fragment, '')
    assert.ok(audit_visual_css(contract, broken, component_css([])).missingStructures.includes(requirement), requirement)
  }
})

function removeStructuralRule(styles, requirement) {
  const selector = compact(STRUCTURAL_REQUIREMENTS[requirement][0])
  return styles.replace(new RegExp(`\\.${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\{[^}]*\\}`, 'g'), '')
}

test('visual audit enforces collapsible contrast contract', () => {
  const hooks = ['cn-button']
  const contract = { hooks, requiredStates: {} }
  const styles = component_css(hooks)
  assert.deepEqual(audit_visual_css(contract, styles, component_css([])).missingStructures, [])
  for (const requirement of ['collapsible-trigger-hover', 'collapsible-trigger-focus', 'collapsible-trigger-open', 'collapsible-trigger-muted-hover', 'collapsible-trigger-icon-hover']) {
    const compactStyles = compact(styles)
    const broken = removeStructuralRule(compactStyles, requirement)
    assert.notEqual(broken, compactStyles, requirement)
    assert.ok(audit_visual_css(contract, broken, component_css([])).missingStructures.includes(requirement))
  }
})

test('visual audit enforces button group single frame contract', () => {
  const hooks = ['cn-button-group', 'cn-button-group-separator', 'cn-button-group-text', 'cn-button']
  const contract = { hooks, requiredStates: {} }
  const styles = component_css(hooks)
  assert.deepEqual(audit_visual_css(contract, styles, component_css([])).missingStructures, [])
  for (const [fragment, requirement] of [
    ['box-shadow:var(--design-shadow)', 'button-group-frame'],
    ['margin:0;border:0;border-radius:0;box-shadow:none', 'button-group-child-reset'],
    ['border-inline-start:1px solid var(--border)', 'button-group-horizontal-separator'],
    ['border-block-start:1px solid var(--border)', 'button-group-vertical-separator'],
    ['outline:2px solid var(--ring)', 'button-group-focus'],
    ['transform:none;box-shadow:none!important', 'button-group-pressed'],
  ]) {
    assert.ok(audit_visual_css(contract, styles.replaceAll(fragment, ''), component_css([])).missingStructures.includes(requirement))
  }
})

test('visual audit enforces input group composition and invalid contract', () => {
  const hooks = ['cn-input-group', 'cn-input-group-addon', 'cn-input-group-button', 'cn-input-group-textarea', 'cn-input', 'cn-card', 'cn-card-content', 'cn-field-group', 'cn-card-footer']
  const contract = { hooks, requiredStates: {} }
  const styles = component_css(hooks)
  assert.deepEqual(audit_visual_css(contract, styles, component_css([])).missingStructures, [])
  const repairs = [
    ['overflow:hidden', 'input-group-frame-clipping'],
    ['border-inline-end:1px solid var(--border)', 'input-group-inline-addon'],
    ['border-inline-start:1px solid var(--border)', 'input-group-inline-end-addon'],
    ['box-shadow:none!important', 'input-group-button-reset'],
    ['align-self:stretch;padding:0', 'input-group-button-addon'],
    ['height:100%;min-height:var(--control-height)', 'input-group-button-fill'],
    ['flex-wrap:wrap;align-items:stretch', 'input-group-block-layout'],
    ['border-bottom:1px solid var(--border)', 'input-group-block-addon'],
    ['border-top:1px solid var(--border)', 'input-group-block-end-addon'],
    ['flex-direction:column;align-items:stretch;height:auto;min-height:7rem', 'input-group-textarea-wrapper'],
    ['min-height:5.5rem', 'input-group-textarea-layout'],
    ['box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)', 'input-group-invalid-frame'],
    ['box-shadow:none!important', 'input-group-invalid-control-reset'],
    ['gap:1.25rem', 'card-field-spacing'],
    ['gap:.5rem', 'card-footer-spacing'],
  ]
  const compactStyles = compact(styles)
  for (const [, requirement] of repairs) {
    const broken = removeStructuralRule(compactStyles, requirement)
    assert.notEqual(broken, compactStyles, requirement)
    assert.ok(audit_visual_css(contract, broken, component_css([])).missingStructures.includes(requirement))
  }
})

test('hook classification rejects unknown hooks', () => {
  const classes = classify_hooks(['cn-button', 'cn-mystery'], ' .cn-button{color:red}')
  assert.deepEqual(classes.explicitHooks, ['cn-button'])
  assert.deepEqual(classes.unclassifiedHooks, ['cn-mystery'])
})

test('representative Base UI hooks are classified and audited', () => {
  const hooks = [
    'cn-avatar-badge', 'cn-chart-tooltip', 'cn-combobox-chips', 'cn-context-menu-subcontent',
    'cn-sidebar-menu-badge', 'cn-command-item', 'cn-input-otp', 'cn-input-otp-input',
    'cn-input-otp-slot', 'cn-input-otp-caret-line', 'cn-native-select', 'cn-native-select-icon',
  ]
  const files = [[{ content: `className="${hooks.join(' ')}"` }]]
  const contract = visual_contract(files)
  const styles = component_css(contract.hooks)
  const audit = audit_visual_css(contract, styles, component_css([]))
  assert.deepEqual(contract.hooks, [...hooks].sort())
  assert.deepEqual(audit.unclassifiedHooks, [])
  assert.deepEqual(audit.missingHooks, [])
  assert.deepEqual(audit.missingStates, [])
  assert.deepEqual(audit.missingStructures, [])
})

test('component title', () => {
  assert.equal(component_title('alert-dialog'), 'Alert Dialog')
  assert.equal(component_title('input-otp'), 'Input OTP')
  assert.equal(component_title('kbd'), 'KBD')
})

test('representative components are grouped', () => {
  const expected = {
    button: 'Actions',
    input: 'Inputs',
    tabs: 'Navigation',
    dialog: 'Overlays',
    alert: 'Feedback',
    table: 'Data display',
    accordion: 'Layout',
    message: 'Messaging',
    direction: 'Utilities',
  }
  for (const [name, category] of Object.entries(expected)) assert.equal(COMPONENT_CATEGORIES[name], category)
})

test('example ownership prefers longest component name', () => {
  const names = ['button-example', 'button-outline', 'button-responsive', 'button-group-example', 'input-example', 'input-group-example']
  const available = Object.fromEntries(names.map((name) => [name, { name, type: 'registry:example' }]))
  const result = examples_by_component(['button', 'button-group', 'input', 'input-group'], available)
  assert.deepEqual(result['button-group'], ['button-group-example'])
  assert.deepEqual(result['input-group'], ['input-group-example'])
  assert.deepEqual(result.button, ['button-example', 'button-outline'])
})

test('custom component manifest', async () => {
  await withTempDirectory(async (root) => {
    const source = path.join(root, 'src/components/custom/metric-card.tsx')
    const preview = path.join(root, 'src/components/custom/metric-card.preview.tsx')
    await mkdir(path.dirname(source), { recursive: true })
    await writeFile(source, 'export function MetricCard() { return null }')
    await writeFile(preview, 'export default function Preview() { return null }')
    const manifest = { components: [{
      name: 'metric-card', title: 'Metric Card', description: 'Reference-derived metric surface.',
      files: ['src/components/custom/metric-card.tsx'], preview: { path: 'src/components/custom/metric-card.preview.tsx' },
      dependencies: [], registryDependencies: ['card'],
    }] }
    await writeFile(path.join(root, 'custom-components.json'), JSON.stringify(manifest))
    const entries = load_custom_components(root)
    assert.equal(entries[0].name, 'metric-card')
    assert.equal(entries[0].export, 'default')
  })
})

test('custom component manifest rejects missing preview', async () => {
  await withTempDirectory(async (root) => {
    const source = path.join(root, 'src/components/custom/metric-card.tsx')
    await mkdir(path.dirname(source), { recursive: true })
    await writeFile(source, 'export function MetricCard() { return null }')
    const manifest = { components: [{
      name: 'metric-card', title: 'Metric Card', description: 'Reference-derived metric surface.',
      files: ['src/components/custom/metric-card.tsx'], preview: { path: 'src/components/custom/missing.preview.tsx' },
    }] }
    await writeFile(path.join(root, 'custom-components.json'), JSON.stringify(manifest))
    assert.throws(() => load_custom_components(root), /Missing custom component file/)
  })
})

test('custom component manifest rejects custom category', async () => {
  await withTempDirectory(async (root) => {
    const source = path.join(root, 'src/components/custom/metric-card.tsx')
    const preview = path.join(root, 'src/components/custom/metric-card.preview.tsx')
    await mkdir(path.dirname(source), { recursive: true })
    await writeFile(source, 'export function MetricCard() { return null }')
    await writeFile(preview, 'export default function Preview() { return null }')
    const manifest = { components: [{
      name: 'metric-card', title: 'Metric Card', category: 'Image-derived', description: 'Reference-derived metric surface.',
      files: ['src/components/custom/metric-card.tsx'], preview: { path: 'src/components/custom/metric-card.preview.tsx' },
    }] }
    await writeFile(path.join(root, 'custom-components.json'), JSON.stringify(manifest))
    assert.throws(() => load_custom_components(root), /fixed Custom components category/)
  })
})

test('custom component manifest rejects integrated preview', async () => {
  await withTempDirectory(async (root) => {
    const source = path.join(root, 'src/components/custom/integrated-preview.tsx')
    await mkdir(path.dirname(source), { recursive: true })
    await writeFile(source, 'export default function IntegratedPreview(){return null}')
    const manifest = { components: [{
      name: 'integrated-preview', title: 'Integrated Preview', description: 'Docs composition',
      files: ['src/components/custom/integrated-preview.tsx'], preview: { path: 'src/components/custom/integrated-preview.tsx' },
    }] }
    await writeFile(path.join(root, 'custom-components.json'), JSON.stringify(manifest))
    assert.throws(() => load_custom_components(root), /reserved for the docs-only gallery composition/)
  })
})

test('component catalog rejects docs only name', () => {
  const labels = Object.fromEntries([...new Set([...Object.values(COMPONENT_CATEGORIES), 'Utilities', 'Custom components', 'Visual preview, variants and interaction states for this component.'])].map((key) => [key, key]))
  assert.throws(() => component_catalog_entries(['button', 'integrated-preview'], [], labels), /Docs-only component names/)
})

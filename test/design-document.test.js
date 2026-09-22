import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { FENCE, TEMPLATE, completion_errors, document } from '../skills/grilling-design-system/scripts/design_document.js'
import { digest } from '../skills/grilling-design-system/scripts/studio.js'
import { COLOR_KEYS, validate } from '../skills/grilling-design-system/scripts/theme.js'

const templatePath = typeof TEMPLATE === 'string' && !TEMPLATE.startsWith('file:')
  ? TEMPLATE
  : fileURLToPath(TEMPLATE)
const templateSource = () => readFileSync(templatePath, 'utf8')

test('completion check verifies documented component paths', () => {
  const text = templateSource().replace('UI components:' + String.fromCharCode(10) + '[path]', 'UI components: src/absent')
  assert.ok(completion_errors(text, '/tmp').some(error => error.includes('src/absent')))
})

test('path checks accept existing multiple paths and explanatory notes', () => {
  const root = dirname(templatePath)
  const name = basename(templatePath)
  const text = templateSource().replace('UI components:' + String.fromCharCode(10) + '[path]', 'UI components: ' + name + ' and ' + name)
    .replace('Shared components:' + String.fromCharCode(10) + '[path]', 'Shared components: ' + name + '（示例说明）')
  assert.ok(!completion_errors(text, root).some(error => error.startsWith('Documented path')))
})

describe('design document', () => {
  let output
  let tokens
  let snapshot
  let state

  beforeEach(() => {
    output = realpathSync(mkdtempSync(join(tmpdir(), 'grilling-design-document-')))
    const colors = Object.fromEntries(
      COLOR_KEYS.map((key) => [key, key.endsWith('foreground') ? '#FFFFFF' : '#222222']),
    )
    Object.assign(colors, {
      background: '#FFFFFF',
      foreground: '#222222',
      card: '#FFFFFF',
      'card-foreground': '#222222',
    })
    tokens = {
      name: 'Fixture',
      slug: 'fixture-theme',
      mode: 'light',
      colors,
      radius: 10,
      font: { family: 'system-ui', heading: 'system-ui', bodySize: 16, headingWeight: 700 },
      spacing: { unit: 4, controlHeight: 44 },
      icons: { family: 'Lucide', size: 24, stroke: 2 },
      motion: { duration: 160, easing: 'ease-out' },
      shadow: 'none',
    }
    snapshot = { url: 'fixture registry', fetchedAt: '2026-09-16', ui: ['button', 'input'] }
    state = {
      status: 'approved',
      simulation: true,
      approval: { tokenHash: digest(tokens) },
      history: [{ stage: 'foundations', action: 'derive', derivation: 'Retain selected geometry' }],
    }
    mkdirSync(join(output, 'src/components/ui'), { recursive: true })
    writeFileSync(join(output, 'src/components/ui/button.tsx'), '// fixture source')
    writeFileSync(join(output, 'src/App.tsx'), '// fixture app')
    writeFileSync(join(output, 'tokens.json'), '{}')
  })

  afterEach(() => {
    rmSync(output, { recursive: true, force: true })
  })

  function generate(currentState = null) {
    document(output, tokens, currentState, snapshot, { keyboard: 'Not run: no browser fixture' })
    return readFileSync(join(output, 'DESIGN.md'), 'utf8')
  }

  function completedFixture() {
    return templateSource()
      .replace(/\[[^\]]+\]/g, 'Fixture value')
      .replace(/^([^\n]+:)$/gm, '$1 Fixture value')
      .replace(/^((?:Desktop|Tablet|Mobile) ->)$/gm, '$1 Fixture value')
  }

  test('template sections, actual tokens, and paths', () => {
    const result = generate(state)
    assert.deepEqual(result.match(/^## .+$/gm), templateSource().match(/^## .+$/gm))
    assert.ok(result.includes('surface: var(--card) = #FFFFFF'))
    assert.ok(result.includes('sm: 6px; --radius-sm'))
    assert.ok(result.includes('Button: src/components/ui/button.tsx'))
    assert.ok(!result.includes('Table: src/components/ui/table.tsx'))
    assert.ok(result.includes('primary-hover: [fill here:'))
    assert.ok(result.includes('variant="default"'))
    assert.ok(result.includes('Not run: no browser fixture'))
    assert.ok(result.includes('src/fixture-theme.css'))
    assert.ok(result.includes('Working directory: .'))
    assert.ok(result.includes('Public imports: @/components/ui/<component>'))
    assert.ok(result.includes('SIMULATED APPROVAL'))
    assert.ok(completion_errors(result).length > 0)
  })

  test('model-authored names are required', () => {
    const missing = structuredClone(tokens)
    delete missing.slug
    assert.throws(() => validate(missing), /Missing token group: slug/)

    const invalid = structuredClone(tokens)
    invalid.slug = 'Fixed Theme.css'
    assert.throws(() => validate(invalid), /model-authored kebab-case/)
  })

  test('regeneration preserves guidance and refreshes facts', () => {
    const note = `# Custom guidance\n\nUse compact groups.\n\n${FENCE}txt\n# Literal example\n${FENCE}`
    writeFileSync(join(output, 'design-notes.md'), note)
    const first = generate(state)
    tokens.colors.primary = '#123456'
    const second = generate()
    assert.ok(second.includes('primary: var(--primary) = #123456'))
    assert.ok(!first.includes('primary: var(--primary) = #123456'))
    assert.ok(second.includes('#### Custom guidance'))
    assert.ok(second.includes(`${FENCE}txt\n# Literal example\n${FENCE}`))
    assert.equal(readFileSync(join(output, 'design-notes.md'), 'utf8'), note)
    assert.ok(first.includes('Retain selected geometry'))
    assert.ok(second.includes('Status: Draft'))
  })

  test('unapproved session is never labeled approved', () => {
    const currentState = structuredClone(state)
    Object.assign(currentState, { status: 'awaiting-user', approval: null })
    assert.ok(generate(currentState).includes('Status: Draft'))
  })

  test('integrated document uses host root and existing source paths', () => {
    const app = join(output, 'host')
    const library = join(app, 'app/design-system')
    mkdirSync(join(library, 'ui'), { recursive: true })
    writeFileSync(join(library, 'ui/Button.vue'), '<button />')
    writeFileSync(join(library, 'tokens.json'), '{}')
    const context = {
      mode: 'integrated',
      webRoot: app,
      output: library,
      workDir: join(app, '.tmp/grilling-design-system'),
      framework: 'Nuxt + Vue',
      styling: 'Existing scoped CSS',
      buildInstructions: 'Run pnpm build.',
      workingDirectory: '.',
      startOrInstall: 'pnpm install; pnpm dev',
      globalStyles: 'app/assets/main.css in nuxt.config.ts',
      rootProviders: 'Nuxt app root plugin',
      publicImports: '~/design-system/ui/Button.vue',
      galleryDocs: 'pnpm dev; /design-system',
      implementationPaths: {
        'UI components': 'app/design-system/ui',
        'Design tokens': 'app/design-system/tokens.json',
      },
      canonicalPaths: { Button: 'app/design-system/ui/Button.vue' },
    }
    const path = document(library, tokens, null, snapshot, {}, context)
    assert.equal(path, resolve(app, 'DESIGN.md'))
    const result = readFileSync(path, 'utf8')
    assert.ok(result.includes('Framework: Nuxt + Vue'))
    assert.ok(result.includes('Button: app/design-system/ui/Button.vue'))
    assert.ok(result.includes('Run pnpm build.'))
    assert.ok(result.includes('Start or install: pnpm install; pnpm dev'))
    assert.ok(result.includes('Public imports: ~/design-system/ui/Button.vue'))
    assert.ok(!result.includes('Run npm install'))
    assert.ok(!existsSync(join(library, 'DESIGN.md')))

    writeFileSync(path, 'Existing project rules')
    const draft = document(library, tokens, null, snapshot, {}, context)
    assert.equal(draft, join(app, '.tmp/grilling-design-system/DESIGN.draft.md'))
    assert.equal(readFileSync(path, 'utf8'), 'Existing project rules')
  })

  test('completed standalone document is never overwritten', () => {
    const first = generate(state)
    assert.ok(first.includes('This is a generated documentation draft.'))
    const completed = completedFixture()
    writeFileSync(join(output, 'DESIGN.md'), completed)
    const draft = document(output, tokens, state, snapshot, {})
    assert.equal(draft, join(resolve(output), '.tmp/grilling-design-system/DESIGN.draft.md'))
    assert.equal(readFileSync(join(output, 'DESIGN.md'), 'utf8'), completed)
  })

  test('completion checker rejects blanks, missing fields, and placeholders', async (t) => {
    const valid = completedFixture()
    assert.deepEqual(completion_errors(valid), [])
    const brokenFixtures = [
      ['blank field', valid.replace('font-family: Fixture value', 'font-family:')],
      ['missing field', valid.replace('font-family: Fixture value', '')],
      ['missing component heading', valid.replace('### Input', '### Missing')],
      ['changed canonical section heading', valid.replace('## 13. Project-Specific Rules', '## 14. Rules')],
      ['template placeholder', `${valid}\n[path]\n`],
    ]
    for (const [name, broken] of brokenFixtures) {
      await t.test(name, () => {
        assert.ok(completion_errors(broken).length > 0)
      })
    }
    assert.ok(completion_errors(templateSource()).length > 0)
  })
})

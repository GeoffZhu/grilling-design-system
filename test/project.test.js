import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { afterEach, beforeEach, describe, test } from 'node:test'

import { build } from '../skills/grilling-design-system/scripts/library.js'
import { resolve_project } from '../skills/grilling-design-system/scripts/project.js'
import { COLOR_KEYS } from '../skills/grilling-design-system/scripts/theme.js'

describe('project output routing and scaffold protection', () => {
  let root

  beforeEach(() => {
    root = realpathSync(mkdtempSync(join(tmpdir(), 'grilling-project-')))
    mkdirSync(join(root, '.git'))
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  function web(target = root, framework = 'next', source = 'src') {
    mkdirSync(target, { recursive: true })
    writeFileSync(join(target, 'package.json'), JSON.stringify({
      dependencies: { [framework]: '1.0' },
      packageManager: 'pnpm@9.0.0',
      scripts: { build: 'next build' },
    }))
    mkdirSync(join(target, source), { recursive: true })
    return target
  }

  function validTokens() {
    const colors = Object.fromEntries(
      COLOR_KEYS.map((key) => [key, key.endsWith('foreground') ? '#FFFFFF' : '#222222']),
    )
    Object.assign(colors, {
      background: '#FFFFFF',
      foreground: '#222222',
      card: '#FFFFFF',
      'card-foreground': '#222222',
    })
    return {
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
  }

  test('four output scenarios', () => {
    const plain = resolve_project(root)
    assert.equal(plain.mode, 'standalone')
    assert.equal(plain.output, join(root, 'design-system'))
    assert.equal(plain.designDoc, join(root, 'design-system/DESIGN.md'))

    let explicit = resolve_project(root, 'chosen')
    assert.equal(explicit.output, join(root, 'chosen'))
    assert.equal(explicit.designDoc, join(root, 'chosen/DESIGN.md'))

    web()
    const native = resolve_project(root)
    assert.equal(native.mode, 'integrated')
    assert.equal(native.output, join(root, 'src/design-system'))
    assert.equal(native.designDoc, join(root, 'DESIGN.md'))
    assert.equal(native.workDir, join(root, '.tmp/grilling-design-system'))

    explicit = resolve_project(root, 'chosen')
    assert.equal(explicit.mode, 'integrated')
    assert.equal(explicit.output, join(root, 'chosen'))
    assert.equal(explicit.designDoc, join(root, 'DESIGN.md'))
    assert.equal(existsSync(join(root, 'chosen')), false)
  })

  test('nested web cwd finds application root', () => {
    web()
    const nested = join(root, 'src/pages')
    mkdirSync(join(nested, 'src'), { recursive: true })
    writeFileSync(join(nested, 'src/demo.tsx'), 'export default null')

    const result = resolve_project(nested, 'local-output')
    assert.equal(result.webRoot, root)
    assert.equal(result.output, join(nested, 'local-output'))
    assert.equal(result.designDoc, join(root, 'DESIGN.md'))
  })

  test('non-React and non-src layout', () => {
    web(root, 'nuxt', 'app')
    const result = resolve_project(root)
    assert.equal(result.output, join(root, 'app/design-system'))
    assert.equal(result.packageManager, 'pnpm@9.0.0')
  })

  test('backend manifest alone is not a web application', () => {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: { express: '5' } }))
    assert.equal(resolve_project(root).mode, 'standalone')
  })

  test('monorepo uses owning app and workspace lock', () => {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ workspaces: ['apps/*'] }))
    writeFileSync(join(root, 'pnpm-lock.yaml'), 'lockfileVersion: 9')
    const app = web(join(root, 'apps/site'))

    const result = resolve_project(join(app, 'src'))
    assert.equal(result.webRoot, app)
    assert.equal(result.designDoc, join(app, 'DESIGN.md'))
    assert.ok(result.lockfiles.includes(join(root, 'pnpm-lock.yaml')))
    assert.equal(resolve_project(root).mode, 'standalone')
  })

  test('custom source override and external requested path', () => {
    web()
    mkdirSync(join(root, 'custom-ui'))
    const target = join(dirname(root), `${basename(root)}-components`)

    const result = resolve_project(root, target, root, 'custom-ui')
    assert.equal(result.output, target)
    assert.equal(result.sourceRoot, join(root, 'custom-ui'))
    assert.equal(result.designDoc, join(root, 'DESIGN.md'))
  })

  test('standalone scaffold refuses host before mutating', async (t) => {
    web()
    const packagePath = join(root, 'package.json')
    const before = readFileSync(packagePath)
    const args = {
      output: join(root, 'src/design-system'),
      cache: join(root, '.tmp/grilling-design-system/cache'),
    }
    t.mock.method(process, 'cwd', () => root)

    await assert.rejects(() => build(args), /Existing Web project/)
    assert.deepEqual(readFileSync(packagePath), before)
    assert.equal(existsSync(args.output), false)
    assert.equal(existsSync(args.cache), false)
  })

  test('failed fetch leaves standalone output untouched', async (t) => {
    const tokens = join(root, 'tokens.json')
    writeFileSync(tokens, JSON.stringify(validTokens()))
    const output = join(root, 'design-system')
    const args = {
      output,
      cache: join(root, 'cache'),
      session: null,
      tokens,
      language: 'en',
      ui_copy: null,
      deliver: false,
      full: false,
      install: false,
      build: false,
    }
    const empty = join(root, 'empty')
    mkdirSync(empty)
    t.mock.method(process, 'cwd', () => empty)
    const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
      throw new Error('offline fixture')
    })

    await assert.rejects(() => build(args), /offline/)
    assert.equal(fetchMock.mock.callCount(), 3)
    assert.equal(existsSync(output), false)
  })

  test('interrupted generator output is not mistaken for a host', async (t) => {
    const output = join(root, 'design-system')
    const marker = join(output, '.tmp/grilling-design-system/standalone-owner')
    mkdirSync(dirname(marker), { recursive: true })
    writeFileSync(marker, 'marker')
    writeFileSync(join(output, 'index.html'), '<div id="root"></div>')
    writeFileSync(join(output, 'vite.config.ts'), 'export default {}')
    const args = {
      output,
      cache: join(root, 'cache'),
      session: null,
      tokens: null,
      language: 'en',
      ui_copy: null,
      deliver: false,
      full: false,
      install: false,
      build: false,
    }
    const empty = join(root, 'empty')
    mkdirSync(empty)
    t.mock.method(process, 'cwd', () => empty)

    await assert.rejects(() => build(args), /Provide --tokens/)
  })

  test('existing requested application is detected', () => {
    const app = web(join(root, 'existing'))
    const result = resolve_project(root, app)
    assert.equal(result.mode, 'integrated')
    assert.equal(result.designDoc, join(app, 'DESIGN.md'))
  })
})

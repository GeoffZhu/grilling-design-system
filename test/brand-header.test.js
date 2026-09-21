import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { render } from '../skills/grilling-design-system/scripts/board.js'

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const skill = join(repositoryRoot, 'skills/grilling-design-system')
const assets = join(skill, 'assets')
const repository = 'https://github.com/GeoffZhu/grilling-design-system'

test('studio header has brand and GitHub link', () => {
  const source = readFileSync(join(assets, 'studio.html'), 'utf8')
  assert.ok(source.includes('>grilling design system</a>'))
  assert.ok(source.includes(`href="${repository}"`))
  assert.ok(source.includes('aria-label="GitHub"'))
  assert.ok(source.includes('<svg'))
})

test('board header has brand and GitHub link', () => {
  const colors = {
    background: '#ffffff', foreground: '#111111',
    card: '#ffffff', 'card-foreground': '#111111',
    popover: '#ffffff', 'popover-foreground': '#111111',
    primary: '#111111', 'primary-foreground': '#ffffff',
    secondary: '#eeeeee', 'secondary-foreground': '#111111',
    muted: '#eeeeee', 'muted-foreground': '#555555',
    accent: '#eeeeee', 'accent-foreground': '#111111',
    destructive: '#aa0000', border: '#dddddd',
    input: '#dddddd', ring: '#111111',
    sidebar: '#ffffff', 'sidebar-foreground': '#111111',
    'sidebar-primary': '#111111', 'sidebar-primary-foreground': '#ffffff',
    'sidebar-accent': '#eeeeee', 'sidebar-accent-foreground': '#111111',
    'sidebar-border': '#dddddd', 'sidebar-ring': '#111111',
  }
  for (let index = 1; index <= 5; index += 1) colors[`chart-${index}`] = '#555555'

  const tokens = {
    name: 'Fixture', slug: 'fixture', mode: 'light', colors,
    radius: 10,
    font: { family: 'system-ui', heading: 'system-ui', bodySize: 16, headingWeight: 700 },
    spacing: { unit: 4, controlHeight: 44 },
    icons: { family: 'Lucide', size: 20, stroke: 2 },
    motion: { duration: 160, easing: 'ease-out' },
    shadow: 'none',
    rationale: 'Fixture',
  }
  const result = render(tokens, {
    language: 'en',
    title: 'Fixture title',
    headline: 'Fixture headline',
    description: 'Fixture description',
    bodyHtml: '<button>Fixture</button>',
  })

  assert.ok(result.includes('<span class="review-brand">grilling design system</span>'))
  assert.ok(result.includes(`href="${repository}"`))
  assert.ok(result.includes('aria-label="GitHub"'))
})

test('gallery template keeps project name and GitHub link', () => {
  const source = readFileSync(join(assets, 'App.tsx'), 'utf8')
  assert.ok(source.includes('>{tokens.name}</a>'))
  assert.ok(source.includes(`href="${repository}"`))
  assert.ok(source.includes('<Github aria-hidden="true"/>'))
  assert.ok(!source.includes('component-count'))
})

test('studio copy remains valid', () => {
  const copy = JSON.parse(readFileSync(join(assets, 'studio-copy.json'), 'utf8'))
  assert.ok(Object.hasOwn(copy, 'en'))
})

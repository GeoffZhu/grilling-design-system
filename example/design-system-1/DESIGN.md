# DESIGN.md

## 1. Design Direction

Product type:

`Marketing site`

Style:

* `Cinematic sci-fi`
* `Technical and precise`
* `Dense at the edges, open at the center`
* `High contrast with restrained saturation`

Principles:

1. `Preserve information hierarchy before decoration.` The reference separates a central focal object from dense edge telemetry; the system keeps primary narrative space open and support data compact.
2. `Use color by role.` Amber carries information, ember orange marks action and active state, and near-black surfaces provide depth.
3. `Separate structural geometry by purpose.` Everyday controls and cards use straight technical frames; circles are reserved for orbit, identity, loading, and status.

### Source and status

Name: Ember Orbit

Status: Approved

Mode: Dark only

The reference image is translated through a near-black canvas, dense perimeter telemetry, thin amber linework, and a central orbital focus. The approved language is English for all runtime previews, examples, metadata, accessible labels, and documentation. The design decisions are preserved in `design-notes.md`.

---

## 2. Design Tokens

### Colors

```txt
background: var(--background) = #050403
surface: var(--card) = #0B0704
border: var(--border) = #814313

text-primary: var(--foreground) = #F4E7C9
text-secondary: var(--secondary-foreground) = #F8C46A
text-muted: var(--muted-foreground) = #C9AA74

primary: var(--primary) = #F05A14
primary-hover: var(--accent) = #F5A21A

success: no standalone semantic token; use labeled active status in existing components
warning: no standalone semantic token; add one in tokens.json before introducing warning UI
error: var(--destructive) = #FF6048
```

Rules:

* Use semantic tokens.
* No arbitrary colors.
* Do not use orange as decoration; reserve it for actions, selection, active state, or critical focal data.

### Typography

```txt
font-family: Inter, sans-serif
display-family: Rajdhani, sans-serif
telemetry-family: IBM Plex Mono, monospace

page-title: Rajdhani 600; clamp(54px, 6vw, 88px); line-height 0.92
section-title: Rajdhani 600; clamp(42px, 6vw, 76px); line-height 0.96
body: Inter 400; 16px; line-height 1.65
small: Inter 400 or 500; 12px to 14px; line-height 1.5 to 1.7
label: IBM Plex Mono 600; 10px to 11px; uppercase; 0.08em to 0.14em tracking
```

Rules:

* Use defined typography only.
* No arbitrary font sizes.
* Rajdhani is for display hierarchy, not long body copy.
* IBM Plex Mono is for labels, measurements, identifiers, and technical status.

### Spacing

```txt
Allowed: 4 / 8 / 12 / 16 / 18 / 20 / 24 / 28 / 30 / 32 / 38 / 44 / 48 / 64 / 72 / 92 / 110 / 140
Base unit: 4px

Card padding: 24px
Form gap: 18px
Section gap: 38px to 72px between heading and content
Page padding: clamp(20px, 5vw, 72px)
```

Rules:

* No arbitrary spacing.
* Use the compact values for controls and telemetry; use the larger values only for Marketing composition.

### Radius

```txt
sm: 1.2px; --radius-sm
md: 1.6px; --radius-md
lg: 2px; --radius-lg, --control-radius, --surface-radius, --overlay-radius
full: 9999px; reserved for circles, icon actions, status dots, and orbital geometry
```

### Icons

```txt
Library: Lucide geometric plus the custom OrbitMark
Sizes: 20px base; 16px for Select disclosure; 44px hit area for icon actions
Stroke: 1.5px
```

Rules:

* Use one icon library.
* No emoji as UI icons.
* Use `OrbitMark` only for Ember Orbit identity, not as a generic action icon.

### Complete semantic color map

| Token | Value |
| --- | --- |
| `--background` | `#050403` |
| `--foreground` | `#F4E7C9` |
| `--card` | `#0B0704` |
| `--card-foreground` | `#F4E7C9` |
| `--popover` | `#100A05` |
| `--popover-foreground` | `#FFF3D6` |
| `--primary` | `#F05A14` |
| `--primary-foreground` | `#190700` |
| `--secondary` | `#211307` |
| `--secondary-foreground` | `#F8C46A` |
| `--muted` | `#171009` |
| `--muted-foreground` | `#C9AA74` |
| `--accent` | `#F5A21A` |
| `--accent-foreground` | `#170900` |
| `--destructive` | `#FF6048` |
| `--border` | `#814313` |
| `--input` | `#A75718` |
| `--ring` | `#FFB43B` |

Additional chart and sidebar roles are defined in `tokens.json` and emitted in `src/index.css`. Component geometry, family shadows, border widths, motion, and control metrics are also emitted as CSS variables from the same token source.

---

## 3. Layout

```txt
Max content width: 1180px for Marketing sections; 1120px for gallery content
Page padding: clamp(20px, 5vw, 72px)
Sidebar width: 260px in the component gallery
Form max width: 560px
```

Breakpoints:

```txt
mobile: 0 to 760px
tablet: 761px to 1100px
desktop: above 1100px
```

Responsive rules:

```txt
Sidebar:
Desktop -> sticky 260px component navigation
Mobile -> hidden sidebar with a 44px menu trigger and modal navigation layer

Grid:
Desktop -> three Hero columns and three Card columns
Tablet -> gallery directory reduces from three columns to two
Mobile -> telemetry sidebars hide; Hero, Section headings, Cards, and Footer reflow to one primary column

Table:
Mobile -> Not applicable; no Table component is delivered
```

The Hero keeps its primary narrative before support telemetry. At 760px and below, side telemetry is removed rather than shrinking core text. The emphasized Mobile Hero line uses `0.78em` to prevent clipping at 360px while retaining the Desktop scale.

---

## 4. Components

### Button

```txt
Variants:
primary
secondary (default)
ghost
destructive: not implemented in this Marketing inventory

Sizes:
sm: 44px minimum height
md: 48px default height
lg: not implemented
```

Rules:

* One primary action per action group.
* No custom button colors.
* Use `loading` to disable the action and show the built-in spinner.
* Use `iconOnly` only with an accessible `aria-label`.

API: `EmberButton` extends native button attributes and adds `variant`, `size`, `loading`, `icon`, and `iconOnly`.

### Input

Rules:

* Always use a visible label.
* Placeholder is not a label.
* Show validation near the field.
* Use `EmberInput` and `EmberTextarea`; both accept native field attributes plus `label`, `help`, and `error`.
* `error` sets `aria-invalid` and connects the message with `aria-describedby`.

### Select

Rules:

* Select: short option lists.
* Theme both the Select trigger and option popup, including focus, selected and disabled options. The delivered popup is custom, not native.
* `EmberSelect` accepts `label`, `options`, controlled `value`, uncontrolled `defaultValue`, `placeholder`, `name`, `required`, `disabled`, `error`, and `onValueChange`.
* Arrow keys move between enabled options; Home and End jump; Enter or Space opens or selects; Escape closes; type-ahead matches the first label character.
* Selection closes the popup and returns focus to the trigger. A hidden input supplies the form value when `name` is present. Form reset restores `defaultValue`.
* Combobox: long or searchable lists; not delivered.
* Radio: small visible choices; not delivered.
* Switch: immediate on/off state; not delivered.

### Card

Rules:

* Use only for meaningful grouping.
* Avoid nested cards.
* `EmberCard` supports index, title, description, status, active state, readout, action, children, and `default` or `signal` variants.
* Use `active` only for the current or live item; retain a text status so color is not the only cue.

### Modal

Use for:

`Not applicable: Modal is outside the approved Marketing component inventory.`

Rules:

* Keep tasks focused.
* Clearly explain destructive actions.

### Drawer

Use for:

`Not applicable: no reusable Drawer is delivered; the documentation gallery owns its private Mobile navigation layer.`

### Tabs

Use for:

`Not applicable: no peer-view tab pattern is present in the approved Marketing composition.`

Rules:

* Peer views only.
* Not for global navigation.

### Table

Rules:

* Text left aligned.
* Numbers right aligned.
* Actions right aligned.
* Support empty state.
* Not applicable to the delivered inventory; add a canonical Table before introducing tabular product UI.

### Marketing components

- `EmberHeader`: brand, current navigation state, compact action, and expandable Mobile navigation.
- `EmberHero`: orbital visual, display copy, telemetry, and primary and secondary actions.
- `EmberSection`: content-width, heading relationship, vertical rhythm, and responsive layout wrapper.
- `EmberFooter`: brand note, grouped links, and system status footer.
- `EmberContactForm`: honest demo composition using `EmberInput`, `EmberTextarea`, and `EmberButton`.
- `EmberIcon`, `IconButton`, and `OrbitMark`: icon wrapper, accessible circular action, and brand geometry.

### Public API mapping

Import named exports directly from `src/components/custom/<component>.tsx`. There is no barrel export and no shadcn variant mapping. The `input-form` family intentionally contains the Input, Textarea, and Contact Form exports.

---

## 5. Interaction Patterns

### Page structure

```txt
Page title
Description
Primary action
Secondary actions
Content
```

Marketing pages may place telemetry around the narrative on Desktop, but DOM order and Mobile layout must keep the primary message and action understandable without it.

### Forms

```txt
Layout: single column, 18px gaps, 560px maximum width
Validation: inline below the affected field; preserve entered values
Save behavior: the demo form reports success in a live status region and sends no network request
Unsaved changes: Not applicable; the delivered demo does not persist or navigate away
```

Rules:

* Prefer single-column forms.
* Group related fields.
* Do not claim a submission was sent when the example is local only.

### Search

```txt
Trigger: immediate component-title and category filtering in the documentation sidebar
Debounce: none; the local nine-item inventory filters synchronously
No-result behavior: show “No components found.”
```

Search is documentation-only and is not part of the portable Marketing components.

### Filters

Rules:

* Show active filters.
* Provide reset when needed.
* Not applicable to the delivered Marketing inventory.

### Destructive Actions

Rules:

* State exactly what will be deleted.
* State whether it is reversible.
* Avoid vague "Are you sure?" copy.
* No destructive workflow is included; define both behavior and semantic styling before adding one.

### Motion

Use the 180ms `cubic-bezier(0.22, 1, 0.36, 1)` token for hover, focus-adjacent state, disclosure rotation, and popup-related visual transitions. Button press offset lasts 100ms. The spinner uses a continuous 700ms rotation only while loading. Motion must be interruptible; `prefers-reduced-motion: reduce` reduces animation and transition durations to `0.01ms` and disables smooth scrolling.

---

## 6. UI States

Every relevant screen must handle:

```txt
loading: EmberButton spinner, disabled while loading
empty: documentation search empty message; product empty patterns are not delivered
error: field border, inline message, aria-invalid, and preserved input
success: inline role=status feedback in EmberContactForm and Select preview
disabled: reduced opacity and no pointer action for Button and Select options
```

Rules:

* Skeleton for known content structure.
* Spinner for short actions.
* Preserve user input after errors.
* Do not use toast for field validation.
* Hover, focus, active, selected, disabled, invalid, and loading states must retain the same semantic color roles and geometry.

---

## 7. UX Writing

Style:

`Concise, professional, technical, and concrete`

Rules:

* Sentence case for actions and explanatory copy; uppercase is a visual treatment for telemetry labels only.
* Prefer specific verbs.
* Avoid vague labels like `OK` and bare `Submit`.
* Do not invent performance, conversion, customer, or product claims.
* Keep sample screens honest about local-only behavior.
* Runtime copy lives in component source files under `src/components/custom`, component metadata in `custom-components.json`, and gallery chrome in `src/review-copy.ts`.

Examples:

```txt
Explore components
View design rules
Confirm channel
Enter a complete email address.
Demo submitted. No message was sent.
```

---

## 8. Accessibility

* Keyboard accessible.
* Visible focus state.
* Semantic HTML.
* Accessible labels for icon buttons.
* Do not rely on color alone.
* Respect reduced motion.

Target size:

`44x44 CSS px minimum for visible Mobile interactive targets`

Standard:

`WCAG 2.2 AA target; not a claim of full conformance`

### Accessibility evidence

All pairs in `contrast-report.json` pass their configured threshold. Key text pairs exceed 4.5:1; ring and input boundary pairs exceed 3:1. Browser checks covered semantic labels, visible focus behavior, Mobile target size, Select keyboard interaction, disabled options, focus return, and inline form feedback.

### Verification and limitations

- `agent-browser` verified the gallery and all nine detail views at 1440x900, 390x844, and 360x800.
- No page or preview canvas overflow remained; the English Hero title was measured for clipping at both Mobile widths.
- Select was exercised with pointer, Arrow keys, Home, End, Enter, Escape, disabled options, and focus return.
- The component gallery and Header Mobile navigation were opened and closed in the browser.
- The production TypeScript and Vite build passed.
- Automated contrast, browser interaction, and source review do not constitute a full manual screen-reader audit.

---

## 9. Implementation

```txt
Framework: React 19 + TypeScript + Vite 6
Styling: Tailwind CSS 4 foundation, semantic CSS variables, authored component CSS
Component library: Native semantic React Marketing components
Icon library: lucide-react plus OrbitMark

UI components: src/components/custom
Shared components: src/components/custom
Domain components: Not applicable; this is a standalone component system
Design tokens: tokens.json
Generated token CSS: src/index.css
```

### Usage

```txt
Working directory: design-system
Start or install: npm install; npm run dev
Global styles: src/main.tsx imports src/index.css once; each delivered component imports src/components/custom/system.css
Root providers: none
Public imports: @/components/custom/<component> inside this Vite app, or relative paths after copying source
Gallery or docs: npm run dev and open http://127.0.0.1:5173/; npm run preview serves dist after npm run build
```

The development port may move when 5173 is occupied; use the URL printed by Vite. The gallery uses the `@` alias configured in `vite.config.ts`. No install step is needed to use components inside this generated app.

Before creating a component:

1. Search existing components.
2. Reuse if possible.
3. Extend if appropriate.
4. Create new only when necessary.

Avoid:

```txt
arbitrary colors
arbitrary spacing
arbitrary font sizes
arbitrary radius
arbitrary shadows
duplicate components
```

### Build and distribution

Run `npm run build` from `design-system`. For a compatible external React project, copy the source closure described in `source-snapshot.json`, install `lucide-react` and the three Fontsource packages listed in `package.json`, load the target project's token foundation once, and preserve the component CSS imports. Do not install shadcn; this Marketing system does not use it.

---

## 10. AI Rules

Do not:

* Redesign unrelated UI.
* Invent product requirements.
* Add unnecessary gradients.
* Add decorative animations.
* Add excessive shadows.
* Add unnecessary icons.
* Create new patterns when an existing one works.
* Create one-off components without reason.
* Reintroduce non-English runtime or documentation copy without explicit approval.
* Register `IntegratedPreview` as a reusable component.

When uncertain:

1. Follow this file.
2. Follow existing components.
3. Follow the nearest existing screen.
4. Use standard UI conventions.

---

## 11. Reference Screens

```txt
App shell: src/App.tsx
List page: src/App.tsx (Overview and component directory)
Detail page: src/App.tsx
Form page: src/components/custom/input-form.preview.tsx
Settings: Not applicable; no settings screen is in scope
```

The canonical integrated Marketing composition is `src/IntegratedPreview.tsx`. It imports delivered components and appears before the component directory on the overview route.

Match these when this file does not specify a detail.

---

## 12. Canonical Components

```txt
Button: src/components/custom/button.tsx
Input: src/components/custom/input-form.tsx
Select: src/components/custom/select.tsx
Dialog: Not applicable; outside the Marketing core inventory
Table: Not applicable; outside the Marketing core inventory
Tabs: Not applicable; outside the Marketing core inventory
Toast: Not applicable; outside the Marketing core inventory
```

Additional canonical families:

```txt
Header: src/components/custom/header.tsx
Hero: src/components/custom/hero.tsx
Section: src/components/custom/section.tsx
Card: src/components/custom/card.tsx
Footer: src/components/custom/footer.tsx
Icon: src/components/custom/icon.tsx
Shared visual rules: src/components/custom/system.css
```

Prefer these over creating local replacements.

---

## 13. Project-Specific Rules

```txt
- Keep the canvas near-black and use thin amber borders; do not brighten all surfaces.
- Reserve primary orange for action, active state, selection, or the central focal object.
- Keep support telemetry compact and subordinate to the primary narrative.
- Use 2px geometry for controls and surfaces; reserve circles for orbital, status, loading, and icon-action roles.
- Keep all preview, metadata, accessible-label, and documentation copy in English.
- Preserve a 44px Mobile hit area and verify 360px and 390px layouts after copy changes.
```

### Reference-derived implementation map

| Reference relationship | Implementation |
| --- | --- |
| Near-black void | `--background`, `--card`, and low-opacity line grid |
| Amber telemetry | `--accent`, `--secondary-foreground`, IBM Plex Mono labels |
| Ember action emphasis | `--primary`, primary Button, active Card status |
| Central orbit | `OrbitVisual` inside `EmberHero` |
| Dense edge data | Desktop `.eo-hero-telemetry` columns |
| Straight frames versus circles | 2px surfaces; circular mark, nodes, status, spinner, and icon-only actions |

### Source snapshot

`source-snapshot.json` is the canonical portable-source manifest for the nine custom families. `custom-components.json` records their titles, descriptions, delivery files, preview modules, and dependencies. The approved token hash is `3ad80480ab49b96e858e0d05573c77525ff1c63da752ef7128387b8b2449f6db`.

Portable implementation files are the delivered `.tsx` modules in `src/components/custom`, `src/components/custom/system.css`, `src/index.css` or an equivalent token foundation, `tokens.json`, and the dependencies in `package.json`. Do not copy `*.preview.tsx`, `src/App.tsx`, `src/FullGallery.tsx`, `src/IntegratedPreview.tsx`, `src/gallery.css`, `.tmp`, `dist`, or `node_modules` into a product solely to reuse components.

### Decisions

- Accepted: one dark mode matching the reference; a second color mode was not requested.
- Accepted: Marketing scope with Button, Header, Hero, Section, Card, Footer, Input/Form, Select, and Icon families.
- Accepted: English-only runtime previews, accessible labels, metadata, and documentation. This supersedes the earlier localized draft without changing its visual direction.
- Derived from the reference: sparse orange action emphasis, amber information hierarchy, 2px surfaces, Rajdhani display type, Inter body type, IBM Plex Mono telemetry, and restrained 180ms motion.
- Adapted for Web accessibility: a 44px minimum Mobile target, responsive removal of side telemetry, reduced-motion overrides, and a keyboard-operable Select popup.

See `design-notes.md` for the durable visual translation and scope exceptions.

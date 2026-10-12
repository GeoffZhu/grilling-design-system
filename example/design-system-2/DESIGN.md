# DESIGN.md

## 1. Design Direction

Product type:

`SaaS administration application with a brand-led marketing homepage`

Style:

* Deep navy application canvas
* Warm gold focal actions
* Precise administrative structure
* Organic brand geometry in marketing regions

Principles:

1. Use the deep blue field as the stable product environment and reserve warm gold for the most important action or status.
2. Keep administration surfaces precise, bordered, and information-led; use flowing shapes only in marketing and brand moments.
3. Reuse the same semantic tokens, typography, and interaction states across the marketing homepage and the authenticated workspace.

### Source and status

Name: Starry Current Workbench

Status: Approved

Mode: Dark only

The reference establishes a large dark-blue field with a small warm focal area. The delivered direction translates that relationship into a marketing Key Visual and a structured SaaS workspace without copying the reference content. Marketing regions may use directional curves and orbit-like decoration; administration regions use a sidebar, restrained borders, and aligned data surfaces.

---

## 2. Design Tokens

### Colors

```txt
background: var(--background) = #071532
surface: var(--card) = #0D2250
border: var(--border) = #385A93

text-primary: var(--foreground) = #F4F0D8
text-secondary: var(--muted-foreground) = #AFC2E8
text-muted: var(--muted-foreground) = #AFC2E8

primary: var(--primary) = #E5C94A
primary-hover: var(--primary) at 85% opacity

success: var(--success) = #8FCFAD
warning: var(--warning) = #F2C66D
error: var(--destructive) = #FF7B7B
```

Rules:

* Use semantic tokens.
* No arbitrary colors.

### Complete semantic color map

| Token | Value |
| --- | --- |
| `--background` | `#071532` |
| `--foreground` | `#F4F0D8` |
| `--card` | `#0D2250` |
| `--card-foreground` | `#F4F0D8` |
| `--popover` | `#132B5F` |
| `--popover-foreground` | `#F4F0D8` |
| `--primary` | `#E5C94A` |
| `--primary-foreground` | `#10204A` |
| `--secondary` | `#17366F` |
| `--secondary-foreground` | `#F4F0D8` |
| `--muted` | `#10275A` |
| `--muted-foreground` | `#AFC2E8` |
| `--accent` | `#79B7C9` |
| `--accent-foreground` | `#071532` |
| `--destructive` | `#FF7B7B` |
| `--border` | `#385A93` |
| `--input` | `#4E70A8` |
| `--ring` | `#F2D665` |
| `--chart-1` | `#E5C94A` |
| `--chart-2` | `#79B7C9` |
| `--chart-3` | `#8297E3` |
| `--chart-4` | `#B4DFA3` |
| `--chart-5` | `#F49B73` |
| `--sidebar` | `#050D24` |
| `--sidebar-foreground` | `#F4F0D8` |
| `--sidebar-primary` | `#E5C94A` |
| `--sidebar-primary-foreground` | `#10204A` |
| `--sidebar-accent` | `#10275A` |
| `--sidebar-accent-foreground` | `#F4F0D8` |
| `--sidebar-border` | `#263F72` |
| `--sidebar-ring` | `#F2D665` |
| `--success` | `#8FCFAD` |
| `--warning` | `#F2C66D` |
| `--info` | `#8BC7E6` |

### Typography

```txt
font-family: 'Noto Sans SC Variable', 'Noto Sans SC', system-ui, sans-serif
heading-family: 'Noto Serif SC Variable', 'Noto Serif SC', serif

page-title: 38–64px responsive; weight 700; line-height 1.08; tracking -0.025em
section-title: 24–32px; weight 700; line-height 1.08; tracking -0.025em
body: 16px; line-height 1.65; var(--font-sans)
small: 12–14px; role-dependent line-height
label: 14px; weight 600
```

Rules:

* Use defined typography only.
* No arbitrary font sizes.

### Spacing

```txt
Base unit: 4px
Allowed: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
Component exceptions: 2 / 6 / 10 / 18 / 20 / 28 / 40 / 56 / 72 / 88, only where already defined in source

Card padding: 20px
Form gap: 12–16px
Section gap: 48–64px
Page padding: 20px Mobile; 40–88px Desktop
```

Rules:

* No arbitrary spacing.
* Reuse the core scale first; component exceptions are fixed implementation values, not a license for one-off spacing.

### Radius

```txt
sm: 9.6px; var(--radius-sm)
md: 12.8px; var(--radius-md)
lg: 16px; var(--radius-lg)
surface: 20px; var(--surface-radius)
overlay: 24px; var(--overlay-radius)
full: 9999px; pill or circle only
```

### Icons

```txt
Library: Lucide rounded outline
Sizes: 20px default; 16px compact; 18px supporting; stroke 1.75
```

Rules:

* Use one icon library.
* No emoji as UI icons.
* Decorative brand marks may use CSS geometry but must not replace functional icons.

### Depth and motion tokens

```txt
control height: 46px
action shadow: 0 8px 24px #02081666
data shadow: 0 12px 34px #02081633
overlay shadow: 0 28px 70px #02081680
feedback shadow: 0 16px 38px #02081655
transition: 160ms cubic-bezier(0.22, 1, 0.36, 1)
reduced motion: 0.01ms with smooth scrolling disabled
```

---

## 3. Layout

```txt
Max content width: 1600px application shell; 1120px documentation content
Page padding: 20px Mobile; 40px Tablet; clamp(32px, 6vw, 88px) Desktop
Sidebar width: 260px documentation; 210px integrated workspace
Form max width: 640px for focused forms
```

Breakpoints:

```txt
mobile: below 760px
tablet: 760–1099px
desktop: 1100px and above
```

Responsive rules:

```txt
Sidebar:
Desktop -> sticky left rail with searchable component navigation
Mobile -> hidden rail replaced by an accessible navigation drawer

Grid:
Desktop -> three-column directory and three-column workspace metrics
Tablet -> two-column directory and reduced workspace density
Mobile -> one column; toolbar, actions, cards, and marketing copy stack vertically

Table:
Mobile -> preserve readable type and use local horizontal scrolling or a purpose-built stacked view
```

The homepage Key Visual reflows from a split marketing composition into a single-column sequence. The integrated workspace keeps content hierarchy and touch targets while hiding its decorative sidebar at narrow widths. Component examples respond to their preview container and must never force document-level horizontal overflow.

---

## 4. Components

### Button

```txt
Variants:
default (design role: primary)
secondary
outline
ghost
destructive
link

Sizes:
xs
sm
default (design role: md)
lg
icon / icon-xs / icon-sm / icon-lg
```

Rules:

* One primary action per action group.
* No custom button colors.
* Primary buttons use the warm focal color; lower-priority actions use secondary, outline, ghost, or link treatment.

### Input

Rules:

* Always use a visible label.
* Placeholder is not a label.
* Show validation near the field.
* Use the 46px default control height, semantic input border, and ring token.

### Select

Rules:

* Select: short option lists.
* Theme both the Select trigger and option popup, including focus, selected and disabled options.
* `Select` is the Base UI root and supports controlled `value`, uncontrolled `defaultValue`, `onValueChange`, `name`, `required`, and reset behavior from the underlying primitive.
* Keyboard behavior is provided by Base UI: arrow navigation, selection, Escape dismissal, and focus restoration.
* Use `NativeSelect` only when the platform picker is intentionally preferred; its popup appearance is platform-controlled.
* Combobox: long or searchable lists.
* Radio: small visible choices.
* Switch: immediate on/off state.

### Card

Rules:

* Use only for meaningful grouping.
* Avoid nested cards.
* Use the 20px surface radius and data-display shadow for primary grouped content; lighter list items may omit the shadow.

### Modal

Use for:

`Focused decisions, short forms, confirmations, and destructive actions that must interrupt the current task.`

Rules:

* Keep tasks focused.
* Clearly explain destructive actions.
* Modal maps to `Dialog`; use `AlertDialog` when explicit confirmation is required.

### Drawer

Use for:

`Mobile navigation, supporting controls, and narrow-screen tasks that should preserve the current page context.`

### Tabs

Use for:

`Peer views within the same local context, such as activity, configuration, and members.`

Rules:

* Peer views only.
* Not for global navigation.

### Table

Rules:

* Text left aligned.
* Numbers right aligned.
* Actions right aligned.
* Support empty state.
* Keep wide tables in a local scroll container on Mobile.

### Marketing components

* `MarketingButton` accepts native button props plus `variant`, `size`, `loading`, `leadingIcon`, and `trailingIcon`; `MarketingLinkButton` provides the same visual variants for links.
* `MarketingHeader` accepts brand, home link, navigation items, and workspace action props. It converts navigation to an accessible expandable menu on Mobile.
* `MarketingHero` accepts eyebrow, title, description, primary and secondary links, and an optional visual node. Actions stack on narrow screens.
* `MarketingSection` accepts heading content, `tone`, children, and an optional anchor id. It owns page-width and vertical rhythm.
* `MarketingCard` accepts content, optional value and action, and `feature`, `project`, or `pricing` variants. `MarketingCardGrid` owns responsive grouping.
* `MarketingFooter` accepts brand context and grouped links; navigation groups remain semantic and wrap on narrow screens.
* `MarketingInput`, `MarketingForm`, and `MarketingNewsletterForm` provide labels, hints, errors, native form props, and an honest demonstration status.
* `MarketingSelect` accepts label, options, controlled or uncontrolled value, `onValueChange`, `name`, required, disabled, and error props. Its Base UI popup includes highlighted, selected, and disabled states.
* `MarketingIcon` accepts a Lucide icon, optional accessible label, and tone. `MarketingStarMark` is decorative only.

### Public API mapping

Preserve the shadcn component APIs in `src/components/ui`. The primary design role maps to `Button variant="default"`; medium size maps to `size="default"`. Modal maps to `Dialog`. Toast notifications map to `sonner.tsx`; the Base UI toast host remains available through `toast.tsx`. Custom marketing components use their explicit exports from `src/components/custom` and are not shadcn variants.

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

Marketing pages may begin with brand context and a Key Visual before product proof. Authenticated workspace pages use the standard title-and-actions sequence.

### Forms

```txt
Layout: single column by default; group only closely related short fields
Validation: inline beside the affected field with aria-invalid and aria-describedby
Save behavior: keep the action visible, disable duplicate submission, and show progress on the initiating control
Unsaved changes: preserve entered values after recoverable errors; prompt before abandoning material edits
```

Rules:

* Prefer single-column forms.
* Group related fields.

### Search

```txt
Trigger: update local component filtering as the user types
Debounce: none for the in-memory documentation index; use 200–300ms for remote product queries
No-result behavior: show a clear empty message and retain the query
```

### Filters

Rules:

* Show active filters.
* Provide reset when needed.

### Destructive Actions

Rules:

* State exactly what will be deleted.
* State whether it is reversible.
* Avoid vague "Are you sure?" copy.

### Motion

* Use the 160ms motion token for hover, focus, selection, popup, dialog, sheet, and drawer transitions.
* Entering overlays fade in while the content uses its primitive-defined transform; exiting reverses the same relationship.
* State changes must be interruptible and must not delay input.
* Loading spinners communicate active work, not decoration.
* Reduced-motion mode shortens transitions and animations to 0.01ms and disables smooth scrolling.

---

## 6. UI States

Every relevant screen must handle:

```txt
loading
empty
error
success
disabled
```

Rules:

* Skeleton for known content structure.
* Spinner for short actions.
* Preserve user input after errors.
* Do not use toast for field validation.
* Use semantic tokens, text, icons, or shape together so status never depends on color alone.
* Keep disabled controls legible and non-interactive; do not use disabled styling to represent read-only content.

---

## 7. UX Writing

Style:

`Concise, professional, direct, and lightly optimistic.`

Rules:

* Sentence case.
* Prefer specific verbs.
* Avoid vague labels like `OK` and `Submit`.
* Keep navigation labels short and stable.
* Put field errors directly below the field; put page-level failures near the affected content.
* Mark illustrative content honestly and never imply that a demo action changed production data.

Examples:

```txt
Create project
Save changes
Delete workspace
Send invite
Enter workspace
No components found
Demo submission recorded. No real subscription was sent.
```

The documentation UI, component examples, registry metadata, and accessible labels use English only.

---

## 8. Accessibility

* Keyboard accessible.
* Visible focus state.
* Semantic HTML.
* Accessible labels for icon buttons.
* Do not rely on color alone.
* Respect reduced motion.

Target size:

`44x44 CSS px minimum for primary touch targets; compact desktop controls retain an accessible surrounding hit area where applicable.`

Standard:

`WCAG 2.2 AA target; this is not a claim of full compliance.`

### Accessibility evidence

Token contrast results cover only the listed color pairs. Rendered states, labels, focus order, keyboard operation, and responsive layout require separate verification.

| Mode | Pair | Ratio | Minimum | Result |
| --- | --- | ---: | ---: | --- |
| dark | foreground/background | 15.75 | 4.5 | Pass |
| dark | card-foreground/card | 13.44 | 4.5 | Pass |
| dark | primary-foreground/primary | 9.63 | 4.5 | Pass |
| dark | secondary-foreground/secondary | 10.20 | 4.5 | Pass |
| dark | muted-foreground/muted | 8.02 | 4.5 | Pass |
| dark | accent-foreground/accent | 8.11 | 4.5 | Pass |
| dark | popover-foreground/popover | 11.90 | 4.5 | Pass |
| dark | destructive/background | 7.20 | 4.5 | Pass |
| dark | sidebar-foreground/sidebar | 16.80 | 4.5 | Pass |
| dark | sidebar-primary-foreground/sidebar-primary | 9.63 | 4.5 | Pass |
| dark | sidebar-accent-foreground/sidebar-accent | 12.54 | 4.5 | Pass |
| dark | ring/background | 12.55 | 3.0 | Pass |
| dark | input/background | 3.62 | 3.0 | Pass |

### Verification and limitations

* The final gallery build completed successfully under Studio verification with build id `build-81af26fdb457ff53`; the approved presentation remains recorded as `build-714673e1ee8ddd91`.
* All 71 component pages were checked at 1440px and 390px with no visible CJK text, document overflow, or preview-canvas overflow.
* Select keyboard operation, Dialog dismissal and focus return, form feedback, and Toast announcements were exercised in the final English preview.
* The semantic contrast report passes every required pair listed above.
* The aggregate registry installed 81 files into a clean React 19, Vite, and Tailwind CSS 4 consumer; representative official and custom components then passed a production build and browser interaction check.
* Automated and targeted manual checks do not establish complete WCAG conformance; production teams must test real product content, assistive technology, zoom, and end-to-end task flows.

---

## 9. Implementation

```txt
Framework: React 19 + TypeScript + Vite
Styling: Tailwind CSS 4 + semantic CSS variables
Component library: shadcn source components on Base UI primitives
Icon library: Lucide rounded outline

UI components:
src/components/ui

Shared components:
src/components

Domain components:
src/components/custom

Design tokens:
tokens.json
```

### Usage

```txt
Working directory: design-system-2
Start or install: npm install; npm run dev
Global styles: src/main.tsx imports src/index.css and src/theme-overrides.css once
Root providers: TooltipProvider; one Sonner Toaster; one Base UI Toaster when Base toast APIs are used
Public imports: @/components/ui/<component> and @/components/custom/<component>
Gallery or docs: npm run dev; open the root route
```

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

Run `npm install`, `npm run dev`, and `npm run build` from `design-system-2`. The gallery already imports global styles and providers through `src/main.tsx`.

For a compatible React 19, Vite, and Tailwind CSS 4 consumer, serve this project and install the aggregate registry from `/r/all.json` with shadcn 4.21.0. The aggregate registry installs the UI and custom sources, the `cn` utility dependency, required packages, fonts, and `src/starry-current.css`. In the consumer entry, import the host stylesheet first and then import `./starry-current.css` exactly once so this theme wins the cascade. Keep `SHADCN-LICENSE.txt` and `shadcn-snapshot.json` when redistributing upstream-derived source.

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
* Move organic marketing geometry into dense administration screens.
* Translate the delivered English documentation or sample UI unless a later request explicitly changes the product language.

When uncertain:

1. Follow this file.
2. Follow existing components.
3. Follow the nearest existing screen.
4. Use standard UI conventions.

---

## 11. Reference Screens

```txt
App shell:
src/App.tsx

List page:
src/App.tsx

Detail page:
src/App.tsx

Form page:
src/examples/field-example.tsx

Settings:
Not applicable: the delivery is a component documentation application, not a product settings implementation.
```

The root view in `src/App.tsx` is the canonical documentation list and integrated Key Visual. Its `?component=<name>` state is the canonical component detail view. `src/IntegratedPreview.tsx` is a documentation-only composition that demonstrates the marketing-to-workspace transition and is not a reusable business component.

---

## 12. Canonical Components

```txt
Button: src/components/ui/button.tsx

Input: src/components/ui/input.tsx

Select: src/components/ui/select.tsx

Dialog: src/components/ui/dialog.tsx

Table: src/components/ui/table.tsx

Tabs: src/components/ui/tabs.tsx

Toast: src/components/ui/sonner.tsx
```

Prefer these over creating local replacements. Use `src/components/ui/toast.tsx` only for the Base UI toast API; do not mount duplicate hosts for the same toast system.

---

## 13. Project-Specific Rules

```txt
- Keep the deep navy canvas dominant and reserve warm gold for a small number of focal actions, active metrics, and brand marks.
- Use exact borders, aligned grids, and restrained depth in administration surfaces; use orbit lines and organic curves only in marketing regions.
- Keep the marketing homepage and SaaS workspace visually related through semantic tokens, typography, icon stroke, and motion rather than identical layout.
- Use English for every visible documentation string, example, registry title, status, error, and accessible label.
- Keep the documentation Key Visual before the component directory and do not register it as a reusable component.
- Preserve the approved token hash unless a future visual revision is explicitly approved.
```

### Reference translation

The reference image supplies relationships rather than product content. Its dark field maps to `--background` and `--sidebar`; its small warm focus maps to `--primary`; cool supporting structure maps to `--accent`, `--secondary`, borders, and chart colors. Directional reference texture becomes restrained orbit geometry in marketing only. The management UI intentionally replaces organic composition with stable navigation, cards, lists, fields, and overlays so operational content remains readable.

Actual mappings live in `src/index.css`, `src/theme-overrides.css`, `src/components/custom/marketing.css`, and `src/IntegratedPreview.tsx`. Durable decision history and maintenance guidance live in `design-notes.md`.

### Decision summary

* Accepted: a dark-only system with deep blue dominance, warm gold focal actions, serif display headings, sans-serif interface text, 10px controls, 20px surfaces, and 24px overlays.
* Accepted: a brand-led marketing homepage Key Visual paired with a precise authenticated workspace.
* Accepted: complete English UI and documentation for Desktop and Mobile Web.
* Ruled out: applying flowing marketing geometry to dense administration components because it weakens scanning and boundary clarity.
* Superseded: an earlier localized documentation pass was replaced by the approved English-only presentation; visual tokens and component geometry did not change.

### Assets and content

No approved production brand imagery was provided. The orbit artwork is CSS-based and illustrative. Sample names, metrics, projects, prices, links, and form outcomes are demonstration content and must be replaced with approved product content before production release. Do not claim conversion or performance improvements from this presentation.

### Source snapshot

Source: `https://github.com/shadcn-ui/ui` at commit `a87a63b2ca25143d26c8bd0903e4e9bc77b3f824`, fetched 2026-10-12 from the Base UI registry layer.

Snapshot: `shadcn-snapshot.json`

License: `SHADCN-LICENSE.txt`

Inventory: 62 official UI components plus 9 custom marketing components, 71 total.

Token hash: `410218678f58e801d19c3b11a3fa4a4d379a0995797c2b7d436aaa560a7e5a5b`.

### Maintenance

Read this file, `design-notes.md`, `tokens.json`, `shadcn-snapshot.json`, and the relevant source before changing the system. Update source, registry artifacts, examples, and documentation together. Re-run the production build, contrast report, Desktop and Mobile overflow checks, interaction checks, English-only scan, and clean-consumer registry installation after any material change.

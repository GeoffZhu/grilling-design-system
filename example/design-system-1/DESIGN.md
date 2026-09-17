# DESIGN.md

## 1. Design Direction

Product type:

`生态教育与课程运营组件库`

Style:

* `自然、克制`
* `编辑感标题`
* `宽松信息密度`
* `柔和数据表达`

Principles:

1. `内容优先，装饰退后`
2. `苔藓绿表达操作，近黑绿只作文字与品牌焦点`
3. `大表面、普通卡、控件和标签使用不同圆角层级`

### Source and status

Name: 植物主调

Status: Approved by user on 2026-09-17

Mode: light only

参考图的奶白排期面板、鼠尾草数据面板和近黑品牌卡构成主要层级。用户选择 B：苔藓绿承担主操作和选中态，近黑绿仅用于文字与特殊品牌面板。

---

## 2. Design Tokens

### Colors

```txt
background: var(--background) = #CED0C3
surface: var(--card) = #FAFAF6
border: var(--border) = #D9DCCF

text-primary: var(--foreground) = #192315
text-secondary: var(--secondary-foreground) = #304329
text-muted: var(--muted-foreground) = #66715E

primary: var(--primary) = #516B3D
primary-hover: color-mix(in srgb, var(--primary) 90%, transparent)

success: var(--chart-2) = #7F9A67
warning: var(--chart-4) = #AFC396 with text-primary label
error: var(--destructive) = #8E332B
```

Rules:

* Use semantic tokens.
* No arbitrary colors.

### Typography

```txt
font-family: Manrope Variable; Noto Sans SC fallback

page-title: Fraunces Variable / Noto Serif SC; 48–64px; 700; line-height 1.02; tracking -0.035em
section-title: Fraunces Variable / Noto Serif SC; 24–36px; 700; line-height 1.08
body: Manrope Variable / Noto Sans SC; 16px; 400–500; line-height 1.55
small: Manrope Variable / Noto Sans SC; 12–13px; 400–600; line-height 1.45
label: Manrope Variable / Noto Sans SC; 14px; 600; line-height 1.4
```

Rules:

* Use defined typography only.
* No arbitrary font sizes.

Fraunces 与 Manrope 通过 Fontsource 安装。两者均为 SIL Open Font License 授权。中文使用系统可用的 Noto Serif SC 与 Noto Sans SC 回退。

### Spacing

```txt
Allowed: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

Card padding: 24 / 32 / 48
Form gap: 8 label-to-field; 16 field-to-field
Section gap: 24 compact; 48 standard; 64 page section
Page padding: 24 desktop; 12 mobile for the dashboard; 20 mobile for documentation
```

Rules:

* No arbitrary spacing.

### Radius

```txt
sm: 14px; controls
md: 24px; mobile rows and overlays
lg: 32–36px; content cards
full: 9999px; tags, tabs, chart bars and desktop schedule rows
```

The reference-led workshop shell is the single 44px exception.

### Icons

```txt
Library: Lucide
Sizes: 16px compact; 20px default; 24px prominent
```

Rules:

* Use one icon library.
* No emoji as UI icons.
* Use 1.75px rounded strokes and align icons to the text baseline.

### Complete semantic color map

| Token | Value | Role |
| --- | --- | --- |
| --background | #CED0C3 | warm page canvas |
| --foreground | #192315 | primary text |
| --card | #FAFAF6 | primary content surface |
| --card-foreground | #192315 | card text |
| --popover | #FFFFFF | raised overlay |
| --popover-foreground | #192315 | overlay text |
| --primary | #516B3D | primary action and selected state |
| --primary-foreground | #FFFFFF | text on primary |
| --secondary | #E9EDDF | secondary action surface |
| --secondary-foreground | #304329 | secondary text |
| --muted | #F0F2E9 | quiet rows and fields |
| --muted-foreground | #66715E | supporting copy |
| --accent | #9DB386 | data panel |
| --accent-foreground | #192315 | text on accent |
| --destructive | #8E332B | destructive and invalid state |
| --border | #D9DCCF | structural separators |
| --input | #69705F | essential field boundary |
| --ring | #516B3D | keyboard focus |
| --chart-1…5 | #516B3D / #7F9A67 / #192315 / #AFC396 / #D7E1C8 | chart series |
| --sidebar | #F5F6F0 | documentation navigation |
| --sidebar-primary | #516B3D | active navigation |

Component-specific named values live in `src/components/custom/organic-components.css`: `--organic-white`, four quiet avatar tones, `--organic-chart-bar`, `--organic-brand`, and `--organic-brand-mark`. Do not reuse `--organic-brand` as a routine card background.

### Motion and depth

```txt
duration: 160ms
easing: cubic-bezier(0.22, 1, 0.36, 1)
surface shadow: 0 18px 48px rgba(25, 35, 21, 0.14)
```

Animate hover, selection and overlay transitions only. Disable nonessential motion under `prefers-reduced-motion`.

---

## 3. Layout

```txt
Max content width: 1600px documentation; fluid dashboard
Page padding: 24px desktop; 12px mobile dashboard
Sidebar width: 260px
Form max width: 448px
```

Breakpoints:

```txt
mobile: below 560px
tablet: 560–899px
desktop: 900px and above
```

Responsive rules:

```txt
Sidebar:
Desktop -> persistent searchable 260px sidebar
Mobile -> modal drawer opened from a 44px menu control

Grid:
Desktop -> full-width schedule above a 1.15fr / 0.85fr feature grid
Tablet -> single-column feature cards; schedule rows become information cards
Mobile -> single column; 12px outer gap; preserve readable type and touch targets

Table:
Mobile -> hide column headers and expose field labels inside each schedule card
```

---

## 4. Components

### Button

```txt
Variants:
primary -> variant="default"
secondary -> variant="secondary"
ghost -> variant="ghost"
destructive -> variant="destructive"

Sizes:
sm -> size="sm"
md -> size="default"
lg -> size="lg"
```

Rules:

* One primary action per action group.
* No custom button colors.

### Input

Rules:

* Always use a visible label.
* Placeholder is not a label.
* Show validation near the field.
* Default height is 46px with a 14px radius.

### Select

Rules:

* Select: short option lists.
* Combobox: long/searchable lists.
* Radio: small visible choices.
* Switch: immediate on/off state.

### Card

Rules:

* Use only for meaningful grouping.
* Avoid nested cards.
* Reserve the near-black surface for `BrandFocusCard`; routine cards use `card`, `muted`, or `accent`.

### Modal

Use for:

`Focused review, confirmation, or editing that must interrupt the current view.`

Rules:

* Keep tasks focused.
* Clearly explain destructive actions.

### Drawer

Use for:

`Mobile component navigation and secondary tasks that benefit from preserved page context.`

### Tabs

Use for:

`Peer views such as 7-day and 30-day data ranges or account sections.`

Rules:

* Peer views only.
* Not for global navigation.

### Table

Rules:

* Text left aligned.
* Numbers right aligned.
* Actions right aligned.
* Support empty state.
* Convert wide schedules to labeled information cards on Mobile.

### Custom components

* `WorkshopSchedule`: responsive course list with instructor, level, date, time and row action.
* `EngagementChart`: 7/30-day segmented range and accessible text-equivalent bar chart.
* `BrandFocusCard`: near-black editorial focal surface with two icon actions.
* `EcosystemDashboard`: integrated reference composition and Dialog interaction.

All standard components preserve shadcn/ui public APIs. Modal maps to `Dialog`; Toast maps to `Sonner`.

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

### Forms

```txt
Layout: one column by default; group only closely related short fields
Validation: inline beside or below the field, using text and destructive styling
Save behavior: primary button changes to a stable-width loading state, then a success message
Unsaved changes: preserve input after errors; use a focused confirmation before destructive navigation
```

Rules:

* Prefer single-column forms.
* Group related fields.

### Search

```txt
Trigger: type in the visible component search field
Debounce: immediate for the local component directory; 200ms for remote data
No-result behavior: show “未找到组件。” in the current context
```

### Filters

Rules:

* Show active filters.
* Provide reset when needed.
* Use pill segments only for short peer ranges such as 7天 / 30天.

### Destructive Actions

Rules:

* State exactly what will be deleted.
* State whether it is reversible.
* Avoid vague "Are you sure?" copy.

---

## 6. UI States

Every relevant screen must handle:

```txt
loading: preserve control width and use Spinner for short actions
empty: show a clear explanation and one next action
error: pair destructive color with specific repair text
success: use a confirmation message or Sonner for global feedback
disabled: reduce opacity while retaining labels and context
```

Rules:

* Skeleton for known content structure.
* Spinner for short actions.
* Preserve user input after errors.
* Do not use toast for field validation.
* Selected states combine fill, text, border, or `aria-pressed`; never use color alone.

---

## 7. UX Writing

Style:

`简练、专业、友好`

Rules:

* Sentence case.
* Prefer specific verbs.
* Avoid vague labels like `OK` and `Submit`.
* Product examples and accessible labels use Chinese; component names and code identifiers remain English.

Examples:

```txt
安排课程
保存更改
删除工作区
发送邀请
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

`Primary touch targets are at least 44×44 CSS px.`

Standard:

`WCAG 2.2 AA target; verification is scoped to the checks recorded below.`

### Evidence

Token contrast checks passed: foreground/background 10.39:1, card text/card 15.53:1, primary text/primary 5.97:1, muted text/muted 4.54:1, focus ring/background 3.82:1, and input boundary/background 3.29:1.

`agent-browser` checks covered 1440×900, 390×844, and 360×800 layouts; 7/30-day selection; Dialog open, Escape close, and focus return; visible keyboard focus; accessible labels; and browser console errors. No automated screen-reader announcement test or physical-device touch test was run.

---

## 9. Implementation

```txt
Framework: React 19 + TypeScript + Vite 6
Styling: Tailwind CSS 4 + semantic CSS variables
Component library: shadcn/ui new-york-v4 snapshot
Icon library: Lucide

UI components: src/components/ui

Shared components: Not applicable; this standalone library separates standard and domain components.

Domain components: src/components/custom

Design tokens: tokens.json and src/index.css
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

Run `npm install`, `npm run dev`, and `npm run build`. Import `src/index.css` once. The installable aggregate registry is `public/r/all.json`; individual custom registry items are under `public/r/`. Font packages are listed in `package.json`.

Mount singleton UI hosts once at the application root. This application renders `Toaster` beside `App` inside `TooltipProvider`; calling `toast()` without that host does not produce visible feedback.

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

When uncertain:

1. Follow this file.
2. Follow existing components.
3. Follow the nearest existing screen.
4. Use standard UI conventions.

---

## 11. Reference Screens

```txt
App shell: src/App.tsx

List page: src/components/custom/workshop-schedule.tsx

Detail page: src/App.tsx?component=ecosystem-dashboard

Form page: Not applicable; form patterns are demonstrated in component detail previews.

Settings: Not applicable; the library has no product settings route.
```

Match these when this file does not specify a detail.

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

Prefer these over creating local replacements.

---

## 13. Project-Specific Rules

```txt
- Use warm gray only as the page canvas; place readable content on cream, white, sage, or near-black surfaces.
- Use moss green for primary actions and selected data; reserve near-black green for primary text and special brand panels.
- Preserve the desktop schedule / two-card composition and the Mobile stacked information-card adaptation.
```

### Source snapshot

Source: `https://ui.shadcn.com/r/styles/new-york-v4/registry.json`; fetched 2026-09-17. The snapshot contains 61 official `registry:ui` components, 88 examples, and 4 custom components. Exact names and hashes are recorded in `shadcn-snapshot.json`. The shadcn source license is preserved in `SHADCN-LICENSE.txt`.

### Decisions

* User-selected: B “植物主调”—苔藓绿用于主按钮与选中态，近黑绿用于文字与特殊品牌面板。
* Image-derived: Fraunces/Manrope role split, large quiet surfaces, pill labels, thin icons, and restrained shadows.
* Agent-derived: responsive card conversion below 900px, 44px minimum touch targets, 160ms state motion, and reduced-motion handling.
* User-approved: integrated Desktop and Mobile presentation on 2026-09-17.

### Custom guidance

See `design-notes.md` for the APIs and usage limits of `WorkshopSchedule`, `EngagementChart`, `BrandFocusCard`, and `EcosystemDashboard`.

### Verification limits

The production build, semantic contrast report, browser screenshots, keyboard flow, representative overlay, chart control, and responsive layouts were checked locally. A full screen-reader pass and physical touch-device test remain outside this local verification.

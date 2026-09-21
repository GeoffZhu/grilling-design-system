# DESIGN.md

## 1. Design Direction

Product type:

`面向 PC Web 与 Mobile Web 的通用组件库，以及用于验证组件组合方式的响应式创意工作台示例。`

Style:

* `暖奶油色画布与绿色结构色`
* `利落圆角、两像素描边、浅层硬阴影`
* `糖果色仅用于重点动作、状态和图形切片`
* `宽松但可用于工作台的中等信息密度`

Principles:

1. `边界归属清晰：复合控件只保留一个外框，每个相邻区域只保留一条分隔线。`
2. `状态成对变化：背景与前景必须同时提供足够对比，不能只改变文字或背景。`
3. `优先复用正式 UI primitives；Gallery 主视觉是文档组合，不是业务组件。`

### Source and status

Name: Playform Atelier

Status: Approved

Mode: light

最终方向由用户确认。后续修订只修复组件几何、层级、状态和组合关系，未改变基础令牌。

---

## 2. Design Tokens

### Colors

```txt
background: var(--background) = #F7E5DB
surface: var(--card) = #FFF8F2
border: var(--border) = #8B6C5D

text-primary: var(--foreground) = #173F31
text-secondary: var(--card-foreground) = #173F31
text-muted: var(--muted-foreground) = #6D554A

primary: var(--primary) = #007A45
primary-hover: var(--primary) with opacity .85

success: var(--primary) = #007A45
warning: var(--secondary) = #FFC43D
error: var(--destructive) = #A92F16
```

Rules:

* Use semantic tokens.
* No arbitrary colors.

### Typography

```txt
font-family: Nunito, Arial Rounded MT Bold, system-ui, sans-serif

page-title: clamp(38px, 5vw, 64px); weight 800; line-height 1.05
section-title: 24px; weight 800; line-height 1.05
body: 16px; line-height 1.55; var(--font-sans)
small: 12–13px; line-height 1.4
label: 14px; weight 700
```

Rules:

* Use defined typography only.
* No arbitrary font sizes.

### Spacing

```txt
Allowed:
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

Card padding: 20px; compact cards 16px
Form gap: 20px between fields; 8px within a field
Section gap: 32–64px according to hierarchy
Page padding: 32–88px desktop; 20px mobile
```

Rules:

* No arbitrary spacing.

### Radius

```txt
sm: 6px; --radius-sm
md: 8px; --radius-md
lg: 10px; --radius-lg
full: 9999px; pill or circle
```

### Icons

```txt
Library: Lucide rounded
Sizes: 22px base; inspect component overrides
```

Rules:

* Use one icon library.
* No emoji as UI icons.

### Complete semantic color map

| Token | Value |
| --- | --- |
| --background | #F7E5DB |
| --foreground | #173F31 |
| --card | #FFF8F2 |
| --card-foreground | #173F31 |
| --popover | #FFF8F2 |
| --popover-foreground | #173F31 |
| --primary | #007A45 |
| --primary-foreground | #FFF8F2 |
| --secondary | #FFC43D |
| --secondary-foreground | #3C2B12 |
| --muted | #EBD2C5 |
| --muted-foreground | #6D554A |
| --accent | #0568C8 |
| --accent-foreground | #FFFFFF |
| --destructive | #A92F16 |
| --border | #8B6C5D |
| --input | #8B6C5D |
| --ring | #0568C8 |
| --chart-1 | #007A45 |
| --chart-2 | #0568C8 |
| --chart-3 | #E84D9B |
| --chart-4 | #E64A19 |
| --chart-5 | #D69A00 |
| --sidebar | #007A45 |
| --sidebar-foreground | #FFF8F2 |
| --sidebar-primary | #FFC43D |
| --sidebar-primary-foreground | #3C2B12 |
| --sidebar-accent | #FFF8F2 |
| --sidebar-accent-foreground | #173F31 |
| --sidebar-border | #1B8B59 |
| --sidebar-ring | #FFC43D |

### Additional implemented tokens

- Heading family: Nunito, Arial Rounded MT Bold, system-ui, sans-serif; weight 800.
- Heading line-height: 1.05; tracking: -0.025em; label weight: 700.
- Spacing base: 4px; control height: 48px.
- Control radius: 9px; surface radius: 16px; overlay radius: 14px.
- Control inline padding: 20px; icon gap: 8px; icon stroke: 2.25.
- Shadow: 0 2px 0 #173F31.
- Motion: 180ms cubic-bezier(0.2, 0.8, 0.2, 1); honor reduced motion.
- Font smoothing: -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale.
- Component-specific optical corrections may use 2px, 10px, 14px, 18px, 20px, 28px, 40px, and 44px where recorded in `src/index.css` or `src/gallery.css`.

---

## 3. Layout

```txt
Max content width: 1600px shell; 1120px documentation content
Page padding: 32–88px desktop; 40px tablet; 20px mobile
Sidebar width: 260px desktop; hidden behind a drawer below 760px
Form max width: 720px in component previews; product forms follow their owning container
```

Breakpoints:

```txt
mobile: below 760px; Key Visual narrow treatment below 560px
tablet: 760–1099px
desktop: 1100px and above; Key Visual two-column treatment above 860px container width
```

Responsive rules:

```txt
Sidebar:
Desktop -> sticky 260px searchable component navigation
Mobile -> hidden sidebar opened as a modal navigation drawer

Grid:
Desktop -> three-column component directory; two-column specimen layouts where container permits
Tablet -> two-column component directory; examples fall back according to container width
Mobile -> one column, 20px page padding, no reduced typography

Table:
Mobile -> preserve readable columns and scroll horizontally inside the table container only
```

---

## 4. Components

### Button

```txt
Variants:
primary
secondary
ghost
destructive

Sizes:
sm
md
lg
```

Rules:

* One primary action per action group.
* No custom button colors.

### Input

Rules:

* Always use a visible label.
* Placeholder is not a label.
* Show validation near the field.

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

### Modal

Use for:

`短小、需要明确完成或取消的任务；实现组件为 Dialog。`

Rules:

* Keep tasks focused.
* Clearly explain destructive actions.

### Drawer

Use for:

`从屏幕边缘进入的补充流程、筛选或移动端上下文面板。`

### Tabs

Use for:

`同一上下文中的对等视图，例如 Explorer 与 Outline。`

Rules:

* Peer views only.
* Not for global navigation.

### Table

Rules:

* Text left aligned.
* Numbers right aligned.
* Actions right aligned.
* Support empty state.

### Public API mapping

Preserve shadcn/ui APIs. The design role primary maps to Button variant="default"; size md maps to size="default". Keep secondary, ghost, destructive, sm, and lg identifiers unchanged. Inspect the actual Button source before documenting extra variants. Modal maps to Dialog; Toast maps to Sonner.

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
Layout:
Layout: 默认单列；相关字段通过 FieldGroup 组织
Validation: destructive border + 2px translucent ring；错误文字紧邻控件
Save behavior: 由消费页面决定；短操作可显示 Spinner，成功可使用全局 Toaster
Unsaved changes: 组件库不规定业务策略；消费页面应在离开前明确提示
```

Rules:

* Prefer single-column forms.
* Group related fields.

### Search

```txt
Trigger:
Trigger: 输入立即筛选 Gallery；产品搜索由业务需求决定
Debounce: Gallery 为本地数据，不使用 debounce；远程搜索应由消费方配置
No-result behavior: 显示明确的空结果文案，不隐藏页面结构
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

---

## 7. UX Writing

Style:

`简洁、友好、面向任务；中文界面使用具体动词。`

Rules:

* Sentence case.
* Prefer specific verbs.
* Avoid vague labels like `OK` and `Submit`.

Examples:

```txt
新建任务
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

`44x44 CSS px minimum for primary touch targets`

Standard:

`WCAG AA target; not a claim of full compliance`

### Accessibility evidence

Token contrast results cover only these pairs. Verify rendered colors, labels, keyboard behavior, focus, and layout separately.

| Mode | Pair | Ratio | Minimum | Result |
| --- | --- | --- | --- | --- |
| light | foreground/background | 9.59 | 4.5 | Pass |
| light | card-foreground/card | 11.14 | 4.5 | Pass |
| light | primary-foreground/primary | 5.16 | 4.5 | Pass |
| light | secondary-foreground/secondary | 8.55 | 4.5 | Pass |
| light | muted-foreground/muted | 4.78 | 4.5 | Pass |
| light | accent-foreground/accent | 5.5 | 4.5 | Pass |
| light | popover-foreground/popover | 11.14 | 4.5 | Pass |
| light | destructive/background | 5.53 | 4.5 | Pass |
| light | sidebar-foreground/sidebar | 5.16 | 4.5 | Pass |
| light | sidebar-primary-foreground/sidebar-primary | 8.55 | 4.5 | Pass |
| light | sidebar-accent-foreground/sidebar-accent | 11.14 | 4.5 | Pass |
| light | ring/background | 4.5 | 3 | Pass |
| light | input/background | 3.91 | 3 | Pass |

### Verification and limitations

- build: 117 skill tests passed; TypeScript and Vite production build completed.
- desktop: agent-browser verified Collapsible hover and open colors at 1280×900.
- mobile: The state rule is component-local and preserves the previously verified 390×844 layout.
- keyboard: Focus-visible retains dark foreground; open state follows Base UI data-panel-open and rotates the disclosure icon.
- contrast: Hover/open computed as muted rgb(235,210,197) with foreground rgb(23,63,49).

---

## 9. Implementation

```txt
Framework: React + TypeScript + Vite
Styling: Tailwind CSS 4 + semantic CSS variables
Component library: shadcn/ui
Icon library: Lucide rounded

UI components: src/components/ui

Shared components: src/components/example.tsx（仅 Gallery 示例容器）

Domain components: 不适用；最终 registry 没有自定义业务组件

Design tokens: tokens.json
```

### Usage

```txt
Working directory: design-system
Start or install: npm install; npm run dev to browse locally
Global styles: src/main.tsx imports src/index.css once; registry consumers install the generated theme CSS import
Root providers: TooltipProvider wraps the app; mount one Toaster when using toast()
Public imports: @/components/ui/<component> after registry installation
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

Run `npm install`, `npm run dev`, and `npm run build` from `design-system`. Import `src/index.css` once. The installable registry is `public/r/all.json`; while the Gallery is running, install it with `npx shadcn@4.21.0 add http://127.0.0.1:5173/r/all.json` in an initialized React + Tailwind 4 project. It installs `src/playform-atelier.css`. Keep required dependencies, font packages, utilities, hooks, and `SHADCN-LICENSE.txt` with the library.

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

List page:
Not applicable: this repository is a component library rather than a product with a canonical list page.

Detail page:
src/App.tsx with `?component=<name>`

Form page:
src/examples/field-example.tsx and src/examples/input-group-example.tsx

Settings:
src/examples/collapsible-example.tsx (Settings specimen)
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
- Preserve the warm cream canvas, green structural color, candy accents, 2px outlines, and shallow offset shadows.
- Keep the overview Key Visual as a docs-only composition in src/IntegratedPreview.tsx; do not register it as a reusable component.
- Use dummyimage.com for generated placeholder imagery; replace placeholders with approved production assets.
- Input Group and Button Group own their outer frame, radius, clipping, shadow, and focus treatment.
- Collapsible folder rows pair muted backgrounds with foreground text/icons for hover, focus, and data-panel-open states.
- Sheet content stays above its overlay and persistent Gallery chrome.
- Calendar cells remain at least 40px; Card footers use balanced vertical padding and centered actions.
- Invalid paint belongs only to frame-owning controls; container Fields never receive a destructive halo.
```


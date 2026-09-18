# DESIGN.md

## 1. Design Direction

Product type:

`面向品牌洞察与策略审计产品的深色 Web 组件库；同时包含可浏览的组件文档与品牌审计参考页面。`

Style:

* `仪器化、精确`
* `编辑感大字排版`
* `深色、克制`
* `数据优先`

Principles:

1. `橙色只表达动作、焦点与活动信号。`
2. `普通表面保持平整深黑，依靠细边框而非阴影分层。`
3. `轨道与十字轴只用于测量、扫描或状态语义。`

### Source and status

Name: Ember Signal

Status: Approved

Mode: dark

用户选择仪器纯黑方向。普通组件使用无阴影深黑分层；橙色只承担活动、焦点和关键数据。

参考图中的 UI 与品牌视觉已扩展为完整 shadcn/ui 组件语言。字体与色值为基于栅格图的近似实现，并使用可再分发的开源字体。

---

## 2. Design Tokens

### Colors

```txt
background: var(--background) = #070606
surface: var(--card) = #12100F
border: var(--border) = #4C403B

text-primary: var(--foreground) = #F4F0EA
text-secondary: var(--secondary-foreground) = #E8D8CA
text-muted: var(--muted-foreground) = #B9AAA1

primary: var(--primary) = #F05A20
primary-hover: color-mix(in srgb, var(--primary) 90%, transparent)

success: var(--success) = #82B78B
warning: var(--warning) = #DFA35F
error: var(--destructive) = #E05A52
```

Rules:

* Use semantic tokens.
* No arbitrary colors.

### Typography

```txt
font-family: Manrope, 'Noto Sans SC', sans-serif

page-title: clamp(38px, 5vw, 64px); weight 500; line-height 0.98; tracking -0.045em
section-title: 24px; weight 500; line-height 0.98; tracking -0.045em
body: 16px; line-height 1.6; var(--font-sans)
small: 12–13px; line-height 1.4–1.6
label: 11–12px; weight 600; tracking 0.08–0.18em for short metadata only
```

Rules:

* Use defined typography only.
* No arbitrary font sizes.

### Spacing

```txt
Allowed:
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

Card padding: 24px desktop / 18px compact Mobile
Form gap: 12–16px
Section gap: 32 / 48 / 64px
Page padding: 32–88px desktop / 20px Mobile
```

Rules:

* No arbitrary spacing.

### Radius

```txt
sm: 2.4px; --radius-sm
md: 3.2px; --radius-md
lg: 4px; --radius-lg
full: 9999px; pill or circle
```

### Icons

```txt
Library: Lucide
Sizes: 20px base; inspect component overrides
```

Rules:

* Use one icon library.
* No emoji as UI icons.

### Complete semantic color map

| Token | Value |
| --- | --- |
| --background | #070606 |
| --foreground | #F4F0EA |
| --card | #12100F |
| --card-foreground | #F4F0EA |
| --popover | #171312 |
| --popover-foreground | #F4F0EA |
| --primary | #F05A20 |
| --primary-foreground | #120806 |
| --secondary | #211C1A |
| --secondary-foreground | #E8D8CA |
| --muted | #1B1817 |
| --muted-foreground | #B9AAA1 |
| --accent | #D0925D |
| --accent-foreground | #120A07 |
| --destructive | #E05A52 |
| --border | #4C403B |
| --input | #6C5B54 |
| --ring | #FF7A3D |
| --chart-1 | #F05A20 |
| --chart-2 | #D0925D |
| --chart-3 | #F4F0EA |
| --chart-4 | #9D5B3E |
| --chart-5 | #79645C |
| --sidebar | #0D0A09 |
| --sidebar-foreground | #F4F0EA |
| --sidebar-primary | #F05A20 |
| --sidebar-primary-foreground | #120806 |
| --sidebar-accent | #1B1715 |
| --sidebar-accent-foreground | #F4F0EA |
| --sidebar-border | #3D3531 |
| --sidebar-ring | #FF7A3D |
| --success | #82B78B |
| --warning | #DFA35F |

### Additional implemented tokens

- Heading family: Manrope, 'Noto Sans SC', sans-serif; weight 500.
- Heading line-height: 0.98; tracking: -0.045em; label weight: 600.
- Spacing base: 4px; control height: 46px.
- Control radius: 2px; surface radius: 4px; overlay radius: 6px.
- Control inline padding: 18px; icon gap: 8px; icon stroke: 1.5.
- Shadow: none.
- Motion: 160ms cubic-bezier(0.22, 1, 0.36, 1); honor reduced motion.
- Font smoothing: -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale.
- Reconcile role sizes, allowed spacing, and component overrides with the final source before delivery.

---

## 3. Layout

```txt
Max content width: 1600px for gallery shell; 1120px for documentation content
Page padding: clamp(32px, 6vw, 88px); Mobile 20px
Sidebar width: 260px desktop; Mobile drawer max 340px
Form max width: 720px for focused forms and Signal Audit Panel
```

Breakpoints:

```txt
mobile: < 760px; integrated presentation stacks at < 900px
tablet: 760–1099px
desktop: >= 1100px
```

Responsive rules:

```txt
Sidebar:
Desktop -> sticky 260px component navigation
Mobile -> hidden by default; opens as a drawer from the header

Grid:
Desktop -> three-column directory; integrated page 48.5% / 51.5% split
Tablet -> two-column directory; integrated page stacks below 900px
Mobile -> one-column directory and vertical content flow

Table:
Mobile -> keep semantic table when comparison is essential; otherwise use labeled rows or horizontal ScrollArea without shrinking type
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

`聚焦编辑、确认或需要阻断背景操作的短任务；使用 Dialog。`

Rules:

* Keep tasks focused.
* Clearly explain destructive actions.

### Drawer

Use for:

`Mobile 导航、补充筛选或不应遮挡整页上下文的次级任务。`

### Tabs

Use for:

`同一对象下的并列视图，例如周/月视图或概览/活动记录。`

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

### Custom components

`SignalAuditPanel` combines a score, labeled metrics, signal gap, next move, and one action. It accepts data through props and does not bake preview content into its API. Use it only for analysis or diagnostic contexts. Source: `src/components/custom/signal-audit-panel.tsx`.

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
Layout: single column by default; group related fields with 12–16px gaps
Validation: inline message beside the relevant field; preserve entered values
Save behavior: show an in-button spinner for short work, then a global success toast
Unsaved changes: product-level concern; add a specific confirmation guard when implementing editable screens
```

Rules:

* Prefer single-column forms.
* Group related fields.

### Search

```txt
Trigger: immediate client-side filtering in the component gallery
Debounce: not required for the small local inventory; use 200–300ms for remote queries
No-result behavior: show “没有找到组件。” and preserve the search query
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

`简练、专业、技术性适中`

Rules:

* Sentence case.
* Prefer specific verbs.
* Avoid vague labels like `OK` and `Submit`.

Examples:

```txt
开始品牌审计
生成策略简报
保存更改
删除工作区
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
| dark | foreground/background | 17.83 | 4.5 | Pass |
| dark | card-foreground/card | 16.71 | 4.5 | Pass |
| dark | primary-foreground/primary | 5.82 | 4.5 | Pass |
| dark | secondary-foreground/secondary | 12.13 | 4.5 | Pass |
| dark | muted-foreground/muted | 7.84 | 4.5 | Pass |
| dark | accent-foreground/accent | 7.42 | 4.5 | Pass |
| dark | popover-foreground/popover | 16.25 | 4.5 | Pass |
| dark | destructive/background | 5.54 | 4.5 | Pass |
| dark | sidebar-foreground/sidebar | 17.38 | 4.5 | Pass |
| dark | sidebar-primary-foreground/sidebar-primary | 5.82 | 4.5 | Pass |
| dark | sidebar-accent-foreground/sidebar-accent | 15.68 | 4.5 | Pass |
| dark | ring/background | 7.81 | 3 | Pass |
| dark | input/background | 3.14 | 3 | Pass |

### Verification and limitations

- build: npm run build：通过，TypeScript 与 Vite 构建成功。
- desktop: agent-browser：1440×900 通过，无横向或纵向溢出。
- mobile: agent-browser：390×844 与 360×800 通过，无横向溢出。
- keyboard: 组件页可访问树包含导航、链接、输入与有名称的按钮；焦点环由全局样式提供。
- contrast: 语义令牌报告全部达到 AA 阈值；实际画面文字与边界另经截图检查。

---

## 9. Implementation

```txt
Framework: React + TypeScript + Vite
Styling: Tailwind CSS 4 + semantic CSS variables
Component library: shadcn/ui
Icon library: Lucide

UI components: src/components/ui

Shared components: Not applicable：当前共享基础均属于 src/components/ui，领域组合位于 src/components/custom

Domain components: src/components/custom

Design tokens: tokens.json
```

### Usage

```txt
Working directory: .
Start or install: npm install; npm run dev（浏览库）；npm run build（生产构建）
Global styles: src/main.tsx imports src/index.css once; registry consumers install the generated theme CSS import
Root providers: TooltipProvider wraps the app; mount one Toaster when using toast()
Public imports: 本仓库使用 @/components/ui/<component> 与 @/components/custom/signal-audit-panel
Gallery or docs: npm run dev；根路由为组件目录，?component=signal-audit-panel 为自定义组件详情
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

在此目录运行 `npm install`、`npm run dev` 与 `npm run build`。`src/main.tsx` 全局载入字体与 `src/index.css`，并挂载一个 `TooltipProvider` 与一个 `Toaster`。可安装注册表为 `public/r/all.json`；先用 `npm run dev` 服务该文件，再在已初始化的 React + Tailwind 4 + shadcn 项目中执行 `npx shadcn@4.21.0 add http://127.0.0.1:5173/r/all.json`。注册表安装 `src/ember-signal.css`、组件、依赖与字体包。

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
src/App.tsx（组件目录首页）

Detail page:
src/App.tsx（`?component=<name>` 详情状态）

Form page:
Not applicable：组件库提供 Field、Form、Input、Select 等表单组件，但不虚构产品表单页

Settings:
Not applicable：当前交付没有产品设置页
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
- 普通卡片、表单、菜单与 Dialog 使用纯黑分层，不添加暖色光晕或投影。
- 橙色仅用于主要动作、焦点、活动进度和小型信号点。
- 轨道/十字轴图形只用于测量、扫描、状态或分析空状态。
- 控件、表面、浮层依次使用 2px、4px、6px 圆角；胶囊形仅用于紧凑状态。
- PC 可使用非对称左右分栏；Mobile 先堆叠内容并移除装饰侧标，不缩小触控区。
```

### Source snapshot

Source: https://ui.shadcn.com/r/styles/new-york-v4/registry.json; fetched: 2026-09-17.
Token hash: cc2d7a5097d85f57734b97bcc2656e3529f7c550b7171b205e1cc638101a2a3f.

| Component | Source |
| --- | --- |
| accordion | shadcn/ui |
| alert | shadcn/ui |
| alert-dialog | shadcn/ui |
| aspect-ratio | shadcn/ui |
| avatar | shadcn/ui |
| badge | shadcn/ui |
| breadcrumb | shadcn/ui |
| button | shadcn/ui |
| button-group | shadcn/ui |
| calendar | shadcn/ui |
| card | shadcn/ui |
| carousel | shadcn/ui |
| chart | shadcn/ui |
| checkbox | shadcn/ui |
| collapsible | shadcn/ui |
| combobox | shadcn/ui |
| command | shadcn/ui |
| context-menu | shadcn/ui |
| dialog | shadcn/ui |
| drawer | shadcn/ui |
| dropdown-menu | shadcn/ui |
| empty | shadcn/ui |
| field | shadcn/ui |
| form | shadcn/ui |
| hover-card | shadcn/ui |
| input | shadcn/ui |
| input-group | shadcn/ui |
| input-otp | shadcn/ui |
| item | shadcn/ui |
| label | shadcn/ui |
| menubar | shadcn/ui |
| navigation-menu | shadcn/ui |
| pagination | shadcn/ui |
| popover | shadcn/ui |
| progress | shadcn/ui |
| radio-group | shadcn/ui |
| resizable | shadcn/ui |
| scroll-area | shadcn/ui |
| select | shadcn/ui |
| separator | shadcn/ui |
| sheet | shadcn/ui |
| sidebar | shadcn/ui |
| skeleton | shadcn/ui |
| slider | shadcn/ui |
| sonner | shadcn/ui |
| spinner | shadcn/ui |
| switch | shadcn/ui |
| table | shadcn/ui |
| tabs | shadcn/ui |
| textarea | shadcn/ui |
| toggle | shadcn/ui |
| toggle-group | shadcn/ui |
| tooltip | shadcn/ui |
| kbd | shadcn/ui |
| native-select | shadcn/ui |
| direction | shadcn/ui |
| attachment | shadcn/ui |
| bubble | shadcn/ui |
| marker | shadcn/ui |
| message | shadcn/ui |
| message-scroller | shadcn/ui |
| src/components/custom/signal-audit-panel.preview.tsx | Custom component |
| src/components/custom/signal-audit-panel.tsx | Custom component |

### Decisions

- direction / select: b   
- foundations / derive: derived-foundations   颜色与纯黑表面继承用户选择的 B 方向；字体比例、方形几何、细线图标与克制动效均由参考图中清晰可见的模式推导。
- components / derive: derived-components   组件处理直接继承用户选择的仪器纯黑方向和已确定的基础规范。完整 shadcn API 保持不变，参考图特有的轨道与评分结构被实现为独立自定义组件。
- preview / approve: ember-signal-presentation   

### Additional project rules

#### Ember Signal visual guidance

- Keep ordinary surfaces flat and near-black. Do not add warm glow or drop shadow to routine cards, forms, menus, or dialogs.
- Use orange for primary action, focus, active progress, and a small signal point. Do not distribute it evenly across every component.
- Use the orbit/axis motif only where a component represents measurement, scanning, status, or empty analysis.
- Controls use 2 px corners, ordinary surfaces 4 px, and overlays 6 px. Pills are reserved for compact status only.
- Use Manrope for interface text and numbers. Cormorant Garamond Italic is an editorial accent, not a form or navigation font.
- Keep labels short, tracked, and quiet. Pair status color with text, icon, or progress geometry.
- Desktop may use deliberate left/right asymmetry. Mobile stacks content and removes ornamental side labels before reducing type or targets.

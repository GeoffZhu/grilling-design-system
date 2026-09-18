# DESIGN.md

## 1. Design Direction

Product type:

`可复用的 Web 组件库与交互式组件图库`

Style:

* `柔和圆润`
* `暖色中性`
* `二维卡通`
* `克制而友好`

Principles:

1. `正文优先，插画退居边缘`
2. `琥珀黄只强调关键焦点`
3. `同一套组件同时适配 PC Web 与 Mobile Web`

### Source and status

Name: Amber Tuxedo

Status: Approved

Mode: light

用户确认柔和圆润的方向，并明确要求使用不写实的卡通猫形象。图片中的暖白背景、近黑主体、矿物灰结构与琥珀黄眼睛被转译为界面色彩。字体、间距、图标、状态和响应式规则由参考图与可访问性要求推导。

---

## 2. Design Tokens

### Colors

```txt
background: var(--background) = #F4F0E7
surface: var(--card) = #FFFCF5
border: var(--border) = #C9C3B8

text-primary: var(--foreground) = #171715
text-secondary: var(--secondary-foreground) = #262521
text-muted: var(--muted-foreground) = #666158

primary: var(--primary) = #171715
primary-hover: bg-primary/90；以 90% primary 混合透明度实现

success: 使用 primary 与 CircleCheckIcon 组合，不另设绿色 token
warning: var(--accent) = #E9C84B，并配 var(--accent-foreground)
error: var(--destructive) = #B6382D
```

Rules:

* Use semantic tokens.
* No arbitrary colors.
* 琥珀黄用于选中、焦点、进度重点和少量提醒，不作为大面积页面底色。

### Typography

```txt
font-family: Manrope Variable, "Noto Sans SC", system-ui, sans-serif

page-title: 38–64px; weight 750; line-height 1.08; tracking -0.025em
section-title: 24px; weight 750; line-height 1.08
body: 16px; line-height 1.55
small: 12–14px; line-height 1.4–1.55
label: 13–14px; weight 650
```

Rules:

* Use defined typography only.
* No arbitrary font sizes.
* `@fontsource-variable/manrope` 提供 Latin 字形；中文使用系统可用的 `Noto Sans SC` 或无衬线回退。

### Spacing

```txt
Allowed: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

Card padding: 24px；页面型 CatBackdrop 为 28–56px 响应式内边距
Form gap: 16px；关联字段可用 12px
Section gap: 48px 或 64px
Page padding: Desktop 32–88px；Mobile 20px
```

Rules:

* No arbitrary spacing.

### Radius

```txt
sm: 7.2px; --radius-sm
md: 9.6px; --radius-md
lg: 12px; --radius-lg / control radius
surface: 22px
overlay: 18px
full: 9999px; pill or circle only
```

### Icons

```txt
Library: Lucide
Sizes: 16px compact; 20px default; 24px prominent
Stroke: 2px
```

Rules:

* Use one icon library.
* No emoji as UI icons.
* 卡通猫是插画资产，不代替功能图标。

### Complete semantic color map

| Token | Value |
| --- | --- |
| --background | #F4F0E7 |
| --foreground | #171715 |
| --card | #FFFCF5 |
| --card-foreground | #171715 |
| --popover | #FFFCF5 |
| --popover-foreground | #171715 |
| --primary | #171715 |
| --primary-foreground | #FFFCF5 |
| --secondary | #E5E0D5 |
| --secondary-foreground | #262521 |
| --muted | #EAE5DB |
| --muted-foreground | #666158 |
| --accent | #E9C84B |
| --accent-foreground | #201D10 |
| --destructive | #B6382D |
| --border | #C9C3B8 |
| --input | #8C857A |
| --ring | #806400 |
| --chart-1…5 | #D6AE17 / #242320 / #777169 / #9A7930 / #B7A88C |
| --sidebar | #EDE8DE |
| --sidebar-foreground | #242320 |
| --sidebar-primary | #171715 |
| --sidebar-primary-foreground | #FFFCF5 |
| --sidebar-accent | #E9C84B |
| --sidebar-accent-foreground | #201D10 |
| --sidebar-border | #C9C3B8 |
| --sidebar-ring | #806400 |

Motion: `160ms cubic-bezier(0.2, 0.8, 0.2, 1)`；`prefers-reduced-motion` 下缩短至近乎即时。

Shadow: `0 12px 32px rgba(23, 23, 21, 0.09)`，只用于主要表面和浮层。

---

## 3. Layout

```txt
Max content width: 1120px gallery content; 1600px app shell
Page padding: Desktop 32–88px; Mobile 20px
Sidebar width: 260px
Form max width: 425px for focused dialog forms
```

Breakpoints:

```txt
mobile: < 640px for CatBackdrop composition
tablet: < 760px for navigation drawer and one-column directory
desktop: >= 1100px for three-column component directory
```

Responsive rules:

```txt
Sidebar:
Desktop -> sticky 260px sidebar
Mobile -> hidden sidebar opened through a drawer

Grid:
Desktop -> three-column component directory; two-column feature row
Tablet -> two-column component directory
Mobile -> one column; CatBackdrop illustration moves below protected copy

Table:
Mobile -> keep semantic columns and allow horizontal scrolling when content cannot stack
```

---

## 4. Components

### Button

```txt
Variants:
primary -> variant="default"
secondary -> variant="secondary" or "outline"
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
* Use `CatBackdrop variant="card"` only when its 68% protected content area is sufficient.

### Modal

Use for:

`需要用户集中完成或确认的短任务；API 映射为 Dialog。`

Rules:

* Keep tasks focused.
* Clearly explain destructive actions.

### Drawer

Use for:

`移动端组件导航或从屏幕边缘进入的补充任务。`

### Tabs

Use for:

`同一上下文中的并列视图，例如账户与密码设置。`

Rules:

* Peer views only.
* Not for global navigation.

### Table

Rules:

* Text left aligned.
* Numbers right aligned.
* Actions right aligned.
* Support empty state.

### Custom components

`CatBackdrop` 位于 `src/components/custom/cat-backdrop.tsx`。`variant="page"` 用于页面主视觉，`variant="card"` 用于内容卡片。它内置装饰性二维卡通猫和文字保护层；可通过 `className` 与 `imageClassName` 调整容器和图片位置。

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

页面头图可使用 `CatBackdrop variant="page"`，但主要操作必须留在左侧保护区。

### Forms

```txt
Layout: 优先单列；关联字段使用 12–16px 间距
Validation: 字段下方就地说明，使用 destructive 色并保留文字
Save behavior: 提交期间禁用重复操作并显示 Spinner
Unsaved changes: 离开前使用 Dialog 明确说明后果
```

Rules:

* Prefer single-column forms.
* Group related fields.

### Search

```txt
Trigger: 输入即筛选本地组件目录
Debounce: 当前本地目录无需 debounce；远程搜索建议 200–300ms
No-result behavior: 显示“没有找到组件。”并保留搜索词
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
loading -> Skeleton for known layouts; Spinner for short actions
empty -> Empty component with a specific next action
error -> inline destructive message; preserve entered data
success -> concise text or Sonner notification
disabled -> reduced opacity plus native disabled semantics
```

Rules:

* Skeleton for known content structure.
* Spinner for short actions.
* Preserve user input after errors.
* Do not use toast for field validation.
* Focus uses `--ring`; selected navigation uses `--accent`; state must never rely on color alone.

---

## 7. UX Writing

Style:

`简练、友好、具体`

Rules:

* Sentence case.
* Prefer specific verbs.
* Avoid vague labels like `OK` and `Submit`.
* 示例文案使用具体任务，不在产品界面中解释实现细节。

Examples:

```txt
开始记录
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
* 卡通猫使用空 `alt` 与 `aria-hidden="true"`，不进入可访问名称。

Target size:

`44x44 CSS px minimum for primary touch targets`

Standard:

`WCAG AA target; not a claim of full compliance`

### Accessibility evidence

`contrast-report.json` 的 13 组语义色对全部达到对应 AA 阈值。正文/背景为 15.78:1，强调色文字/强调色为 10.31:1，焦点环/背景为 4.94:1，输入边界/背景为 3.21:1。

浏览器验证覆盖最终 62 个组件，并在 1440×900、390×844 与 360×800 下检查；均无横向溢出，Manrope 字体已加载。Dialog 可打开并用 Escape 关闭，关闭后焦点返回触发按钮。Sonner Toast 已实际触发并渲染。完整注册表已在干净的 Vite + React + Tailwind 4、shadcn `new-york`/Radix 消费项目中安装并构建成功。未在真实触屏硬件上验证粗指针命中区域；语义色报告不等同于完整 WCAG 认证。

---

## 9. Implementation

```txt
Framework: React 19 + TypeScript + Vite 6
Styling: Tailwind CSS 4 + semantic CSS variables + theme-overrides.css
Component library: shadcn/ui new-york-v4 source
Icon library: Lucide React

UI components: src/components/ui
Shared components: src/components/custom/cat-backdrop.tsx
Domain components: Not applicable; this repository is a neutral component library
Design tokens: tokens.json and src/amber-tuxedo.css
```

### Usage

```txt
Working directory: design-system
Start or install: npm install; npm run dev
Global styles: src/main.tsx imports src/index.css and src/theme-overrides.css once
Root providers: TooltipProvider wraps App; exactly one Toaster is mounted beside App
Public imports: @/components/ui/<component> and @/components/custom/cat-backdrop
Gallery or docs: npm run dev; open / or /?component=cat-backdrop
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

Registry: `public/r/all.json` contains the full source set. `public/r/cat-backdrop.json` installs the custom component alone. Initialize consumers with the shadcn `new-york` style and Radix base before installation; the default `base-nova` preset is API-incompatible with this snapshot. Keep `SHADCN-LICENSE.txt`, `@fontsource-variable/manrope`, the theme CSS, local utilities and root providers with redistributed code.

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
* Replace the approved flat cartoon cat with a realistic rendering.
* Put readable text over the cat's eyes, face, or high-contrast markings.

When uncertain:

1. Follow this file.
2. Follow existing components.
3. Follow the nearest existing screen.
4. Use standard UI conventions.

---

## 11. Reference Screens

```txt
App shell: src/App.tsx

List page: src/App.tsx overview route at /

Detail page: src/App.tsx component route at /?component=<name>

Form page: src/examples/form-demo.tsx

Settings: Not applicable; no product settings screen is part of this component library
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
- Use the cartoon tuxedo cat only as a decorative, peripheral image.
- Protect text with the implemented opaque-to-transparent surface wash.
- Use CatBackdrop page/card variants instead of recreating positioning locally.
- Keep amber sparse and purposeful; large surfaces stay warm ivory.
- Preserve the cat's black coat, amber eyes, white chin/chest/paws, and mouth-side white patch.
- On Mobile, place the page mascot below copy and keep the card face visibly cropped at the lower-right.
```

### Custom guidance

See `IMAGE-COMPONENTS.md`. The portable image data is in `src/components/custom/cat-mascot-data.ts`; the layout contract is in `cat-backdrop.css`.

### Decision history

- Initial A/B explored soft enclosure versus crisp framing.
- User preferred A's softness but rejected both abstract directions.
- User explicitly requested a cartoon cat usable as page or card background.
- A realistic first illustration was discarded. The confirmed asset is a simplified, flat 2D mascot.

### Source snapshot and attribution

- Official component source: `https://ui.shadcn.com/r/styles/new-york-v4/registry.json`.
- Snapshot date: 2026-09-18.
- Snapshot metadata: `shadcn-snapshot.json`.
- License: `SHADCN-LICENSE.txt`.
- Final inventory: 61 shadcn/ui components plus 1 custom `CatBackdrop` component.
- Approved token hash: `56da6f8890c58d0a449b4eab0e821a7b2656360e799f12573fdf4029a9a5a322`.

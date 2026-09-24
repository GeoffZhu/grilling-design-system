# DESIGN.md

## 1. Design Direction

Product type:

`[fill here]`

Style:

* `[e.g. clean]`
* `[e.g. professional]`
* `[e.g. dense]`
* `[e.g. minimal]`

Principles:

1. `[e.g. Clarity over decoration]`
2. `[e.g. Consistency over novelty]`
3. `[e.g. Reuse existing patterns]`

---

## 2. Design Tokens

### Colors

```txt
background:
surface:
border:

text-primary:
text-secondary:
text-muted:

primary:
primary-hover:

success:
warning:
error:
```

Rules:

* Use semantic tokens.
* No arbitrary colors.

### Typography

```txt
font-family:

page-title:
section-title:
body:
small:
label:
```

Rules:

* Use defined typography only.
* No arbitrary font sizes.

### Spacing

```txt
Allowed:
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64

Card padding:
Form gap:
Section gap:
Page padding:
```

Rules:

* No arbitrary spacing.

### Radius

```txt
sm:
md:
lg:
full:
```

### Icons

```txt
Library:
Sizes:
```

Rules:

* Use one icon library.
* No emoji as UI icons.

---

## 3. Layout

```txt
Max content width:
Page padding:
Sidebar width:
Form max width:
```

Breakpoints:

```txt
mobile:
tablet:
desktop:
```

Responsive rules:

```txt
Sidebar:
Desktop ->
Mobile ->

Grid:
Desktop ->
Tablet ->
Mobile ->

Table:
Mobile ->
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
* Theme both the Select trigger and option popup, including focus, selected and disabled options. Document any intentional native picker separately.
* Record the actual value/change/ref API, keyboard behavior and supported form submission, validation and reset behavior.
* Combobox: long/searchable lists.
* Radio: small visible choices.
* Switch: immediate on/off state.

### Card

Rules:

* Use only for meaningful grouping.
* Avoid nested cards.

### Modal

Use for:

`[fill here]`

Rules:

* Keep tasks focused.
* Clearly explain destructive actions.

### Drawer

Use for:

`[fill here]`

### Tabs

Use for:

`[fill here]`

Rules:

* Peer views only.
* Not for global navigation.

### Table

Rules:

* Text left aligned.
* Numbers right aligned.
* Actions right aligned.
* Support empty state.

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
Validation:
Save behavior:
Unsaved changes:
```

Rules:

* Prefer single-column forms.
* Group related fields.

### Search

```txt
Trigger:
Debounce:
No-result behavior:
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

`[concise / professional / friendly / technical]`

Rules:

* Sentence case.
* Prefer specific verbs.
* Avoid vague labels like `OK` and `Submit`.

Examples:

```txt
Create project
Save changes
Delete workspace
Send invite
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

`[44x44 / other]`

Standard:

`[WCAG AA / other]`

---

## 9. Implementation

```txt
Framework:
Styling:
Component library:
Icon library:

UI components:
[path]

Shared components:
[path]

Domain components:
[path]

Design tokens:
[path]
```

### Usage

```txt
Working directory:
Start or install:
Global styles:
Root providers:
Public imports:
Gallery or docs:
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
App shell:
[path]

List page:
[path]

Detail page:
[path]

Form page:
[path]

Settings:
[path]
```

Match these when this file does not specify a detail.

---

## 12. Canonical Components

```txt
Button:
[path]

Input:
[path]

Select:
[path]

Dialog:
[path]

Table:
[path]

Tabs:
[path]

Toast:
[path]
```

Prefer these over creating local replacements.

---

## 13. Project-Specific Rules

```txt
- [rule]
- [rule]
- [rule]
```

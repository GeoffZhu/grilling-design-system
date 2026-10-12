# Component craft and verification

Read the relevant sections when implementing or checking delivered components. Use the inventory from [product-flows.md](product-flows.md); never add components to satisfy this checklist. Marketing uses its custom families and existing projects retain their host primitives. Base UI selectors below apply only to Base UI implementations; inspect the actual DOM for other primitives. Preserve public APIs and real behavior.

Use [verification.md](verification.md) for build receipts, evidence and capability limits. Inspect at actual size, at Desktop and Mobile widths, in the real gallery canvas and applicable target pages. Record unsupported checks honestly.

- [Select and opened surfaces](#select-and-opened-surfaces)
- [Switch, Checkbox and touch geometry](#switch-checkbox-and-touch-geometry)
- [Calendar and Card](#calendar-and-card)
- [Sheet and Dialog](#sheet-and-dialog)
- [Input Group and invalid states](#input-group-and-invalid-states)
- [Command](#command)
- [Navigation, Tabs and Sidebar](#navigation-tabs-and-sidebar)
- [Collapsible](#collapsible)
- [Button Group and icons](#button-group-and-icons)
- [Feedback, media and providers](#feedback-media-and-providers)

## Select and opened surfaces

Use an accessible custom listbox popup with a suitable unstyled primitive from the host's established family. Styling a native select with `appearance:none`, a chevron or option CSS cannot consistently theme the browser/OS popup. Retain a native picker only for an explicit user request, an established host requirement or a distinct NativeSelect required by inventory. Document the exception and platform-controlled appearance in DESIGN.md; do not present it as the themed Select or ask a redundant preference question.

Specify trigger and popup together: surface/text pair, border, radius, shadow, padding, option height, hover/focus, selection indicator, disabled options and open-trigger state. Keep flat shadows when the theme is flat. Bound width and height to trigger/content and viewport; support long labels, scrolling, collision handling and portals above cards and gallery chrome. Use a zero-line-height, inline-flex 16px disclosure wrapper and separately bounded 16px glyph, centered with the label and protected from broad SVG rules.

Preserve labels, descriptions/errors, focus return, disabled behavior and controlled/uncontrolled values. For form-capable APIs, preserve name/form association, required validation, submission and reset. Prefer the primitive's form support. A hidden native bridge may serialize values but must not introduce a second picker, tab stop or duplicate submitted field; invalid focus goes to the visible trigger. Document actual value/change/ref types and unsupported native props rather than claiming HTMLSelectElement compatibility. Include primitive dependencies in the manifest, snapshot, consumer build and handoff.

**Verify:** Open every included Select implementation on Desktop and Mobile, in cards and any supported overlay container. Inspect all popup treatments, long labels, width, scrolling, collision and layering; capture an opened-popup screenshot when available. A closed field, styled chevron or assigned DOM value does not verify the popup. An unintended OS picker is a defect, not a missing-browser limitation. Apply the same opened-state checks to included menus, comboboxes, popovers and date pickers.

Select through real pointer and keyboard input: Enter/Space, arrows, Home/End and typeahead where supported, disabled-option skipping, Escape, outside dismissal and focus return. One selection updates once and closes; Enter must not reopen after focus returns. Exercise controlled/uncontrolled examples, required/error association, submission without duplicate fields and reset of both label and submitted value. Record unsupported checks without substituting programmatic changes for keyboard evidence.

## Switch, Checkbox and touch geometry

Separate painted geometry from touch targets. With device emulation, confirm `(pointer: coarse)` matches, added hit areas receive input and adjacent actions do not overlap. Preserve track/thumb/inset/travel relationships; padding and background clipping must not deform rounded tracks or leave mismatched shadows.

For Base UI Switch, use the root's reflected `data-checked` and `data-unchecked` to style track and descendant thumb; do not assume a Radix-style thumb `data-state`. Check both endpoints and every delivered size, including default/small, after coarse-pointer rules apply.

Give Checkbox an explicitly sized inline-grid painted root with zero padding and line-height. Its indicator fills the box using absolute inset centering; bound the SVG size. Expand touch input with an independent pseudo-element and exclude the painted root from generic coarse-pointer minimum dimensions.

**Verify:** Measure checked Checkbox root, indicator and SVG bounds. The root keeps its documented compact size, indicator bounds match it and SVG centers agree within one CSS pixel. Verify the pseudo-element's hit area. Inspect Switch, Checkbox, Radio and other compact controls after touch rules apply; a narrow viewport alone does not emulate touch.

## Calendar and Card

Keep Calendar default cells at least 40px and no smaller than normal control height. Month/year dropdown captions are full controls with at least a 40px hit area, stable locale-safe widths, balanced padding and bounded disclosure icons. Days with secondary text use taller non-square rows, explicit vertical padding and a small internal gap. Single selections and range endpoints retain an opaque semantic fill after Button variants; focus follows the cell radius without an oversized circular halo.

At narrow widths preserve cells and type; reduce surrounding preview padding or give multi-month variants local scrolling or a responsive month count. Never shrink Calendar to fit two documentation columns.

Card footers use equal block padding, centered controls and enough minimum height for normal controls plus insets. Keep a consistent rhythm across FieldGroup/form gaps, label-to-control spacing, feedback, adjacent fields and footer action gaps.

**Verify:** Inspect Calendar at 100% inside the actual gallery, standalone and inside cards/popovers. Measure captions and custom-day rows; confirm both text lines fit with no row collision, selections remain filled and wide variants scroll locally. Check default/small Card footers with wrapped, full-width-button and icon/text content. Measure form rhythm in Input Group In Card, including Feedback & Comments.

## Sheet and Dialog

Define a stack with backdrop above persistent application/gallery chrome and content one layer above it. Sheet also needs fixed positioning and side geometry; source order is insufficient. Dialog close is a bounded icon action pinned to a top corner with title clearance and hover/focus affordances.

**Verify:** Open every Sheet side over sticky headers, sidebars and Mobile drawers. Confirm the backdrop covers chrome and content remains above it. Open Dialog, check close alignment and title clearance, then exercise dismissal and focus return under the existing keyboard checks.

## Input Group and invalid states

Make Input Group the sole owner of border, radius, background, shadow, focus/invalid treatment and clipping. Set wrapper overflow hidden so addon/button fills cannot cover corners; the wrapper's external shadows remain visible. Reset nested input/textarea frames, backgrounds, shadows and focus treatment after all signature rules; keep the editable area unconstrained.

Inline-start/end addons and buttons need useful padding and one separator from the editable region. Multiple addons must not double separators. Block-start/end addons make the wrapper wrap, own full-width rows with padding and one boundary; textarea is a separate full-width row with internal padding and a stable documented minimum height.

Invalid Input, Textarea, Select and groups use a destructive boundary plus a restrained translucent 2px ring without layout shift. Only the group wrapper paints invalid treatment; children clear their own rings. FieldError or invalid descriptions follow the control closely with a small consistent gap.

**Verify:** Inspect every supported addon position, grouped buttons and textarea rows. Check corner clipping, one outer frame, one internal separator, no nested button shadow, available editing width and visible wrapper focus/invalid shadow. Compare standalone and grouped invalid states for repeated rings, thick red halos or layout shift, including Card examples.

## Command

Command Input owns one bottom boundary around a borderless full-width search row. Exclude its internal Input Group from generic addon padding/separators. Set stable search-row inline padding and gap, group-heading bottom inset, vertical item gaps, readable item minimum height, balanced item padding and bounded 16px leading icons.

**Verify:** Measure the search boundary, editing space, heading separation and item geometry. Test short/long labels with shortcuts. Generic Input Group rules must not squeeze the search field or introduce extra separators.

## Navigation, Tabs and Sidebar

Use actual primitive attributes: Base UI Navigation Menu uses truthy `data-popup-open`; Tabs uses truthy `data-active`, including empty attributes and excluding `false`. Keep Navigation Menu open treatment while hovering and moving into its content. Links inside content use block-level, full-width boxes; hover/focus/active backgrounds paint continuous rows, and muted descendants use the accent foreground. Navigation disclosure icons use the same bounded 16px wrapper/glyph as Select.

Default active Tabs use accent/accent-foreground plus a visible non-layout-shifting border or shadow, even when card and sidebar colors coincide. Inactive triggers clear those treatments. Line Tabs lists and triggers have no border or shadow; active triggers stay transparent except for an indicator inset at least 8px or half the control radius, whichever is larger, avoiding rounded ends.

The gallery account/version control is a SidebarMenuButton containing Item and opening a portaled DropdownMenu, not a Select. Style its `data-popup-open` with sidebar colors and remove the nested Item border/background/shadow. Give the generated popup an explicit context class and stable positioner hook for anchor width, viewport bounds and a layer above chrome. Keep a deliberate gap between the account/version control and search, aligned edges and balanced header padding.

**Verify:** Move between Navigation Menu trigger/content; inspect open versus hover and descendant contrast. Measure disclosure wrappers/glyphs at 16×16px and content links at block/100% width. Switch Tabs and confirm only truthy active triggers receive selection styling; measure line-indicator insets and confirm no list/trigger border or shadow. Open Sidebar DropdownMenu and inspect nested Item resets, popup/positioner geometry and layering. Check header spacing, alignment and crowding on Desktop and in the Mobile drawer.

## Collapsible

Bind Base UI open styling and icon rotation to truthy `data-panel-open`, including its empty form. Pair hover/focus/open backgrounds and foregrounds, carrying the foreground into text, SVG, `[data-icon]` and muted descendants. Do not substitute `data-state=open`.

**Verify:** Inspect folder rows closed, hovered, focused and open. Check readable contrast pairs and disclosure rotation without layout changes.

## Button Group and icons

Button Group owns one outer border, radius, background, clipping and shadow. Use the accepted theme shadow token and depth hierarchy, including `none`; never inject a fixed extruded shadow. Reset direct Button, Input, Select/Dropdown trigger, Input Group, text and nested-group outer borders, radius, margin and shadows. Draw one 1px separator per adjacency, inline for horizontal and block for vertical groups; an explicit separator replaces the automatic boundary. Preserve outer corner continuity. Use inset focus and suppress standalone pressed translation/shadow.

Bound Button icons by explicit width/height from the icon token, with tighter optical caps for xs/sm. Do not rely on intrinsic SVG dimensions or broad descendant rules. Keep compact action icons subordinate to labels and preserve aspect ratio.

**Verify:** Exercise horizontal, vertical, mixed and nested groups, including explicit separators. Computed styles must show a single frame, one separator per adjacency and an outer shadow equal to the theme token. Focus/press must not change bounds or double outlines. Measure the Input OTP Resend Code refresh icon at actual size against its compact optical size and label.

## Feedback, media and providers

Alert reserves a leading grid column for direct icons or an explicit leading slot and a separate trailing-action column. Avatar sm/default/lg roots have bounded square dimensions; gallery wrappers must not stretch them. Message Scroller content owns visible vertical gaps rather than relying on Bubble margins.

Mount required singleton hosts/providers once at the application root, including one global Toaster when Sonner is included. Lazy examples and consumer screens must share a working host.

**Verify:** Check Alert with no icon, direct icon, leading slot, description and trailing action. Measure Avatar variants and scroll messages to inspect every adjacency. Trigger every represented global feedback API; click a Sonner `toast()` example and verify a toast in the accessibility tree and viewport. Source inspection of its handler alone is insufficient. Audit other delivered APIs for equivalent hosts/providers.

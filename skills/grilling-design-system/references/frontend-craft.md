# Frontend craft

Apply this before designing a direction, before showing key components, and after expanding the full library. The method draws on [Anthropic's frontend-design skill](https://raw.githubusercontent.com/anthropics/claude-code/refs/heads/main/plugins/frontend-design/skills/frontend-design/SKILL.md), read 2026-09-16. This is an adaptation for image-led design systems, not an instruction to adopt a house style.

## Preserve the brief

The image and confirmed choices take precedence over aesthetic heuristics. A rounded, playful reference should stay rounded and playful. Do not replace it with editorial serif, brutalist borders, dark neon, gradients or a fashionable palette to appear original. Extract its organizing logic as well as its colors.

Infer the subject, a representative user action and realistic specimen content from the image. For non-UI images, propose a concrete use context inside the direction description. Do not add a product/audience questionnaire or another confirmation step. Keep the existing PC/Mobile, one-mode default and review loop.

## Pass 1: specify a design intent

Write a short design-intent.md beside each round's candidates. It must explain choices that the tokens cannot:

- Reference evidence: three visible characteristics to preserve, with approximate image regions. Separate observation from interpretation.
- Visual priority: one memorable feature and the supporting elements that should stay quiet. For a component system, identify the recurring signature, not a compulsory landing-page hero.
- Palette: 4–6 named base colors and their roles/relative prominence. Expand these into shadcn semantics later. Large surface color, action color and readable text color need not be identical.
- Typography: rendered font(s), heading/body/label roles, sizes, weights, line heights and tracking. Use one family when sufficient; two only with distinct roles. Decide how short labels, long titles, numbers and multiline text wrap. Keep prose comfortably below 80 characters per line.
- Composition: a small wireframe and one sentence about alignment, groups, whitespace and responsive reordering. Preserve purposeful asymmetry. Avoid a grid of identical containers merely because the starter has cards.
- Component geometry: distinguish container radius, input radius, button radius and compact indicator shape. Define density, border roles and elevation hierarchy. Identify icon optical corrections.
- Theme signature: expand the Key Visual and custom-component signature across representative actions, inputs, selection controls, navigation, feedback, overlays, and data display. Define depth, semantic color roles, and pressed/selected/focus behavior per family. Keep dense rows and low-priority utilities lighter; token substitution alone does not establish one coherent system.
- Motion and copy: name the action a transition explains; write representative labels, success and error text with consistent verbs.

Before coding, compare the plan to the image. Remove choices that could have been pasted unchanged into any unrelated brief. Record what was revised and why, or explain why each familiar pattern fits this reference. This is an agent self-review, not another user questionnaire.

## Pass 2: build and inspect the actual components

Use official shadcn APIs and interaction primitives as the structural base. Design the actual variant classes, state treatments and component geometry. Merely assigning global colors and a large radius is not a completed system.

| Area | What to inspect at actual size |
| --- | --- |
| Typography | Baselines, cap/x-height, optical centering, heading weight versus labels, line breaks, truncation and numbers. Text should not all look equally bold. |
| Spacing | Repeated insets, label-to-field distance, icon-to-text gap, rhythm between groups and edge alignment. Resolve awkward gaps locally before shrinking the whole UI. |
| Shape | Nested corners should follow the inset; circles, pills, fields, cards and overlays have intentional roles. Avoid forcing every size/variant to the same height or radius. |
| Compound controls | Preserve relationships between track, thumb, inset and travel. A Switch hit area must not stretch its painted track. Check both endpoints and every size; padding plus background clipping can deform rounded shapes and leave a mismatched shadow. |
| Checkbox indicator | Compare the computed bounds and centers of the painted root, indicator, and check SVG. The indicator fills the painted box, the SVG is optically sized, and coarse-pointer hit expansion does not resize the visible square. |
| Overlay stack and grouped fields | Open Sheet over sticky headers, sidebars, and Mobile drawers; content stays above its backdrop and all chrome. Input Group has one outer frame only, with an unconstrained editable area and aligned addons. |
| Input Group composition | The wrapper clips child fills to its radius while retaining its own external focus/invalid shadow. Inline addons/buttons have one separator and useful padding. Block addons and textarea form distinct full-width rows. In Card examples keep label, control, feedback, footer, and adjacent fields on one repeatable spacing rhythm. |
| Invalid state | Inspect standalone and grouped invalid controls at actual size. Use a destructive border plus a restrained 2px translucent ring; Input Group children do not repeat it, and error text stays near the control. |
| Stateful navigation and compound rows | Inspect Navigation Menu open versus hover, including muted descendant contrast; Tabs active versus inactive; Command Input boundaries; and SidebarMenuButton + portaled DropdownMenu geometry using the primitive's actual data attributes. |
| Collapsible rows | Inspect trigger hover, keyboard focus, closed, and `data-panel-open` states. Background and foreground change as a pair; labels, icons, and muted metadata remain readable, and the disclosure icon follows the actual Base UI open attribute. |
| Button Group | Inspect horizontal, vertical, mixed, and nested groups as one frame. Children have no standalone radius/border/shadow, adjacent items share one separator, and focus/pressed states do not shift or double the outline. |
| Leading, trailing and media regions | Alert icons/leading content and actions occupy separate grid columns; Dialog close does not cover titles; Avatar sizes stay bounded; Message Scroller items retain a visible vertical gap. |
| Calendar and card footer | Inspect calendar cells at 100% inside the actual gallery canvas; keep default cells at least 40px and no smaller than the normal control height. Check that Card footer buttons and icons sit vertically centered with balanced top/bottom padding, including small and wrapped variants. |
| Icons | Consistent family, optical size and stroke; align to the label rather than the SVG box alone. Quiet action icons should not compete with illustration. |
| Surfaces | Border and shadow explain separation or elevation. Keep structural separators quieter than essential input boundaries. Use an explicit reason for a gradient, texture or border. |
| States | Hover/pressed/focus/selected/disabled/error/loading are legible and stable. Loading preserves button width. Selected borders do not shift layout. Test long labels and real content. |
| Motion | Respond to the action: show expansion, completion or changed selection. Remove idle wiggles, bouncing stickers and card lifts that communicate nothing. Honor reduced motion. |
| Composition | One clear focal area at thumbnail scale, clean geometry at 100%, adequate touch targets on Mobile. Do not distribute saturated accents evenly across every component. |
| Copy | Use the user’s main language for every phrase, including accessible labels. Use short sentences and everyday words. Explain necessary technical words immediately. Each phrase supports a task. Use concrete verbs and useful empty/error states. Delete ornamental eyebrows, generic encouragement and redundant descriptions. |

Treat common “generated UI” patterns as review prompts, not bans: all-caps labels, serial numbers without a sequence, one highlighted headline word, identical cards, pill-shaped everything, default soft shadows, decorative gradients, arrows appended to every action. Keep them only when the image or actual task justifies them. Round numbers in the review studio do describe a real sequence.

## Screenshot → critique → repair → screenshot

Use available host browser/image capabilities; no particular package is required. When capture is available, inspect the rendered UI with fonts loaded at the specimen viewport, or at 1440×900 and real Mobile widths for the integrated page. Inspect relevant controls and states; the integrated review also covers a card/list item and overlay. View actual screenshots, since DOM measurements alone do not reveal weak composition or optical alignment. When these capabilities are unavailable, use the source-inspection artifact and explicit limitations described in verification.md. Never invent screenshot evidence or block source delivery on a missing browser tool.

Mobile width alone does not emulate touch. When device emulation is available, confirm `(pointer: coarse)` matches. Inspect Switch, Checkbox, Radio and other compact controls after touch-target rules apply. Expand hit areas without distorting the visible control; verify that the added area receives input and does not overlap adjacent actions. Record unsupported checks as not run.

Treat documentation previews as container-responsive compositions. Check the actual preview canvas width beside navigation, not only the browser viewport. At widths that cannot hold two examples, stack them. Let intrinsically wide tables, menus, navigation groups, and control clusters own local horizontal scrolling or reflow inside their example card; the parent canvas must never scroll horizontally or overlap another example. Do not use zoom or smaller type to hide overflow.

The gallery overview is itself a composition check. Its first substantive section must be the confirmed integrated Key Visual built from delivered components, followed by the component directory. Treat this as docs composition, not component inventory: it has no detail route, custom-component entry, registry item, or package export. Inspect this ordering and boundary at Desktop and Mobile.

Write concrete observations, not “looks polished” or a numerical beauty score. Example: “Field labels and button labels use the same 900 weight; set labels to 650 while retaining 900 for habit titles.” Tie each repair to a screenshot and a component/style rule. Remove one unnecessary element if the composition is busy; do not add decoration as a reflex.

Repeat while identifiable issues remain. If the repair changes the user's confirmed visual direction, return to foundations; never quietly relabel it approved. Keep implementation defects separate from choices needing user input. Only then publish the next preview with its visualReview artifact.

## Expand with the same care

Apply the approved language to every delivered family: actions, form controls, navigation, feedback, overlays and data display. Inspect representative families together so input padding, dialog edges, menu density and chart colors do not regress to upstream defaults. The full gallery is a review surface; its chrome should be quiet. Keep design-system notes in the review UI/docs rather than embedding developer terminology in a simulated product flow.

Store the approved visual intent, type scale, component-specific geometry, icon rules and rationale in DESIGN.md. Keep optional theme geometry in tokens.json, custom rules in theme-overrides.css or component variants, and cross-check registry output. Preserve user edits and prior approved artifacts when creating a refinement candidate.

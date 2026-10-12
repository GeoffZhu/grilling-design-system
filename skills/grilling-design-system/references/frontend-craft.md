# Frontend craft

Apply component-specific rules only to the selected product/task inventory from product-flows.md. Marketing uses custom core families; existing SaaS preserves host components. Do not expand scope to satisfy an admin-only check.

Apply this before designing a direction, before showing key components, and after expanding the full library. The method draws on [Anthropic's frontend-design skill](https://raw.githubusercontent.com/anthropics/claude-code/refs/heads/main/plugins/frontend-design/skills/frontend-design/SKILL.md), read 2026-09-16. This is an adaptation for image-led design systems, not an instruction to adopt a house style.

## Preserve the brief

The image and confirmed choices take precedence over aesthetic heuristics. A rounded, playful reference should stay rounded and playful. Do not replace it with editorial serif, brutalist borders, dark neon, gradients or a fashionable palette to appear original. Extract its organizing logic as well as its colors.

Infer the subject, a representative user action and realistic specimen content from the image. For non-UI images, propose a concrete use context inside the direction description. Do not add a product/audience questionnaire or another confirmation step. Keep the existing PC/Mobile, one-mode default and review loop.

## Pass 1: specify a design intent

Write a short design-intent.md beside each round's candidates. Summarize the region analysis and translation map from visual-analysis.md rather than starting a new interpretation. It must explain choices that the tokens cannot:

- Reference evidence: the highest-priority relationships to preserve, with region IDs. Include content anatomy, color prominence, type contrast, and geometry where visible. Separate observation from interpretation; a fixed count of adjectives does not establish coverage.
- Visual priority: one memorable feature and the supporting elements that should stay quiet. For a component system, identify the recurring signature, not a compulsory landing-page hero.
- Palette: 4–6 named base colors and their roles/relative prominence. Expand these into shadcn semantics later. Large surface color, action color and readable text color need not be identical.
- Typography: rendered font(s), heading/body/label roles, sizes, weights, line heights and tracking. Use one family when sufficient; two only with distinct roles. Decide how short labels, long titles, numbers and multiline text wrap. Keep prose comfortably below 80 characters per line.
- Composition: a small wireframe and one sentence about alignment, groups, whitespace and responsive reordering. Preserve purposeful asymmetry. Avoid a grid of identical containers merely because the starter has cards.
- Component geometry: distinguish container radius, input radius, button radius and compact indicator shape. Define density, border roles and elevation hierarchy. Identify icon optical corrections.
- Theme signature: carry the original image's relationships into the Key Visual, custom components, and representative actions, inputs, selection controls, navigation, feedback, overlays, and data display. Define role-specific type, density, geometry, depth, semantic color, and states. Retain the image's coexisting treatments and their scope. Keep dense rows and low-priority utilities lighter; token substitution alone does not establish one coherent system.
- Motion and copy: name the action a transition explains; write representative labels, success and error text with consistent verbs.

Before coding, compare the plan to the image. Remove choices that could have been pasted unchanged into any unrelated brief. Record what was revised and why, or explain why each familiar pattern fits this reference. This is an agent self-review, not another user questionnaire.

## Pass 2: build and inspect the actual components

For shadcn-based SaaS only, use official shadcn APIs and interaction primitives as the structural base. Design the actual variant classes, state treatments and component geometry. Merely assigning global colors and a large radius is not a completed system.

| Area | What to inspect at actual size |
| --- | --- |
| Typography | Baselines, cap/x-height, optical centering, heading weight versus labels, line breaks, truncation and numbers. Text should not all look equally bold. |
| Spacing | Repeated insets, label-to-field distance, icon-to-text gap, rhythm between groups and edge alignment. Resolve awkward gaps locally before shrinking the whole UI. |
| Shape | Nested corners should follow the inset; circles, pills, fields, cards and overlays have intentional roles. Avoid forcing every size/variant to the same height or radius. |
| Icons | Consistent family, optical size and stroke; align to the label rather than the SVG box alone. Keep action icons subordinate to their labels and quiet utilities subordinate to illustration. |
| Surfaces | Border and shadow explain separation or elevation. Keep structural separators quieter than essential input boundaries. Use an explicit reason for a gradient, texture or border. |
| States | Hover/pressed/focus/selected/disabled/error/loading are legible and stable. Loading preserves button width. Selected borders do not shift layout. Test long labels and real content. |
| Motion | Apply [motion.md](motion.md) to purpose, enter/exit, interruption and reduced motion. |
| Composition | One clear focal area at thumbnail scale, clean geometry at 100%, adequate touch targets on Mobile. Do not distribute saturated accents evenly across every component. |
| Copy | Apply [ux-writing.md](ux-writing.md) to task clarity, claims, useful states, localization and layout. |

For included controls, read [component-craft.md](component-craft.md). It owns the component-specific geometry, state and rendered checks; the table above covers their shared visual language. For Marketing or a SaaS homepage Key Visual, also read [marketing-review.md](marketing-review.md).

Treat common “generated UI” patterns as review prompts, not bans: all-caps labels, serial numbers without a sequence, one highlighted headline word, identical cards, pill-shaped everything, default soft shadows, decorative gradients, arrows appended to every action. Keep them only when the image or actual task justifies them. Round numbers in the review studio do describe a real sequence.

## Screenshot → critique → repair → screenshot

Apply visual-analysis.md's review for lost information. Compare the original image as well as the generated Key Visual; a component library can consistently repeat an inaccurate interpretation. Check hierarchy, silhouette, color distribution, content anatomy, imagery, and transfer into ordinary controls. Record concrete findings against translation IDs and explain deliberate adaptations.

Use available host browser/image capabilities; no particular package is required. When capture is available, inspect the rendered UI with fonts loaded at the specimen viewport, or at 1440×900 and real Mobile widths for the integrated page. Inspect relevant controls and states; the integrated review also covers a card/list item and overlay. View actual screenshots, since DOM measurements alone do not reveal weak composition or optical alignment. When these capabilities are unavailable, use the source-inspection artifact and explicit limitations described in verification.md. Never invent screenshot evidence or block source delivery on a missing browser tool.

Use [component-craft.md](component-craft.md#switch-checkbox-and-touch-geometry) for coarse-pointer checks; a narrow viewport alone does not emulate touch.

Treat documentation previews as container-responsive compositions. Check the actual preview canvas width beside navigation, not only the browser viewport. At widths that cannot hold two examples, stack them. Let intrinsically wide tables, menus, navigation groups, and control clusters own local horizontal scrolling or reflow inside their example card; the parent canvas must never scroll horizontally or overlap another example. Do not use zoom or smaller type to hide overflow.

The gallery overview is itself a composition check. Its first substantive section must be the confirmed integrated Key Visual built from delivered components, followed by the component directory. Treat this as docs composition, not component inventory: it has no detail route, custom-component entry, registry item, or package export. Inspect this ordering and boundary at Desktop and Mobile.

Use [component-craft.md](component-craft.md#navigation-tabs-and-sidebar) to check the gallery sidebar header on Desktop and Mobile.

Write concrete observations, not “looks polished” or a numerical beauty score. Example: “Field labels and button labels use the same 900 weight; set labels to 650 while retaining 900 for habit titles.” Tie each repair to a screenshot and a component/style rule. Remove one unnecessary element if the composition is busy; do not add decoration as a reflex.

Repeat while identifiable issues remain. If the repair changes the user's confirmed visual direction, return to foundations; never quietly relabel it approved. Keep implementation defects separate from choices needing user input. Only then publish the next preview with its visualReview artifact.

## Expand with the same care

Apply the approved language to every delivered family: actions, form controls, navigation, feedback, overlays and data display. Inspect representative families together so input padding, dialog edges, menu density and chart colors do not regress to upstream defaults. The full gallery is a review surface; its chrome should be quiet. Keep design-system notes in the review UI/docs rather than embedding developer terminology in a simulated product flow.

Store the approved visual intent, type scale, component-specific geometry, icon rules and rationale in DESIGN.md. Keep optional theme geometry in tokens.json, custom rules in theme-overrides.css or component variants, and cross-check registry output. Preserve user edits and prior approved artifacts when creating a refinement candidate.

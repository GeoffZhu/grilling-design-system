# Design translation rules

## UI images

Separate observed properties from inferred ones. Record palette roles, type proportions, border treatment, spacing rhythm, icon geometry and special component patterns. Preserve the recognizable composition and style when adapting Mobile UI to PC. Do not render the device frame as a product component. Extend the language to controls, menus, tables and overlays.

Implement image-specific components from the current input analysis; the generic starter is only scaffolding. Never reuse another session's subject matter or ornamental treatments as defaults.

## Non-UI images

Map material/light to surface and elevation, color relationships to semantic roles, dominant geometry to shape, visual rhythm to density, and subject character to typography/icons. State which qualities are translated. Offer two component treatments only when a planned high-impact decision needs them; otherwise derive one. Explain visible differences in everyday words. Avoid using the entire photo as a background to imitate its atmosphere.

## Foundation choices

- Color: foreground/background pairs, primary action, secondary, accent, muted, destructive, focus, charts and sidebar.
- Typography: rendered heading/body fonts, hierarchy, weight, line height, numeric/text specimens, CJK fallback when needed.
- Spacing: control height, rhythm, internal padding, component gaps and touch targets.
- Shape: radius scale, border contrast/width, elevation and selected-state treatment.
- Icons: show comparable action icons (add, search, back, check, settings) with explicit family, size, stroke, corner and fill decisions. Keep decorative characters separate.
- Motion: show real hover/press/open behavior, durations and easing; respect reduced motion.

Tokens alone cannot implement every style. Extend CSS and component variants when required; keep extensions in a dedicated theme file and include it in registry distribution. When changing template CSS, verify it reflects the accepted values in both preview and final library.

Apply frontend-craft.md for the design-intent and screenshot critique passes. Prefer a specific hierarchy of type weights, geometry and surface roles over globally applying one large radius and heavy weight. Every visible label, separator, illustration and motion should have a purpose in the image-derived design. The reference wins when it intentionally uses a familiar style.

## Responsive and accessibility

Use component specimens or relevant sections for preference decisions, with enough room to compare at readable sizes. Use full 16:9 Desktop and 9:16 Mobile frames side by side for the sole integrated presentation. Preserve zoom gestures and scrolling without zoom controls or hints. Separately use 1440×900 as the PC target and 390/360 px for Mobile checks. Keep primary touch targets at least 44 px and do not shrink type to force fit. Use actual focusable controls, labels, descriptions, and keyboard behavior. Apply antialiased font smoothing in every preview document.

Use AA contrast targets: 4.5:1 normal text, 3:1 large text and essential UI boundaries/focus. Fix low-contrast source details with a visible explanation during choice. Token reports are partial evidence, never blanket WCAG certification. Preserve familiar disabled affordances while ensuring context is clear. Avoid color-only status. Chart palettes also need labels/patterns.

Use meaningful custom APIs with controlled/uncontrolled state where useful. Do not bake example content into the component library. Group files under `components/custom/` as "Custom components" in galleries, and give every component its own specific name and detail page. Stickers may be original SVG/CSS approximations; identify them as interpretations, not extracted originals. Bundle required assets and licenses or state intentional limitations.

# Cat illustration usage

- `CatBackdrop` supports `page` and `card` variants.
- Keep the mascot decorative with an empty `alt` value and `aria-hidden="true"`. Important content must remain in text.
- Keep headings and actions in the component's protected content area. Do not place live text directly over the face or eyes.
- Use the amber color for focus and a small number of highlights; do not recolor the entire mascot per status.
- On narrow screens, let the page variant move below the copy. The card variant should be used only when its content remains readable at the target width.
- The portable optimized asset is embedded by `src/components/custom/cat-mascot-data.ts`. Preview-only files are not part of the reusable component source.

# Starry Current Workbench — Design Notes

## Purpose

This file preserves design decisions that should survive future regeneration. The system supports a SaaS administration application whose public homepage also carries brand and marketing responsibilities. Desktop Web and Mobile Web are first-class contexts.

## Reference translation

The reference is treated as visual evidence, not as product content. Its dominant deep-blue field becomes the application background and sidebar. Its small warm focal region becomes the primary action and selected emphasis. Cool secondary structure becomes borders, supporting surfaces, and chart colors.

The reference also contains directional, organic movement. That quality is retained as restrained orbit geometry in marketing regions. It is deliberately omitted from dense administration components, where exact alignment, predictable boundaries, and scanning speed matter more.

## Accepted decisions

* Use one dark color mode with `#071532` as the dominant canvas.
* Use `#E5C94A` sparingly for the highest-priority action, active metric, or brand mark.
* Use Noto Serif SC Variable for display headings and Noto Sans SC Variable for interface text.
* Use 10px controls, 20px surfaces, and 24px overlays.
* Use Lucide outline icons at 20px with a 1.75 stroke by default.
* Use 160ms motion with `cubic-bezier(0.22, 1, 0.36, 1)` and an immediate reduced-motion path.
* Keep marketing composition expressive and administration composition precise while sharing the same semantic tokens and interaction language.
* Deliver all visible documentation, examples, status text, errors, registry metadata, and accessible labels in English.
* Keep the integrated Key Visual as a documentation composition before the component directory. It is not a reusable component and is not part of the 71-component inventory.

## Ruled-out and superseded directions

* Flowing organic geometry is ruled out for dense tables, forms, menus, and administration cards because it competes with operational content.
* Broad gradients and decorative animation are ruled out because the reference relationship is carried by flat color dominance, focal contrast, and geometry.
* An earlier localized documentation pass was superseded by the approved English-only presentation. That revision changed copy and locale handling, not the approved visual tokens or geometry.
* Unselected comparison options are not treated as permanent rejections. Reopen them only when a future request changes the visual objective.

## Component guidance

* Reuse `src/components/ui` before creating a new administration primitive.
* Reuse `src/components/custom` for brand and marketing composition.
* Keep the primary action unique within an action group.
* Use semantic colors and the existing component role shadows; do not add one-off hex colors or shadows.
* Keep opened surfaces themed. Select, combobox, dropdown, context menu, popover, dialog, drawer, and sheet styling includes both trigger and opened state.
* Use inline validation for fields. Use toast notifications for transient page-level outcomes, never as the only field error.
* Preserve 44px primary touch targets and visible focus rings.
* Wide examples and tables scroll locally or reflow; they must not create document-level horizontal overflow.

## Marketing guidance

The homepage journey is illustrative: brand promise, entry actions, product proof, workspace preview, and supporting links. Sample metrics, project names, prices, and form outcomes are not production claims. No approved production imagery was supplied; the delivered orbit artwork is CSS-based placeholder brand expression and should be replaced only with approved assets that preserve the same dark-field and warm-focus relationship.

## Maintenance checklist

1. Read `DESIGN.md`, `tokens.json`, and this file before editing.
2. Keep the approved token hash stable unless a new visual direction is explicitly approved.
3. Update component source, examples, registry files, and documentation together.
4. Preserve English-only visible documentation unless the product language is explicitly changed.
5. Re-run the build, contrast report, Desktop and Mobile overflow checks, interaction checks, English-only scan, and clean-consumer registry installation.
6. Keep upstream attribution in `shadcn-snapshot.json` and `SHADCN-LICENSE.txt`.

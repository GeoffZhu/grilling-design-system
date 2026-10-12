# Ember Orbit design notes

## Reference translation

- The near-black canvas maps to `--background` and `--card`.
- Amber maps to telemetry, labels, status readouts, and secondary emphasis through `--accent` and `--secondary-foreground`.
- Ember orange maps to primary actions, active status, selected emphasis, and the central orbital focus through `--primary`.
- Dense edge telemetry and an open center become the three-column Desktop Hero; Mobile removes the side telemetry before reducing the primary narrative.
- Straight technical frames map to 2px control, surface, and overlay radii. Circular geometry is reserved for the orbital mark, nodes, icon-only actions, spinners, and status dots.

## Durable decisions

- Product scope is a standalone Marketing design system with nine custom component families.
- The approved version is English-only in gallery chrome, examples, metadata, accessibility labels, and `DESIGN.md`.
- The language revision did not alter the approved palette, density, type hierarchy, or interaction model.
- Rajdhani is reserved for display hierarchy, Inter for body and controls, and IBM Plex Mono for telemetry and labels.
- Saturated color is scarce by design: primary orange is for action or active state; amber carries information; muted gold supports secondary copy.
- The Select uses a custom portaled popup so the trigger, options, selected state, disabled state, collision handling, and keyboard behavior share the same theme.

## Scope and exceptions

- Modal, tabs, table, toast, admin navigation, and destructive workflows are not part of this Marketing inventory.
- The integrated Key Visual is documentation-only. It imports delivered components and is not a tenth reusable component.
- Preview modules, gallery files, `IntegratedPreview.tsx`, and build output are not part of the portable component source set.

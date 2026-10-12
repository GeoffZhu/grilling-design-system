# Token audit for an existing project

Read after optimization scope is resolved and before changing styles. Apply to inspected `targetPaths` and their actual shared dependencies, using [existing-project.md](existing-project.md). This is a scoped source review, not a new migration or scanning command.

Adapted from [ui-skills /tokens](https://github.com/dawitlabs/ui-skills/blob/6973cc6df7772780d31a4891fb60859f53f3e0b2/skills/tokens/SKILL.md) and its token-system reference. Preserve the host architecture and confirmed visual rules.

## Find the source of truth

Locate CSS custom properties, theme configuration, Tailwind configuration, CSS-in-JS theme objects and component variants used by the target pages. Read existing DESIGN.md and inspect imports and variable resolution before proposing a token. An equal literal value does not prove equal meaning.

Use `rg` on the resolved files to find repeated colors, spacing, typography, radii, shadows and z-index values, arbitrary utilities and inconsistent semantic-token use. Follow aliases to their definitions. Ignore dependencies, build outputs and unrelated examples; treat search hits as candidates for review, not automatic violations.

Record findings in PROJECT/token-audit.md:

| Location | Current value/token | Role | Existing token or proposed mapping | Affected pages | Disposition and verification |
| --- | --- | --- | --- | --- | --- |
| Actual file/selector | Literal or resolved token | What it means here | Reuse, extend or retain | Inspected consumers | Repair, justified exception, or deferred outside scope |

Use this table for the current task; do not require a new machine-readable artifact. Capture representative baseline views when available.

## Decide by meaning and scope

- Reuse an existing token when its semantic role matches. Extend the host's conventions only when a recurring role has no suitable representation.
- Keep primitive values, semantic roles and component-specific exceptions conceptually distinct; do not force an existing system into a new three-layer JSON format.
- Do not merge action and error colors just because their current hex values match. Do not merge nearby spacing values when the reference or optical alignment justifies their difference.
- Permit structural layout calculations, one-pixel boundaries, licensed/brand assets, third-party styles and deliberate optical corrections when appropriate. Record important exceptions rather than creating tokens for every literal.
- Prioritize broken or unreadable UI and repeated shared inconsistencies, then local polish. For repeated issues, inspect the shared token/component first; changing a token is appropriate only when its consumers share the intended meaning.
- List affected consumers before shared changes. Use a scoped variant when a global edit would change unrelated pages; do not broaden `targetPaths` to authorize unrequested work.

## Repair and recheck

Apply one coherent category of changes at a time. Preserve APIs, data flow and behavior. Compare affected pages against the baseline and confirmed design, including state combinations and Mobile layouts. Track shared fixes once and verify each relevant consumer instead of repeatedly restyling the same component.

Re-run the targeted search and inspect the remaining candidates. Verify resolved styles and CSS cascade where browser access exists; a lower literal count is not an acceptance criterion. Run the host's applicable build/typecheck/lint and existing behavior checks through the normal workflow. Record unavailable visual checks honestly.

Carry final semantic mappings into DESIGN.md section 2 and important exceptions, scope and reuse guidance into section 13/design-notes.md. Keep the temporary audit in PROJECT for normal cleanup. Source findings can inform existing `visualReview.observations` areas such as `spacing`, `shape` or `states`; never describe a source search as visual proof.

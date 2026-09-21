# Complete the canonical DESIGN.md

Use [DESIGN.template.md](../assets/DESIGN.template.md) as the required output structure. Keep the title and all 13 numbered section headings in their original order. Preserve every subsection, field, and rule; fill values from the final implementation and settled design. Translate explanations and values into the user's language while retaining the template's headings, field labels, code identifiers, and paths.

Resolve DESIGN_DOC with project-output.md: Web application root/DESIGN.md for integration, or LIBRARY/DESIGN.md for standalone delivery. library.js generates a standalone draft; design_document.js --context uses inspected host environment and path mappings for integrated drafts. Both fill available tokens, paths, inventory, decisions, and evidence. Complete project-specific fields before delivery; placeholders do not constitute a finished document. In integrated mode, preserve and merge existing root standards.

## Fill from evidence

- Design Direction: infer product type from existing context or describe a neutral component library when no product exists. Record the selected visual style and its principles. Do not invent product requirements.
- Design Tokens: name every allowed value and semantic role used in source. Map surface to card and text-primary to foreground where appropriate. For text-secondary, primary-hover, success, and warning, inspect the actual token or state implementation; define missing semantic roles consistently in code before documenting them. Do not invent a hex value only in the document.
- Typography, spacing, and radius: record the actual role scale, padding, gaps, and component geometry. Start from the template's allowed spacing scale; if the confirmed system uses another scale, document that exact scale and its rationale. Reconcile starter CSS and component overrides rather than declaring compliance with a scale they do not use.
- Layout and Interaction Patterns: inspect the implementation for widths, breakpoints, responsive rules, forms, search, and save behavior. Use a concise "Not applicable: reason" for features absent from the component-library scope. Do not build unrelated product pages merely to fill the template.
- Components: retain the required usage rules and preserve official shadcn APIs. Explain primary/default and md/default mappings. Add custom components within this section when needed.
- UI States, UX Writing, Accessibility, and AI Rules: retain the template's rules. Document the chosen writing style, relevant states, target sizes, and actual verification limits. Accessibility targets are not evidence of passing.
- Implementation, Reference Screens, and Canonical Components: use existing paths relative to the directory containing DESIGN_DOC. In Web projects these are relative to the application root, even when the component destination is elsewhere. Inspect custom/shared components and reference screens. In section 9, record the repository-specific start or install command, global stylesheet entry, required root providers, public import convention, and gallery/docs command when present; keep these consistent with the final usage handoff. Mark absent screen types as not applicable with a reason; never fabricate paths or duplicate components to fill a field.
- Project-Specific Rules: complete concrete image-derived rules and exceptions. Preserve snapshot, history, custom guidance, and source attribution as subsections within section 13. Keep contrast and verification evidence inside section 8.

Do not turn template fields into questions. Reuse project context, the reference, accepted choices, and consistent agent-derived rules. Only an unresolved high-impact visual choice can use the remaining question budget.

## Regeneration and completion

Before regenerating, preserve the completed DESIGN_DOC with the normal project backup. The renderer writes PROJECT/DESIGN.draft.md under `.tmp/grilling-design-system` instead of overwriting when root DESIGN.md already exists in integrated mode, or when a standalone DESIGN.md no longer carries the draft notice; merge it into the existing document. Keep durable guidance in design-notes.md or IMAGE-COMPONENTS.md; the generator imports or links these under section 13. Reapply project-specific values and translations after regeneration, checking them against current tokens and code.

Before reporting delivery:

1. Complete every placeholder, example-only value, empty field, and reference path. Retain all 13 sections even when a field is not applicable. Remove the generated-draft notice after completing the document; preserve approval/simulation status and verification limits.
2. Verify colors, type scale, spacing, radii, icons, layout, interactions, and canonical paths against the final library and registry. Fix drift in code or documentation according to the accepted specification.
3. Run the structural completion check:

~~~sh
node "$SKILL/scripts/design_document.js" --check "$DESIGN_DOC"
~~~

This check catches missing/reordered sections, template placeholders, and empty value slots. It does not prove that design rules or paths match the implementation; inspect those separately. Deliver the component library and completed DESIGN.md together.

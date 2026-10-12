# Marketing page and Key Visual review

Read for Marketing tasks or SaaS sessions with `includeMarketingHomepage: true`, when composing the page and before presentation. Keep the nine-family inventory and docs-only Key Visual boundary from [product-flows.md](product-flows.md).

Adapted from [ui-skills /landing](https://github.com/dawitlabs/ui-skills/blob/6973cc6df7772780d31a4891fb60859f53f3e0b2/skills/landing/SKILL.md). Use conversion patterns as review prompts; the reference, real product and confirmed preferences determine the composition.

## Clarify the visible task

Use supplied context and the existing product to state what the offer does, who it serves and the primary next step. A non-UI reference may use an explicitly illustrative scenario in the design intent. Do not add a product/audience questionnaire or fabricate capabilities to fill a landing-page formula.

Inspect the first viewport on Desktop and Mobile: can a reader identify the offer and next action from the heading, supporting text and visual? Make the primary CTA visible and distinguishable where the task calls for it. Preserve intentional reference compositions; explain adaptations instead of automatically compressing every hero to force all content above the fold.

## Review the journey

- Check heading, supporting copy and CTA describe the same offer. Use [ux-writing.md](ux-writing.md) for concrete actions and useful field, error and success copy.
- Keep one clear primary action per action group and subordinate secondary actions. Check CTA visibility, long-label wrapping and touch operation at real device sizes.
- Follow buttons, links, navigation, form submission and validation to their actual results. Preserve established routes and business behavior. A demo action must show honest demo feedback or navigate within the specimen, not imply a real purchase or signup occurred.
- Order sections to answer the current task's questions. Features, proof, pricing, FAQ and repeated CTAs are useful when supported; no fixed sequence or mandatory section count applies. Do not remove useful navigation solely to reduce exits.
- Retain the reference's hierarchy and color distribution; do not impose a universal color ratio, whitespace multiplier or animation style.

## Keep claims grounded

Use only supplied or verified customer names/logos, testimonials, ratings, user counts, prices, guarantees, trial terms, certifications and measured benefits. Do not invent social proof or security badges. Omit unsupported proof sections or use clearly identified illustrative content in a specimen; examples must never be presented as real endorsements.

Keep placeholder-image handling consistent with SKILL.md. Preserve approved and licensed imagery. Record missing production assets and important content assumptions in the design notes instead of substituting invented evidence.

## Distinguish real pages from documentation

For an actual Marketing page in scope, inspect the rendered title/description and existing sharing metadata, correcting known factual mismatches within the task. Check that a critical above-fold Hero image is not unnecessarily lazy-loaded and has appropriate dimensions; use host image tooling and reserve high priority for the actual critical resource. Reuse approved sharing assets; record missing assets rather than inventing an image or publishing it. Report performance metrics only when measured under stated conditions. Do not introduce a new performance gate.

A component gallery or SaaS homepage Key Visual is documentation. Review its visual hierarchy, copy and representative interactions, without adding a business route, SEO implementation, deployment task, analytics or another component export. Reusable parts remain within the required custom families.

## Record the review

Use existing `visualReview.observations`: `composition` for hierarchy/journey, `copy` for claims and wording, and `states` for CTA/form behavior. Record concrete findings and repairs, plus actual checks or capability limitations. Fix broken actions and misleading content using the current review loop; subjective suggestions do not create another approval gate.

Document final page rules and deliberate exceptions in DESIGN.md sections 1, 5, 7 and 13 as applicable. A clearer hierarchy is a design observation, not evidence that conversion increased; claims of improvement require real outcome data.

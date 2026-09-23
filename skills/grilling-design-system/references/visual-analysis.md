# Read the image before choosing the system

- [Content and treatment](#1-separate-content-from-treatment)
- [Visual relationships](#2-extract-relationships-not-a-bag-of-attributes)
- [Internal differences](#3-preserve-the-images-internal-differences)
- [Implementation mapping](#4-translate-evidence-into-implementation)
- [Specimen selection](#5-let-evidence-choose-the-specimen)
- [Fidelity review](#6-review-for-lost-information)

Use this before writing tokens, choosing specimens, or adapting an existing system. Write the findings in PROJECT/interpretation.md and the implementation mapping in PROJECT/visual-translation.md. Reuse these documents across stages; update affected rows after feedback. This is agent work, not an extra questionnaire. Scale the detail to the image: inspect every meaningful region, merge repeated instances, and record absent or unreadable properties honestly.

Keep each finding in one place. Reference region and translation IDs from the decision tree and design intent instead of repeating the analysis. Summarize uncertainty once when several absent properties share the same cause.

## 1. Separate content from treatment

View the complete original image first, then inspect important regions at readable size. Use real crops when tools allow; retain their coordinates and the source image identity. Do not infer small text, exact fonts, materials, or interactions that the image does not establish. A crop is evidence of a detail, not a replacement for the whole composition.

Check transparency and image bounds when relevant. A viewer's black, white, or checkerboard backdrop is not an observed image color. Distinguish transparent space from painted negative space before deriving a color mode, surface palette, or crop.

Map content before applying style labels. Describe what each region contains, what gets attention first, and how regions relate. For UI, distinguish navigation, primary task, supporting information, repeated collections, feedback, media, and utilities. For non-UI images, describe subjects, foreground/background planes, clusters, negative space, edges, and focal points; any product use is an interpretation. For mixed references or collages, map panels separately before identifying shared rules. Do not average distinct panels into one style.

Use stable region IDs and this table in interpretation.md:

| Region / approximate bounds | Visible content and role | Order, grouping, and relative prominence | Treatment and distinguishing detail | Confidence / uncertainty |
| --- | --- | --- | --- | --- |

Then write the content structure in a few lines: hierarchy, representative action or subject, supporting content, repeated patterns, and omissions. Separate reusable component anatomy from page arrangement and from sample copy. Infer useful specimen content from this structure; do not replace it with an unrelated dashboard or a uniform card grid. Preserve text length, numeric prominence, media proportions, and grouping when they affect the design, even when exact wording is unreadable.

## 2. Extract relationships, not a bag of attributes

Record the following dimensions against region IDs. Use relative estimates when measurements are unavailable. Words such as playful, premium, minimal, or modern are a summary, never the evidence.

| Dimension | What to record |
| --- | --- |
| Composition | Reading order, dominant/supporting areas, alignment axes, asymmetry, spacing between clusters, framing, overlap, and intentional empty space. |
| Color | Large-area surfaces, text, actions, accents, media-only colors, adjacent color pairs, and approximate prominence. Distinguish broad low-saturation fields from small saturated marks. Do not turn every sampled color into a UI status. |
| Typography | Display/body/label/metadata/numeric roles, size and weight contrasts, width, casing, tracking, line length, wrapping, and text-to-image balance. Separate visible letterform qualities from guessed font names. |
| Geometry | Shapes by role: containers, controls, indicators, dividers, media masks, and motifs. Record mixed corners, ratios, nested insets, irregular silhouettes, and where shapes stop recurring. |
| Density and rhythm | Dense versus open regions, padding compared with gaps, compact repeated rows versus larger focal content, and alignment inside compound elements. |
| Surface and depth | Flat versus raised layers, border hierarchy, shadow direction/hardness/spread, translucency, texture, and the regions where these occur. Absence of depth is evidence too. |
| Icons and imagery | Outline/fill, stroke and optical scale, illustration/photo/graphic roles, crop, aspect ratio, layering, and decorative versus interactive marks. Do not replace a dominant illustration with a generic action icon. |
| State cues | Only visible selected, disabled, focused, or expanded treatments. Label hover, motion, hidden states, and Mobile behavior as derived unless shown in the reference. |

Distinguish three sources: observed in the image, explicitly chosen by the user, and inferred by the agent. An accessibility repair is a derived adaptation with a reason, not a newly observed property.

## 3. Preserve the image's internal differences

Identify the few relationships that make this reference recognizable and rank them by prominence, repetition, and distinctiveness. Record both what must survive and what should remain quiet. A title's scale relative to body copy, a colored field beside a neutral list, or a soft media mask next to precise controls can matter more than any exact hex value.

Group recurring treatments by role, using as many groups as the evidence warrants. A reference may combine expressive focal content, calm working controls, and dense supporting rows within one coherent system. Record each group's typography, spacing, surface, shape, and emphasis, plus the shared rules that connect them. These groups coexist in the chosen design; they are not mutually exclusive A/B directions. A simple reference may need only one group with a clear emphasis hierarchy. Never invent extra styles to meet a diversity quota.

For each important relationship, state:

- **Invariant:** the relationship to retain, with supporting region IDs.
- **Adaptation:** what may change for readability, accessibility, responsive use, or missing components.
- **Boundary:** where this treatment belongs and where it would obscure the task.

Do not assume consistency means identical radii, elevation, saturation, density, or type weight everywhere. Equally, do not scatter motifs over every control. The reference determines both variation and restraint.

## 4. Translate evidence into implementation

Create visual-translation.md before the direction specimen. Use one row per important relationship or recurring component pattern, retaining stable IDs. Begin with planned targets and replace them with actual files/selectors/variants as implementation progresses.

| Evidence / priority | Rule to preserve | Scope and exceptions | Implementation target | Specimen / verification | Status and reason |
| --- | --- | --- | --- | --- | --- |

Choose the smallest appropriate implementation layer:

- **Foundation token:** a repeated semantic value, such as color roles, type roles, spacing, or depth. Supply explicit craft and family signature values where the generator supports them.
- **Component rule or variant:** role-specific typography, density, surface, geometry, or state behavior. Use theme-overrides.css or host-native styles when tokens cannot express the rule. Preserve supported APIs and accessible primitive behavior.
- **Custom component:** a recurring anatomy or interaction absent from the standard inventory. Give it a specific name, real props, and a registered preview. For shadcn-based SaaS, do not create a custom component merely to restyle Button or Card. Marketing and SaaS homepage families are deliberately custom; follow product-flows.md.
- **Asset:** an image, illustration, texture, or icon essential to the reference's composition. Preserve authorized assets; identify interpretations and placeholders. Placeholder imagery preserves aspect ratio, crop, placement, and visual mass but does not prove fidelity to the original imagery. Follow the skill's image-source policy.
- **Docs composition:** reading order, section scale, asymmetry, or media placement that belongs in the integrated Key Visual. Compose delivered components without exporting a business page as a reusable component.

If the generator cannot express a high-priority rule, implement the extension before calling that rule covered. A token name or a sentence in DESIGN.md is not an implementation. Inspect style-provenance.json for inherited defaults; keep a default only when it fits the recorded evidence or a documented adaptation. Do not change defaults merely to make a count look better.

Record status as planned, implemented, adapted, or omitted. Explain adaptations and omissions, especially for prominent features. Unresolved high-priority omissions require repair or explicit disclosure before review; never silently drop them during full-library generation.

## 5. Let evidence choose the specimen

Show the smallest specimen that preserves the relationship under review. A button pair can resolve control corners; it cannot demonstrate editorial hierarchy, irregular media framing, or contrasting dense/open regions. For those decisions use a relevant section or a small composition that includes the required context.

When comparing A and B, keep the content anatomy, unrelated treatments, and confirmed rules constant. Vary only the unresolved relationship. Do not split coexisting reference traits into competing options or spend questions rediscovering visible evidence. Carry all settled treatments into the selected system.

Before expanding the library, implement a representative reference-derived fragment and the reusable components it contains. Extend those rules to unseen component families by analogy, documenting the inference. The original image remains the source of truth; a generated Key Visual does not become evidence that its own styling matches the image.

## 6. Review for lost information

Compare the original image, the rendered reference-derived fragment, and representative ordinary components. Inspect actual screenshots when available. Use these diagnostic checks, not a numerical style score:

- **Hierarchy:** does the reading order, relative scale, spacing, and balance of dense/open areas still match? Has everything become equally prominent?
- **Silhouette:** ignoring hue, do geometry, typography, grouping, and depth retain the observed character? A palette-led reference may depend chiefly on color; say so rather than inventing non-color traits.
- **Distribution:** are dominant surfaces and small accents used in similar roles and proportions, or has one accent flooded every control?
- **Content anatomy:** are media, labels, numbers, metadata, and actions still grouped and proportioned intentionally? Has a recurring pattern been replaced by an unrelated generic card?
- **Transfer:** does the signature remain visible in ordinary components away from the Key Visual, while quiet rows and utilities remain quiet? Trace rules to the delivered styles and variants.
- **Assets:** if media or texture carries much of the reference, identify what placeholders cannot validate. Do not compensate by decorating unrelated controls.

Write concrete findings against translation IDs in visualReview.observations under area: reference, then repair and recapture. Check the mapping again after full generation and registry assembly. Builds and coverage tables establish implementation evidence, not visual similarity.

Before PROJECT is removed, distill the final region-derived rules, treatment scopes, implementation mapping, adaptations, and limitations into LIBRARY/design-notes.md and DESIGN.md sections 1 and 13. Preserve decisions, not temporary crops, session files, or candidate histories.

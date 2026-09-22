# Plan the visual decision tree

Before asking, map the full visual tree in PROJECT/decision-tree.md using interpretation.md and visual-translation.md from visual-analysis.md. This is an agent planning artifact, not a questionnaire for the user. Cover each branch below, its dependencies, known evidence, remaining alternatives, and the downstream rules each answer would settle. Infer content and page structure; ask only about an unresolved visible treatment. Preserve treatments that coexist in the image instead of making the user choose between them.

| Branch | Component evidence | Downstream decisions |
| --- | --- | --- |
| Composition and emphasis | A reference-derived section with title, media, and supporting content | Relative scale, alignment, dense/open rhythm, color distribution; derive content and page structure |
| Palette and surface hierarchy | Action, field, card, muted text | Semantic colors, emphasis, borders, feedback, chart roles |
| Typography and rhythm | Heading, label, body, numbers | Type roles, line height, control height, spacing density |
| Geometry and depth | Button, input, card, overlay | Corner hierarchy, nested insets, border weight, shadows |
| Icon language | The same action icons | Family, stroke, fill, optical size, text alignment |
| Imagery and motifs | The same media region or recurring graphic | Crop, mask, layering, texture, and scope; separate decorative marks from interactive icons |
| State treatment and motion | Focus, selection, errors, opening | State colors, indicators, transitions, reduced motion |
| Responsive adaptation | The same component at relevant widths | Wrapping, spacing changes, touch areas, overflow |

Record known user preferences and image evidence first. Mark decisions as user-selected, image-derived, or agent-derived, with a short reason. Do not claim an inference is a user selection. Accessibility requirements constrain every branch; they are not optional preference choices.

Rank unresolved decisions using three factors: visible impact, number of affected component families, and uncertainty after considering the reference. Prefer one answer that settles several related rules. Do not combine unrelated differences into a confusing choice. For each possible answer, describe which branches become fixed and which meaningful uncertainty remains.

Default to a maximum of three initial preference questions across all stages. Use a smaller explicit user budget when provided. Reserve questions for the highest-ranked unresolved nodes; derive the rest consistently. Do not spend the budget on font names, pixel values, technical implementation, product context, or questions already answered.

For each selected node, record:

1. The visible decision, its rank, and why asking is necessary.
2. Two mutually exclusive treatments with the same content and state.
3. The smallest specimen that distinguishes them and its required viewport(s).
4. What answer A or B settles and how to derive the remaining rules.

Examples: show the same buttons and fields for rounded versus squared controls; the same card for border versus shadow separation; the same five icons for filled versus outlined symbols. Use a relevant page section only when local samples cannot show the difference.

After every answer, update the tree and remove resolved questions. A canceled or unanswered question remains pending; do not replace it with a derived checkpoint to evade the missing answer. Derive only decisions that were never put to the user or that their later instructions explicitly resolve.

Direction, foundations, and components are checkpoints. Use reviewType: choice only for a planned question. Questions need not be distributed evenly across stages: set continueStage: true on a choice round when the next planned decision belongs to the same stage. Keep previously selected rules fixed in subsequent candidates. Use reviewType: derived with one candidate and a derivation rationale when no question is needed. Record complete rules even if the specimen illustrates only one branch.

The full-page stage uses reviewType: presentation with one integrated design. Preference discovery has ended. Invite freeform corrections or confirmation without another choice popup. If feedback reopens a branch, update only affected rules and questions; explicit feedback usually permits a derived revision without another preference question.

# UI writing review

Read when authoring specimen copy and before presenting the integrated result. Apply to the current product and target pages, including accessible labels. Follow [language.md](language.md) for the user's language and runtime translations; preserve the short choice-page intro required by SKILL.md.

Adapted from [ui-skills /copy](https://github.com/dawitlabs/ui-skills/blob/6973cc6df7772780d31a4891fb60859f53f3e0b2/skills/copy/SKILL.md). Use the task, reference and confirmed preferences to choose tone; do not impose a fixed word count or marketing voice on every control.

## Inspect the context

Identify the action and real outcome before rewriting. Reuse product terminology, names, units and factual claims. If the reference text is unreadable, derive honest sample copy with similar length and hierarchy; do not invent product capabilities.

For existing projects, locate the localization library, message files and keys used by target pages. Edit messages at their source, preserving keys, interpolation variables, plural/select branches, formatting and fallback behavior. Use the host's message format; do not replace translated expressions with component literals. Check consumers of shared keys and keep changes inside the agreed scope. A new key is appropriate when an existing shared message has a different meaning elsewhere.

## Review by task

| Surface | Check | Example when supported by the product |
| --- | --- | --- |
| Action | Name the action or destination; make primary and secondary choices distinguishable. Generic words need surrounding context. | Save changes; Create project |
| Error | State what failed and a useful next step. Preserve input; never promise an unavailable retry or expose internal details. | Could not save. Check your connection and try again. |
| Empty state | Explain what belongs here and offer a supported next step. Distinguish first use from no search results and lack of permission. | No matching projects. Clear the filters. |
| Loading/success | Name the operation or result when useful. Keep updates short and avoid invented progress or completion. | Saving changes…; Changes saved |
| Confirmation | Name the object, consequence and reversibility. Make the destructive action explicit. | Delete “Q4 report”? This cannot be undone. |
| Field/help | Keep a visible label; use placeholders for realistic examples. Explain constraints before errors when useful. | Email / name@example.com |
| Heading | State the section's purpose or strongest supported claim; maintain the reference's hierarchy. | Team permissions |
| Icon action | Give a concise accessible name consistent with the visible action and current state. | Close dialog |

Use everyday words and concrete verbs. Remove redundant descriptions, ornamental eyebrows, generic encouragement and unexplained jargon. Keep necessary consequences, legal/product constraints and useful instructions even when they need more than one sentence. Preserve meaningful reference content rather than deleting it to meet a length target.

For Marketing claims and CTA journeys, also apply [marketing-review.md](marketing-review.md). Do not add unsupported benefits, trial terms or customer endorsements to make copy sound stronger.

## Verify in context

- Render normal and long labels, titles, error messages, empty states and confirmation objects on Desktop and Mobile. Exercise applicable states rather than reviewing only the default screen.
- Check CJK fallback and natural wrapping for Chinese sessions; for existing multilingual projects inspect the affected available locales, interpolation and plural output. Do not add a new locale just for the check.
- Check that wording fits without unintended truncation, overflow, shifted actions or obscured meaning. Repair wrapping/layout where needed; never shrink text or remove critical information just to fit.
- Confirm labels, instructions and actual behavior agree. Keep the tone consistent across the task, while allowing different product areas to use their documented voice.

Record concrete findings, repairs and actual verification in `visualReview.observations` under `copy`; use `composition` for layout effects and `states` for behavior. Use [verification.md](verification.md) to disclose unavailable browser checks. Recheck affected views after edits.

In DESIGN.md section 7, record voice, terminology and a few actual examples, plus the host message location when relevant. Preserve related state and interaction rules in sections 5 and 6. Keep process notes out of sample product screens.

# Runtime language and English skill source

Keep skill instructions, examples, metadata, and bundled copy in English. Use the language of the user's instructions for generated replies, questions, previews, and design explanations. Do not infer a language change from pasted code or an image.

- Studio: pass --language at initialization. For English variants, use the bundled English copy. For every other language, translate each key from assets/studio-copy.json into a flat JSON object saved in PROJECT and pass --ui-copy. Later rounds can update language and uiCopy. Existing saved translations remain readable.
- Boards: set content.language and translate title, headline, description, cards, bodyHtml, extraHtml, and accessible labels.
- Library: use the host localization system for integrated components. For standalone generation, pass --language to library.py. For non-English sessions, pass --ui-copy with a flat translation of assets/library-copy.json keys on every generation, including delivery. These keys also cover the supplemental gallery demos. The generator preserves App.tsx, so inspect and translate it when resuming.
- Downloaded examples: translate visible headings, buttons, notices, errors, placeholders, and accessible labels. Preserve import paths, exported names, APIs, and code values.
- DESIGN.md: use assets/DESIGN.template.md and keep its 13 numbered headings and subsection structure. Translate completed explanations and values into the user's language while preserving headings, field labels, commands, identifiers, paths, confirmed facts, and verification limits. Recheck after regeneration.

Describe visible differences in everyday words, such as "Larger text and more space between buttons." Explain necessary technical terms immediately. Keep color codes, font details, and developer notes in design documentation. Sample product screens should use concrete actions such as "Save," "View orders," and "Enter your email."

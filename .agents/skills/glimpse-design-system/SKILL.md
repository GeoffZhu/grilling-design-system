---
name: glimpse-design-system
description: Derive a PC and Mobile Web design system from an inspiration image using a planned set of high-impact visual component choices, focused HTML previews, and the host agent's single-select question tool. Use to compare or revise UI styles and deliver a complete themed shadcn/ui component library with a matching DESIGN.md.
---

# Glimpse design system

Deliver both a working shadcn/ui design system adapted to the project framework and DESIGN.md that describes its final specification. These are mandatory outputs; a preview, token sheet, or design proposal alone is incomplete. Preserve confirmed preferences and distinguish user choices from agent-derived rules. Never treat silence, a timeout, or a preselected answer as approval.

Use [DESIGN.template.md](assets/DESIGN.template.md) for DESIGN.md. Preserve its 13 numbered sections and required fields. Read [design-document.md](references/design-document.md) for evidence-based completion, API mappings, and the final completeness check.

## Language and communication

Keep this skill's instructions, examples, metadata, and bundled source copy in English. Generate replies, questions, preview copy, accessible labels, and design explanations in the user's main language. A pasted reference does not change that language. Keep file names, code identifiers, and proper names unchanged; set HTML lang accordingly. Read [language.md](references/language.md) for runtime translations.

Use short sentences and everyday words. Describe visible differences, such as "Rounder buttons" or "Larger text and more space between fields." Keep implementation notes out of sample product screens.

## Plan the decisions before asking

Read [decisions.md](references/decisions.md). Before the first preference question, write PROJECT/decision-tree.md covering the entire visual decision tree, dependencies, known preferences, remaining uncertainty, and which branches each answer would settle. Rank unresolved decisions by visual impact, reuse across components, and uncertainty.

Default to at most three preference questions across the initial direction, foundation, and component stages combined; use fewer when evidence is sufficient. This is a ceiling, not a quota. Ask one decision at a time. Recompute the remaining branches after each answer instead of following a fixed questionnaire. New user-requested changes can reopen affected branches without repeating settled questions.

Every preference question must compare visible component treatments: color relationships, type hierarchy, spacing, corners, borders, shadows, icons, or interaction states. Infer product context, content, platform defaults, and implementation details. Do not ask the user to choose a product, audience, feature set, page structure, framework, or delivery format. Derive lower-impact rules from the image and accepted choices, documenting their basis without claiming the user selected them.

## Show enough to decide, then use the host tool

For a selected preference decision, publish two comparable options, A above B, at a useful size. Keep content, state, and unrelated visual rules constant. Show the smallest specimen that makes the difference clear: buttons, an input group, icon samples, a card/list item, state examples, or a relevant page section. A complete page is optional during preference discovery. Show both device contexts only when responsiveness changes the decision.

Write the option page intro as a short, direct instruction naming the user's action, such as "Choose your preferred button corners." Add at most one short instruction about where or how to respond when needed, such as "Return to chat and choose A or B." Omit background, image interpretation, design rationale, process commentary, and repeated hints from the intro. Put visible differences under each option and keep rationale in project documents. Apply this rule to the studio and any custom comparison HTML.

Use a specimen viewport sized for readable components; see [protocol.md](references/protocol.md). Reserve full Desktop and Mobile frames for page-level context and the integrated presentation. Keep designed type and control sizes, scrolling, open links, and browser zoom. Do not add zoom buttons, sliders, percentages, or hints. Apply `-webkit-font-smoothing: antialiased` and `-moz-osx-font-smoothing: grayscale` to every preview document, including iframe content. Tailwind's `antialiased` utility is equivalent.

Keep the review HTML for viewing only. Do not add feedback forms, option checkboxes, selection counts, or decision buttons. Example components remain interactive. Publish working links before asking. Then call the actual question tool supplied by the host agent, such as AskUserQuestion or a native equivalent, using its real schema and single-select behavior. Set `multiSelect: false` only if the tool supports that field. Do not invent a tool or force a particular API name. Read [choices.md](references/choices.md) for tool adaptation and answer recording.

If a stage has no important unresolved choice, publish one derived specimen with its rationale and continue without a question. The full-page preview always presents one consolidated design; it never asks for another A/B preference.

## Start

Read [project-output.md](references/project-output.md) first. Resolve SKILL, the final component destination LIBRARY, the design document path DESIGN_DOC, and the separate working directory PROJECT before generating code. A user-specified directory has first priority. Always inspect whether the current application is a Web project, including when an output directory was specified. In a Web project, default LIBRARY to the actual source root/design-system and DESIGN_DOC to the Web application root/DESIGN.md; adapt to its build and code conventions. Outside a Web project, create a complete standalone app at the requested directory or cwd/design-system, with DESIGN.md at that app root. PROJECT stores sessions, candidates, decisions, translations, and caches under the resolved .glimpse working directory. Record and reuse PROJECT/project-context.json. Python 3.10+ is needed for helper scripts; Web integration uses the host runtime/package manager, while the standalone scaffold requires Node 20.19+ and npm. Network is needed for the first upstream download. Read [protocol.md](references/protocol.md) before using scripts, and [design-rules.md](references/design-rules.md) plus [frontend-craft.md](references/frontend-craft.md) before designing. No particular browser CLI or browser installation is required. Use available host capabilities for visual checks; record unavailable checks honestly as described in [verification.md](references/verification.md).

1. Read PROJECT/session/session.json if present and resume nextStage. Never restart implicitly.
2. View the actual input image with an available image tool. Locate attachments; never fabricate replacements. If a required image is inaccessible, request its local path while retaining any available analysis.
3. Default to PC Web and Mobile Web. Infer specimen content from the image; use neutral content for non-UI images.
4. Classify UI / non-UI / mixed. Preserve observed palette, typography, silhouette, density, icons, and component patterns. For non-UI references, distinguish interpretation from observation. State uncertainty about exact fonts and colors.
5. Default to one color mode matching the image. Add another only on request.
6. Write PROJECT/interpretation.md and PROJECT/decision-tree.md. Reuse existing choices when resuming.
7. Initialize and serve:

~~~sh
python3 "$SKILL/scripts/studio.py" init --session "$PROJECT/session" --image /path/to/image.png --name "Design name" --language en
python3 "$SKILL/scripts/studio.py" serve --session "$PROJECT/session" --port 4310
~~~

Set --language from the conversation. For non-English copy, translate the English keys in assets/studio-copy.json into PROJECT/studio-copy.json and pass --ui-copy at initialization. Keep the server running in a persistent terminal and share its actual URL. Record real user responses with studio.py decide. If the host ends the turn while awaiting a choice, explain how to resume; saved state remains authoritative. No background AI service is included.

## Build the system

Follow image interpretation → planned visual choices → foundations → components → one integrated presentation → feedback or confirmation → full delivery. Direction, foundations, and components are implementation checkpoints, not three compulsory questionnaires.

### Direction

When broad component styling is the highest-impact uncertainty, create two coherent visual treatments close to the image, varying one or two related qualities. Use the same component content for comparison. Otherwise record one derived treatment.

Write a compact design intent: image evidence, base colors, type roles, alignment, one visual priority, geometry, icons, motion, and representative copy. Review it against the image before coding. Carry the intent into later stages and DESIGN.md.

Supply complete token JSON per candidate. Use scripts/board.py as a neutral shell with agent-authored content and layout. Include observed special components or image-inspired geometry. Set content.language and translate all visible copy. Focus the specimen on the planned decision.

### Foundations

Define color, typography, spacing, shape/border/shadow, icon style, and motion. Cover all six in the specification; only ask about unresolved groups that warrant the remaining question budget. A small focused specimen can explain a decision while its candidate carries the complete token object. Keep settled values constant across alternatives.

Show actual type and icon samples, including optical size, stroke, corners, and fill where relevant. Bundle or install the chosen open font, document fallback and license, and do not claim an unavailable font was tested. Derive routine state, spacing, and motion rules consistently. Written changes require a revised visible specimen before they can be accepted.

### Components and states

Build real components in the resolved environment. In a Web project, follow project-output.md: reuse its framework, language, styling, primitives, aliases, package manager, and code style; expose a specimen through its existing preview mechanism. Fetch source inputs with library.py --sources-only when needed. The following scaffold command applies only outside an existing Web project:

~~~sh
python3 "$SKILL/scripts/library.py" --tokens "$PROJECT/chosen-tokens.json" --output "$LIBRARY" --cache "$PROJECT/cache" --language en --install --build
~~~

For the standalone generator, set --language from the conversation and supply --ui-copy when needed. Customize LIBRARY/src/App.tsx and LIBRARY/src/components/custom/. For an integrated module, use host-native paths and preview components under LIBRARY; do not add another app scaffold or lockfile. Preserve compatible shadcn APIs, semantic roles, accessibility, and real interactions. Record required dependencies with the host package manager and preserve existing versions. For non-React projects, use compatible framework-native components and document the adaptation.

Only create two component alternatives if a remaining important visual choice needs them. Otherwise show one derived specimen. Design type weights, control/container radii, density, icon alignment, and purposeful state changes. Include applicable default, hover, focus, selected, disabled, invalid, and loading states. Prioritize representative components from the image. Keep the accepted foundation token hash unchanged; foundation changes return to that checkpoint.

Perform the available visual and interaction checks in verification.md and frontend-craft.md. Attach a truthful visualReview artifact to each component candidate and the integrated preview. Source-only inspection must include limitations; never manufacture screenshot or browser evidence.

### Full page presentation and revision

Build one integrated design from the settled visual specification and the same component implementation. Publish exactly one option with reviewType: presentation. Show Desktop and Mobile together, using full 16:9 and 9:16 review frames; separately verify normal device sizes. This stage demonstrates the complete result. Do not introduce a second design, a preference questionnaire, or an approve/revise choice popup.

Share the complete preview and invite freeform corrections or explicit confirmation in the conversation. Record confirmation of the sole design as approve; record changes as revise. Do not infer confirmation from viewing, silence, or earlier preferences. Reuse an explicit instruction to proceed when it clearly covers this exact displayed version.

For requested changes, identify affected branches, revise foundations and dependent components, then show the updated integrated design. Preserve unaffected rules. Use derived checkpoints when the feedback already specifies the desired treatment. Ask another visual question only for an important ambiguity. Repeat requested revisions without imposing a fixed iteration limit.

Read state before publishing. If awaiting-user, wait or yield. If needs-agent, read history and build nextStage. Never edit session.json to bypass a pending decision. Simulated choices require an explicitly requested test with --simulation and must use studio.py decide.

### Mandatory delivery

After confirmation, deliver the full component inventory at the recorded source snapshot, plus image-derived components, and a complete DESIGN_DOC matching the final library. Use official registry:ui sources for compatible React environments and documented native equivalents for other frameworks. Official blocks and every example variant are outside "all UI components." In Web projects, finish the native integration and host verification from project-output.md; write DESIGN_DOC at the Web app root. The command below is only for a standalone application:

~~~sh
python3 "$SKILL/scripts/library.py" --session "$PROJECT/session" --output "$LIBRARY" --cache "$PROJECT/cache" --deliver --install --build
~~~

For non-English standalone sessions, also pass the translated --ui-copy file. The standalone generator writes sources, theme, gallery, lockfile, registry, snapshot, contrast report, and a DESIGN.md draft at LIBRARY. It records the generation in the session but does not mark delivery. When LIBRARY/DESIGN.md is already completed, it keeps that file and writes PROJECT/DESIGN.draft.md for merging instead. In integrated mode, write adapted components at LIBRARY, reuse host tooling, and complete DESIGN_DOC at the Web application root without replacing existing standards. Complete every field from the final implementation and confirmed design; use a reasoned not-applicable entry for absent product features. Do not add a questionnaire to fill the template. Inspect and translate generated gallery text and DESIGN.md explanations, preserving the template headings. Run the design-document.md completion check before delivery. Recheck after regeneration. Store durable custom guidance in LIBRARY/IMAGE-COMPONENTS.md or LIBRARY/design-notes.md. Use host-native gallery components in integrated mode; in standalone mode keep custom panels in App.tsx around the generated FullGallery.

Document visual intent, token roles, typography, geometry, icons, states, responsive behavior, motion, component usage, accessibility adjustments, decisions, and verification limits. Verify the module with the host build/typecheck/lint commands in integrated mode. For standalone delivery, install the registry into a clean Tailwind 4 shadcn Vite consumer and build it. Validate any integrated registry in a consumer matching its actual framework and styling versions. Inspect available representative families for visual drift. Verify tokens, CSS, registry, and DESIGN.md agree; rebuild after changes. In both modes, record delivery only after the completion check passes:

~~~sh
python3 "$SKILL/scripts/studio.py" finish --session "$PROJECT/session" --evidence "$PROJECT/delivery.json"
~~~

Report the exact LIBRARY and DESIGN_DOC paths together with the preview URL and actual verification results. Missing browser capabilities do not make source artifacts optional; identify checks that could not run without claiming full visual verification.

## Maintain

Read PROJECT/project-context.json, the root DESIGN_DOC, tokens, history, and snapshot first. Preserve the saved destination and host environment unless the user changes them. Preserve source with a normal directory copy, excluding node_modules/dist, when overwriting would lose edits. Never use git worktrees.

~~~sh
python3 "$SKILL/scripts/studio.py" reopen --session "$PROJECT/session" --feedback "Requested change and affected components"
~~~

Resume foundations and update the affected decision-tree branches. Preserve the source snapshot unless deliberately upgrading upstream. Keep replacement images alongside earlier evidence. Sync code, registry, and DESIGN.md after confirmation; never clobber unrelated changes.

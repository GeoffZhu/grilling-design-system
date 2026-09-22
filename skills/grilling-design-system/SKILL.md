---
name: grilling-design-system
description: Derive a PC and Mobile Web design system from an inspiration image using a planned set of high-impact visual component choices, focused HTML previews, and the host agent's single-select question tool. Use to compare or revise UI styles and deliver a complete themed shadcn/ui component library, a matching DESIGN.md, and repository-specific usage instructions.
---

# Grilling design system

Deliver both a working shadcn/ui design system adapted to the project framework and DESIGN.md that describes its final specification. These are mandatory outputs; a preview, token sheet, or design proposal alone is incomplete. For standalone React output, use shadcn's raw Base UI component layer for behavior and accessibility, then author its `cn-*` visual layer from the approved design tokens. Do not use an official shadcn visual preset as the generated system's style. Preserve a host project's established primitive family when integrating rather than mixing implementations. Preserve confirmed preferences and distinguish user choices from agent-derived rules. Never treat silence, a timeout, or a preselected answer as approval.

Use [DESIGN.template.md](assets/DESIGN.template.md) for DESIGN.md. Preserve its 13 numbered sections and required fields. Read [design-document.md](references/design-document.md) for evidence-based completion, API mappings, and the final completeness check. Read [usage-handoff.md](references/usage-handoff.md) before final delivery; a repository-specific usage handoff in the final reply is mandatory.

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

Keep the shared preview chrome consistent: show `grilling design system` on the left and a GitHub icon linking to `https://github.com/GeoffZhu/grilling-design-system` on the right. Apply this to Studio and standalone comparison HTML. In the delivered example gallery, keep the generated project name on the left and use the same GitHub icon link on the right.

If a stage has no important unresolved choice, publish one derived specimen with its rationale and continue without a question. The full-page preview always presents one consolidated design; it never asks for another A/B preference.

## Start

Read [project-output.md](references/project-output.md) first. Resolve SKILL, the final component destination LIBRARY, the design document path DESIGN_DOC, and the separate temporary working directory PROJECT before generating code. A user-specified directory has first priority. Always inspect whether the current application is a Web project, including when an output directory was specified. In a Web project, default LIBRARY to the actual source root/design-system and DESIGN_DOC to the Web application root/DESIGN.md; adapt to its build and code conventions. Outside a Web project, create a complete standalone app at the requested directory or cwd/design-system, with DESIGN.md at that app root. PROJECT stores sessions, candidates, decisions, translations, caches, and evidence under the resolved `.tmp/grilling-design-system` directory. Never store working files in a legacy working directory. Record and reuse PROJECT/project-context.json while the workflow is active. Node.js 20.19+ is needed for helper scripts and the standalone scaffold; Web integration uses the host runtime/package manager, while standalone generation uses npm. Network is needed for the first upstream download. Read [protocol.md](references/protocol.md) before using scripts, and [design-rules.md](references/design-rules.md) plus [frontend-craft.md](references/frontend-craft.md) before designing. No particular browser CLI or browser installation is required. Use available host capabilities for visual checks; record unavailable checks honestly as described in [verification.md](references/verification.md).

1. Read PROJECT/session/session.json if present and resume nextStage. Never restart implicitly.
2. View the actual input image with an available image tool. Locate attachments; never fabricate replacements. If a required image is inaccessible, request its local path while retaining any available analysis.
3. Default to PC Web and Mobile Web. Infer specimen content from the image; use neutral content for non-UI images.
4. Classify UI / non-UI / mixed. Preserve observed palette, typography, silhouette, density, icons, and component patterns. For non-UI references, distinguish interpretation from observation. State uncertainty about exact fonts and colors.
5. Default to one color mode matching the image. Add another only on request.
6. Write PROJECT/interpretation.md and PROJECT/decision-tree.md. Reuse existing choices when resuming.
7. Initialize and serve:

~~~sh
node "$SKILL/scripts/studio.js" init --session "$PROJECT/session" --image /path/to/image.png --name "Design name" --language en
node "$SKILL/scripts/studio.js" serve --session "$PROJECT/session" --port 4310
~~~

Set --language from the conversation. For non-English copy, translate the English keys in assets/studio-copy.json into PROJECT/studio-copy.json and pass --ui-copy at initialization. Keep the server running in a persistent terminal and share its actual URL. Record real user responses with studio.js decide. If the host ends the turn while awaiting a choice, explain how to resume; saved state remains authoritative. No background AI service is included.

## Build the system

Follow image interpretation → planned visual choices → foundations → components → one integrated presentation → feedback or confirmation → full delivery. Direction, foundations, and components are implementation checkpoints, not three compulsory questionnaires.

### Direction

When broad component styling is the highest-impact uncertainty, create two coherent visual treatments close to the image, varying one or two related qualities. Use the same component content for comparison. Otherwise record one derived treatment.

Write a compact design intent: image evidence, base colors, type roles, alignment, one visual priority, geometry, icons, motion, and representative copy. Review it against the image before coding. Carry the intent into later stages and DESIGN.md.

Supply complete token JSON per candidate. Invent a specific theme `name` and unique kebab-case `slug` from the reference and design intent. The generator uses them for visible naming and generated artifact names; never reuse the skill name or a fixed generic name. Keep the accepted name and slug stable unless the user requests a rename. Use scripts/board.js as a neutral shell with agent-authored content and layout. Include observed special components or image-inspired geometry. Set content.language and translate all visible copy. Focus the specimen on the planned decision.

### Foundations

Define color, typography, spacing, shape/border/shadow, icon style, and motion. Cover all six in the specification; only ask about unresolved groups that warrant the remaining question budget. A small focused specimen can explain a decision while its candidate carries the complete token object. Keep settled values constant across alternatives.

Show actual type and icon samples, including optical size, stroke, corners, and fill where relevant. Bundle or install the chosen open font, document fallback and license, and do not claim an unavailable font was tested. Derive routine state, spacing, and motion rules consistently. Written changes require a revised visible specimen before they can be accepted.

### Components and states

Build real components in the resolved environment. In a Web project, follow project-output.md: reuse its framework, language, styling, primitives, aliases, package manager, and code style; expose a specimen through its existing preview mechanism. Fetch source inputs with library.js --sources-only when needed. Implement components that are not adequately represented by the standard inventory under the host's custom component area. Call this collection "Custom components" in the gallery, while giving every component its own specific name. Register every custom component in the gallery and registry; a custom component that exists only as source code is incomplete. The following scaffold command applies only outside an existing Web project:

Use `https://dummyimage.com/{width}x{height}/{background}/{foreground}` for every placeholder image in generated specimens, examples, galleries, and applications. Match width and height to the intended layout; omit `#` from path colors and URL-encode any optional text query. Every remote image source inside downloaded/generated example or block code is sample content and must be rewritten, including HTML `img`, JSX/Next `Image`, Avatar images, known placeholder services, demo photos, explicit dimensions, and `fill`. Do not rewrite the user's inspiration image, user-authored custom/application source, imported assets, or explicitly licensed real imagery. Preserve those sources exactly. Clearly identify placeholders during review, and require production applications to replace them with approved assets before release.

~~~sh
node "$SKILL/scripts/library.js" --tokens "$PROJECT/chosen-tokens.json" --output "$LIBRARY" --cache "$PROJECT/cache" --language en --install --build
~~~

For the standalone generator, set --language from the conversation and supply --ui-copy when needed. Customize LIBRARY/src/App.tsx and LIBRARY/src/components/custom/. For an integrated module, use host-native paths and preview components under LIBRARY; do not add another app scaffold or lockfile. Preserve compatible shadcn APIs, semantic roles, accessibility, and real interactions. Record required dependencies with the host package manager and preserve existing versions. For non-React projects, use compatible framework-native components and document the adaptation.

Only create two component alternatives if a remaining important visual choice needs them. Otherwise show one derived specimen. Design type weights, control/container radii, density, icon alignment, and purposeful state changes. Include applicable default, hover, focus, selected, disabled, invalid, and loading states. Prioritize representative components from the image. Keep the accepted foundation token hash unchanged; foundation changes return to that checkpoint.

Carry the Key Visual and custom-component signature into the official library with explicit craft and signature tokens as described in protocol.md. Read style-provenance.json to distinguish token choices from script defaults. Verify representative actions, inputs, selection controls, navigation, data display, overlays, and feedback share intentional geometry, depth, semantic color roles, and states. Keep dense lists and low-priority controls lighter; do not stop at token recoloring or elevate every component equally. Make gallery examples responsive to their actual preview container. Stack examples when two columns do not fit, keep the parent canvas free of horizontal overflow, and give intrinsically wide components local scrolling or reflow without zooming or shrinking type.

Treat component scale and compound alignment as explicit acceptance criteria. Calendar day cells must remain comfortably readable and operable in the real gallery canvas; do not shrink the calendar to make a multi-column example fit. Treat month/year dropdown captions as controls with stable height, width, padding, and bounded disclosure icons rather than bordered inline labels. Calendar cells with secondary content need a taller, non-square row with explicit internal gap and padding; single selections and range endpoints need a visible fill that generic Button variants cannot override. Card footers must use balanced block padding and vertically center their controls at every supported card size. Check these rules in standalone examples, cards/popovers, and Mobile layouts.

Treat overlay layering and compound-control ownership as structural requirements, not theme preferences. Sheet content must be positioned above its overlay, and both must be above persistent gallery chrome. Switch styling must follow the actual state attributes emitted by the chosen primitive on both track and thumb. Input Group owns the single visible frame, focus ring, background, and shadow; clip its descendants to the outer radius so addon and button fills cannot paint over the rounded border. Its nested input, textarea, and addons must not add another frame or squeeze the editable area. Inline addons and buttons need adequate padding and one internal separator from the editable region. Block-start/block-end addons form full-width vertical sections with their own padding and one boundary; textarea controls occupy a full row with a documented minimum height.

Keep Checkbox's painted root at its documented compact size while expanding touch input with a pseudo-element. The indicator must fill and center within that painted root, and its SVG must have an explicit optical size; do not let a coarse-pointer minimum resize the visible checkbox. Verify computed root, indicator, and icon bounds in checked state.

Audit compound and stateful components against the primitive's emitted DOM, not a different library's conventions. Command search owns one bottom boundary around a borderless internal Input Group. Exclude that internal group from generic Input Group addon padding and separator rules. Give its search row stable inline padding and gap; give group headings breathing room before their items; give item collections a small vertical gap; and set explicit item minimum height, padding, and 16px leading-icon size. Navigation Menu and Select disclosure arrows use a stable inline-flex, zero-line-height 16px wrapper plus an explicitly sized 16px glyph, centered independently from text; do not leave them as intrinsic 24px SVGs or allow broad descendant SVG rules to resize them. Navigation Menu open triggers use Base UI's data-popup-open; Tabs selection uses truthy data-active, including the empty attribute form. Default active Tabs must use accent/accent-foreground plus a non-layout-shifting border or shadow so they remain visibly distinct even when card and sidebar colors coincide; inactive Tabs clear those treatments. Line Tabs keep both list and triggers borderless and shadowless. Their selected state uses only an underline/indicator inset from the trigger ends by enough to avoid every rounded corner; it must never run edge to edge or enter a rounded region. Navigation Menu links inside expanded content must be block-level, full-width interaction boxes, and must promote muted descendants to the accent foreground on hover, focus, and active states. The sidebar account/version control is a SidebarMenuButton containing Item and opening a portaled DropdownMenu, not a Select: style the open trigger with sidebar roles, strip the nested Item frame, and explicitly mark the generated portaled popup so its positioner/content can use anchor width, viewport bounds, and a layer above gallery chrome. Give the Sidebar header a deliberate vertical gap between its account/version switcher and search region, then inspect that top cluster as one composition at Desktop and Mobile sizes. Dialog close actions need a stable top-corner position, explicit icon size, hover/focus affordance, and content clearance. Alerts need a real leading column for a direct icon or explicit leading slot, plus an independent trailing action column. Avatar roots require bounded sizes for every variant; gallery layout must not stretch them. Message Scroller content requires an explicit vertical gap so adjacent messages never touch.

Collapsible Trigger uses Base UI's `data-panel-open`, including its empty-attribute form. Hover, focus-visible, and open states must assign a matching semantic background/foreground pair rather than changing foreground alone. Text, SVG icons, and muted descendants inherit or explicitly use that foreground so folder-tree rows remain readable. Use `data-panel-open` for disclosure-icon rotation; do not assume a `data-state=open` attribute.

Treat Button Group as one compound control, including mixed and nested groups. The outer group alone owns border, radius, background, clipping, and shadow. Its elevation must come from the accepted theme shadow token and reference-derived depth hierarchy; never inject a fixed hard shadow into a flat theme. Every direct Button, Input, Select trigger, Dropdown trigger, Input Group, text item, or nested Button Group removes its own outer border, radius, margin, and shadow. Adjacent children receive exactly one inline separator in horizontal groups or block separator in vertical groups; an explicit separator replaces, rather than doubles, that boundary. Preserve first/last continuity through outer clipping. Focus uses an inset outline without changing dimensions, and pressed buttons suppress standalone translation/shadow.

Treat icons inside Buttons as optically bounded content. Apply explicit width and height based on the icon token, with tighter caps for xs/sm buttons; do not rely on an SVG's intrinsic dimensions or a broad descendant rule. In particular, verify the Input OTP form's Resend Code refresh icon at actual size and ensure it remains subordinate to the label.

Keep form rhythm explicit inside cards and invalid states restrained. Card content FieldGroup/form layouts need consistent group and field gaps; Card footer actions need a real gap. Invalid controls use a destructive border plus a subtle 2px translucent ring that does not change dimensions, never a heavy red halo. For Input Group, the wrapper alone renders invalid border/ring and nested input/textarea clears its own invalid ring. Place FieldError or invalid description directly after its control with a small, consistent gap.

Mount every required global host or provider at the application root, not only inside an example. In particular, when Sonner is included, render exactly one global `Toaster` alongside the application so `toast()` calls from lazy gallery examples and consumer screens have a live viewport. Audit other generated components for equivalent singleton hosts or context providers.

Perform the available visual and interaction checks in verification.md and frontend-craft.md. Attach a truthful visualReview artifact to each component candidate and the integrated preview. Source-only inspection must include limitations; never manufacture screenshot or browser evidence.

Run the production build through studio.js verify as described in protocol.md and retain its buildId. Create every session-hosted build preview with `studio.js snapshot`; never copy `dist` into candidates by hand or reuse a snapshot name. The command validates the HTML, static imports, dynamic imports, and CSS assets in staging, then publishes a new immutable directory with an atomic rename. Reference the returned preview path when publishing the round. See protocol.md.

### Full page presentation and revision

Before the standalone integrated presentation, regenerate with --tokens and --full so the confirmed version contains the complete inventory and final component CSS. Build one integrated design from the settled visual specification and the same component implementation. Publish exactly one option with reviewType: presentation and the verified buildId. Show Desktop and Mobile together, using full 16:9 and 9:16 review frames; separately verify normal device sizes. This stage demonstrates the complete result. Do not introduce a second design, a preference questionnaire, or an approve/revise choice popup.

The integrated design is also the gallery overview's Key Visual. Render it as the first substantive section after the overview heading and before the component directory; do not hide it only in a session preview or an individual component route. It is a docs-only composition that directly imports delivered ui/custom components. It is not a reusable business component: never list it in custom-components.json, componentEntries, the component count, registry items, or registry files. In standalone output, replace src/IntegratedPreview.tsx with the confirmed reference-derived composition and remove its placeholder marker before delivery. The delivery generator rejects the neutral starter, an overview that places the integrated preview after the directory, and attempts to register the reserved integrated-preview name. In integrated Web projects, implement and verify the equivalent first-position docs section using host-native routes without exporting it from the design-system package.

Share the complete preview and invite freeform corrections or explicit confirmation in the conversation. Record confirmation of the sole design as approve; record changes as revise. Do not infer confirmation from viewing, silence, or earlier preferences. Reuse an explicit instruction to proceed when it clearly covers this exact displayed version.

For requested changes, identify affected branches, revise foundations and dependent components, then show the updated integrated design. Preserve unaffected rules. Use derived checkpoints when the feedback already specifies the desired treatment. Ask another visual question only for an important ambiguity. Repeat requested revisions without imposing a fixed iteration limit.

Read state before publishing. If awaiting-user, wait or yield. If needs-agent, read history and build nextStage. Never edit session.json to bypass a pending decision. Simulated choices require an explicitly requested test with --simulation and must use studio.js decide.

### Mandatory delivery

After confirmation, deliver the full component inventory at the recorded source snapshot, plus custom components, and a complete DESIGN_DOC matching the final library. Use official registry:ui sources for compatible React environments and documented native equivalents for other frameworks. Official blocks and every example variant are outside "all UI components." In Web projects, finish the native integration and host verification from project-output.md; write DESIGN_DOC at the Web app root. The command below is only for a standalone application:

~~~sh
node "$SKILL/scripts/library.js" --session "$PROJECT/session" --output "$LIBRARY" --cache "$PROJECT/cache" --deliver --install --build
~~~

For non-English standalone sessions, also pass the translated --ui-copy file. The standalone generator writes sources, theme, gallery, lockfile, registry, snapshot, contrast report, and a DESIGN.md draft at LIBRARY. It records the generation in the session but does not mark delivery. When LIBRARY/DESIGN.md is already completed, it keeps that file and writes PROJECT/DESIGN.draft.md for merging instead. In integrated mode, write adapted components at LIBRARY, reuse host tooling, and complete DESIGN_DOC at the Web application root without replacing existing standards. Complete every field from the final implementation and confirmed design; use a reasoned not-applicable entry for absent product features. Do not add a questionnaire to fill the template. Inspect and translate generated gallery text and DESIGN.md explanations, preserving the template headings. Run the design-document.md completion check before delivery. Recheck after regeneration. Store durable custom guidance in LIBRARY/IMAGE-COMPONENTS.md or LIBRARY/design-notes.md.

Build the final gallery as component documentation, following the shadcn component site's information architecture without copying its visual theme. Keep a persistent searchable component sidebar on desktop and a drawer on Mobile. Make the home route list every delivered component in a multi-column directory. Give each component its own navigable detail view with the real interactive preview, representative variants, and relevant visual states. Keep detail pages visual: omit installation instructions, source listings, prop tables, and long API reference text. Use host-native routes and gallery components in integrated mode. In standalone mode, use the generated App.tsx and FullGallery registry.

On the home route, keep this order: overview heading, confirmed integrated Key Visual, then the complete component directory. The Key Visual must import the delivered components rather than imitate them with one-off markup.

For standalone output, create `LIBRARY/custom-components.json` before the final library generation whenever custom components exist. List every custom component with `name`, localized `title`, localized `description`, delivered `files`, and a `preview` module. Keep all listed files under `src/components/custom/`. Do not add a custom category per component: the generator groups every entry under the localized "Custom components" section while preserving its specific component title. The preview may be a separate non-delivery module in the same directory. The generator validates the manifest and automatically adds each entry to the home directory, sidebar, detail page, snapshot, component count, aggregate registry, and an individual `registry:component` item. See [project-output.md](references/project-output.md) for the manifest shape.

Document visual intent, token roles, typography, geometry, icons, states, responsive behavior, motion, component usage, accessibility adjustments, decisions, and verification limits. Verify the module with the host build/typecheck/lint commands in integrated mode. For standalone delivery, install the registry into a clean Tailwind 4 shadcn Vite consumer and build it. Validate any integrated registry in a consumer matching its actual framework and styling versions. Inspect available representative families for visual drift. Verify tokens, CSS, registry, and DESIGN.md agree; rebuild after changes. Reinspect the final repository and prepare the exact usage handoff required by usage-handoff.md; do not rely on scaffold defaults or earlier project detection. In both modes, run the final build through studio.js verify, add its buildId to delivery evidence, and record delivery only after the completion check passes:

~~~sh
node "$SKILL/scripts/studio.js" finish --session "$PROJECT/session" --evidence "$PROJECT/delivery.json"
~~~

`finish` validates the final library and DESIGN_DOC, records the result in its command output, then deletes PROJECT. Do not copy session state, candidates, screenshots, caches, drafts, or other working artifacts into the final library.

Report the exact LIBRARY and DESIGN_DOC paths and actual verification results. Include a "How to use" section that follows usage-handoff.md and contains repository-valid commands, a minimal working component example, and two explicit reuse paths: the exact source set a user can copy into another project, and a copyable prompt for an AI to read and adapt the generated directory. Name required styles, utilities, assets, dependencies, and providers; exclude gallery-only, temporary, and build artifacts. State that the temporary preview was retired during cleanup; do not report its now-invalid URL. Missing browser capabilities do not make source artifacts optional; identify checks that could not run without claiming full visual verification.

## Maintain

After delivery, PROJECT no longer exists. Read the root DESIGN_DOC, final tokens, source snapshot, and durable design notes first. Recreate PROJECT at the resolved `.tmp/grilling-design-system` path for a maintenance run and initialize a new session with the current or replacement reference image. Preserve the destination and host environment unless the user changes them. Preserve source with a normal directory copy, excluding node_modules/dist, when overwriting would lose edits. Never use git worktrees.

~~~sh
node "$SKILL/scripts/studio.js" init --session "$PROJECT/session" --image /path/to/current-or-replacement-image.png --name "Design revision" --language en
~~~

Resume foundations and update the affected decision-tree branches. Preserve the source snapshot unless deliberately upgrading upstream. Keep replacement images alongside earlier evidence. Sync code, registry, and DESIGN.md after confirmation; never clobber unrelated changes.

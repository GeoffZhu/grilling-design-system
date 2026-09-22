# Local session protocol

- [Files](#files)
- [Tokens](#tokens)
- [Boards](#boards)
- [Publish](#publish)
- [Generator](#generator)

## Files

- session/inspiration.*: original input.
- session/session.json: state, accepted choices, history, approval; written by studio.js.
- session/rounds/: immutable published specs.
- session/candidates/: agent-authored tokens, HTML and content. Use new paths each revision.
- LIBRARY: final component module or standalone app selected by project-output.md.
- DESIGN_DOC: Web application root/DESIGN.md in integrated mode; LIBRARY/DESIGN.md in standalone mode.
- PROJECT/project-context.json: inspected environment and output paths; PROJECT is the owned `.tmp/grilling-design-system` namespace and holds session/, cache/, evidence/, drafts, translations, and other non-final artifacts.
- A successful `studio.js finish` deletes PROJECT. A failed validation or pending user decision leaves it intact for resume. Never place temporary workflow files in a legacy working directory or elsewhere in LIBRARY.
- Keep LIBRARY and DESIGN_DOC outside PROJECT. Stop the local Studio server before `finish`; its preview becomes unavailable when PROJECT is deleted.
- evidence/: available screenshots, source observations, and explicit verification limitations.
- decision-tree.md: planned visual branches, dependencies, question budget, choices, and derived rules.

Node.js scripts use built-in modules. library.js scaffolds standalone React/Vite apps and uses npm only in that mode. In Web projects, --sources-only fetches upstream inputs without scaffolding; follow project-output.md to integrate with the host framework and tooling. Local serving binds 127.0.0.1. No account or hosted backend is required.

## Tokens

Each direction/foundation option contains a complete object, not a patch. Colors use six-digit hex. Numeric sizes use px; duration uses ms. Do not copy one image's palette into unrelated sessions.

~~~json
{
  "name": "Northstar Atelier",
  "slug": "northstar-atelier",
  "mode": "light",
  "colors": { "background": "#FFFFFF", "foreground": "#141414" },
  "radius": 16,
  "font": {"family": "system-ui, sans-serif", "heading": "system-ui, sans-serif", "bodySize": 16, "headingWeight": 700},
  "spacing": {"unit": 4, "controlHeight": 44},
  "icons": {"family": "Lucide rounded", "size": 24, "stroke": 2},
  "motion": {"duration": 160, "easing": "ease-out"},
  "shadow": "none",
  "rationale": "Observed qualities and intended emphasis."
}
~~~

The agent must invent both `name` and `slug` for the specific design. `name` is the visible theme name. `slug` is its unique kebab-case artifact name. The standalone package, registry, and registry theme CSS use `slug`; never substitute a skill name, generic fixed name, or generator default. Keep both values stable after foundations are accepted unless the user requests a rename.

Expand colors to the complete required map: background, foreground, card, card-foreground, popover, popover-foreground, primary, primary-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, destructive, border, input, ring, chart-1…chart-5, sidebar, sidebar-foreground, sidebar-primary, sidebar-primary-foreground, sidebar-accent, sidebar-accent-foreground, sidebar-border, sidebar-ring. Add custom semantic colors as needed. See scripts/theme.js.

Optional alternate: {"mode":"dark","colors":{complete map}}. Only on request. If icons differ from Lucide, replace imports consistently and update dependencies. Token text alone does not install fonts or change icon geometry.

Optional craft group controls component-specific details without replacing shadcn APIs. Values are examples, not a preferred style:

~~~json
"craft": {
  "controlRadius": 12, "surfaceRadius": 24, "overlayRadius": 20,
  "bodyLineHeight": 1.5, "headingLineHeight": 1.1, "headingTracking": -0.025,
  "labelWeight": 650, "controlPadding": 20, "iconGap": 8
}
~~~

Radius/padding/gap use px; line heights are unitless and tracking uses em. Omitted craft values use documented script defaults: equal base/control/surface/overlay radii, label weight 500, body/heading line heights 1.5/1.15, heading tracking -0.035em, control padding 16px and icon gap 8px. Supply explicit craft values when deriving the design. The theme applies controlHeight to default/large actions; compact sizes retain their shadcn dimensions and coarse-pointer targets remain at least 44 px. For more specific geometry, use component classes or theme-overrides.css instead of high-specificity global selectors.

Switch uses an independent transparent hit area (at least 44×44) around its visible track. Default track/thumb are 44×24 / 18px, small 36×20 / 14px, both with 3px end insets. Thumb travel derives from track width, thumb size and insets. Do not apply generic button minimum sizes or background clipping to Switch. A hit area may extend outside the visual box; leave room around it and verify actual input there.

## Boards

Boards and standalone libraries use the same browser-native component CSS. Use the delivered `cn-*` class hooks in board HTML; arbitrary agent-authored markup does not acquire component behavior. The two modes differ only in Tailwind imports and aliases. Use the same custom overrides in both previews when present.

Optional signature tokens configure each family: actions, inputs, selection, navigation, data-display, overlays, feedback. Every family accepts shadow (CSS value) and borderWidth (px, 0–16). Actions, selection and navigation also accept pressedOffset; feedback accepts accentWidth. Other family/property combinations are rejected. Example:

~~~json
"signature": {
  "actions": {"shadow":"none","borderWidth":1,"pressedOffset":0},
  "inputs": {"shadow":"none","borderWidth":1},
  "overlays": {"shadow":"0 12px 32px #00000020","borderWidth":1},
  "feedback": {"accentWidth":0}
}
~~~

Missing family shadows default to none for controls/navigation and the main shadow token for data display/overlays/feedback; borders default to 1px, press offsets and accent stripes to 0. Family rules use these variables; no fixed hard shadow or press translation is injected. Geometry and family defaults are recorded in style-provenance.json and the DESIGN.md draft. Explicit token values still need their user/image/agent basis documented by the agent. Structural sizing, accessible state pairs and compound-control ownership remain shared implementation rules.

~~~sh
node "$SKILL/scripts/board.js" --tokens tokens.json --content content.json --output "$PROJECT/session/candidates/r1-a.html"
~~~

content.json requires language (for example zh-CN or en), title, headline, description and either bodyHtml or cards [{title,description,tone}]. tone defaults to card and must have a semantic foreground pair. Supply bodyHtml for composition derived from the image, css for its layout/type/icon rules, and optional extraHtml. No habit tracker, generic slogans or equal saturated cards are inserted automatically. Never interpolate raw feedback into HTML. Later reviews use actual components in the target framework.

## Publish

~~~json
{
  "stage": "direction",
  "reviewType": "choice",
  "title": "Choose your preferred control corners",
  "language": "en",
  "description": "Return to chat and choose A or B.",
  "options": [
    {"id":"a","title":"A: Rounded","description":"Rounder corners.","preview":"candidates/r1-a.html","tokens":{},"viewports":[{"device":"specimen","width":800,"height":400}]},
    {"id":"b","title":"B: Squared","description":"Straighter corners.","preview":"candidates/r1-b.html","tokens":{},"viewports":[{"device":"specimen","width":800,"height":400}]}
  ]
}
~~~

Use title for the intro's direct action. Omit description or leave it empty unless one short instruction is needed to explain where or how to respond. Keep background, interpretation, and rationale in PROJECT/interpretation.md or PROJECT/decision-tree.md; legacy interpretation fields are not displayed. Use option descriptions only for concise visible differences.

Stage must match nextStage. Choose the review type according to decision-tree.md:

| reviewType | Stages | Candidates | Result |
| --- | --- | --- | --- |
| choice | direction, foundations, components | Exactly two | Await one native single-select answer |
| derived | direction, foundations, components | Exactly one | Record derivation and advance without a question |
| presentation | preview only | Exactly one | Await freeform corrections or explicit confirmation |

For derived checkpoints, include a nonempty derivation explaining the reference, prior choices, or explicit feedback supporting the result. History records action: derive and source: agent-derived. Do not use this to resolve a pending question without a response. Historical rounds remain readable; new submissions accept at most one option ID.

Set continueStage: true only on a choice round when another planned high-impact question belongs to the same stage. Selecting saves that candidate and keeps nextStage unchanged. Later candidates must preserve its settled rules. Omit continueStage on the last question, or publish a derived checkpoint to finish the stage if the answer resolved all remaining uncertainty. All questions still count toward the shared initial budget.

Replace empty tokens with complete objects. Foundations require covers: ["color","typography","spacing","shape","icons","motion"]; this is specification coverage, not six user questions. Components/preview use tokenHash instead of tokens; compute studio.digest(accepted foundation tokens). Translate titles and descriptions into the user's language. For non-English sessions, supply all English studio-copy.json keys as a flat translated uiCopy object or initialize with --ui-copy. Saved translations remain available on resume.

Choice/derived options may set viewports to one or two objects with device: specimen, desktop, or mobile and width/height between 160 and 2400 pixels. Default: one 960 by 540 specimen. Use matching viewports across alternatives; choose dimensions for the components being compared. Complete pages are optional. The integrated presentation omits viewports and always shows Desktop at 1440 by 810 and Mobile at 390 by 693.333. Each document must apply antialiased font smoothing; parent CSS does not cross iframe boundaries.

Components/preview require visualReview: a JSON path relative to session/. Prefer actual screenshot inspection when supported:

~~~json
{
  "tokenHash": "accepted foundation hash",
  "method": "screenshots",
  "intent": "candidates/r3/design-intent.md",
  "screenshots": ["candidates/r3/desktop.png", "candidates/r3/mobile.png"],
  "observations": [
    {"area":"typography","finding":"Labels competed with titles","action":"Reduced label weight","verification":"Viewed the revised control crop at actual size"}
  ],
  "unresolved": []
}
~~~

Expand observations to cover reference, typography, spacing, shape, icons, states, composition, and copy. Use actual PNG/JPEG/WebP captures at least 160×160. Studio checks image headers and dimensions, hashes the review, intent and screenshot bytes, and rechecks them before accepting a selection or approval. It cannot grade aesthetics, authenticate a capture, or prove screenshots were viewed.

If no usable browser/image capture capability exists, use method: source-inspection, screenshots: [], and a nonempty limitations array describing the unavailable checks. Include sourceFiles for every inspected artifact: session-relative snapshot paths, or absolute source paths covered by option.buildId and record actual observations instead of inventing screenshots, focus tests, or visual approval. Missing verification belongs in limitations; known defects belong in unresolved and must be repaired. See verification.md.

Preview is a session-relative path or localhost URL. For every session-hosted production build, create a fresh immutable snapshot and use the returned preview path:

~~~sh
node "$SKILL/scripts/studio.js" snapshot --session "$PROJECT/session" --dist "$LIBRARY/dist"
~~~

By default the command generates a unique directory name and returns its preview path. An optional `--name` must itself be new; the command refuses an existing or concurrent target. It copies into hidden staging beside candidates, validates `index.html` and the recursive local HTML/JS/CSS asset closure (including static and dynamic imports), writes a hash manifest, then atomically renames staging into `session/candidates/`. A failed validation leaves no published target. Never use `mkdir`/`cp` to publish a build and never replace files behind a published preview. `studio.js publish` revalidates the closure and manifest of local module-based HTML before changing session state. Plain board HTML remains valid without a snapshot manifest. For Web integration, a localhost host-preview URL remains valid; otherwise snapshot its supported static export while preserving the tested source revision.

The integrated presentation requires a buildId from the verification command below, plus checks for build, desktop, mobile, keyboard, and contrast. Record actual commands, observations, and evidence paths; use an explicit "Not run: capability unavailable" explanation for checks that could not run. These keys document evidence and limitations, not automatic passing grades.

~~~sh
node "$SKILL/scripts/studio.js" publish --session "$PROJECT/session" --spec round.json
node "$SKILL/scripts/studio.js" status --session "$PROJECT/session"
node "$SKILL/scripts/studio.js" wait --session "$PROJECT/session" --timeout 45
~~~

wait polls while the round is awaiting-user (at most 55 seconds) and prints the state. Use it only to pick up a response that arrived through the studio API; it never substitutes for asking.

Record native single-select tool answers or plain chat responses with roundId, optionIds (zero or one ID), action, and actual feedback. The HTML has no decision inputs. Legacy optionId remains readable; multiple IDs are rejected without mutation. Actions: select for a preference choice, revise for changes, and approve for the sole integrated presentation. Chat submissions use studio.js decide against the running server and share its validation lock. See choices.md. Stale/duplicate submissions are rejected. Components/preview revisions return to foundations and invalidate downstream confirmations. Approval with unprocessed feedback is rejected. Writes are atomic and history survives restarts.

## Generator

### Verified build receipts

Before publishing the integrated presentation and again after final generation, write a build spec with the actual framework command and output paths, then execute it through Studio:

~~~json
{
  "cwd": "/absolute/application/root",
  "command": ["npm", "run", "build"],
  "artifacts": ["dist"],
  "inputs": []
}
~~~

~~~sh
node "$SKILL/scripts/studio.js" verify --session "$PROJECT/session" --spec "$PROJECT/build.json"
~~~

Use the host package manager and real artifact paths (for example .next in Next). Add external component directories and workspace dependency/config paths to inputs when outside cwd. The command runs without a shell, captures a log, rejects failures or source mutation during the build, and records source/artifact/log hashes in the session. It returns buildId. Source fingerprinting excludes dependency/cache/output directories and DESIGN.md/DESIGN.draft.md/log/build-info files; include actual consumed code and assets. Arbitrary commands are host-selected: a successful receipt proves execution and file integrity, not that the command is a sufficient test.

Add buildId at the top level of a presentation spec and delivery evidence. Live localhost component previews also need option.buildId. Their receipt binds source files; the host must verify that the running server uses that source revision, because HTTP content is not authenticated by this check. Create the immutable snapshot after verification. Studio hashes local preview assets and visual evidence at publish and rechecks them at select/approve. Changes require a revised round. finish requires a current build receipt covering delivered sources; it rejects changes to previously confirmed component/style files, stale standalone tokens/inventory, and registry contents that differ from local source. Generate the full standalone inventory with --full before the integrated presentation so --deliver does not change the confirmed theme CSS. A new build receipt does not approve changed design.

Keep the final library/source snapshot and DESIGN.md in agreement by agent inspection. Structured checks and image headers cannot establish aesthetic quality, screenshot authenticity or natural-language meaning. Decision events and approval are explicitly marked host-reported: only submit actual host-tool/chat answers. The local API is not an identity-verification boundary.

Resolve paths with project-output.md first. These generator details apply to standalone delivery. Draft uses --tokens and core shadcn sources plus a neutral starter. --full preflights the entire snapshot. --deliver reads approved foundations from --session, requires --build, and records session.generated; it never marks the session delivered. Upstream inputs are fetched before any file is written, and LIBRARY/.tmp/grilling-design-system/standalone-owner marks generator-owned output so an interrupted run can be retried in place. The marker is temporary and removed after delivery; later maintenance also recognizes the generated package and snapshot. If TLS verification fails behind an intercepting system proxy, retry with no_proxy="*". Use --output LIBRARY directly, without a library/ wrapper; App.tsx and custom files remain. Never run this scaffold in a host Web project. Both modes finish with studio.js finish and actual delivery evidence (see project-output.md); finish rejects an incomplete DESIGN.md.

DESIGN.md is drafted from assets/DESIGN.template.md with all 13 numbered sections. scripts/design_document.js fills facts available from tokens and existing paths, preserving evidence within sections 8 and 13. Complete the remaining fields from actual source and accepted choices before delivering. A generated draft (still containing the draft notice) is refreshed in place. A completed DESIGN.md is never overwritten: the refreshed draft goes to PROJECT/DESIGN.draft.md (LIBRARY/.tmp/grilling-design-system by default) and must be merged back, reapplying completed values and translations. Follow design-document.md and run its completion check; generating source artifacts alone does not complete the document.

Upstream behavior/API source: `apps/v4/registry/bases/base/` in `shadcn-ui/ui`, discovered through that repository's generated `public/r/index.json`. Pin both metadata and raw files to the same full commit SHA in library.js; update that pin deliberately, never follow `main` during generation. This raw Base UI layer exposes `cn-*` semantic hooks without selecting Nova, Vega, or another shadcn visual preset. The generator must style those hooks from approved tokens and component decisions. Before writing output, extract every `cn-*` hook from the selected source set, classify it as explicit visual, semantically inferred visual, or structural, and fail on missing or unclassified hooks. Enforce the complete required Base UI state matrix with visible-property declarations, while separately recording states observed in source. The generated design slug identifies the custom style in components.json; it must not claim to be an official shadcn preset. shadcn-snapshot.json records repository and commit, metadata/source/generator/lockfile hashes, toolchain versions, primitive family, hook classifications, names, state coverage, and any upstream `registry:ui` entries that currently have no files. Gallery lazily imports raw Base UI examples. Next image/link examples adapt to React HTML for Vite; icon placeholders adapt to Lucide. Sonner observes the document color-mode class through a local hook. Supplemental demos cover current UI items whose upstream examples are unsuitable for the standalone gallery; add further demos if the snapshot grows. SHADCN-LICENSE.txt accompanies source and registry.

Known fixed-color Checkbox, Badge and Toggle examples are translated into semantic theme colors; chart examples use chart tokens. Inspect newly fetched examples for palette drift before delivery. Snapshot hashes identify upstream inputs, not the adapted output.

Keep custom CSS under src/components/custom/ and import it from custom TSX, or use src/theme-overrides.css. These files are preserved and distributed. Fontsource imports must be backed by package.json dependencies; those are preserved across generation. Avoid manual edits to generated main.tsx or index.css. Copy scripts' output artifacts into source control as appropriate; omit node_modules and build caches.

Standalone registry: LIBRARY/public/r/all.json. Serve public/ and install the URL via npx shadcn@4.21.0 add into React + Tailwind 4 with initialized shadcn configuration and src/ root. Include required custom fonts/assets in the registry. This is source distribution; publishing/deployment is not implied.

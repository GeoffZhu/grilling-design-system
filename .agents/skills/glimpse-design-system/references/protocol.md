# Local session protocol

- [Files](#files)
- [Tokens](#tokens)
- [Boards](#boards)
- [Publish](#publish)
- [Generator](#generator)

## Files

- session/inspiration.*: original input.
- session/session.json: state, accepted choices, history, approval; written by studio.py.
- session/rounds/: immutable published specs.
- session/candidates/: agent-authored tokens, HTML and content. Use new paths each revision.
- LIBRARY: final component module or standalone app selected by project-output.md.
- DESIGN_DOC: Web application root/DESIGN.md in integrated mode; LIBRARY/DESIGN.md in standalone mode.
- PROJECT/project-context.json: inspected environment and output paths; PROJECT holds session/, cache/, and evidence/.
- evidence/: available screenshots, source observations, and explicit verification limitations.
- decision-tree.md: planned visual branches, dependencies, question budget, choices, and derived rules.

Python scripts use the standard library. library.py scaffolds standalone React/Vite apps and uses npm only in that mode. In Web projects, --sources-only fetches upstream inputs without scaffolding; follow project-output.md to integrate with the host framework and tooling. Local serving binds 127.0.0.1. No account or hosted backend is required.

## Tokens

Each direction/foundation option contains a complete object, not a patch. Colors use six-digit hex. Numeric sizes use px; duration uses ms. Do not copy one image's palette into unrelated sessions.

~~~json
{
  "name": "Example",
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

Expand colors to the complete required map: background, foreground, card, card-foreground, popover, popover-foreground, primary, primary-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, destructive, border, input, ring, chart-1…chart-5, sidebar, sidebar-foreground, sidebar-primary, sidebar-primary-foreground, sidebar-accent, sidebar-accent-foreground, sidebar-border, sidebar-ring. Add custom semantic colors as needed. See scripts/theme.py.

Optional alternate: {"mode":"dark","colors":{complete map}}. Only on request. If icons differ from Lucide, replace imports consistently and update dependencies. Token text alone does not install fonts or change icon geometry.

Optional craft group controls component-specific details without replacing shadcn APIs. Values are examples, not a preferred style:

~~~json
"craft": {
  "controlRadius": 12, "surfaceRadius": 24, "overlayRadius": 20,
  "bodyLineHeight": 1.5, "headingLineHeight": 1.1, "headingTracking": -0.025,
  "labelWeight": 650, "controlPadding": 20, "iconGap": 8
}
~~~

Radius/padding/gap use px; line heights are unitless and tracking uses em. Omit craft to keep legacy token defaults. The theme applies controlHeight to default/large actions; compact sizes retain their shadcn dimensions and coarse-pointer targets remain at least 44 px. For more specific geometry, use component classes or theme-overrides.css instead of high-specificity global selectors.

Switch uses an independent transparent hit area (at least 44×44) around its visible track. Default track/thumb are 44×24 / 18px, small 36×20 / 14px, both with 3px end insets. Thumb travel derives from track width, thumb size and insets. Do not apply generic button minimum sizes or background clipping to Switch. A hit area may extend outside the visual box; leave room around it and verify actual input there.

## Boards

~~~sh
python3 "$SKILL/scripts/board.py" --tokens tokens.json --content content.json --output "$PROJECT/session/candidates/r1-a.html"
~~~

content.json requires language (for example zh-CN or en), title, headline, description and either bodyHtml or cards [{title,description,tone}]. tone defaults to card and must have a semantic foreground pair. Supply bodyHtml for composition derived from the image, css for its layout/type/icon rules, and optional extraHtml. No habit tracker, generic slogans or equal saturated cards are inserted automatically. Never interpolate raw feedback into HTML. Later reviews use actual components in the target framework.

## Publish

~~~json
{
  "stage": "direction",
  "reviewType": "choice",
  "title": "Choose the control corners",
  "language": "en",
  "description": "Compare the same buttons and fields.",
  "interpretation": "Both treatments preserve the reference colors and type.",
  "options": [
    {"id":"a","title":"A: Rounded","description":"Rounder corners.","preview":"candidates/r1-a.html","tokens":{},"viewports":[{"device":"specimen","width":800,"height":400}]},
    {"id":"b","title":"B: Squared","description":"Straighter corners.","preview":"candidates/r1-b.html","tokens":{},"viewports":[{"device":"specimen","width":800,"height":400}]}
  ]
}
~~~

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

Expand observations to cover reference, typography, spacing, shape, icons, states, composition, and copy. The studio validates structure, paths, token hash, and known unresolved defects; it cannot grade aesthetics or prove screenshots were viewed.

If no usable browser/image capture capability exists, use method: source-inspection, screenshots: [], and a nonempty limitations array describing the unavailable checks. Record source files and actual observations instead of inventing screenshots, focus tests, or visual approval. Missing verification belongs in limitations; known defects belong in unresolved and must be repaired. See verification.md.

Preview is a session-relative path or localhost URL. For standalone previews, copy immutable dist builds into session/candidates/rN-preview/ and reference index.html. For Web integration, use the host preview URL or its supported export format, preserving the tested source revision. Never replace files behind a confirmed preview.

The integrated presentation requires checks for build, desktop, mobile, keyboard, and contrast. Record actual commands, observations, and evidence paths; use an explicit "Not run: capability unavailable" explanation for checks that could not run. These keys document evidence and limitations, not automatic passing grades.

~~~sh
python3 "$SKILL/scripts/studio.py" publish --session "$PROJECT/session" --spec round.json
python3 "$SKILL/scripts/studio.py" status --session "$PROJECT/session"
python3 "$SKILL/scripts/studio.py" wait --session "$PROJECT/session" --timeout 45
~~~

wait polls while the round is awaiting-user (at most 55 seconds) and prints the state. Use it only to pick up a response that arrived through the studio API; it never substitutes for asking.

Record native single-select tool answers or plain chat responses with roundId, optionIds (zero or one ID), action, and actual feedback. The HTML has no decision inputs. Legacy optionId remains readable; multiple IDs are rejected without mutation. Actions: select for a preference choice, revise for changes, and approve for the sole integrated presentation. Chat submissions use studio.py decide against the running server and share its validation lock. See choices.md. Stale/duplicate submissions are rejected. Components/preview revisions return to foundations and invalidate downstream confirmations. Approval with unprocessed feedback is rejected. Writes are atomic and history survives restarts.

## Generator

Resolve paths with project-output.md first. These generator details apply to standalone delivery. Draft uses --tokens and core shadcn sources plus a neutral starter. --full preflights the entire snapshot. --deliver reads approved foundations from --session, requires --build, and records session.generated; it never marks the session delivered. Upstream inputs are fetched before any file is written, and LIBRARY/.glimpse-standalone marks generator-owned output so an interrupted run can be retried in place. If TLS verification fails behind an intercepting system proxy, retry with no_proxy="*". Use --output LIBRARY directly, without a library/ wrapper; App.tsx and custom files remain. Never run this scaffold in a host Web project. Both modes finish with studio.py finish and actual delivery evidence (see project-output.md); finish rejects an incomplete DESIGN.md.

DESIGN.md is drafted from assets/DESIGN.template.md with all 13 numbered sections. scripts/design_document.py fills facts available from tokens and existing paths, preserving evidence within sections 8 and 13. Complete the remaining fields from actual source and accepted choices before delivering. A generated draft (still containing the draft notice) is refreshed in place. A completed DESIGN.md is never overwritten: the refreshed draft goes to PROJECT/DESIGN.draft.md (LIBRARY/.glimpse by default) and must be merged back, reapplying completed values and translations. Follow design-document.md and run its completion check; generating source artifacts alone does not complete the document.

Upstream: https://ui.shadcn.com/r/styles/new-york-v4/*.json. shadcn-snapshot.json records hashes and names. Gallery lazily imports upstream examples. Next image/link examples adapt to React HTML for Vite; Tabler example icons adapt to Lucide. Sonner observes the document color-mode class through a local hook. Seven supplemental demos cover current UI items without an upstream example; add further demos if the snapshot grows. SHADCN-LICENSE.txt accompanies source and registry.

Known fixed-color Checkbox, Badge and Toggle examples are translated into semantic theme colors; chart examples use chart tokens. Inspect newly fetched examples for palette drift before delivery. Snapshot hashes identify upstream inputs, not the adapted output.

Keep custom CSS under src/components/custom/ and import it from custom TSX, or use src/theme-overrides.css. These files are preserved and distributed. Fontsource imports must be backed by package.json dependencies; those are preserved across generation. Avoid manual edits to generated main.tsx or index.css. Copy scripts' output artifacts into source control as appropriate; omit node_modules and build caches.

Standalone registry: LIBRARY/public/r/all.json. Serve public/ and install the URL via npx shadcn@4.21.0 add into React + Tailwind 4 with initialized shadcn configuration and src/ root. Include required custom fonts/assets in the registry. This is source distribution; publishing/deployment is not implied.

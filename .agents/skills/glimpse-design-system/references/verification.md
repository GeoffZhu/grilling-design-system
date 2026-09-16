# Verification and delivery evidence

## Available capabilities

Use the host's available browser and image tools, following their actual schemas. No named browser package, CLI, extension, or installation is a prerequisite. Do not install a browser tool just to satisfy this skill. Use existing capabilities when present; otherwise inspect source, run build and contrast checks, serve HTML for the user, and record the missing visual or interaction checks explicitly.

Keep known defects separate from unavailable verification. Fix defects before showing the result. Use visualReview.method: source-inspection with nonempty limitations when screenshot inspection is unavailable. Never create placeholder images or label unexecuted checks as passed. Carry limitations into DESIGN.md and the delivery response.

## Per preview

1. Build actual React source for component and integrated previews. Inspect focused HTML specimens for earlier decisions.
2. Serve locally. When browser capabilities exist, inspect the specimen at its declared viewport and the integrated page at 1440 by 900, 390 by 844, and 360 by 800.
3. Check Mobile overflow, readable text, and touch targets. When device emulation exists, verify coarse-pointer behavior, Switch on/off and default/small sizes, thumb insets, and the independent hit area.
4. Operate representative controls, a form, a custom component, and an overlay. Check keyboard focus, close/return focus, invalid states, and reduced motion where supported.
5. Read contrast-report.json and inspect actual foreground/background combinations in source. Fix failures; semantic reports alone do not cover all rendered combinations.
6. When screenshots are available, view them at actual size, including relevant component crops and states. Review reference fidelity, type hierarchy, spacing, shape, icons, composition, and copy; repair issues and recapture. See frontend-craft.md.
7. Save visualReview per component candidate and integrated presentation with the accepted token hash, real observations, and no known unresolved defects. Record limitations separately. Preview checks must describe actual results or explicitly identify checks not run.

## Workflow validation

Use temporary --simulation sessions for explicitly requested simulated runs. Record simulated responses through studio.py decide; never add decision controls to HTML or edit session state to skip a pending response. Keep simulation status visible in state and DESIGN.md.

Cover a planned visual choice, the real available single-select tool when a human participates, a derived checkpoint, one integrated presentation, revision feedback, updated foundations/components, explicit confirmation, and full source/registry/DESIGN.md delivery. Automated tests can submit simulated protocol responses but cannot claim they tested a real question popup. Check resume and retained history. Ensure feedback causes a visible change.

## Final delivery

- Fetch all registry:ui items from one recorded snapshot; use its manifest rather than a permanently hardcoded count.
- Include component sources, custom components, full gallery, tokens, CSS, dependency lock, installable registry, snapshot, licenses, and DESIGN.md. Both the library and its matching DESIGN.md are required.
- Build the library. Where browser access exists, inspect lazy gallery rendering, runtime errors, and visual consistency across forms, navigation, overlays, charts, and feedback components.
- Serve library/public; install public/r/all.json with npx shadcn@4.21.0 add into a clean initialized React + Tailwind 4 consumer and build it. Check theme imports and custom dependencies.
- Verify registry includes source imports, dependency versions, theme files, and required assets/fonts.
- Check DESIGN.md, tokens.json, CSS, registry, and the confirmed token hash agree. Include actual limitations; source generation is not proof of visual verification.

## Choice, presentation, and language checks

- Choice rounds contain exactly two comparable visual specimens and consume only planned high-impact questions. Derived checkpoints contain one specimen and a rationale, without a question.
- The full-page preview contains exactly one integrated design with Desktop and Mobile views. It has no A/B choice or approval popup. Confirmations and revisions arrive in conversation.
- Check relevant specimen viewports, scrolling, open links, zoom, and readable component sizes. Full device framing is required only for the integrated presentation. No zoom widgets or hints are visible.
- Verify font smoothing in the studio, HTML boards, and React preview documents, including iframe content.
- Send working links and use the available host tool's actual single-select schema. Reject multiple option IDs, stale answers, and premature approvals without mutating state. Cancellation or silence leaves the pending round unchanged.
- Keep review HTML free of feedback inputs and decision buttons. Preserve interactions within component examples.
- Keep skill source text in English. Translate runtime copy, previews, accessible labels, examples, and DESIGN.md into the user's language without changing identifiers.

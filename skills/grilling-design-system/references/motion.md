# Purposeful motion review

Read when defining motion foundations and checking components with transitions, animation or asynchronous feedback. Reuse the reference-derived intent and host primitives. Static components can remain static.

Adapted from [ui-skills /animate](https://github.com/dawitlabs/ui-skills/blob/6973cc6df7772780d31a4891fb60859f53f3e0b2/skills/animate/SKILL.md). Treat its timing patterns as examples, not mandatory animation recipes.

## Define the behavior

Inspect existing CSS transitions/keyframes, primitive enter/exit handling and any installed motion library before changing code. Reuse the established approach; simple CSS does not require another dependency.

For each recurring interaction, record the trigger, what changes, enter/exit behavior, duration/easing and reduced-motion behavior in the design intent. Derive the detail from the task and scale of movement. Keep the accepted `motion.duration` and `motion.easing` tokens as the shared foundation; express necessary role-specific behavior through existing host tokens, styles or variants without changing the token schema.

| Interaction | Purpose and checks |
| --- | --- |
| Hover/press/selection | Explain readiness or changed state; keep labels and hit geometry stable. |
| Popup/dialog/drawer | Connect trigger and surface, allow dismissal, and finish enter/exit cleanly. |
| Accordion/expansion | Explain content appearing and preserve reading position. |
| Loading/completion | Communicate real progress or completion without blocking the task or shifting button width. |
| Page/section reveal | Use only when the reference and task justify it; content must remain accessible if animation does not run. |

Do not enforce one duration for every role or require exits to be faster than entrances. Remove idle wiggles, gratuitous bouncing and card lifts that explain nothing. Existing meaningful animations may remain.

## Implement and inspect

Prefer transform/opacity for movement and fades. Avoid unnecessary layout work and broad `transition: all`. Color transitions and functional size changes, such as an accordion's content height, can be appropriate; bound them to the intended properties and inspect their effect on surrounding layout. A property name alone does not establish a performance defect.

Keep interaction responsive during animation. Exercise enter, exit, interruption and rapid repeated actions. Confirm no stranded overlay, invisible focusable control, stale loading state or delayed second action remains after cancellation. Preserve the primitive's mounting, dismissal and focus lifecycle.

Respect `prefers-reduced-motion`: remove nonessential travel, parallax and continuous effects while keeping state changes, feedback and content available. Reuse the host's existing reduction strategy and check the actual rendered behavior where supported; a CSS rule's presence alone does not verify it.

## Evidence and handoff

Use real browser interactions, and recordings or timed observations where supported, to inspect the sequence. Static before/after screenshots can show endpoints but cannot establish timing, interruption behavior or smoothness. Do not claim performance improvements without relevant measurements.

Record findings, actions and verification in `visualReview.observations` under `states`, with `composition` for layout effects. Reuse the existing review format; no new report or browser dependency is required. Describe unavailable interaction checks in limitations under [verification.md](verification.md).

Document the final interaction-specific rules in DESIGN.md section 5, the shared motion values alongside existing token notes, and the reduced-motion behavior and verification limits in section 8. Changes to accepted foundations return to that checkpoint.

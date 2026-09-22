# Grilling Design System

[English](README.md) | [中文](README.zh.md)

Start from one image, ask only a few high-impact visual questions, and deliver a complete shadcn/ui component library plus DESIGN.md.

Skill entry: [.agents/skills/grilling-design-system/SKILL.md](.agents/skills/grilling-design-system/SKILL.md). The repo also provides a `.claude/skills/grilling-design-system` link. Copy the entire skill directory into another project to use it.

Invocation example:

> Use $grilling-design-system, take this image as inspiration, and confirm a PC Web and Mobile Web design system.

## Workflow

Break the image into regions for content and style → map image traits to implementation → plan the visual decision tree → overall direction → foundation rules → components and states → check against the original image → integrated desktop and mobile preview → revise or confirm → full delivery.

- Start with content hierarchy, composition, color prominence, type contrast, geometry, density, material, and image use. Separate direct observation from inference. See [visual-analysis.md](skills/grilling-design-system/references/visual-analysis.md) for the method.
- Keep coexisting treatments in the image, such as a strong hero, a calm form, and a compact supporting list. Map every important trait to tokens, component variants, custom components, assets, or integrated composition. Do not leave it only in prose.
- After generation, check hierarchy, contours, color distribution, and content grouping against the original image. Also check whether ordinary components still follow those rules. Document rewritten traits, missing traits, and asset limits.

- Write the full decision tree first. Rank by visual impact, reuse, and uncertainty. Default to at most three questions; ask fewer when the evidence is enough.
- Each question shows only two options, A above B. Show the smallest specimen that makes the difference visible, such as the same set of buttons, inputs, or cards. A full page is not required every time.
- Publish the preview link first, then call the host agent's single-select tool (for example AskUserQuestion, `multiSelect: false`). If no tool is available, reply A or B in chat. To merge or adjust, say what should change.
- When a stage needs no question, the agent derives the rule from the image and prior choices, records the basis, and does not treat it as a user choice.
- The final preview shows one integrated design: a 16:9 desktop preview on the left and a 9:16 mobile preview on the right. Confirm in chat, or request changes. After changes, return to foundation styling and repeat until confirmed.
- Default to one light or dark mode.

Preview pages run locally and are for viewing only. They have no option checkboxes, feedback fields, or submit buttons. Specimens keep their designed size and shrink only when space is insufficient. Scrolling, pinch/browser zoom, and opening links stay available. Choices are saved in session.json. If the agent ends the turn, reply with the choice to continue.

## Output location

- If the current directory is a Web project: reuse its framework, styling system, and package manager. Write components to `design-system/` under the source root (or a directory you specify). Write DESIGN.md at the application root.
- If it is not a Web project: generate a complete React + Vite + Tailwind 4 app in the specified directory or `./design-system`, with DESIGN.md at that app root.

A complete library means every recorded official `registry:ui` item plus image-specific components. Official page blocks are not included. Deliverables include source, a runnable gallery, theme parameters, a shadcn install registry, the lockfile, an upstream snapshot, DESIGN.md, and verification records. After DESIGN.md is complete and passes `design_document.js --check`, record delivery with `studio.js finish`.

## Environment

Requires Node.js 20.19+ and npm. The first fetch of shadcn source and font dependencies needs a network. If a system proxy intercepts TLS and certificate verification fails, retry with `no_proxy='*'`.

All explanations and preview copy follow the user's primary language, in short, easy-to-understand sentences. The workflow incorporates Anthropic frontend-design checks for intent, composition, and component detail; see [frontend-craft.md](.agents/skills/grilling-design-system/references/frontend-craft.md). Component and integrated previews need real screenshot checks. If no browser capability is available, record the skipped checks honestly. A passing build does not replace visual inspection.

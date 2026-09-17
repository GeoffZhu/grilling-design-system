# Project detection, output paths, and native integration

Resolve the destination before generating code. Directory selection and project compatibility are separate decisions: a user-specified directory always wins, and the current Web project's environment still applies. Do not ask the user to choose a framework or delivery format.

## Output rules

| Current context | User-specified directory | Component output | DESIGN.md |
| --- | --- | --- | --- |
| Web project | Present | That exact directory | Web application root/DESIGN.md |
| Web project | Absent | Actual source root/design-system/ | Web application root/DESIGN.md |
| No Web project | Present | Complete standalone application at that directory | That directory/DESIGN.md |
| No Web project | Absent | Complete standalone application at cwd/design-system/ | cwd/design-system/DESIGN.md |

Resolve relative user paths against the invocation working directory. Do not append library/, src/, or design-system/ to an explicitly requested destination. Determine Web context from the current or explicitly targeted application, not from whether the output directory is empty. A Web project's custom destination may be outside src or outside the repository; retain it and configure imports/build inclusion according to existing workspace conventions.

Use the owning Web application's root, not an arbitrary ancestor or a sibling app. In a monorepo, resolve the application from the current path, user context, source, and workspace scripts. Follow the workspace package manager and lockfile. If several applications remain equally plausible, request only the missing target path; do not turn this into a visual preference question. Inspect existing destination files too: if the chosen directory already contains an application, integrate with that application instead of overwriting it with a new scaffold.

## Inspect the environment

Read AGENTS.md, package manifests, lockfiles, build scripts/config, route entries, components.json, tsconfig/jsconfig aliases, formatter/linter rules, stylesheets, and representative nearby components. Recognize React/Next/Remix, Vue/Nuxt, Svelte, Angular, Astro, and other browser applications; package.json alone is not proof of a Web project. Check server-rendered template applications and plain HTML projects too.

Identify the actual source root from build entries and aliases. Common roots are src/, app/, resources/js/, client/, or the flat project root. Do not create src/ merely because the standalone starter uses it. Identify JS versus TS, JSX conventions, client/server boundaries, import paths, filename casing, exports, quotes, semicolons, formatting, CSS approach, framework/Tailwind versions, icon library, accessibility primitives, package manager, and verification commands.

Use scripts/project.py for a read-only first pass:

~~~sh
python3 "$SKILL/scripts/project.py" --cwd "$PWD"
python3 "$SKILL/scripts/project.py" --cwd "$PWD" --output /user/requested/path
~~~

Its detection is heuristic; confirm results from source/config. For a custom setup or targeted monorepo app, pass --web-root and --source-root after inspection. The script resolves paths but never creates files or changes project configuration.

Record the confirmed result as PROJECT/project-context.json. Use LIBRARY for its output, DESIGN_DOC for its designDoc, and PROJECT for its workDir. PROJECT defaults to WEB_ROOT/.tmp/grilling-design-system in integrated mode and LIBRARY/.tmp/grilling-design-system in standalone mode. Keep sessions, candidates, caches, translations, drafts, and evidence there. Never use a legacy working directory. Reuse these paths while the workflow is active. A successful `studio.py finish` deletes PROJECT; only LIBRARY and DESIGN_DOC remain.

## Existing Web project

Implement a source module inside LIBRARY using the host framework and conventions. Use directories such as ui/, custom/, hooks/, and theme files only where they fit the host structure. Reuse existing canonical primitives and utilities via imports/re-exports when suitable. Add or adapt missing components under LIBRARY. Preserve existing package/build configuration and entry points; make only the changes needed to compile and expose the new module. Merge existing root DESIGN.md guidance rather than discarding unrelated standards.

Do not run the standalone scaffold into the project or its source tree. library.py is a standalone React/Vite generator and cannot infer arbitrary project conventions. To fetch official shadcn inputs without writing a new app, use:

~~~sh
python3 "$SKILL/scripts/library.py" --sources-only --full --cache "$PROJECT/cache"
~~~

For compatible React projects, adapt official sources to the installed React, styling, and primitive versions. Respect Next/server rendering boundaries and existing image/link/theme providers. Tailwind 3 requires its own configuration conventions; never inject Tailwind 4 directives blindly. When the project uses another styling system, translate the accepted visual specification into that system without replacing its build pipeline. Install only required dependencies with the existing package manager and compatible versions.

For non-React frameworks, use their compatible shadcn ecosystem or framework-native accessible equivalents for the same component inventory and design rules. Do not paste React TSX into Vue/Svelte/Angular code or add a second React runtime just for the gallery. Document adaptations and source attribution in DESIGN.md and the snapshot; do not label a framework port as unchanged official React source.

Mount a gallery/specimen through the host's existing route, story, demo, or preview mechanism. It must import the actual delivered module. Run the existing build/typecheck/lint commands and relevant interaction checks. Do not create a nested package.json, Vite app, or second lockfile solely to preview the design system. Generate a registry only when it is compatible with the host ecosystem, using actual paths and installed dependency versions. Validate its consumer in that same environment; do not require a Tailwind 4 Vite consumer for a different stack.

Write tokens, attribution/snapshot, applicable registry, and custom guidance with the module. Write the completed 13-section DESIGN.md to WEB_ROOT/DESIGN.md. Paths in that document are relative to WEB_ROOT, including relative paths to an explicitly requested external component directory. Its Implementation section must name actual host tooling and commands. Existing root standards must be merged with the new system.

For a generated documentation draft, scripts/design_document.py accepts --context with project-context.json. Add inspected fields framework, styling, componentLibrary, apiMapping, buildInstructions, and path mappings implementationPaths, referencePaths, and canonicalPaths; resolve path mappings from WEB_ROOT. implementationPaths uses the template labels UI components, Shared components, Domain components, and Design tokens. referencePaths uses App shell, List page, Detail page, Form page, and Settings. canonicalPaths uses Button, Input, Select, Dialog, Table, Tabs, and Toast. Do not fill these with assumed Vite/src paths. When root DESIGN.md exists, merge an intermediate draft into it.

~~~sh
python3 "$SKILL/scripts/design_document.py" --context "$PROJECT/project-context.json" --tokens "$LIBRARY/tokens.json" --snapshot "$LIBRARY/shadcn-snapshot.json" --checks "$PROJECT/checks.json" --session "$PROJECT/session"
~~~

Only finalize delivery after the integrated build, available visual checks, component coverage, and DESIGN_DOC completion check. Record integrated delivery through studio.py finish using an evidence JSON with absolute path, designDoc, tokenHash, componentCount, snapshotHash, and checks containing the actual host build result. This records evidence; it does not execute the build or prove visual quality.

~~~sh
python3 "$SKILL/scripts/studio.py" finish --session "$PROJECT/session" --evidence "$PROJECT/delivery.json"
~~~

On success, capture the command output for the handoff; the command removes PROJECT and all non-delivery artifacts. On failure, PROJECT remains intact for correction and resume.

## No Web project

Create the full runnable React/TypeScript/Vite/Tailwind application at LIBRARY itself. Use library.py with --output LIBRARY, --cache PROJECT/cache, and the existing draft/delivery arguments. The app's package.json, src/, public/, and DESIGN.md belong directly under LIBRARY. Never add a library/ wrapper. The user's chosen path remains the application root.

Use the model-authored token `name` as the visible application and theme name. Use the model-authored token `slug` as the package name, registry name, and registry theme CSS filename (`src/<slug>.css`). Do not use the skill name or another fixed generator name for these artifacts.

Use the standalone development/build commands and compatible shadcn registry consumer checks. Complete LIBRARY/DESIGN.md with the required template. Then record delivery with studio.py finish: evidence path is LIBRARY, designDoc is LIBRARY/DESIGN.md, tokenHash and snapshotHash come from session.generated, and checks.build holds the actual build result. Without project-context.json, finish validates against session.generated. If output already contains user work, inspect and preserve it before generating; an existing Web application takes the integration path.

### Custom component manifest

Create `LIBRARY/custom-components.json` when the design requires components outside the standard shadcn inventory. Keep component and preview files under `src/components/custom/`. The gallery groups all entries under "Custom components"; give each entry a specific component name. Example:

~~~json
{
  "components": [
    {
      "name": "metric-card",
      "title": "Metric Card",
      "description": "A compact metric surface for key values.",
      "files": ["src/components/custom/metric-card.tsx"],
      "preview": {
        "path": "src/components/custom/metric-card.preview.tsx",
        "export": "default"
      },
      "dependencies": [],
      "registryDependencies": ["card"]
    }
  ]
}
~~~

Use kebab-case unique names. `files` contains final consumer code; preview-only files are excluded from registry delivery unless also listed in `files`. `export` defaults to `default` and may name an exported preview component. The generator fails on missing files, paths outside `src/components/custom/`, duplicate names, or names colliding with official components.

In an existing Web project, implement the equivalent manifest or route metadata using the host framework. The outcome is mandatory: every custom component must appear under the "Custom components" group on the component home page and navigation, and have its own specifically named visual detail view, delivered inventory entry, and applicable registry/package export.

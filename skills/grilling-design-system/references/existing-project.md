# Optimize an existing UI

Read after intake and project-output.md when taskType is optimize. Deliver changed target pages, their real components, and merged root DESIGN.md.

## Inspect and bound the work

Read actual routes, representative screens, global styles, canonical components, data handlers and the existing design document. Use the host's preview mechanism and capture the current Desktop/Mobile UI when possible. Record baseline findings, page-to-component relationships, affected shared styles and checks in PROJECT. Do not infer behavior from screenshots alone.

If scope is missing, inspect first and ask whole site or selected pages with real candidates. Resolve concrete source paths, including changed shared styles, before initializing the session. Preserve unrelated user edits and existing assets.

## Adapt the real implementation

Reuse the framework, language, package manager, aliases, component library and accessibility primitive family. Ant Design, Element Plus and other established libraries remain in place; do not migrate them to shadcn. An existing shadcn project keeps its established primitive family. If no library exists, adapt the project's native components rather than installing a complete inventory for an optimization task.

For marketing targets, implement the nine custom families in the host framework, retaining existing public APIs or using local adapters where necessary. Do not add shadcn. Keep existing libraries needed by unrelated routes; avoiding a new dependency does not authorize deleting the old one.

Apply accepted rules directly to target pages and canonical components. Preserve route URLs, data fetching, permissions, forms, actions and error handling. Prefer scoped variants when shared/global changes would affect out-of-scope pages. Check impacted consumers; do not create a parallel unused component library while leaving the requested screens unchanged. Do not scaffold a nested app, second lockfile or another framework runtime.

LIBRARY remains the design-system module/metadata location from project-output.md; canonical implementation may remain elsewhere in the host. Document actual imports, not duplicate copies. Show the optimized real screens and compare important baseline issues at Desktop and Mobile. A generated gallery is supplemental, not proof the old pages were updated.

## Evidence and handoff

List target pages and affected component/style paths in context.targetPaths. Run the host build through studio.js verify with the host root and any external component directory as inputs. The approved and final builds must include those targets. A change to page or dependency sources after approval requires an updated presentation, even when it is outside LIBRARY.

For marketing or SaaS-with-homepage integration, write source-snapshot.json under LIBRARY with ui/custom inventories, portable files, dependencies and hashes using scripts/source_snapshot.js helpers. Use paths relative to LIBRARY, including explicit ../ paths for inspected host-owned files only, and pass the host root to the helper's allowedRoots option. Include the custom nine families (marketing-* for SaaS). For other existing SaaS tasks keep the host's applicable snapshot/attribution; no full official inventory or registry is required.

Merge DESIGN.md at the application root. Mark unused template components/screens as not applicable, document API mappings and styles actually in use, and include updated page paths. Verify the host build/typecheck/lint and meaningful existing behavior checks; use agent-browser for local visual/interaction verification when available. Report actual page changes and verification limits, plus the valid component/gallery usage instructions. Cleanup removes only the owned PROJECT workspace.

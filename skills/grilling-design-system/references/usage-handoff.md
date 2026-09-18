# Prepare the repository-specific usage handoff

The final reply must explain how to use the delivered component library in the repository that now exists. Treat this as part of delivery, not optional follow-up documentation. Write the handoff in the user's language.

## Reinspect the final result

After all generation and integration changes, inspect the final manifests, lockfile, exports or registry, stylesheet entry, aliases, root application entry, providers, gallery route, and representative component source. Prefer the repository's own commands and APIs over remembered scaffold defaults. Determine:

- the exact directory from which each command runs and the detected package manager;
- whether the library is already integrated, imported by source alias, exposed as a workspace package, or installed through a registry;
- the one required global stylesheet or theme import and where it belongs;
- every required root provider or singleton host, such as a theme provider, tooltip provider, dialog context, or toaster;
- a real public import path and actual props for one representative component;
- how to start or open the component gallery or documentation, if it remains in the delivered repository;
- any generated custom component whose setup differs from the standard components.
- the exact portable source set for reuse in another project: component files, token or theme styles, utilities, hooks, assets, dependencies, and provider setup;
- the exact generated directory and the minimum files an AI should read to adapt the system, starting with DESIGN_DOC and then the source, tokens, registry or snapshot, and durable design notes that actually exist.

Do not tell users to install the library when it already lives in their application. Do not advertise a registry URL, package export, barrel import, Storybook command, route, or alias unless it exists and was verified. If the output is a standalone app with a registry, distinguish running the gallery from installing the components into another app. Use the actual package manager and workspace filters. Never substitute generic `npm` commands for a pnpm, Yarn, Bun, or monorepo workflow.

Separate reusable implementation files from documentation-only or disposable files. Do not recommend copying gallery previews, review-only modules, temporary session data, caches, build output, or the whole standalone scaffold unless the target project needs them. Include transitive local imports required by the selected components; copying a component without its theme, utility, hook, asset, dependency, or provider is not a usable handoff.

## Verify the instructions

Exercise the documented path through the strongest safe check available. Ensure commands exist in the manifest, imports resolve, the stylesheet is loaded once, providers are mounted at the real root, and the example uses the delivered API. Prefer an existing demo or gallery that imports the same component. If a step cannot be executed, inspect it statically and label that exact limitation in the verification summary. Fix incorrect delivery wiring before writing the handoff.

Mirror durable setup facts in section 9, Implementation, of DESIGN_DOC. Keep the final reply concise but self-contained; the user must not need earlier progress messages to start using the system.

## Required final reply

Include a `How to use` section with:

1. **Start or install**: exact commands with the working directory. Say explicitly when no install step is needed.
2. **Global setup**: exact stylesheet import and required root providers or hosts. Omit this item only when none are needed.
3. **Use a component**: a minimal copyable example using a real delivered import path, export name, and props.
4. **Browse the library**: the exact gallery/docs command and route or built artifact, when available.
5. **Reuse in another project**: explicitly offer both paths below. Keep paths repository-valid and name only files that exist.
   - **Copy source**: list the exact files or directories to copy, the supporting styles, utilities, hooks, assets, dependencies, and root setup they require, plus any gallery or generated files that should not be copied. If copying is unsafe because the implementation is tightly integrated with the host, say so and recommend the AI-assisted path.
   - **Let AI adapt it**: identify the exact generated directory and a short ordered list of files for an AI to read. Provide a copyable prompt that tells the AI to inspect those files, preserve the design tokens and component behavior, and adapt imports, dependencies, styles, and providers to the target project's framework and conventions. Do not imply that an AI can access a path outside its workspace; tell the user to copy or attach the directory first when needed.
6. **Custom components**: mention their import or required setup when they differ; otherwise omit this item.

Also report LIBRARY, DESIGN_DOC, verification results, and any unverified usage step. Never include a retired temporary preview URL.

Adapt the content to the repository instead of forcing all items into separate headings. For an integrated source module, a valid handoff may look like this only after confirming every path and API:

~~~tsx
import { Button } from "@/design-system/ui/button"

export function SaveAction() {
  return <Button>Save</Button>
}
~~~

For a standalone registry, include both the verified gallery command and the exact registry install command, then show imports from the files the registry actually creates. Never copy these examples verbatim without repository evidence.

Keep the reuse guidance proportional. Prefer a compact path list and one short AI prompt. For example, derive wording shaped like the following from the delivered repository rather than copying its placeholders:

~~~text
Read <DESIGN_DOC>, then inspect <TOKENS>, <COMPONENT_SOURCE>, and <DURABLE_NOTES> under <LIBRARY>. Adapt the selected components to this project's framework and conventions. Preserve the documented tokens, states, responsive behavior, and accessibility. Bring over required local utilities, styles, assets, dependencies, and root providers; do not copy gallery-only or temporary files.
~~~

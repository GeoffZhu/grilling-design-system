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

Do not tell users to install the library when it already lives in their application. Do not advertise a registry URL, package export, barrel import, Storybook command, route, or alias unless it exists and was verified. If the output is a standalone app with a registry, distinguish running the gallery from installing the components into another app. Use the actual package manager and workspace filters. Never substitute generic `npm` commands for a pnpm, Yarn, Bun, or monorepo workflow.

## Verify the instructions

Exercise the documented path through the strongest safe check available. Ensure commands exist in the manifest, imports resolve, the stylesheet is loaded once, providers are mounted at the real root, and the example uses the delivered API. Prefer an existing demo or gallery that imports the same component. If a step cannot be executed, inspect it statically and label that exact limitation in the verification summary. Fix incorrect delivery wiring before writing the handoff.

Mirror durable setup facts in section 9, Implementation, of DESIGN_DOC. Keep the final reply concise but self-contained; the user must not need earlier progress messages to start using the system.

## Required final reply

Include a `How to use` section with:

1. **Start or install**: exact commands with the working directory. Say explicitly when no install step is needed.
2. **Global setup**: exact stylesheet import and required root providers or hosts. Omit this item only when none are needed.
3. **Use a component**: a minimal copyable example using a real delivered import path, export name, and props.
4. **Browse the library**: the exact gallery/docs command and route or built artifact, when available.
5. **Custom components**: mention their import or required setup when they differ; otherwise omit this item.

Also report LIBRARY, DESIGN_DOC, verification results, and any unverified usage step. Never include a retired temporary preview URL.

Adapt the content to the repository instead of forcing all items into separate headings. For an integrated source module, a valid handoff may look like this only after confirming every path and API:

~~~tsx
import { Button } from "@/design-system/ui/button"

export function SaveAction() {
  return <Button>Save</Button>
}
~~~

For a standalone registry, include both the verified gallery command and the exact registry install command, then show imports from the files the registry actually creates. Never copy these examples verbatim without repository evidence.

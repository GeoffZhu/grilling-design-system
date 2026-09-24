# Product intake and component scope

## Intake order

1. Obtain and view the actual reference image first. Reuse an accessible attachment or path. If missing, request the image in conversation and wait; do not ask product questions or invent a substitute first.
2. Use the host's single-select question tool: “What are we designing?” Options: “SaaS app — admin interface” and “Marketing site — brand website.” Reuse an explicit answer instead of asking again.
3. For SaaS only, immediately ask: “Include a promotional homepage Key Visual?” Options: “Yes — custom homepage components and a gallery Key Visual” and “No — admin interface only.” This does not add a business homepage route.
4. Inspect the project using project-output.md. Distinguish a new system from UI optimization by actual pages and the user's request; an empty framework starter is still a new task. If an optimization request does not identify its scope, list the discovered pages and ask “Whole site” or “Selected pages.” Resolve selected paths before visual work. Never silently default to a whole-site rewrite.
5. Record context, analyze the image, and plan visual choices. The intake and scope questions do not consume the three-question visual preference budget and do not need A/B preview pages. Their answers are context, not visual approvals.

Resume saved context and pending decisions. Only ask for missing information. Missing answers stay pending; silence is not consent. Translate questions into the user's language.

## Product rules

| Product / task | Required component coverage |
| --- | --- |
| New SaaS | Complete shadcn/ui inventory, adapted to the host framework |
| Existing SaaS optimization | Existing component library; target pages and their used/shared components |
| SaaS with homepage | Its admin coverage plus all nine custom marketing families |
| Marketing, new or existing | The nine custom core families below |

Custom marketing families use these manifest identifiers:

| Identifier | Component | Responsibility |
| --- | --- | --- |
| button | Button | CTA and action variants |
| header | Header / Navbar | Logo, navigation, CTA, mobile disclosure |
| hero | Hero | Heading, subtitle, primary CTA, visual region |
| section | Section | Consistent width, vertical spacing, title structure |
| card | Card | Feature, case study and pricing compositions |
| footer | Footer | Brand information and core links |
| input-form | Input / Form | Inputs, labels, validation and form composition |
| select | Select | Themed trigger, option popup, selection and applicable interaction states |
| icon | Icon | Icon style, size and accessible meaning |

Use variants and composition inside these families; do not inflate the inventory with separate feature/pricing/business blocks. Input and Form may be separate exports/files in one input-form manifest entry. Header and Navbar are one family.

Author all nine from the reference. Do not fetch, copy, wrap or style shadcn components for marketing. Use native semantic elements and the host's suitable unstyled interaction primitives when needed; using an unstyled accessible primitive does not require shadcn. An existing icon library is allowed. Preserve keyboard interaction, visible focus, form labels, errors, disabled/loading states, and mobile behavior.

Default Select to an accessible custom option popup styled with the delivered system, even for short lists. Styling a native select's closed field does not style its browser/OS picker. Follow the Select rules in design-rules.md, including documented native exceptions and form compatibility; verify the opened popup as specified in verification.md.

For SaaS homepages, prefix manifest identifiers with marketing- and public component exports with Marketing, e.g. marketing-button / MarketingButton. Apply scoped custom styles; do not inherit the backend's cn-* styling through wrappers. Share brand colors and typography foundations while defining suitable section rhythm and scale. The admin component catalog remains present. Homepage Key Visual is the overview composition when enabled; otherwise use an admin scene.

The full homepage is docs-only: do not count, register or export IntegratedPreview as a component. Each of its nine reusable families must have a visual detail page and usable source exports. Do not create a real application homepage route unless separately requested.

## Recorded context

Extend the inspected project-context.json, retaining its real path/tooling fields:

~~~json
{
  "productType": "saas",
  "taskType": "optimize",
  "includeMarketingHomepage": false,
  "targetPaths": ["src/pages/settings.tsx", "src/components/settings", "src/styles/settings.css"]
}
~~~

productType is saas or marketing. taskType is new or optimize and is independent of mode (integrated or standalone). Optimization requires integrated mode, webRoot and nonempty inspected targetPaths. Paths identify actual source files/directories, not URL strings; expand “whole site” to actual page roots. Include changed shared components and styles. Marketing sets includeMarketingHomepage to false: its own Key Visual is already mandatory.

Pass --context to studio.js init and library.js. Initialization stores it in the session and project-context.json. The standalone generator also retains design-context.json for later regeneration. A session's product/scope cannot be silently changed; start a new session with the new scope if necessary. Legacy commands and sessions without product context retain the original SaaS behavior for compatibility; do not describe this fallback as a user-selected product.

The shared token format remains compatible across products; unused admin color roles do not imply extra marketing components. Marketing boards set content.productType to marketing and supply their own component CSS. The foundation-only theme contains no shadcn component rules.

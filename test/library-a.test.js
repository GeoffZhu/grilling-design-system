import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  COMPONENT_CATEGORIES,
  SOURCE_ROOT,
  UPSTREAM_BASE,
  UPSTREAM_COMMIT,
  component_catalog_entries,
  filename,
  local_registry_imports,
  main_source,
  nonstandard_placeholder_urls,
  normalize_generated_sources,
  normalize_placeholder_images,
  preserve_previous_dependencies,
  registry,
  remote_example_image_urls,
  scaffold,
  theme_example,
  transform,
} from "../skills/grilling-design-system/scripts/library.js";
import {
  button_group_css,
  component_css,
  css,
  input_group_composition_css,
  geometry,
  signature,
  style_provenance,
  validate,
  state_css,
  theme_signature_css,
} from "../skills/grilling-design-system/scripts/theme.js";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = path.join(REPOSITORY_ROOT, "skills/grilling-design-system");
const COLORS = Object.fromEntries([
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "secondary", "secondary-foreground", "muted",
  "muted-foreground", "accent", "accent-foreground", "destructive", "border", "input",
  "ring", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "sidebar",
  "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent",
  "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
].map((key) => [key, key.endsWith("foreground") ? "#111111" : "#eeeeee"]));
const tokens = (name, slug) => ({
  name, slug, mode: "light", colors: COLORS, radius: 10,
  font: { family: "system-ui", heading: "system-ui", bodySize: 16, headingWeight: 700 },
  spacing: { unit: 4, controlHeight: 44 },
  icons: { family: "Lucide", size: 24, stroke: 2 },
  motion: { duration: 160, easing: "ease-out" }, shadow: "none",
});
const compact = (value) => value.replace(/\s/g, "");
const css_rule = (styles, expression, index = 0) => {
  const matches = [...styles.matchAll(expression)];
  assert.ok(matches.length > index, `missing CSS rule ${expression}`);
  return matches[index][1];
};
const includes_all = (actual, expected) => {
  for (const value of expected) assert.ok(actual.includes(value), `expected ${JSON.stringify(value)}`);
};
const temporary_root = (t) => {
  const root = mkdtempSync(path.join(tmpdir(), "glimpse-library-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
};

test("flat tokens have no hidden family elevation and explicit choices propagate", () => {
  const flat = tokens("Flat", "flat");
  const resolved = signature(flat);
  for (const family of Object.values(resolved)) {
    assert.equal(family.shadow, "none");
    if (Object.hasOwn(family, "pressedOffset")) assert.equal(family.pressedOffset, 0);
  }
  assert.equal(geometry(flat).surfaceRadius, flat.radius);
  assert.equal(style_provenance(flat).craft.labelWeight.source, "script-default");
  flat.craft = { labelWeight: 650, surfaceRadius: 24 };
  flat.signature = { actions: { shadow: "0 3px 0 #000000", pressedOffset: 2, borderWidth: 2 } };
  const result = css(flat, false);
  includes_all(result, ["--actions-shadow:0 3px 0 #000000", "--actions-pressed-offset:2px", "--actions-border-width:2px", "--surface-radius:24px"]);
  assert.equal(style_provenance(flat).signature.actions.shadow.source, "token");
  flat.signature.actions.shadow = "none; color:red";
  assert.throws(() => validate(flat), /signature shadow/);
});

test("board and library share browser-native component rules", () => {
  const t = tokens("Shared", "shared");
  const shared = component_css();
  assert.ok(!shared.includes("@apply"));
  assert.ok(css(t, false).endsWith(shared));
  assert.ok(css(t, true).endsWith(shared));
  assert.ok(css(t, false).includes("--radius-sm:6px"));
  assert.ok(shared.includes("display:inline-flex;align-items:center;justify-content:center"));
  assert.ok(shared.includes(".cn-card{display:flex;flex-direction:column}"));
  assert.ok(!shared.includes("box-shadow:var(--inputs-shadow),"));
});

test("registry uses model-authored artifact name", (t) => {
  const root = temporary_root(t);
  mkdirSync(path.join(root, "src"));
  registry(root, {}, tokens("Northstar Atelier", "northstar-atelier"), { dependencies: { react: "19.1.0" } }, []);
  const item = JSON.parse(readFileSync(path.join(root, "public/r/all.json"), "utf8"));
  const catalog = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8"));
  assert.equal(catalog.name, "northstar-atelier");
  assert.ok(Object.hasOwn(item.css, '@import "./northstar-atelier.css"'));
  assert.ok(item.files.map((entry) => entry.path).includes("src/northstar-atelier.css"));
});

test("integrated preview is docs-only, not registry or catalog", (t) => {
  const root = temporary_root(t);
  mkdirSync(path.join(root, "src/components/custom"), { recursive: true });
  writeFileSync(path.join(root, "src/IntegratedPreview.tsx"), "export default function IntegratedPreview(){return null}");
  writeFileSync(path.join(root, "src/components/custom/metric-card.tsx"), "export function MetricCard(){return null}");
  const custom = [{
    name: "metric-card", title: "Metric Card", description: "Metric",
    files: ["src/components/custom/metric-card.tsx"],
    preview: { path: "src/components/custom/metric-card.tsx" },
    dependencies: [], registryDependencies: [],
  }];
  const labels = Object.fromEntries(
    [...new Set([...Object.values(COMPONENT_CATEGORIES), "Utilities", "Custom components", "Visual preview, variants and interaction states for this component."])]
      .map((key) => [key, key]),
  );
  registry(root, {}, tokens("Test", "test"), { dependencies: {} }, custom);
  const item = JSON.parse(readFileSync(path.join(root, "public/r/all.json"), "utf8"));
  const catalog = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8"));
  const paths = new Set(item.files.map((entry) => entry.path));
  const entries = component_catalog_entries(["button"], custom, labels);
  assert.ok(!paths.has("src/IntegratedPreview.tsx"));
  assert.ok(!entries.some((entry) => entry.name === "integrated-preview"));
  assert.ok(!catalog.items.some((entry) => entry.name === "integrated-preview"));
  assert.deepEqual(entries.map((entry) => entry.name), ["button", "metric-card"]);
});

test("main source mounts global component hosts", () => {
  const source = main_source({ mode: "light" }, ["button", "tooltip", "sonner"]);
  assert.ok(source.includes('import { Toaster } from "@/components/ui/sonner";'));
  assert.equal(source.split("<Toaster />").length - 1, 1);
  assert.ok(source.includes("<TooltipProvider><App /><Toaster /></TooltipProvider>"));
});

test("main source omits unavailable global hosts", () => {
  const source = main_source({ mode: "light" }, ["button", "tooltip"]);
  assert.ok(!source.includes("@/components/ui/sonner"));
  assert.ok(!source.includes("<Toaster />"));
});

test("main source mounts Base UI toast host", () => {
  const source = main_source({ mode: "light" }, ["toast"]);
  assert.ok(source.includes('from "@/components/ui/toast"'));
  assert.ok(source.includes("<App /><BaseToaster />"));
  assert.ok(!source.includes("TooltipProvider"));
});

test("scaffold uses generated style name", (t) => {
  const root = temporary_root(t);
  scaffold(root, "en", "Test", "test-style");
  const config = JSON.parse(readFileSync(path.join(root, "components.json"), "utf8"));
  assert.equal(UPSTREAM_BASE, "base");
  assert.match(UPSTREAM_COMMIT, /^[0-9a-f]{40}$/);
  assert.ok(SOURCE_ROOT.includes(UPSTREAM_COMMIT));
  assert.ok(SOURCE_ROOT.includes("/registry/bases/base/"));
  assert.equal(config.style, "test-style");
});

test("Base UI source path and icon transform", () => {
  assert.equal(filename("registry/bases/base/ui/button.tsx"), "src/components/ui/button.tsx");
  const source = `"use client"
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"
import { Button } from "@/registry/bases/base/ui/button"
export function Demo(){return <div className="p-4 style-nova:p-2 style-vega:p-6"><IconPlaceholder lucide="XIcon" tabler="IconX" className="size-4" /></div>}
`;
  const result = transform(source);
  includes_all(result, ['import { XIcon } from "lucide-react"', 'from "@/components/ui/button"', '<XIcon className="size-4" />']);
  assert.ok(!result.includes("IconPlaceholder"));
  assert.ok(!result.includes("style-nova"));
  assert.ok(!result.includes("style-vega"));
});

test("transform keeps semantic hook when preset branch is removed", () => {
  const result = transform('className="cn-input-otp-slot style-nova:size-10 style-vega:border"');
  assert.ok(result.includes("cn-input-otp-slot"));
  assert.ok(!result.includes("style-nova:"));
  assert.ok(!result.includes("style-vega:"));
});

test("transform removes unused React namespace from scroll area", () => {
  const source = `import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
function ScrollArea(props: ScrollAreaPrimitive.Root.Props) { return <div {...props} /> }
`;
  assert.ok(!transform(source).includes('import * as React from "react"'));
});

test("placeholder services and demo photos use dummyimage", () => {
  const source = `
const mock = "https://picsum.photos/id/22/640/360"
const random = "https://source.unsplash.com/random/720x480?nature"
const legacy = "https://via.placeholder.com/300x200.png?text=Legacy"
const flickr = "https://loremflickr.com/480/320/city"
const fake = "https://fakeimg.pl/250x100/"
`;
  const result = transform(source);
  for (const size of ["640x360", "720x480", "300x200", "480x320", "250x100"]) {
    assert.ok(result.includes(`https://dummyimage.com/${size}/000/fff`));
  }
  assert.deepEqual(nonstandard_placeholder_urls(result), []);
});

test("HTML and JSX image geometry controls placeholder size", () => {
  const source = `
<img src="https://placehold.co/900x900/png" width="640" height="360" alt="Demo" />
<Image src={'https://placeholder.com/200x200'} width={320} height={180} alt="Demo" />
<Image fill src="https://images.unsplash.com/photo-demo?w=1200&h=800" alt="Demo" />
<img className="aspect-video w-full" src="https://images.unsplash.com/photo-wide?w=800" alt="Demo" />
`;
  const result = transform(source);
  includes_all(result, ["640x360", "320x180", "1200x800", "800x450"].map((size) => `https://dummyimage.com/${size}/000/fff`));
  assert.ok(!result.includes("#000"));
  assert.ok(!result.includes("#fff"));
});

test("placeholder conversion preserves real and user resources", () => {
  const source = `
import heroImage from "./hero.jpg"
<img src="/images/customer-reference.png" alt="Reference" />
<Image src={heroImage} fill alt="Licensed campaign" />
<img src="https://cdn.example.com/licensed/campaign.jpg" width="800" height="600" />
<AvatarImage src="https://github.com/evilrabbit.png" />
<img src="data:image/png;base64,AAAA" />
`;
  assert.equal(normalize_placeholder_images(source), source);
});

test("generated example rewrites all remote image and avatar sources", () => {
  const source = `
<AvatarImage src="https://github.com/example.png" />
<img src="https://cdn.example.com/example-photo.jpg" width="800" height="600" />
<Image src="https://assets.example.com/hero.webp" fill className="aspect-video" />
<a href="https://example.com/docs">Docs</a>
`;
  const result = transform(source, true);
  includes_all(result, ["600x600", "800x600", "600x338"].map((size) => `https://dummyimage.com/${size}/000/fff`));
  assert.ok(result.includes('href="https://example.com/docs"'));
  assert.deepEqual(remote_example_image_urls(result), []);
  assert.ok(!result.includes("github.com/example.png"));
  assert.ok(!result.includes("cdn.example.com/example-photo.jpg"));
});

test("non-example sources preserve user and licensed remote images", () => {
  const source = '<AvatarImage src="https://cdn.example.com/licensed-avatar.png" /><img src="https://cdn.example.com/campaign.jpg" />';
  assert.equal(transform(source), source);
});

test("dummyimage is normalized to path colors without hashes", () => {
  const result = normalize_placeholder_images('<img src="https://dummyimage.com/1024x512/abcdef/123456.png&text=Demo" />');
  assert.equal(result, '<img src="https://dummyimage.com/1024x512/000/fff" />');
});

test("generated source pass catches templates and preserves real assets", (t) => {
  const root = temporary_root(t);
  const examples = path.join(root, "src/examples");
  const custom = path.join(root, "src/components/custom");
  mkdirSync(examples, { recursive: true });
  mkdirSync(custom, { recursive: true });
  writeFileSync(path.join(examples, "gallery.tsx"), '<Image fill src="https://images.unsplash.com/photo-demo?w=960&h=540" /><AvatarImage src="https://github.com/example.png" />');
  writeFileSync(path.join(custom, "promo.tsx"), '<img src="https://placekitten.com/400/300" /><img src="/customer.png" /><img src="https://cdn.example.com/licensed.jpg" />');
  normalize_generated_sources(root);
  const generated = [path.join(examples, "gallery.tsx"), path.join(custom, "promo.tsx")]
    .map((file) => readFileSync(file, "utf8")).join("\n");
  includes_all(generated, ["960x540", "600x600", "400x300"].map((size) => `https://dummyimage.com/${size}/000/fff`));
  for (const value of ["images.unsplash.com", "github.com/example.png", "placekitten.com"]) assert.ok(!generated.includes(value));
  assert.ok(generated.includes("/customer.png"));
  assert.ok(generated.includes("https://cdn.example.com/licensed.jpg"));
});

test("local registry imports find missing UI dependency", () => {
  const item = { files: [{ content: 'import { ToggleGroup } from "@/registry/bases/base/ui/toggle-group"' }] };
  assert.deepEqual(local_registry_imports(item), new Set(["toggle-group"]));
});

test("unused legacy primitive dependencies are not preserved", () => {
  const current = { "@base-ui/react": "latest", react: "^19" };
  const previous = { "radix-ui": "1.4.3", "@radix-ui/react-slot": "1.2.3", react: "19.3.0", zod: "4.0.0" };
  const result = preserve_previous_dependencies(current, previous);
  assert.ok(!("radix-ui" in result));
  assert.ok(!("@radix-ui/react-slot" in result));
  assert.equal(result.react, "19.3.0");
  assert.equal(result.zod, "4.0.0");
});

test("generated visual layer styles raw Base UI hooks", () => {
  const styles = component_css();
  includes_all(styles, [".cn-button", ".cn-input", ".cn-card", ".cn-dialog-content", ".cn-select-item", ".cn-tabs-trigger"]);
});

test("progress root keeps labels and file-upload rows visible", () => {
  const styles = compact(component_css());
  const root = css_rule(styles, /\.cn-progress-root\{([^}]*)\}/g);
  const track = css_rule(styles, /\.cn-progress-track\{([^}]*)\}/g);
  assert.ok(root.includes("display:flex;flex-wrap:wrap;gap:0.75rem;"));
  assert.ok(!root.includes("h-2"));
  assert.ok(!root.includes("overflow-hidden"));
  assert.ok(track.includes("height:0.5rem;overflow:hidden;border-radius:9999px;background-color:var(--muted);"));
});

test("item defaults to lightweight surface without weakening cards", () => {
  const styles = compact(component_css());
  const item = css_rule(styles, /(?:^|})\.cn-item\{([^}]*)\}/g);
  assert.ok(item.includes("box-shadow:none"));
  assert.ok(!item.includes("var(--design-shadow)"));
  const raised = css_rule(styles, /\.cn-card,\.cn-attachment,\.cn-alert\{([^}]*)\}/g);
  assert.ok(raised.includes("box-shadow:var(--design-shadow)"));
});

test("progress file-upload example wraps without squeezing filename", () => {
  const source = `function FileUploadList() {
  return <Item className="px-0">
    <ItemContent className="inline-block truncate">name</ItemContent>
    <ItemContent>
      <Progress value={file.progress} className="w-32" />
    </ItemContent>
    <ItemActions className="w-16 justify-end">time</ItemActions>
  </Item>
}`;
  const result = theme_example("progress-example", source);
  includes_all(result, [
    'className="min-w-0 inline-block truncate"',
    'className="order-last !flex-[0_0_100%] pl-8"',
    'className="w-full"',
    'className="w-16 shrink-0 justify-end"',
  ]);
  assert.ok(!result.includes('className="w-32"'));
});

test("gallery responds to preview container and owns overflow locally", () => {
  const gallery = readFileSync(path.join(SKILL, "assets/gallery.css"), "utf8");
  const styles = compact(gallery);
  includes_all(styles, [
    "container:visual-preview/inline-size",
    "@containervisual-preview(min-width:960px)",
    "grid-template-columns:minmax(0,1fr)!important",
    "grid-template-columns:repeat(2,minmax(0,1fr))!important",
    ".demo-canvas{position:relative;min-width:0;min-height:420px;overflow-x:hidden",
    ".visual-example-canvas:has(.cn-calendar)[data-slot=example-content]",
  ]);
  assert.ok(gallery.includes("[data-slot=table-container]"));
  assert.ok(gallery.includes("overflow-x:auto"));
  assert.ok(gallery.includes(".visual-example:has(.cn-calendar)"));
});

test("gallery sidebar top controls have deliberate spacing", () => {
  const gallery = compact(readFileSync(path.join(SKILL, "assets/gallery.css"), "utf8"));
  const sidebar = css_rule(gallery, /\.catalog-sidebar-inner\{([^}]*)\}/g);
  const search = css_rule(gallery, /\.catalog-search\{([^}]*)\}/g);
  includes_all(sidebar, ["display:flex", "flex-direction:column", "gap:20px", "padding:24px20px48px"]);
  assert.ok(search.includes("margin:0"));
});

test("calendar has readable cells and card footer centers content", () => {
  const styles = compact(component_css());
  const calendar = css_rule(styles, /\.cn-calendar\{([^}]*)\}/g);
  const day = css_rule(styles, /(?:^|})\.cn-calendar-day-button\{([^}]*)\}/g);
  const footer = css_rule(styles, /\.cn-card-footer\{([^}]*)\}/g);
  assert.ok(calendar.includes("--cell-size:max(2.5rem,var(--control-height))"));
  includes_all(day, ["min-height:var(--cell-size)", "min-width:var(--cell-size)"]);
  includes_all(footer, ["display:flex", "align-items:center", "min-height:calc(var(--control-height)+2rem)", "padding-block:1.0rem"]);
  assert.ok(!footer.includes("pt-4"));
});

test("calendar dropdowns and rich days have explicit geometry", () => {
  const styles = compact(component_css());
  const dropdown = css_rule(styles, /\.cn-calendar-dropdown-root\{([^}]*)\}/g);
  const caption = css_rule(styles, /\.cn-calendar-caption-label\{([^}]*)\}/g);
  const richCell = css_rule(styles, /\.cn-calendar-custom-days\.rdp-day\{([^}]*)\}/g);
  const richDay = css_rule(styles, /\.cn-calendar-custom-days\.cn-calendar-day-button\{([^}]*)\}/g);
  includes_all(dropdown, ["display:inline-flex", "align-items:center", "min-width:5.5rem", "min-height:2.5rem", "overflow:hidden"]);
  includes_all(caption, ["width:100%", "min-height:2.375rem", "justify-content:space-between", "gap:.5rem", "padding-inline:.625rem"]);
  includes_all(richCell, ["height:4rem", "aspect-ratio:auto"]);
  includes_all(richDay, ["height:4rem", "min-height:4rem", "aspect-ratio:auto", "gap:.25rem", "padding-block:.5rem"]);
  for (const state of ["selected-single", "range-start", "range-end"]) {
    const rule = css_rule(styles, new RegExp(`\\.cn-calendar-day-button\\[data-${state}=\"true\"\\][^{]*\\{([^}]*)\\}`, "g"));
    includes_all(rule, ["background-color:var(--primary)", "color:var(--primary-foreground)"]);
  }
});

test("calendar custom-days example uses rich-cell contract", () => {
  const source = `function CalendarCustomDays() {
  return <Calendar className="[--cell-size:--spacing(10)] md:[--cell-size:--spacing(12)]" />
}`;
  const themed = theme_example("calendar-example", source);
  assert.ok(themed.includes('className="cn-calendar-custom-days [--cell-size:--spacing(12)]"'));
  assert.ok(!themed.includes("md:[--cell-size:--spacing(12)]"));
});

test("sheet content stacks above overlay and gallery chrome", () => {
  const styles = compact(component_css());
  const overlay = css_rule(styles, /\.cn-sheet-overlay\{([^}]*)\}/g);
  const content = css_rule(styles, /\.cn-sheet-content\{([^}]*)\}/g);
  const gallery = compact(readFileSync(path.join(SKILL, "assets/gallery.css"), "utf8"));
  const chromeLevels = [...gallery.matchAll(/z-index:(\d+)/g)].map((match) => Number(match[1]));
  includes_all(overlay, ["position:fixed", "inset:0", "z-index:80"]);
  includes_all(content, ["position:fixed", "z-index:81"]);
  assert.ok(chromeLevels.length > 0, "gallery chrome must define at least one z-index");
  assert.ok(80 > Math.max(...chromeLevels));
  assert.ok(Number(content.match(/z-index:(\d+)/)?.[1]) > Number(overlay.match(/z-index:(\d+)/)?.[1]));
  for (const side of ["right", "left", "top", "bottom"]) assert.ok(styles.includes(`.cn-sheet-content[data-side="${side}"]`));
});

test("switch uses Base UI checked attributes for track and thumb", () => {
  const styles = compact(component_css());
  const checked = '[data-checked]:not([data-checked="false"])';
  const unchecked = '[data-unchecked]:not([data-unchecked="false"])';
  assert.ok(styles.includes(`.cn-switch${checked}{background-color:var(--primary)}`));
  assert.ok(styles.includes(`.cn-switch${unchecked}{background-color:var(--input)}`));
  assert.ok(styles.includes(`.cn-switch${checked}.cn-switch-thumb{transform:translateX(calc(var(--switch-width)-var(--switch-thumb-size)-var(--switch-inset)-var(--switch-inset)));background-color:var(--primary-foreground)}`));
  assert.ok(styles.includes(`.cn-switch${unchecked}.cn-switch-thumb{transform:translateX(0);background-color:var(--background)}`));
  assert.ok(!styles.includes('[data-slot="switch-thumb"][data-state="checked"]'));
});

test("input group owns single frame without inner control borders", () => {
  const styles = compact(component_css());
  const signature = compact(theme_signature_css());
  const rules = [
    css_rule(styles, /\.cn-input-group>\.cn-input-group-input\{([^}]*)\}/g),
    css_rule(styles, /\.cn-input-group>\.cn-input-group-textarea\{([^}]*)\}/g),
    css_rule(styles, /\.cn-input-group>\.cn-input-group-addon\{([^}]*)\}/g),
  ];
  for (const rule of rules) includes_all(rule, ["border:0", "box-shadow:none", "background:transparent"]);
  assert.ok(signature.includes(".cn-input:not(.cn-input-group-input)"));
  assert.ok(signature.includes(".cn-textarea:not(.cn-input-group-textarea)"));
  assert.ok(!signature.includes(".cn-input,.cn-textarea,.cn-select-trigger"));
});

test("button group owns frame and children share single separators", () => {
  const styles = compact(button_group_css());
  const frame = css_rule(styles, /\.cn-button-group\{([^}]*)\}/g);
  const children = css_rule(styles, /\.cn-button-group>\[data-slot\]:not\(\[data-slot="button-group-separator"\]\)\{([^}]*)\}/g);
  const horizontal = css_rule(styles, /\.cn-button-group:not\(\[data-orientation="vertical"\]\)>\[data-slot\]\+\[data-slot\]\{([^}]*)\}/g);
  const vertical = css_rule(styles, /\.cn-button-group\[data-orientation="vertical"\]>\[data-slot\]\+\[data-slot\]\{([^}]*)\}/g);
  const nested = css_rule(styles, /\.cn-button-group>\.cn-button-group\{([^}]*)\}/g);
  includes_all(frame, ["border:var(--actions-border-width)solidvar(--border)", "border-radius:var(--control-radius)", "box-shadow:var(--design-shadow)", "overflow:hidden", "isolation:isolate"]);
  assert.ok(!frame.includes("box-shadow:03px0"));
  includes_all(children, ["border:0", "border-radius:0", "box-shadow:none", "margin:0"]);
  assert.ok(horizontal.includes("border-inline-start:1pxsolidvar(--border)"));
  assert.ok(vertical.includes("border-block-start:1pxsolidvar(--border)"));
  includes_all(nested, ["border:0", "border-radius:0", "box-shadow:none"]);
  assert.ok(styles.includes('.cn-button-group>[data-slot]:not([data-slot="button-group-separator"])'));
});

test("button-group focus, pressed, and explicit separator do not double-frame", () => {
  const styles = compact(button_group_css());
  const focus = css_rule(styles, /\.cn-button-group>\[data-slot\]:focus-visible\{([^}]*)\}/g);
  const pressed = css_rule(styles, /\.cn-button-group\.cn-button:active\{([^}]*)\}/g);
  const separator = css_rule(styles, /\.cn-button-group>\[data-slot="button-group-separator"\]\{([^}]*)\}/g);
  includes_all(focus, ["position:relative", "z-index:2", "outline:2pxsolidvar(--ring)", "outline-offset:-2px", "box-shadow:none!important"]);
  includes_all(pressed, ["transform:none", "box-shadow:none!important"]);
  includes_all(separator, ["width:1px", "margin:0", "border:0", "background:var(--border)"]);
  includes_all(styles, [
    '[data-slot="button-group-separator"]+[data-slot]{border-inline-start:0}',
    '[data-slot="button-group-separator"]+[data-slot]{border-block-start:0}',
    '[data-slot]+[data-slot="button-group-separator"]{border-inline-start:0}',
    '[data-slot]+[data-slot="button-group-separator"]{border-block-start:0}',
  ]);
  const signature = theme_signature_css();
  assert.ok(signature.lastIndexOf(".cn-button-group .cn-button:active") > signature.lastIndexOf(".cn-button-variant-default:active"));
});

test("input-group inline addons and buttons share one frame", () => {
  const styles = compact(input_group_composition_css());
  const frame = css_rule(styles, /\.cn-input-group\{([^}]*)\}/g);
  const start = css_rule(styles, /\.cn-input-group:not\(\.cn-command-input-group\)>\.cn-input-group-addon\[data-align="inline-start"\]\{([^}]*)\}/g);
  const end = css_rule(styles, /\.cn-input-group:not\(\.cn-command-input-group\)>\.cn-input-group-addon\[data-align="inline-end"\]\{([^}]*)\}/g);
  const button = css_rule(styles, /\.cn-input-group-addon\.cn-input-group-button\{([^}]*)\}/g);
  const buttonAddon = css_rule(styles, /\.cn-input-group>\.cn-input-group-addon:has\(>\.cn-input-group-button\):not\(:has\(>:not\(\.cn-input-group-button\)\)\)\{([^}]*)\}/g);
  const buttonFill = css_rule(styles, /\.cn-input-group>\.cn-input-group-addon:has\(>\.cn-input-group-button\):not\(:has\(>:not\(\.cn-input-group-button\)\)\)>\.cn-input-group-button\{([^}]*)\}/g);
  assert.ok(frame.includes("overflow:hidden"));
  includes_all(start, ["flex:none", "min-height:var(--control-height)", "gap:.5rem", "padding-inline:.75rem", "border-inline-end:1pxsolidvar(--border)"]);
  includes_all(end, ["flex:none", "min-height:var(--control-height)", "gap:.5rem", "padding-inline:.75rem", "border-inline-start:1pxsolidvar(--border)"]);
  includes_all(button, ["min-height:2rem", "margin:0", "border:0", "box-shadow:none!important", "padding-inline:.625rem"]);
  includes_all(buttonAddon, ["align-self:stretch", "padding:0"]);
  includes_all(buttonFill, ["height:100%", "min-height:var(--control-height)", "border-radius:0", "padding-inline:.875rem"]);
  assert.ok(styles.includes(":not(:has(>:not(.cn-input-group-button)))"));
  assert.ok(styles.includes(".cn-input-group-addon.cn-input-group-button:active{transform:none;box-shadow:none!important}"));
});

test("input-group block addons and textarea form vertical sections", () => {
  const styles = compact(input_group_composition_css());
  assert.ok(styles.includes(".cn-input-group{overflow:hidden}"));
  const start = css_rule(styles, /\.cn-input-group>\.cn-input-group-addon\[data-align="block-start"\]\{([^}]*)\}/g);
  const end = css_rule(styles, /\.cn-input-group>\.cn-input-group-addon\[data-align="block-end"\]\{([^}]*)\}/g);
  const textarea = css_rule(styles, /\.cn-input-group>\.cn-input-group-textarea\[data-slot="input-group-control"\]\{([^}]*)\}/g);
  const wrapper = css_rule(styles, /\.cn-input-group:has\(>\.cn-input-group-textarea\)\{([^}]*)\}/g);
  assert.ok(styles.includes("flex-wrap:wrap"));
  assert.ok(styles.includes("align-items:stretch"));
  includes_all(start, ["flex:00100%", "width:100%", "min-height:2.5rem", "padding:.75rem1rem", "border-bottom:1pxsolidvar(--border)"]);
  includes_all(end, ["flex:00100%", "width:100%", "min-height:2.5rem", "padding:.75rem1rem", "border-top:1pxsolidvar(--border)"]);
  includes_all(wrapper, ["flex-direction:column", "flex-wrap:nowrap", "align-items:stretch", "height:auto", "min-height:7rem"]);
  assert.ok(styles.includes('.cn-input-group:has(>.cn-input-group-textarea):has(>.cn-input-group-addon[data-align^="block"]){flex-wrap:nowrap}'));
  assert.ok(styles.includes('.cn-input-group:has(>.cn-input-group-textarea)>.cn-input-group-addon[data-align^="block"]{flex:00auto}'));
  includes_all(textarea, ["width:100%", "min-height:5.5rem", "flex:11auto", "padding:1rem", "line-height:1.5"]);
});

test("card form spacing and invalid feedback are structured and lightweight", () => {
  const styles = compact(input_group_composition_css());
  includes_all(styles, [
    ".cn-card-content>.cn-field-group{gap:1.25rem}",
    ".cn-card-content>form>.cn-field-group{gap:1.25rem}",
    ".cn-card-content.cn-field{gap:.5rem}",
    ".cn-card>.cn-card-footer{gap:.5rem}",
  ]);
  const standalone = css_rule(styles, /\.cn-input\[aria-invalid="true"\]\{([^}]*)\}/g);
  const wrapper = css_rule(styles, /\.cn-input-group:has\(>\[aria-invalid="true"\]\)\{([^}]*)\}/g);
  const child = css_rule(styles, /\.cn-input-group>\[aria-invalid="true"\]\{([^}]*)\}/g);
  for (const rule of [standalone, wrapper]) {
    includes_all(rule, ["border-color:var(--destructive)", "box-shadow:0002pxcolor-mix(insrgb,var(--destructive)16%,transparent)"]);
    assert.ok(!rule.includes("3px"));
  }
  includes_all(child, ["border:0", "box-shadow:none!important", "outline:none"]);
  assert.ok(styles.includes(".cn-field[data-invalid]>.cn-field-error,.cn-field[data-invalid]>.cn-field-description{margin-top:.25rem}"));
  assert.ok(styles.includes(".cn-input-group{overflow:hidden}"));
  assert.ok(compact(component_css()).includes(".cn-input-group:not(.cn-command-input-group):focus-within{border-color:var(--ring);box-shadow:"));
  assert.ok(styles.includes('.cn-input-group:has(>[aria-invalid="true"]){border-color:var(--destructive);box-shadow:'));
  const invalid = compact(state_css(["invalid"]));
  assert.ok(!invalid.includes('[class*="cn-"][data-invalid'));
  assert.ok(!invalid.includes(".cn-field[data-invalid"));
  assert.ok(invalid.includes('.cn-input[aria-invalid="true"]'));
  assert.ok(!compact(component_css()).includes("3pxcolor-mix(insrgb,var(--destructive)"));
});

test("checkbox computed geometry centers indicator and icon", () => {
  const styles = compact(component_css());
  const root = css_rule(styles, /\.cn-checkbox\{([^}]*)\}/g);
  const indicator = css_rule(styles, /\.cn-checkbox-indicator\{([^}]*)\}/g);
  const icon = css_rule(styles, /\.cn-checkbox-indicator>svg\{([^}]*)\}/g);
  includes_all(root, ["display:inline-grid", "place-items:center", "width:1rem", "height:1rem", "min-width:1rem", "min-height:1rem", "padding:0", "line-height:0"]);
  includes_all(indicator, ["position:absolute", "inset:0", "display:grid", "place-items:center", "width:100%", "height:100%", "line-height:0", "pointer-events:none"]);
  includes_all(icon, ["display:block", "width:.75rem", "height:.75rem", "margin:auto", "flex:none"]);
  const generated = compact(css(tokens("Fixture", "fixture"), false));
  const coarse = css_rule(generated, /@media\(pointer:coarse\)\{([^}]*)\}/g);
  assert.ok(coarse.includes(':not([role="checkbox"])'));
  assert.ok(!coarse.includes('[role="checkbox"],'));
});

test("command input uses one boundary and flexible input", () => {
  const styles = compact(component_css());
  const wrapper = css_rule(styles, /\.cn-command-input-wrapper\{([^}]*)\}/g);
  const group = css_rule(styles, /\.cn-command-input-group\{([^}]*)\}/g);
  const addon = css_rule(styles, /\.cn-command-input-group>\.cn-input-group-addon\{([^}]*)\}/g);
  const control = css_rule(styles, /\.cn-command-input\{([^}]*)\}/g);
  includes_all(wrapper, ["border-bottom:1pxsolidvar(--border)", "padding:0"]);
  includes_all(group, ["display:flex", "align-items:center", "width:100%", "min-height:3rem", "gap:.75rem", "padding-inline:1rem", "border:0", "box-shadow:none", "background:transparent"]);
  includes_all(addon, ["flex:none", "min-height:0", "padding:0", "border:0", "background:transparent"]);
  includes_all(control, ["min-width:0", "height:3rem", "flex:1", "border:0", "padding-inline:0"]);
  assert.ok(compact(theme_signature_css()).includes(".cn-input-group:not(.cn-command-input-group)"));
  const composition = compact(input_group_composition_css());
  assert.ok(composition.includes('.cn-input-group:not(.cn-command-input-group)>.cn-input-group-addon[data-align="inline-start"]'));
  assert.ok(!composition.includes('.cn-input-group>.cn-input-group-addon[data-align="inline-start"]{'));
});

test("command groups and items have explicit readable rhythm", () => {
  const styles = compact(component_css());
  const groups = [...styles.matchAll(/\.cn-command-item\{([^}]*)\}/g)];
  const rules = {
    group: css_rule(styles, /\.cn-command-group\{([^}]*)\}/g),
    heading: css_rule(styles, /\.cn-command-group\[cmdk-group-heading\]\{([^}]*)\}/g),
    items: css_rule(styles, /\.cn-command-group\[cmdk-group-items\]\{([^}]*)\}/g),
    item: groups.at(-1)[1],
    icon: css_rule(styles, /\.cn-command-item>svg\{([^}]*)\}/g),
  };
  assert.ok(rules.group.includes("padding:.5rem"));
  includes_all(rules.heading, ["padding:.375rem.5rem.5rem", "line-height:1rem"]);
  includes_all(rules.items, ["display:flex", "flex-direction:column", "gap:.25rem"]);
  includes_all(rules.item, ["min-height:2.75rem", "padding:.5rem.625rem", "gap:.625rem"]);
  includes_all(rules.icon, ["width:1rem", "height:1rem", "flex:none", "align-self:center"]);
});

test("transform wraps select and navigation disclosure icons", () => {
  const selectSource = `function SelectTrigger() { return (
  <SelectPrimitive.Icon
    render={
      <ChevronDownIcon className="cn-select-trigger-icon pointer-events-none" />
    }
  />
) }`;
  const select = transform(selectSource);
  assert.ok(select.includes('<span className="cn-select-trigger-icon" aria-hidden="true">'));
  assert.ok(select.includes('className="cn-select-trigger-icon-glyph pointer-events-none"'));
  const navigationSource = `function NavigationMenuTrigger() { return (
  <ChevronDownIcon className="cn-navigation-menu-trigger-icon"
    aria-hidden="true" />
) }`;
  const navigation = transform(navigationSource);
  assert.ok(navigation.includes('<span className="cn-navigation-menu-trigger-icon" aria-hidden="true">'));
  assert.ok(navigation.includes('className="cn-navigation-menu-trigger-icon-glyph"'));
});

test("select and navigation disclosure icons have optical frames", () => {
  const styles = compact(component_css());
  for (const prefix of ["select-trigger", "navigation-menu-trigger"]) {
    const frame = css_rule(styles, new RegExp(`\\.cn-${prefix}-icon\\{([^}]*)\\}`, "g"));
    const glyph = css_rule(styles, new RegExp(`\\.cn-${prefix}-icon-glyph\\{([^}]*)\\}`, "g"));
    includes_all(frame, ["display:inline-flex", "width:1rem", "height:1rem", "flex:none", "align-items:center", "justify-content:center", "align-self:center", "line-height:0"]);
    includes_all(glyph, ["display:block", "width:1rem", "height:1rem", "flex:none"]);
    const trigger = css_rule(styles, new RegExp(`\\.cn-${prefix}\\{([^}]*)\\}`, "g"));
    assert.ok(trigger.includes("gap:.5rem"));
  }
});

test("navigation and tabs use actual Base UI boolean states", () => {
  const styles = compact(component_css());
  const popup = '[data-popup-open]:not([data-popup-open="false"])';
  const active = '[data-active]:not([data-active="false"])';
  assert.ok(styles.includes(`.cn-navigation-menu-trigger${popup}{background-color:var(--accent);color:var(--accent-foreground)}`));
  assert.ok(styles.includes(`.cn-navigation-menu-trigger${popup}.cn-navigation-menu-trigger-icon{transform:rotate(180deg)}`));
  const activeRule = css_rule(styles, /\.cn-tabs-trigger\[data-active\]:not\(\[data-active="false"\]\)\{([^}]*)\}/g);
  const inactiveRule = css_rule(styles, /\.cn-tabs-trigger:not\(\[data-active\]\),\.cn-tabs-trigger\[data-active="false"\]\{([^}]*)\}/g);
  const lineExpression = /\.cn-tabs-list\[data-variant="line"\]\.cn-tabs-trigger\[data-active\]:not\(\[data-active="false"\]\)\{([^}]*)\}/g;
  const lineMatch = lineExpression.exec(styles);
  assert.ok(lineMatch, "missing active line-tabs CSS rule");
  const lineRule = lineMatch[1];
  includes_all(activeRule, ["background-color:var(--accent)", "color:var(--accent-foreground)", "border-color:var(--border)", "box-shadow:var(--navigation-shadow)"]);
  for (const value of ["background-color:transparent", "border-color:transparent", "box-shadow:none"]) {
    assert.ok(inactiveRule.includes(value));
    assert.ok(lineRule.includes(value));
  }
  assert.ok(lineRule.includes("color:var(--foreground)"));
  assert.ok(!activeRule.includes("sidebar-accent"));
  const signature = compact(theme_signature_css());
  const defaultSelector = `.cn-tabs-list:not([data-variant="line"]).cn-tabs-trigger${active}`;
  assert.ok(signature.includes(`${defaultSelector},.cn-toggle[data-pressed="true"]{background-color:var(--accent);color:var(--accent-foreground)}`));
  const signatureRules = [...signature.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
  const tabColorSelectors = signatureRules
    .filter((match) => match[2].includes("color:var(--accent-foreground)"))
    .flatMap((match) => match[1].split(",").filter((selector) => selector.includes(".cn-tabs-trigger")));
  assert.ok(tabColorSelectors.length > 0);
  assert.ok(tabColorSelectors.every((selector) => selector.startsWith('.cn-tabs-list:not([data-variant="line"])')));
  const lineRuleEnd = lineMatch.index + lineMatch[0].length;
  const trailingTabSelectors = [...styles.slice(lineRuleEnd).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter((match) => match[2].includes("color:"))
    .flatMap((match) => match[1].split(",").filter((selector) => selector.includes(".cn-tabs-trigger")));
  assert.ok(trailingTabSelectors.every((selector) => selector === '.cn-tabs-trigger' || selector.startsWith('.cn-tabs-list:not([data-variant="line"])')));
  assert.ok(!styles.includes(".cn-navigation-menu-trigger[data-active"));
});

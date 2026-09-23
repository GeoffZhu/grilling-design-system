/** Standalone custom-product generation. No upstream registry is fetched. */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { read, write, digest, save } from './studio.js';
import { validate, contrast, foundation_css, style_provenance } from './theme.js';
import { document } from './design_document.js';
import { translated_copy } from './language.js';
import { validate_custom_coverage } from './product.js';
import { custom_source_snapshot } from './source_snapshot.js';
import { ASSETS, scaffold, load_custom_components, component_catalog_entries, prepare_integrated_preview, main_source, dependencies } from './library.js';

const put = (file, source) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, source); };
const copyMissing = (source, file) => { if (!fs.existsSync(file)) put(file, fs.readFileSync(source)); };
const run = (args, cwd) => execFileSync('npm', args, { cwd, stdio: 'inherit' });

export function custom_gallery(entries, labels) {
  const imports = ['import { Suspense, lazy } from "react";', 'import type { ComponentType, LazyExoticComponent } from "react";', 'import { text } from "./review-copy";'];
  entries.forEach((entry, index) => {
    const module = '@/' + entry.preview.path.slice(4).replace(/\.[^.]+$/, '');
    imports.push('const P' + index + '=lazy(()=>import(' + JSON.stringify(module) + ')' + (entry.export === 'default' ? '' : '.then(m=>({default:m.' + entry.export + '}))') + ');');
  });
  imports.push('export const componentEntries: {name:string;title:string;category:string;description:string}[] = ' + JSON.stringify(component_catalog_entries([], entries, labels)) + ';');
  imports.push('const previews: LazyExoticComponent<ComponentType>[] = [' + entries.map((_, i) => 'P' + i).join(',') + '];');
  imports.push('export function ComponentPreview({entry}:{entry:(typeof componentEntries)[number]}) { const Preview=previews[componentEntries.findIndex(item=>item.name===entry.name)]; return Preview ? <div className="component-previews"><section className="visual-example"><div className="visual-example-canvas"><Suspense fallback={<p>{text["Loading…"]}</p>}><Preview/></Suspense></div></section></div> : <p>{text["Preview unavailable"]}</p>; }');
  return imports.join('\n');
}

export async function build_marketing(args, context) {
  const output = path.resolve(context.output);
  const state = args.session ? read(path.join(args.session, 'session.json')) : null;
  const lang = args.language ?? state?.language;
  if (!lang) throw new Error('Pass --language using the user’s main language');
  const labels = translated_copy(lang, args.ui_copy ? read(args.ui_copy) : null, 'library-copy.json');
  if (args.deliver && (!state || !['approved', 'delivered'].includes(state.status))) throw new Error('Delivery requires explicit approval of the latest preview');
  if (!args.deliver && !args.tokens) throw new Error('Provide --tokens for a draft');
  const tokens = args.deliver ? state.accepted.foundations.tokens : read(args.tokens);
  validate(tokens);
  if (args.deliver && digest(tokens) !== state.approval.tokenHash) throw new Error('Approval is stale');
  if (args.deliver && !args.build) throw new Error('Delivery requires --build');
  if (contrast(tokens).some(result => !result.passAA)) throw new Error('Fix failing token contrasts before generating');
  const entries = load_custom_components(output);
  validate_custom_coverage(entries, context, args.full || args.deliver);
  if (entries.some(entry => entry.registryDependencies.length)) throw new Error('Marketing components use local imports, not registryDependencies');
  const previous = fs.existsSync(path.join(output, 'package.json')) ? read(path.join(output, 'package.json')) : {};
  if (previous.dependencies?.shadcn || fs.existsSync(path.join(output, 'components.json'))) throw new Error('Do not overwrite a shadcn output with a marketing scaffold; integrate it as an existing project');
  const packageData = { name: tokens.slug, version: '0.1.0', private: true, type: 'module',
    scripts: { dev: 'vite --host 127.0.0.1', build: 'tsc --noEmit && vite build', preview: 'vite preview --host 127.0.0.1', ...previous.scripts },
    dependencies: { react: '^19.1.0', 'react-dom': '^19.1.0', 'lucide-react': '^0.468.0', ...dependencies(entries), ...previous.dependencies },
    devDependencies: { typescript: '^5.8.3', vite: '^6.4.1', '@vitejs/plugin-react': '^4.7.0', tailwindcss: '^4.1.0', '@tailwindcss/vite': '^4.1.0', '@types/react': '^19.1.0', '@types/react-dom': '^19.1.0', '@types/node': '^22.0.0', ...previous.devDependencies } };
  if (packageData.dependencies.shadcn || packageData.devDependencies.shadcn) throw new Error('Marketing generation does not install shadcn');
  scaffold(output, lang, tokens.name, tokens.slug, true);
  write(path.join(output, 'package.json'), packageData);
  write(path.join(output, 'design-context.json'), context);
  write(path.join(output, 'tokens.json'), tokens);
  write(path.join(output, 'contrast-report.json'), contrast(tokens));
  write(path.join(output, 'style-provenance.json'), { ...style_provenance(tokens), componentStyles: 'Authored custom components; no generated shadcn visual layer' });
  const hasOverrides = fs.existsSync(path.join(output, 'src/theme-overrides.css'));
  put(path.join(output, 'src/index.css'), foundation_css(tokens));
  put(path.join(output, 'src/main.tsx'), main_source(tokens, [], hasOverrides));
  put(path.join(output, 'src/review-copy.ts'), 'export const text: Record<string,string> = ' + JSON.stringify(labels) + ';\n');
  put(path.join(output, 'src/FullGallery.tsx'), custom_gallery(entries, labels));
  copyMissing(path.join(ASSETS, 'App.tsx'), path.join(output, 'src/App.tsx'));
  copyMissing(path.join(ASSETS, 'gallery.css'), path.join(output, 'src/gallery.css'));
  prepare_integrated_preview(output, args.deliver, true);
  if (args.install) {
    run(['install', '--no-audit', '--no-fund'], output);
    const lock = read(path.join(output, 'package-lock.json'));
    for (const dep of Object.keys(packageData.dependencies)) {
      const resolved = lock.packages?.['node_modules/' + dep]?.version;
      if (resolved) packageData.dependencies[dep] = resolved;
    }
    write(path.join(output, 'package.json'), packageData);
    run(['install', '--package-lock-only', '--no-audit', '--no-fund'], output);
  }
  const snapshot = custom_source_snapshot(output, entries, { ...packageData.devDependencies, ...packageData.dependencies }, ['src/index.css', 'tokens.json', ...(hasOverrides ? ['src/theme-overrides.css'] : [])]);
  write(path.join(output, 'source-snapshot.json'), snapshot);
  const designDoc = document(output, tokens, state, snapshot, state?.round?.checks ?? {}, context);
  if (args.build) run(['run', 'build'], output);
  const result = { output, components: entries.length, officialComponents: 0, customComponents: entries.length, tokenHash: digest(tokens), designDocument: designDoc, snapshotPath: 'source-snapshot.json' };
  if (args.deliver) {
    state.generated = { path: output, tokenHash: digest(tokens), componentCount: entries.length, snapshotHash: snapshot.deliverySha256, snapshotPath: result.snapshotPath, context, at: new Date().toISOString() };
    save(args.session, state);
    result.next = 'Complete DESIGN.md, then run studio.js finish with delivery evidence.';
  }
  console.log(JSON.stringify(result, null, 2));
  return result;
}

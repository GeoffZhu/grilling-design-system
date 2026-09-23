/** Portable custom source closure; gallery and review modules are never delivery sources. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const snapshotHash = snapshot => hash(JSON.stringify(snapshot));
const sourceExtensions = ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.cjs', '.css', '.scss', '.vue', '.svelte', '.json'];
const read = file => fs.readFileSync(file, 'utf8');
const relative = (root, file) => path.relative(root, file).split(path.sep).join('/');

function inside(roots, file) {
  if (!Array.isArray(roots)) roots = [roots];
  if (roots.some(root => { const rel = path.relative(root, file); return rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel); })) return file;
  throw new Error('Source import escapes delivery root: ' + file);
}

export function custom_source_snapshot(output, entries, dependencies, seeds = ['src/index.css', 'tokens.json'], options = {}) {
  output = fs.realpathSync(output);
  const roots = [output, ...(options.allowedRoots ?? []).map(root => fs.realpathSync(root))];
  const aliases = { '@/': path.join(output, 'src'), ...(options.aliases ?? {}) };
  const previewOnly = new Set(entries.filter(entry => !entry.files.includes(entry.preview.path)).map(entry => entry.preview.path));
  const files = {}, used = new Set();
  function visit(file) {
    file = inside(roots, fs.realpathSync(file));
    const rel = relative(output, file);
    if (previewOnly.has(rel) || ['src/App.tsx', 'src/FullGallery.tsx', 'src/IntegratedPreview.tsx', 'src/main.tsx'].includes(rel)) throw new Error('Custom delivery imports a docs-only module: ' + rel);
    if (files[rel]) return;
    files[rel] = hash(fs.readFileSync(file));
    if (!sourceExtensions.includes(path.extname(file))) return;
    const source = read(file);
    const refs = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*(?:\(\s*)?|\brequire\s*\(\s*|@import\s*)["']([^"']+)["']/g)].map(match => match[1]);
    if (/\.s?css$/.test(file)) refs.push(...[...source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)].map(match => match[1]));
    for (const ref of refs) {
      if (/^(?:https?:|data:|#)/.test(ref)) continue;
      if (ref === 'tailwindcss') { if (!dependencies[ref]) throw new Error('Undeclared custom dependency: ' + ref); used.add(ref); continue; }
      const alias = Object.keys(aliases).sort((a, b) => b.length - a.length).find(key => ref.startsWith(key));
      if (!ref.startsWith('.') && !alias && !ref.startsWith('/')) {
        const dep = ref.startsWith('@') ? ref.split('/').slice(0, 2).join('/') : ref.split('/')[0];
        if (!dependencies[dep]) throw new Error('Undeclared custom dependency: ' + dep);
        if (dep === 'shadcn' && !options.allowShadcn) throw new Error('Marketing delivery must not depend on shadcn');
        used.add(dep); continue;
      }
      const clean = ref.split(/[?#]/)[0];
      const base = inside(roots, alias ? path.join(aliases[alias], clean.slice(alias.length)) : ref.startsWith('/') ? path.join(output, 'public', clean.slice(1)) : path.resolve(path.dirname(file), clean));
      const candidates = [base, ...sourceExtensions.map(ext => base + ext), ...sourceExtensions.map(ext => path.join(base, 'index' + ext))];
      const target = candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (!target) throw new Error('Missing custom source import: ' + ref + ' in ' + rel);
      visit(target);
    }
  }
  for (const file of [...entries.flatMap(entry => entry.files), ...seeds]) visit(path.resolve(output, file));
  const snapshot = { sourceLayer: 'Custom components', ui: options.ui ?? [], custom: entries.map(entry => entry.name),
    componentFiles: Object.fromEntries(entries.map(entry => [entry.name, entry.files])),
    files: Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b))),
    dependencies: Object.fromEntries([...used].sort().map(dep => [dep, dependencies[dep]])) };
  return { ...snapshot, deliverySha256: snapshotHash(snapshot) };
}

export function validate_source_snapshot(output, snapshot, allowedRoots = []) {
  const { deliverySha256, ...source } = snapshot;
  if (!snapshot.files || !Object.keys(snapshot.files).length || snapshotHash(source) !== deliverySha256) throw new Error('Invalid custom source snapshot');
  const root = fs.realpathSync(output);
  const roots = [root, ...allowedRoots.map(value => fs.realpathSync(value))];
  for (const name of snapshot.custom ?? []) {
    if (!snapshot.componentFiles?.[name]?.length || snapshot.componentFiles[name].some(file => !snapshot.files[file])) throw new Error('Custom component missing from snapshot files: ' + name);
  }
  for (const [rel, expected] of Object.entries(snapshot.files)) {
    const file = inside(roots, fs.realpathSync(path.resolve(root, rel)));
    if (hash(fs.readFileSync(file)) !== expected) throw new Error('Custom source snapshot is stale: ' + rel);
  }
}

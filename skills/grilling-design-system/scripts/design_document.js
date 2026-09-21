/** Render the user's canonical DESIGN.md template using actual artifact facts. */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { digest, read } from './studio.js';
import { contrast, geometry } from './theme.js';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const TEMPLATE = path.resolve(SCRIPT_DIR, '..', 'assets', 'DESIGN.template.md');
export const FENCE = '`'.repeat(3);
export const DRAFT_NOTICE = 'This is a generated documentation draft.';

function readText(filename) {
  return fs.readFileSync(filename, 'utf8');
}

function writeText(filename, text) {
  fs.writeFileSync(filename, text, 'utf8');
}

function exists(filename) {
  return fs.existsSync(filename);
}

function resolveExistingPath(...parts) {
  const absolute = path.resolve(...parts);
  let existing = absolute;
  const remainder = [];
  while (!exists(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) return absolute;
    remainder.unshift(path.basename(existing));
    existing = parent;
  }
  return path.join(fs.realpathSync(existing), ...remainder);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function posixRelative(from, to) {
  return path.relative(from, to).split(path.sep).join('/');
}

function formatValue(value) {
  if (value === null) return 'None';
  if (value === true) return 'True';
  if (value === false) return 'False';
  return String(value);
}

function formatNumber(value) {
  return Number.parseFloat(Number(value).toPrecision(6)).toString();
}

function formatRatio(value) {
  return Number.isInteger(value) ? `${value}.0` : String(value);
}

function recursivelyList(root) {
  if (!exists(root)) return [];
  const results = [];
  const pending = [root];
  while (pending.length) {
    const current = pending.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true }).sort((left, right) => right.name.localeCompare(left.name));
    for (const entry of entries) {
      const candidate = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(candidate);
      else if (entry.isFile()) results.push(candidate);
    }
  }
  return results.sort();
}

export function document(output, tokens, state, snapshot, checks, context = null) {
  /** Generate an intermediate draft for agent completion before delivery. */
  output = resolveExistingPath(output);
  context = context ?? {};
  const integrated = context.mode === 'integrated';
  const docRoot = integrated ? resolveExistingPath(context.webRoot) : output;
  const template = readText(TEMPLATE);
  const parts = template.split(/^(## \d+\. .+)$/gm);
  const sections = new Map();
  for (let index = 1; index < parts.length; index += 2) {
    sections.set(Number(parts[index].split('.')[0].slice(3)), [parts[index], parts[index + 1]]);
  }

  function fields(number, values) {
    const section = sections.get(number);
    let text = section[1];
    for (const [key, value] of Object.entries(values)) {
      const replacement = `${key}: ${formatValue(value)}`;
      const pathExpression = new RegExp(`^${escapeRegExp(key)}:\n\\[path\\]$`, 'gm');
      const fieldExpression = new RegExp(`^${escapeRegExp(key)}:$`, 'gm');
      text = text.replace(pathExpression, () => replacement).replace(fieldExpression, () => replacement);
    }
    section[1] = text;
  }

  function append(number, text) {
    const section = sections.get(number);
    let body = section[1].trimEnd();
    if (body.endsWith('---')) body = body.slice(0, -3).trimEnd();
    section[1] = `${body}\n\n${text.trim()}${number < 13 ? '\n\n---\n\n' : '\n'}`;
  }

  function source(sourcePath) {
    if (!sourcePath) return '[fill here: existing path or Not applicable with reason]';
    const actual = resolveExistingPath(docRoot, sourcePath);
    return exists(actual) ? posixRelative(docRoot, actual) : '[fill here: existing path or Not applicable with reason]';
  }

  const colors = tokens.colors;
  const craft = geometry(tokens);
  const aliases = {
    background: 'background',
    surface: 'card',
    border: 'border',
    'text-primary': 'foreground',
    'text-muted': 'muted-foreground',
    primary: 'primary',
    error: 'destructive',
  };
  const values = {};
  for (const role of [
    'background', 'surface', 'border', 'text-primary', 'text-secondary',
    'text-muted', 'primary', 'primary-hover', 'success', 'warning', 'error',
  ]) {
    const key = Object.hasOwn(colors, role) ? role : aliases[role];
    values[role] = key ? `var(--${key}) = ${colors[key]}` : '[fill here: map to the implemented semantic token or state rule]';
  }
  fields(2, values);
  fields(2, {
    'font-family': tokens.font.family,
    body: `${tokens.font.bodySize}px; line-height ${craft.bodyLineHeight}; var(--font-sans)`,
    sm: `${formatNumber(tokens.radius * 0.6)}px; --radius-sm`,
    md: `${formatNumber(tokens.radius * 0.8)}px; --radius-md`,
    lg: `${formatNumber(tokens.radius)}px; --radius-lg`,
    full: '9999px; pill or circle',
    Library: tokens.icons.family,
    Sizes: `${tokens.icons.size}px base; inspect component overrides`,
  });

  const colorTable = ['### Complete semantic color map', '', '| Token | Value |', '| --- | --- |'];
  colorTable.push(...Object.entries(colors).map(([key, value]) => `| --${key} | ${value} |`));
  if (tokens.alternate) {
    colorTable.push('', `### Requested alternate mode: ${tokens.alternate.mode}`, '', '| Token | Value |', '| --- | --- |');
    colorTable.push(...Object.entries(tokens.alternate.colors).map(([key, value]) => `| --${key} | ${value} |`));
  }
  colorTable.push(
    '',
    '### Additional implemented tokens',
    '',
    `- Heading family: ${tokens.font.heading}; weight ${tokens.font.headingWeight}.`,
    `- Heading line-height: ${craft.headingLineHeight}; tracking: ${craft.headingTracking}em; label weight: ${craft.labelWeight}.`,
    `- Spacing base: ${tokens.spacing.unit}px; control height: ${tokens.spacing.controlHeight}px.`,
    `- Control radius: ${craft.controlRadius}px; surface radius: ${craft.surfaceRadius}px; overlay radius: ${craft.overlayRadius}px.`,
    `- Control inline padding: ${craft.controlPadding}px; icon gap: ${craft.iconGap}px; icon stroke: ${tokens.icons.stroke}.`,
    `- Shadow: ${tokens.shadow}.`,
    `- Motion: ${tokens.motion.duration}ms ${tokens.motion.easing}; honor reduced motion.`,
    '- Font smoothing: -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale.',
    '- Reconcile role sizes, allowed spacing, and component overrides with the final source before delivery.',
  );
  append(2, colorTable.join('\n'));

  const confirmed = Boolean(
    state
      && ['approved', 'delivered'].includes(state.status)
      && (state.approval ?? {}).tokenHash === digest(tokens),
  );
  const status = confirmed && state.simulation ? 'SIMULATED APPROVAL (validation only)' : confirmed ? 'Approved' : 'Draft';
  append(1, `### Source and status\n\nName: ${tokens.name}\n\nStatus: ${status}\n\nMode: ${tokens.mode}\n\n`
    + `${tokens.rationale ?? 'Use the image interpretation and recorded decisions.'}\n\n`
    + `${DRAFT_NOTICE} Complete every placeholder and verify all rules against the final library before delivery. `
    + 'Infer missing documentation from the project and confirmed visual choices; do not turn template fields into a user questionnaire.');

  append(4, '### Public API mapping\n\n' + (integrated
    ? (context.apiMapping ?? '[fill here: map design roles to actual host component APIs]')
    : 'Preserve shadcn/ui APIs. The design role primary maps to Button variant="default"; '
      + 'size md maps to size="default". Keep secondary, ghost, destructive, sm, and lg identifiers unchanged. '
      + 'Inspect the actual Button source before documenting extra variants. Modal maps to Dialog; Toast maps to Sonner.'));

  sections.get(8)[1] = sections.get(8)[1]
    .replace('[44x44 / other]', '44x44 CSS px minimum for primary touch targets')
    .replace('[WCAG AA / other]', 'WCAG AA target; not a claim of full compliance');
  const evidence = [
    '### Accessibility evidence',
    '',
    'Token contrast results cover only these pairs. Verify rendered colors, labels, keyboard behavior, focus, and layout separately.',
    '',
    '| Mode | Pair | Ratio | Minimum | Result |',
    '| --- | --- | --- | --- | --- |',
    ...contrast(tokens).map((result) => `| ${result.mode} | ${result.pair} | ${formatRatio(result.ratio)} | ${result.minimum} | ${result.passAA ? 'Pass' : 'FAIL'} |`),
    '',
    '### Verification and limitations',
    '',
  ];
  const checkEntries = Object.entries(checks);
  evidence.push(...(checkEntries.length
    ? checkEntries.map(([key, value]) => `- ${key}: ${value}`)
    : ['- No runtime verification recorded.']));
  append(8, evidence.join('\n'));

  const implementation = context.implementationPaths ?? {};
  fields(9, {
    Framework: integrated ? (context.framework ?? '[fill here: actual host framework]') : 'React + TypeScript + Vite',
    Styling: integrated ? (context.styling ?? '[fill here: actual host styling]') : 'Tailwind CSS 4 + semantic CSS variables',
    'Component library': integrated ? (context.componentLibrary ?? '[fill here: actual compatible component library]') : 'shadcn/ui',
    'Icon library': tokens.icons.family,
    'UI components': source(integrated ? implementation['UI components'] : 'src/components/ui'),
    'Shared components': source(integrated ? implementation['Shared components'] : 'src/components/shared'),
    'Domain components': source(integrated ? implementation['Domain components'] : 'src/components/custom'),
    'Design tokens': source(integrated ? implementation['Design tokens'] : 'tokens.json'),
    'Working directory': integrated ? (context.workingDirectory ?? '[fill here: repository-relative command directory]') : '.',
    'Start or install': integrated ? (context.startOrInstall ?? '[fill here: exact host start or install command]') : 'npm install; npm run dev to browse locally',
    'Global styles': integrated ? (context.globalStyles ?? '[fill here: exact stylesheet import and entry file]') : 'src/main.tsx imports src/index.css once; registry consumers install the generated theme CSS import',
    'Root providers': integrated ? (context.rootProviders ?? '[fill here: required providers or None]') : 'TooltipProvider wraps the app; mount one Toaster when using toast()',
    'Public imports': integrated ? (context.publicImports ?? '[fill here: verified public import convention]') : '@/components/ui/<component> after registry installation',
    'Gallery or docs': integrated ? (context.galleryDocs ?? '[fill here: exact command and route, or Not applicable with reason]') : 'npm run dev; open the root route',
  });
  append(9, '### Build and distribution\n\n' + (integrated
    ? (context.buildInstructions ?? '[fill here: actual host install, build, and preview commands]')
    : 'Run npm install, npm run dev, and npm run build. Import src/index.css once. '
      + 'The installable registry is public/r/all.json; install it with npx shadcn@4.21.0 add <registry-url> '
      + `in an initialized React + Tailwind 4 project. It installs src/${tokens.slug}.css. `
      + 'Keep dependencies, custom components, fonts, assets, and SHADCN-LICENSE.txt with the library.'));

  if (integrated) {
    fields(11, Object.fromEntries(Object.entries(context.referencePaths ?? {}).map(([name, sourcePath]) => [name, source(sourcePath)])));
  } else {
    fields(11, { 'App shell': source('src/App.tsx') });
  }
  const canonicalFiles = [
    ['Button', 'button'], ['Input', 'input'], ['Select', 'select'], ['Dialog', 'dialog'],
    ['Table', 'table'], ['Tabs', 'tabs'], ['Toast', 'sonner'],
  ];
  fields(12, Object.fromEntries(canonicalFiles.map(([name, filename]) => [
    name,
    source(integrated ? (context.canonicalPaths ?? {})[name] : `src/components/ui/${filename}.tsx`),
  ])));

  const extra = [
    '### Source snapshot',
    '',
    `Source: ${snapshot.url}; fetched: ${snapshot.fetchedAt}.`,
    `Token hash: ${digest(tokens)}.`,
    '',
    '| Component | Source |',
    '| --- | --- |',
  ];
  const inventorySource = integrated ? (context.componentLibrary ?? 'shadcn-derived; verify host adaptation') : 'shadcn/ui';
  extra.push(...snapshot.ui.map((name) => `| ${name} | ${inventorySource} |`));
  const customRoot = integrated && implementation['Domain components']
    ? resolveExistingPath(docRoot, implementation['Domain components'])
    : path.join(output, integrated ? 'custom' : 'src/components/custom');
  extra.push(...recursivelyList(customRoot)
    .filter((filename) => ['.tsx', '.jsx', '.vue', '.svelte'].includes(path.extname(filename)))
    .map((filename) => `| ${source(filename)} | Custom component |`));
  extra.push('', '### Decisions', '');
  if (state) {
    extra.push(...(state.history ?? []).map((event) => '- ' + event.stage + ' / ' + event.action + ': '
      + `${event.optionId ?? ''} ${['feedback', 'combination', 'derivation'].map((key) => event[key] ?? '').join(' ')}`));
  }
  if (exists(path.join(output, 'IMAGE-COMPONENTS.md'))) {
    extra.push('', `See ${source(path.join(output, 'IMAGE-COMPONENTS.md'))} for image-specific component APIs and usage.`);
  }
  for (const [filename, heading] of [['design-notes.md', 'Additional project rules'], ['design-intent.md', 'Visual intent']]) {
    const notePath = path.join(output, filename);
    if (exists(notePath)) {
      const lines = [];
      let fenced = false;
      const noteLines = readText(notePath).split(/\r\n|\n|\r/);
      if (noteLines.at(-1) === '') noteLines.pop();
      for (let line of noteLines) {
        if (line.startsWith(FENCE) || line.startsWith('~~~')) fenced = !fenced;
        if (!fenced) line = line.replace(/^#{1,3} /, '#### ');
        lines.push(line);
      }
      extra.push('', `### ${heading}`, '', lines.join('\n'));
    }
  }
  append(13, extra.join('\n'));

  const result = parts[0] + [...sections.values()].map(([heading, body]) => heading + body).join('');
  let destination = path.join(docRoot, 'DESIGN.md');
  // Only an unedited generated draft may be replaced; completed or host documents get a separate draft.
  if (exists(destination) && (integrated || !readText(destination).includes(DRAFT_NOTICE))) {
    const draftRoot = resolveExistingPath(context.workDir ?? path.join(docRoot, '.tmp', 'grilling-design-system'));
    fs.mkdirSync(draftRoot, { recursive: true });
    destination = path.join(draftRoot, 'DESIGN.draft.md');
  }
  writeText(destination, result);
  return destination;
}

function matches(text, expression) {
  return [...text.matchAll(expression)].map((match) => match[0]);
}

export function completion_errors(text) {
  /** Validate structure and filled slots; source consistency needs inspection. */
  const errors = [];
  const template = readText(TEMPLATE);
  if (!text.startsWith('# DESIGN.md\n')) errors.push('Keep the # DESIGN.md title');
  const expected = matches(template, /^## .+$/gm);
  const actualHeadings = matches(text, /^## .+$/gm);
  if (JSON.stringify(actualHeadings) !== JSON.stringify(expected)) {
    errors.push('Keep all 13 canonical section headings in order');
  }
  const templateSections = template.split(/^## .+$/gm).slice(1);
  const actualSections = text.split(/^## .+$/gm).slice(1);
  if (actualSections.length === templateSections.length) {
    templateSections.forEach((templateSection, sectionIndex) => {
      const labels = matches(templateSection, /^(?:### .+|[A-Za-z][A-Za-z -]+:|(?:Desktop|Tablet|Mobile) ->)$/gm);
      for (const label of new Set(labels)) {
        const count = matches(actualSections[sectionIndex], new RegExp(`^${escapeRegExp(label)}(?: .*)?$`, 'gm')).length;
        const expectedCount = labels.filter((candidate) => candidate === label).length;
        if (count < expectedCount) errors.push(`Section ${sectionIndex + 1} is missing required heading or field: ${label}`);
      }
    });
  }
  for (const marker of [
    '[fill here', '[path]', '[rule]', '[e.g.',
    '[concise / professional / friendly / technical]', '[44x44 / other]', '[WCAG AA / other]',
  ]) {
    if (text.includes(marker)) errors.push(`Complete template placeholder: ${marker}`);
  }
  if (text.includes(DRAFT_NOTICE)) errors.push('Complete the draft and remove its draft notice');
  const fencedExpression = new RegExp(`${escapeRegExp(FENCE)}txt\n(.*?)${escapeRegExp(FENCE)}`, 'gs');
  for (const match of text.matchAll(fencedExpression)) {
    const lines = match[1].trim().split(/\r?\n/);
    lines.forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line.endsWith(':') && !line.endsWith('->')) return;
      const nextLine = index + 1 < lines.length ? lines[index + 1].trim() : '';
      if (!nextLine || nextLine.endsWith(':') || nextLine.endsWith('->')) errors.push(`Fill empty value: ${line}`);
    });
  }
  return errors;
}

function argumentError(message) {
  const error = new Error(message);
  error.argument = true;
  return error;
}

function parseArguments(argv) {
  const values = { check: null, context: null, tokens: null, snapshot: null, checks: null, session: null };
  const options = new Map([
    ['--check', 'check'], ['--context', 'context'], ['--tokens', 'tokens'],
    ['--snapshot', 'snapshot'], ['--checks', 'checks'], ['--session', 'session'],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '-h' || option === '--help') {
      process.stdout.write('usage: design_document.js [-h] [--check CHECK] [--context CONTEXT] [--tokens TOKENS] [--snapshot SNAPSHOT] [--checks CHECKS] [--session SESSION]\n');
      process.exit(0);
    }
    const key = options.get(option);
    if (!key || index + 1 >= argv.length) throw argumentError(`unrecognized or incomplete argument: ${option}`);
    values[key] = argv[index + 1];
    index += 1;
  }
  return values;
}

export function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArguments(argv);
    if (args.context) {
      if (args.check || !args.tokens || !args.snapshot) {
        throw argumentError('Draft generation requires --context, --tokens, and --snapshot, without --check');
      }
      const context = read(args.context);
      if (context.mode !== 'integrated') throw argumentError('Use library.js to generate standalone documentation');
      const state = args.session ? read(path.join(args.session, 'session.json')) : null;
      const destination = document(
        resolveExistingPath(context.output),
        read(args.tokens),
        state,
        read(args.snapshot),
        args.checks ? read(args.checks) : {},
        context,
      );
      const finalDocument = path.join(resolveExistingPath(context.webRoot), 'DESIGN.md');
      process.stdout.write(`{"document": ${JSON.stringify(destination)}, "finalDocument": ${JSON.stringify(finalDocument)}}\n`);
      return 0;
    }
    if (!args.check) throw argumentError('Provide --check or generation arguments with --context');
    const errors = completion_errors(readText(args.check));
    if (errors.length) {
      process.stderr.write(`${errors.join('\n')}\n`);
      return 1;
    }
    process.stdout.write('DESIGN.md structure and fields are complete; verify implementation consistency separately.\n');
    return 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return error.argument ? 2 : 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = main();
}

export const completionErrors = completion_errors;

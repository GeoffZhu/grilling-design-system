/** Inspect the current application and resolve output paths without modifying it. */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const WEB_DEPENDENCIES = new Set([
  'react-dom', 'next', 'vue', 'nuxt', 'svelte', '@sveltejs/kit',
  '@angular/core', '@remix-run/react', 'react-router-dom', 'astro',
  'solid-js', 'preact', 'gatsby', '@web/dev-server', 'vite',
  'react-scripts', '@vue/cli-service', '@angular/cli', 'parcel',
]);
export const WEB_CONFIGS = [
  'next.config.*', 'nuxt.config.*', 'svelte.config.*', 'astro.config.*',
  'vite.config.*', 'angular.json', '.parcelrc',
];
export const SOURCE_FILES = [
  'src/**/*.tsx', 'src/**/*.jsx', 'src/**/*.vue', 'src/**/*.svelte',
  'app/**/*.tsx', 'app/**/*.jsx', 'pages/**/*.tsx', 'pages/**/*.jsx',
  'templates/**/*.html', 'resources/views/**/*.blade.php',
];

function exists(candidate) {
  return fs.existsSync(candidate);
}

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}

function isDirectory(candidate) {
  try {
    return fs.statSync(candidate).isDirectory();
  } catch {
    return false;
  }
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

function wildcardMatches(name, pattern) {
  const expression = pattern
    .split('*')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${expression}$`).test(name);
}

function hasRecursiveSource(root, pattern) {
  const marker = '/**/';
  const markerIndex = pattern.indexOf(marker);
  const directory = path.join(root, pattern.slice(0, markerIndex));
  const suffix = pattern.slice(markerIndex + marker.length);
  if (!isDirectory(directory)) return false;

  const pending = [directory];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const candidate = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(candidate);
      else if (entry.isFile() && wildcardMatches(entry.name, suffix)) return true;
    }
  }
  return false;
}

function parentPaths(start) {
  const result = [];
  let current = start;
  while (true) {
    result.push(current);
    const parent = path.dirname(current);
    if (parent === current) return result;
    current = parent;
  }
}

export function web_evidence(root) {
  /** Heuristic evidence; the agent must inspect ambiguous/custom projects. */
  root = resolveExistingPath(root);
  const evidence = [];
  let packageData = {};
  const packagePath = path.join(root, 'package.json');
  if (isFile(packagePath)) {
    packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = new Set([
      ...Object.keys(packageData.dependencies ?? {}),
      ...Object.keys(packageData.devDependencies ?? {}),
    ]);
    evidence.push(
      ...[...dependencies]
        .filter((name) => WEB_DEPENDENCIES.has(name))
        .sort()
        .map((name) => `dependency:${name}`),
    );
    for (const [name, command] of Object.entries(packageData.scripts ?? {})) {
      if (/\b(next|nuxt|vite|astro|react-scripts|vue-cli-service|webpack-dev-server|parcel)\b/.test(command)) {
        evidence.push(`script:${name}`);
      }
    }
  }

  for (const pattern of WEB_CONFIGS) {
    if (pattern.includes('*')) {
      if (isDirectory(root)) {
        for (const name of fs.readdirSync(root).sort()) {
          const candidate = path.join(root, name);
          if (wildcardMatches(name, pattern) && isFile(candidate)) evidence.push(`config:${name}`);
        }
      }
    } else {
      const candidate = path.join(root, pattern);
      if (isFile(candidate)) evidence.push(`config:${path.basename(candidate)}`);
    }
  }
  if (isFile(path.join(root, 'index.html'))) evidence.push('entry:index.html');
  for (const pattern of SOURCE_FILES) {
    if (hasRecursiveSource(root, pattern)) evidence.push(`source:${pattern}`);
  }
  return [evidence, packageData];
}

export function find_web_project(cwd) {
  const start = resolveExistingPath(cwd);
  let sourceCandidate = null;
  for (const root of parentPaths(start)) {
    const [evidence, packageData] = web_evidence(root);
    if (evidence.length && (Object.keys(packageData).length || evidence.some((item) => item.startsWith('config:') || item.startsWith('entry:')))) {
      return [root, evidence, packageData];
    }
    if (evidence.length) sourceCandidate = [root, evidence, packageData];
    // A nested package is its own application boundary; do not inherit a sibling app.
    if (exists(path.join(root, 'package.json')) || exists(path.join(root, '.git'))) break;
  }
  return sourceCandidate ?? [null, [], {}];
}

export function source_root(root, override = null) {
  root = resolveExistingPath(root);
  if (override) return resolveExistingPath(root, override);
  for (const name of ['src', 'app', 'resources/js', 'client', 'frontend', 'source', 'pages']) {
    const candidate = path.join(root, name);
    if (isDirectory(candidate)) return candidate;
  }
  // Flat applications keep code at their root; never manufacture a src layout.
  return root;
}

export function resolve_project(cwd, output = null, webRoot = null, source = null) {
  cwd = resolveExistingPath(cwd);
  let root;
  let evidence;
  let packageData;
  if (webRoot) {
    root = resolveExistingPath(cwd, webRoot);
    if (!isDirectory(root)) throw new Error('Web project root must exist');
    [evidence, packageData] = web_evidence(root);
    evidence.push('agent-confirmed-root');
  } else {
    [root, evidence, packageData] = find_web_project(cwd);
  }

  const requested = output !== null && output !== undefined ? resolveExistingPath(cwd, output) : null;
  if (root === null && requested !== null) [root, evidence, packageData] = find_web_project(requested);

  let sourcePath;
  let target;
  let mode;
  let designRoot;
  let work;
  if (root) {
    sourcePath = source_root(root, source);
    target = requested ?? path.join(sourcePath, 'design-system');
    mode = 'integrated';
    designRoot = root;
    work = path.join(root, '.tmp', 'grilling-design-system');
  } else {
    sourcePath = null;
    target = requested ?? path.join(cwd, 'design-system');
    mode = 'standalone';
    designRoot = target;
    work = path.join(target, '.tmp', 'grilling-design-system');
  }

  const lockfiles = [];
  if (root) {
    for (const parent of parentPaths(root)) {
      for (const name of ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lock', 'bun.lockb']) {
        const candidate = path.join(parent, name);
        if (exists(candidate)) lockfiles.push(candidate);
      }
      if (exists(path.join(parent, '.git'))) break;
    }
  }

  return {
    mode,
    cwd,
    webRoot: root || null,
    sourceRoot: sourcePath || null,
    output: target,
    designDoc: path.join(designRoot, 'DESIGN.md'),
    workDir: work,
    userSpecifiedOutput: requested !== null,
    evidence,
    packageManager: packageData.packageManager ?? null,
    lockfiles,
    scripts: packageData.scripts ?? {},
  };
}

function parseArguments(argv) {
  const values = { cwd: process.cwd(), output: null, webRoot: null, sourceRoot: null };
  const options = new Map([
    ['--cwd', 'cwd'], ['--output', 'output'], ['--web-root', 'webRoot'], ['--source-root', 'sourceRoot'],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    if (option === '-h' || option === '--help') {
      process.stdout.write('usage: project.js [-h] [--cwd CWD] [--output OUTPUT] [--web-root WEB_ROOT] [--source-root SOURCE_ROOT]\n');
      process.exit(0);
    }
    const key = options.get(option);
    if (!key || index + 1 >= argv.length) {
      const error = new Error(`unrecognized or incomplete argument: ${option}`);
      error.argument = true;
      throw error;
    }
    values[key] = argv[index + 1];
    index += 1;
  }
  return values;
}

export function main(argv = process.argv.slice(2)) {
  try {
    const args = parseArguments(argv);
    process.stdout.write(`${JSON.stringify(resolve_project(args.cwd, args.output, args.webRoot, args.sourceRoot), null, 2)}\n`);
    return 0;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    return error.argument ? 2 : 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = main();
}

export const webEvidence = web_evidence;
export const findWebProject = find_web_project;
export const sourceRoot = source_root;
export const resolveProject = resolve_project;

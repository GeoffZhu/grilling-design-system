#!/usr/bin/env node
/** Local design review. Standard library only; no hosted service. */
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { translated_copy } from './language.js';
import { completion_errors } from './design_document.js';

export const ASSETS = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');
export const STAGES = ['direction', 'foundations', 'components', 'preview'];
export const TEMP_NAMESPACE = 'grilling-design-system';
export const TEMP_MARKER = '.temporary-workspace';
export const SNAPSHOT_MANIFEST = '.preview-snapshot.json';

export class DecisionError extends Error {
  constructor(code) {
    super(code);
    this.name = 'DecisionError';
    this.code = code;
  }
}

const clone = (value) => structuredClone(value);
const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const exists = (value) => { try { fs.accessSync(value); return true; } catch { return false; } };
const isFile = (value) => { try { return fs.statSync(value).isFile(); } catch { return false; } };
const isDirectory = (value) => { try { return fs.statSync(value).isDirectory(); } catch { return false; } };
const utcTimestamp = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

function resolvedPath(value) {
  const absolute = path.resolve(String(value));
  let cursor = absolute;
  const tail = [];
  while (!exists(cursor)) {
    const parent = path.dirname(cursor);
    if (parent === cursor) return absolute;
    tail.unshift(path.basename(cursor));
    cursor = parent;
  }
  return path.join(fs.realpathSync(cursor), ...tail);
}

export function public_state(state) {
  const result = clone(state);
  if (!Object.hasOwn(result, 'language')) result.language = 'en';
  result.uiCopy = translated_copy(result.language, result.uiCopy);
  return result;
}

export function read(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function write(file, value) {
  file = path.resolve(String(file));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n');
  fs.renameSync(temp, file);
}

function canonicalValue(value) {
  if (value === null) return 'null';
  if (value === true) return 'true';
  if (value === false) return 'false';
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return 'NaN';
    if (value === Infinity) return 'Infinity';
    if (value === -Infinity) return '-Infinity';
    if (Object.is(value, -0)) return '-0.0';
    return String(value);
  }
  if (typeof value === 'string') {
    return JSON.stringify(value).replace(/[\u007f-\uffff]/g, (char) =>
      [...char].map((unit) => `\\u${unit.charCodeAt(0).toString(16).padStart(4, '0')}`).join(''));
  }
  if (Array.isArray(value)) return `[${value.map(canonicalValue).join(', ')}]`;
  return `{${Object.keys(value).sort().map((key) => `${canonicalValue(key)}: ${canonicalValue(value[key])}`).join(', ')}}`;
}

export function digest(value) {
  return crypto.createHash('sha256').update(canonicalValue(value)).digest('hex');
}

export function save(root, state) {
  write(path.join(String(root), 'session.json'), state);
}

export function temporary_project(root) {
  root = resolvedPath(root);
  const project = path.dirname(root);
  if (path.basename(root) !== 'session' || path.basename(project) !== TEMP_NAMESPACE || path.basename(path.dirname(project)) !== '.tmp') {
    throw new Error('Session must be PROJECT/session under .tmp/grilling-design-system');
  }
  return project;
}

export function contained(root, relative) {
  root = resolvedPath(root);
  const target = resolvedPath(path.resolve(root, String(relative)));
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error('Path must remain inside the session');
  return target;
}

export function local_reference(value) {
  value = value.trim();
  if (!value || value.startsWith('#') || value.startsWith('data:') || value.startsWith('blob:') ||
      /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) || value.startsWith('//')) return null;
  const pathname = value.split(/[?#]/, 1)[0];
  try { return decodeURIComponent(pathname); } catch { return pathname.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))); }
}

function htmlReferences(text) {
  const references = [];
  const moduleScripts = [];
  const markup = text.replace(/<!--[\s\S]*?-->/g, '').replace(/(<script\b[^>]*>)[\s\S]*?<\/script\s*>/gi, '$1');
  for (const match of markup.matchAll(/<(script|link|img|source|video|audio|iframe)\b([^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    const attrs = {};
    for (const attr of match[2].matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
      attrs[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? attr[4] ?? '';
    }
    if (tag === 'script' && attrs.src) {
      references.push(attrs.src);
      if ((attrs.type || '').toLowerCase() === 'module') moduleScripts.push(attrs.src);
    } else if (tag === 'link' && attrs.href && ['stylesheet', 'modulepreload', 'preload', 'icon'].includes((attrs.rel || '').toLowerCase())) {
      references.push(attrs.href);
    } else if (['img', 'source', 'video', 'audio', 'iframe'].includes(tag)) {
      if (attrs.src) references.push(attrs.src);
      for (const item of (attrs.srcset || '').split(',')) if (item.trim()) references.push(item.trim().split(/\s+/)[0]);
    }
  }
  return { references, moduleScripts };
}

export const JS_REFERENCE_PATTERNS = [
  /(?:import|export)\s*(?:(?:[^"'();]*?)\bfrom\s*)?["']([^"']+)["']/g,
  /import\s*\(\s*["']([^"']+)["']\s*\)/g,
  /new\s+URL\s*\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url/g,
  /["']((?:\.\.?\/)[^"']+\.(?:js|mjs|cjs|css|wasm|json|png|jpe?g|gif|webp|svg|woff2?|ttf|otf)(?:[?#][^"']*)?)["']/gi,
];
export const CSS_REFERENCE_PATTERNS = [
  /@import\s+(?:url\(\s*)?["']?([^"')\s;]+)/g,
  /url\(\s*["']?([^"')]+)/g,
];

export function file_hash(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function resolve_asset(root, source, reference) {
  const relative = local_reference(reference);
  if (relative === null) return null;
  if (relative.startsWith('/')) throw new Error(`Build asset references must be relative: ${reference}`);
  const target = resolvedPath(path.resolve(path.dirname(source), relative));
  root = resolvedPath(root);
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error(`Build asset escapes the snapshot: ${reference}`);
  if (!isFile(target)) throw new Error(`Build asset missing: ${path.relative(root, target).split(path.sep).join('/')}`);
  return target;
}

export function validate_asset_closure(root, entry = 'index.html') {
  root = resolvedPath(root);
  const entryPath = resolvedPath(path.resolve(root, entry));
  if ((entryPath !== root && !entryPath.startsWith(root + path.sep)) || !isFile(entryPath)) throw new Error(`Preview entry missing: ${entry}`);
  const pending = [entryPath];
  const visited = new Set();
  let moduleEntry = false;
  while (pending.length) {
    const source = pending.pop();
    if (visited.has(source)) continue;
    visited.add(source);
    const suffix = path.extname(source).toLowerCase();
    const textual = ['.html', '.htm', '.js', '.mjs', '.cjs', '.css'].includes(suffix);
    const text = textual ? fs.readFileSync(source, 'utf8') : '';
    let references = [];
    if (['.html', '.htm'].includes(suffix)) {
      const parsed = htmlReferences(text);
      references = parsed.references;
      if (source === entryPath && parsed.moduleScripts.length) moduleEntry = true;
    } else if (['.js', '.mjs', '.cjs'].includes(suffix)) {
      references = JS_REFERENCE_PATTERNS.flatMap((pattern) => [...text.matchAll(new RegExp(pattern.source, pattern.flags))].map((match) => match[1]));
    } else if (suffix === '.css') {
      references = CSS_REFERENCE_PATTERNS.flatMap((pattern) => [...text.matchAll(new RegExp(pattern.source, pattern.flags))].map((match) => match[1]));
    }
    for (const reference of references) {
      const target = resolve_asset(root, source, reference);
      if (target !== null) pending.push(target);
    }
  }
  return { files: [...visited].map((file) => path.relative(root, file).split(path.sep).join('/')).sort(), moduleEntry };
}

function walkFiles(root) {
  const result = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const item = path.join(root, entry.name);
    if (entry.isDirectory()) result.push(...walkFiles(item));
    else if (entry.isFile()) result.push(item);
  }
  return result;
}

function hasSymlink(root) {
  return fs.readdirSync(root, { withFileTypes: true }).some((entry) => {
    const item = path.join(root, entry.name);
    return entry.isSymbolicLink() || (entry.isDirectory() && hasSymlink(item));
  });
}

export function validate_snapshot(root, entry = 'index.html', require_manifest = false) {
  root = path.resolve(String(root));
  const result = validate_asset_closure(root, entry);
  const manifestPath = path.join(root, SNAPSHOT_MANIFEST);
  if (require_manifest && !isFile(manifestPath)) throw new Error('Build previews must be created with studio.js snapshot');
  if (isFile(manifestPath)) {
    const manifest = read(manifestPath);
    if (manifest.entry !== entry || !isObject(manifest.files)) throw new Error('Preview snapshot manifest is invalid');
    const current = Object.fromEntries(walkFiles(root).filter((file) => path.basename(file) !== SNAPSHOT_MANIFEST)
      .map((file) => [path.relative(root, file).split(path.sep).join('/'), file_hash(file)]));
    if (JSON.stringify(Object.keys(current).sort().map((key) => [key, current[key]])) !==
        JSON.stringify(Object.keys(manifest.files).sort().map((key) => [key, manifest.files[key]]))) {
      throw new Error('Preview snapshot changed after creation');
    }
  }
  return result;
}

export function snapshot(root, dist, name = null) {
  root = resolvedPath(root);
  temporary_project(root);
  if (!isFile(path.join(root, 'session.json'))) throw new Error('Initialize the session before creating a snapshot');
  dist = resolvedPath(dist);
  if (!isDirectory(dist)) throw new Error('Build dist directory is missing');
  name ||= `preview-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}-${crypto.randomBytes(4).toString('hex')}`;
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) throw new Error('Snapshot name must be one path-safe directory name');
  const candidates = path.join(root, 'candidates');
  fs.mkdirSync(candidates, { recursive: true });
  const candidatesReal = fs.realpathSync(candidates);
  if (candidatesReal === dist || candidatesReal.startsWith(dist + path.sep)) throw new Error('Build dist cannot contain the session candidates directory');
  const target = path.join(candidates, name);
  const lock = path.join(candidates, `.${name}.snapshot.lock`);
  try { fs.closeSync(fs.openSync(lock, 'wx', 0o600)); }
  catch (error) { if (error.code === 'EEXIST') throw new Error(`Snapshot name is already being published: ${name}`); throw error; }
  const staging = path.join(candidates, `.${name}.staging-${crypto.randomUUID().replaceAll('-', '')}`);
  let closure;
  let files;
  try {
    if (exists(target)) throw new Error(`Snapshot target already exists: candidates/${name}`);
    if (hasSymlink(dist)) throw new Error('Build snapshots cannot contain symlinks');
    fs.cpSync(dist, staging, { recursive: true, preserveTimestamps: true });
    closure = validate_asset_closure(staging);
    files = Object.fromEntries(walkFiles(staging).map((file) => [path.relative(staging, file).split(path.sep).join('/'), file_hash(file)]));
    write(path.join(staging, SNAPSHOT_MANIFEST), { schemaVersion: 1, entry: 'index.html', closure: closure.files, files });
    if (exists(target)) throw new Error(`Snapshot target already exists: candidates/${name}`);
    fs.renameSync(staging, target);
  } finally {
    if (exists(staging)) fs.rmSync(staging, { recursive: true, force: true });
    fs.rmSync(lock, { force: true });
  }
  return { preview: `candidates/${name}/index.html`, directory: target, files: Object.keys(files).length, closure: closure.files };
}

export function validate_local_preview(root, preview) {
  const file = contained(root, preview);
  if (!isFile(file)) throw new Error(`Preview missing: ${preview}`);
  if (!['.html', '.htm'].includes(path.extname(file).toLowerCase())) return;
  const parsed = htmlReferences(fs.readFileSync(file, 'utf8'));
  if (parsed.moduleScripts.length) validate_snapshot(path.dirname(file), path.basename(file), true);
}

export function validate_visual_review(root, option, token_hash) {
  const reviewPath = option.visualReview;
  if (typeof reviewPath !== 'string' || !reviewPath) throw new Error('Components/preview require a visualReview JSON path');
  const review = read(contained(root, reviewPath));
  if (review.tokenHash !== token_hash) throw new Error('Visual review is stale for these foundation tokens');
  const intent = review.intent;
  if (typeof intent !== 'string' || !isFile(contained(root, intent))) throw new Error('Visual review needs an existing design-intent document');
  const method = Object.hasOwn(review, 'method') ? review.method : 'screenshots';
  if (!['screenshots', 'source-inspection'].includes(method)) throw new Error('Use screenshots or source-inspection as the review method');
  const screenshots = Object.hasOwn(review, 'screenshots') ? review.screenshots : [];
  if (!Array.isArray(screenshots) || (method === 'screenshots' && !screenshots.length)) throw new Error('Screenshot review needs screenshots the agent has viewed');
  if (method === 'source-inspection') {
    const limitations = review.limitations;
    if (!Array.isArray(limitations) || !limitations.length || limitations.some((item) => typeof item !== 'string' || !item.trim())) {
      throw new Error('Source inspection must disclose unavailable visual checks');
    }
  }
  for (const shot of screenshots) {
    if (typeof shot !== 'string' || !['.png', '.jpg', '.jpeg', '.webp'].includes(path.extname(shot).toLowerCase()) || !isFile(contained(root, shot))) {
      throw new Error('Visual review screenshot is missing or invalid');
    }
  }
  const observations = review.observations;
  if (!Array.isArray(observations) || !observations.length) throw new Error('Visual review needs concrete observations and repairs');
  const covered = new Set();
  for (const observation of observations) {
    if (!isObject(observation) || ['area', 'finding', 'action', 'verification'].some((key) => typeof observation[key] !== 'string' || !observation[key].trim())) {
      throw new Error('Each observation needs area, finding, action and verification');
    }
    covered.add(observation.area);
  }
  if (['reference', 'typography', 'spacing', 'shape', 'icons', 'states', 'composition', 'copy'].some((area) => !covered.has(area))) {
    throw new Error('Visual review must inspect reference, typography, spacing, shape, icons, states, composition and copy');
  }
  if (!Array.isArray(review.unresolved) || review.unresolved.length !== 0) throw new Error('Resolve visual defects before publishing; direction changes return to foundations');
  return digest(review);
}

export function init(root, source, name, simulation = false, language = 'en', ui_copy = undefined) {
  const labels = translated_copy(language, ui_copy);
  root = path.resolve(String(root));
  const project = temporary_project(root);
  fs.mkdirSync(root, { recursive: true });
  if (exists(path.join(root, 'session.json'))) throw new Error('Session exists. Use status/serve to resume.');
  source = path.resolve(String(source));
  const suffix = path.extname(source).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(suffix)) throw new Error('Use a raster image: png/jpg/webp/gif');
  const target = path.join(root, 'inspiration' + suffix);
  fs.cpSync(source, target, { preserveTimestamps: true });
  const state = { schemaVersion: 3, name, image: path.basename(target), simulation, language, uiCopy: labels,
    nextStage: 'direction', status: 'needs-agent', revision: 0, round: null, accepted: {}, history: [], approval: null };
  fs.writeFileSync(path.join(project, TEMP_MARKER), 'Temporary files owned by grilling-design-system.\n');
  save(root, state);
  return state;
}

export function publish(root, spec) {
  root = path.resolve(String(root));
  const state = read(path.join(root, 'session.json'));
  if (state.status !== 'needs-agent') throw new Error('Read/resolve the current round before publishing another.');
  const stage = spec.stage;
  if (stage !== state.nextStage) throw new Error(`Expected stage ${state.nextStage}, got ${stage}`);
  const language = Object.hasOwn(spec, 'language') ? spec.language : Object.hasOwn(state, 'language') ? state.language : 'en';
  const copyOverride = Object.hasOwn(spec, 'uiCopy') ? spec.uiCopy : language === state.language ? state.uiCopy : undefined;
  const labels = translated_copy(language, copyOverride);
  const options = Object.hasOwn(spec, 'options') ? spec.options : [];
  if (!options.length || new Set(options.map((option) => option.id)).size !== options.length) throw new Error('Provide distinct option IDs');
  const review_type = Object.hasOwn(spec, 'reviewType') ? spec.reviewType : stage === 'preview' ? 'presentation' : 'choice';
  if (!['choice', 'derived', 'presentation'].includes(review_type)) throw new Error('Unknown reviewType');
  if ((stage === 'preview') !== (review_type === 'presentation')) throw new Error('Preview is a single presentation; earlier stages use choice or derived');
  const expected_count = review_type === 'choice' ? 2 : 1;
  if (options.length !== expected_count) throw new Error(`${review_type} requires exactly ${expected_count} option(s)`);
  if (review_type === 'derived' && (typeof spec.derivation !== 'string' || !spec.derivation.trim())) throw new Error('Derived checkpoints need a rationale based on existing evidence');
  const continueStage = Object.hasOwn(spec, 'continueStage') ? spec.continueStage : false;
  if (typeof continueStage !== 'boolean' || (continueStage && review_type !== 'choice')) throw new Error('continueStage is a boolean for planned choice rounds only');
  if (stage === 'foundations' && ['color', 'typography', 'spacing', 'shape', 'icons', 'motion'].some((item) => !(spec.covers ?? []).includes(item))) {
    throw new Error('Foundation review must cover color, typography, spacing, shape, icons, motion');
  }
  for (const option of options) {
    if (!option.title || !option.description || !option.preview) throw new Error('Each option needs title, description and preview');
    const viewports = option.viewports;
    if (viewports !== undefined && viewports !== null) {
      if (stage === 'preview') throw new Error('The integrated presentation uses the standard Desktop and Mobile frames');
      if (!Array.isArray(viewports) || viewports.length < 1 || viewports.length > 2) throw new Error('Provide one or two specimen viewports');
      for (const viewport of viewports) {
        if (!isObject(viewport) || !['specimen', 'desktop', 'mobile'].includes(viewport.device)) throw new Error('Viewport device must be specimen, desktop or mobile');
        if (['width', 'height'].some((key) => typeof viewport[key] !== 'number' || viewport[key] < 160 || viewport[key] > 2400)) {
          throw new Error('Viewport width and height must be between 160 and 2400 pixels');
        }
      }
    }
    const preview = option.preview;
    if (preview.startsWith('http')) {
      if (!['localhost', '127.0.0.1'].includes(new URL(preview).hostname)) throw new Error('Preview URLs must be local');
    } else validate_local_preview(root, preview);
    if (['direction', 'foundations'].includes(stage) && !isObject(option.tokens)) throw new Error('Direction/foundation options need a complete token object');
    if (['components', 'preview'].includes(stage)) {
      const expected = digest(state.accepted.foundations.tokens);
      if (option.tokenHash !== expected) throw new Error('Candidate tokenHash does not match accepted foundations');
      validate_visual_review(root, option, expected);
    }
  }
  if (stage === 'preview') for (const key of ['build', 'desktop', 'mobile', 'keyboard', 'contrast']) {
    if (!spec.checks?.[key]) throw new Error(`Missing preview evidence: ${key}`);
  }
  state.revision += 1;
  state.language = language;
  state.uiCopy = labels;
  spec = clone(spec);
  spec.reviewType = review_type;
  spec.id = `r${state.revision}-${crypto.randomBytes(4).toString('hex')}`;
  state.round = spec;
  state.status = 'awaiting-user';
  state.approval = null;
  if (review_type === 'derived') {
    state.accepted[stage] = options[0];
    state.nextStage = STAGES[STAGES.indexOf(stage) + 1];
    state.status = 'needs-agent';
    state.history.push({ at: utcTimestamp(), roundId: spec.id, stage, action: 'derive',
      optionId: options[0].id, optionIds: [options[0].id], feedback: '', derivation: spec.derivation,
      source: 'agent-derived', simulation: state.simulation });
  }
  write(path.join(root, 'rounds', `${spec.id}.json`), spec);
  save(root, state);
  return state;
}

export function decide(root, data) {
  root = path.resolve(String(root));
  const state = read(path.join(root, 'session.json'));
  const current = state.round;
  if (state.status !== 'awaiting-user' || data.roundId !== current.id) throw new DecisionError('staleRound');
  let action = data.action;
  const feedback = String(data.feedback ?? '').trim();
  const combination = String(data.combination ?? '').trim();
  const option_ids = data.optionIds ?? (data.optionId ? [data.optionId] : []);
  const validIds = current.options.map((option) => option.id);
  if (!Array.isArray(option_ids) || option_ids.some((id) => typeof id !== 'string') || option_ids.length > 1 || option_ids.some((id) => !validIds.includes(id))) {
    throw new DecisionError('invalidChoice');
  }
  const selected = option_ids.length === 1 ? current.options.find((option) => option.id === option_ids[0]) ?? null : null;
  const stage = current.stage;
  if (!['select', 'revise', 'approve'].includes(action)) throw new DecisionError('invalidAction');
  if (action === 'approve' && stage !== 'preview') throw new DecisionError('previewOnly');
  if (['select', 'approve'].includes(action) && !option_ids.length) throw new DecisionError('chooseRequired');
  if (action === 'revise' && !(feedback || combination)) throw new DecisionError('feedbackRequired');
  if (stage === 'preview' && action === 'select') throw new DecisionError('previewAction');
  if (action === 'approve' && (feedback || combination)) throw new DecisionError('approveChanges');
  if (action === 'select' && (feedback || combination)) action = 'revise';
  const event = { at: utcTimestamp(), roundId: current.id, stage, action,
    optionId: selected ? option_ids[0] : null, optionIds: option_ids, feedback, combination,
    source: data.source ?? 'chat', simulation: state.simulation };
  state.history.push(event);
  if (action === 'revise') {
    state.status = 'needs-agent';
    state.nextStage = ['components', 'preview'].includes(stage) ? 'foundations' : stage;
    state.approval = null;
    const index = STAGES.indexOf(state.nextStage);
    for (const key of STAGES.slice(index)) delete state.accepted[key];
  } else if (action === 'approve') {
    state.accepted[stage] = selected;
    state.status = 'approved';
    state.nextStage = 'delivery';
    state.approval = { roundId: current.id, tokenHash: selected.tokenHash, at: event.at, simulation: state.simulation };
  } else {
    state.accepted[stage] = selected;
    state.nextStage = current.continueStage ? stage : STAGES[STAGES.indexOf(stage) + 1];
    state.status = 'needs-agent';
  }
  save(root, state);
  return state;
}

export function reopen(root, feedback) {
  root = path.resolve(String(root));
  const state = read(path.join(root, 'session.json'));
  if (!['approved', 'delivered'].includes(state.status)) throw new Error('Only an approved/delivered session can be reopened');
  state.history.push({ stage: 'maintenance', action: 'revise', feedback, simulation: state.simulation });
  state.status = 'needs-agent';
  state.nextStage = 'foundations';
  state.approval = null;
  state.accepted = Object.fromEntries(Object.entries(state.accepted).filter(([key]) => key === 'direction'));
  save(root, state);
}

export function finish(root, evidence) {
  root = path.resolve(String(root));
  const project = temporary_project(root);
  if (!isFile(path.join(project, TEMP_MARKER))) throw new Error('Temporary workspace ownership marker is missing');
  const state = read(path.join(root, 'session.json'));
  if (!['approved', 'delivered'].includes(state.status)) throw new Error('Delivery requires confirmation of the current presentation');
  const expected = digest(state.accepted.foundations.tokens);
  if (evidence.tokenHash !== expected || state.approval.tokenHash !== expected) throw new Error('Delivery token hash is stale');
  for (const key of ['path', 'designDoc']) {
    const value = evidence[key] ?? '';
    if (!path.isAbsolute(value) || !exists(value)) throw new Error('Delivery requires an existing absolute ' + key);
  }
  if (!isDirectory(evidence.path) || !isFile(evidence.designDoc)) throw new Error('Delivery requires a component directory and DESIGN.md file');
  const output = fs.realpathSync(evidence.path);
  const design_doc = fs.realpathSync(evidence.designDoc);
  if (output === project || output.startsWith(project + path.sep) || design_doc === project || design_doc.startsWith(project + path.sep)) {
    throw new Error('Final library and DESIGN.md must remain outside the temporary PROJECT directory');
  }
  const contextPath = path.join(path.dirname(root), 'project-context.json');
  const generated = state.generated;
  let mode;
  if (isFile(contextPath)) {
    const context = read(contextPath);
    mode = context.mode;
    if (!['integrated', 'standalone'].includes(mode)) throw new Error('project-context.json needs mode integrated or standalone');
    const docRoot = path.resolve(mode === 'integrated' ? context.webRoot : context.output);
    if (output !== path.resolve(context.output) || design_doc !== path.join(docRoot, 'DESIGN.md')) {
      throw new Error('Delivery paths must match the ' + mode + ' project context');
    }
  } else if (generated) {
    mode = 'standalone';
    if (output !== path.resolve(generated.path) || design_doc !== path.join(output, 'DESIGN.md')) {
      throw new Error('Delivery paths must match the generated standalone library');
    }
  } else throw new Error('Delivery requires project-context.json beside the session or a library.js --deliver run');
  if (mode === 'standalone' && (!generated || path.resolve(generated.path) !== output || generated.tokenHash !== expected)) {
    throw new Error('Standalone delivery requires library.js --deliver for the approved tokens first');
  }
  const errors = completion_errors(fs.readFileSync(evidence.designDoc, 'utf8'));
  if (errors.length) throw new Error('Complete DESIGN.md before delivery: ' + errors.join('; '));
  if (!isObject(evidence.checks) || !evidence.checks.build) throw new Error('Record the actual host build result');
  if (!Number.isInteger(evidence.componentCount) || evidence.componentCount < 1 || !evidence.snapshotHash) {
    throw new Error('Record component coverage and the source snapshot hash');
  }
  state.status = 'delivered';
  state.delivery = { ...evidence, mode };
  state.temporaryFilesRemoved = true;
  save(root, state);
  fs.rmSync(project, { recursive: true });
  try { fs.rmdirSync(path.dirname(project)); } catch {}
  return state;
}

const MIME_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf' };

function sendResponse(response, status, body, mime = 'application/json') {
  response.writeHead(status, {
    'Content-Type': mime + (mime.startsWith('text/') ? '; charset=utf-8' : ''),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

export function serve(root, port) {
  root = path.resolve(String(root));
  const server = http.createServer((request, response) => {
    let requestPath;
    try { requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch (error) { sendResponse(response, 404, { error: String(error.message ?? error) }); return; }
    if (request.method === 'GET') {
      try {
        if (requestPath === '/api/state') {
          sendResponse(response, 200, public_state(read(path.join(root, 'session.json'))));
          return;
        }
        let target;
        if (requestPath === '/') target = path.join(ASSETS, 'studio.html');
        else if (requestPath === '/studio.js') target = path.join(ASSETS, 'studio.js');
        else if (requestPath === '/studio.css') target = path.join(ASSETS, 'studio.css');
        else if (requestPath.startsWith('/files/')) target = contained(root, requestPath.slice(7));
        else { sendResponse(response, 404, { error: 'Not found' }); return; }
        const mime = MIME_TYPES[path.extname(target).toLowerCase()] ?? 'application/octet-stream';
        sendResponse(response, 200, fs.readFileSync(target), mime);
      } catch (error) { sendResponse(response, 404, { error: String(error.message ?? error) }); }
      return;
    }
    if (request.method === 'POST') {
      try {
        const origin = request.headers.origin;
        if (origin && origin !== 'http://' + (request.headers.host ?? '')) throw new Error('Cross-origin submissions are not allowed');
        if (requestPath !== '/api/decision') { sendResponse(response, 404, { error: 'Not found' }); return; }
        if (!String(request.headers['content-type'] ?? '').includes('application/json')) throw new Error('JSON required');
        const length = Number(request.headers['content-length'] ?? 0);
        if (length > 65536) throw new Error('Submission too large');
        const chunks = [];
        let received = 0;
        request.on('data', (chunk) => {
          received += chunk.length;
          if (received <= 65536) chunks.push(chunk);
        });
        request.on('end', () => {
          try {
            if (received > 65536) throw new Error('Submission too large');
            const state = decide(root, JSON.parse(Buffer.concat(chunks).toString('utf8')));
            sendResponse(response, 200, state);
          } catch (error) {
            sendResponse(response, 409, { error: String(error.message ?? error), code: error.code ?? 'submitFailed' });
          }
        });
      } catch (error) { sendResponse(response, 409, { error: String(error.message ?? error), code: error.code ?? 'submitFailed' }); }
      return;
    }
    sendResponse(response, 501, { error: 'Unsupported method' });
  });
  server.listen(port, '127.0.0.1', () => {
    console.log(`Studio: http://127.0.0.1:${server.address().port}`);
  });
  return server;
}

function usageError(message) {
  throw new Error(message);
}

const CLI_HELP = `usage: studio.js [-h] {init,snapshot,publish,status,serve,wait,reopen,decide,finish} ...

Local design review. Standard library only; no hosted service.

commands:
  init       initialize a review session
  snapshot   create an immutable build snapshot
  publish    publish a review round
  status     print the session state
  serve      serve the local review studio
  wait       wait briefly for a user decision
  reopen     reopen an approved or delivered session
  decide     submit a decision through the running studio
  finish     record verified delivery

options:
  -h, --help  show this help message and exit`;

function parseCli(argv) {
  const commands = new Set(['init', 'snapshot', 'publish', 'status', 'serve', 'wait', 'reopen', 'decide', 'finish']);
  const command = argv[0];
  if (argv.includes('--help') || argv.includes('-h')) return { help: true };
  if (!commands.has(command)) usageError('Choose a command: init, snapshot, publish, status, serve, wait, reopen, decide or finish');
  const values = {};
  for (let index = 1; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith('--')) usageError(`Unrecognized argument: ${item}`);
    const key = item.slice(2);
    if (key === 'simulation') { values.simulation = true; continue; }
    if (index + 1 >= argv.length || argv[index + 1].startsWith('--')) usageError(`Argument --${key} requires a value`);
    values[key] = argv[++index];
  }
  if (!values.session) usageError('The following argument is required: --session');
  const required = { init: ['image', 'name', 'language'], snapshot: ['dist'], publish: ['spec'], reopen: ['feedback'],
    finish: ['evidence'], decide: ['decision', 'url'] };
  for (const key of required[command] ?? []) if (!values[key]) usageError(`The following argument is required: --${key}`);
  return { command, values };
}

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

export async function main(argv = process.argv.slice(2)) {
  const parsed = parseCli(argv);
  if (parsed.help) { console.log(CLI_HELP); return; }
  const { command, values } = parsed;
  const root = path.resolve(values.session);
  if (command === 'init') init(root, values.image, values.name, values.simulation ?? false, values.language, values['ui-copy'] ? read(values['ui-copy']) : undefined);
  else if (command === 'snapshot') { console.log(pretty(snapshot(root, values.dist, values.name))); return; }
  else if (command === 'publish') publish(root, read(values.spec));
  else if (command === 'serve') { serve(root, values.port === undefined ? 4310 : Number(values.port)); return; }
  else if (command === 'reopen') reopen(root, values.feedback);
  else if (command === 'finish') { console.log(pretty(await finish(root, read(values.evidence)))); return; }
  else if (command === 'decide') {
    const endpoint = new URL(values.url);
    if (!['localhost', '127.0.0.1'].includes(endpoint.hostname)) throw new Error('Use the local studio URL');
    const payload = read(values.decision);
    payload.source ??= 'ask-user-question';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let response;
    try {
      response = await fetch(values.url.replace(/\/$/, '') + '/api/decision', { method: 'POST',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: controller.signal });
    } finally { clearTimeout(timeout); }
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Submission failed');
    console.log(pretty(result));
    return;
  } else if (command === 'wait') {
    const deadline = Date.now() + Math.min(values.timeout === undefined ? 45 : Number(values.timeout), 55) * 1000;
    while (Date.now() < deadline && read(path.join(root, 'session.json')).status === 'awaiting-user') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log(pretty(read(path.join(root, 'session.json'))));
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (direct) {
  main().catch((error) => {
    process.stderr.write(`Error: ${error.message ?? error}\n`);
    process.exitCode = 1;
  });
}

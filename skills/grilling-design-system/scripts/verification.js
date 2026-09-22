/** Execute builds and bind their results to the files actually checked. */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ignored = new Set(['node_modules', '.git', '.tmp', 'dist', 'build', '.next', '.nuxt', '.svelte-kit', 'coverage']);
export const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export const object_hash = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

export function fingerprint(roots, source = false) {
  const files = {};
  function visit(file) {
    const stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error('Verification paths must not be symlinks: ' + file);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) {
        if (name === '.git' || name === 'node_modules' || name === '.tmp' || (source && ignored.has(name))) continue;
        visit(path.join(file, name));
      }
    } else if (stat.isFile() && !(source && (/(?:\.log|\.tsbuildinfo)$/.test(file) || ["DESIGN.md", "DESIGN.draft.md"].includes(path.basename(file))))) {
      files[file] = sha256(file);
    }
  }
  for (const root of [...new Set(roots.map((file) => path.resolve(file)))].sort()) visit(root);
  if (!Object.keys(files).length) throw new Error('Verification needs nonempty file inputs and artifacts');
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
}

export function execute_build(session, spec) {
  const cwd = fs.realpathSync(spec.cwd);
  if (!Array.isArray(spec.command) || !spec.command.length || spec.command.some((item) => typeof item !== 'string' || !item)) {
    throw new Error('Build command must be a nonempty argv array');
  }
  if (!Array.isArray(spec.artifacts) || !spec.artifacts.length) throw new Error('List the build output paths in artifacts');
  const inputs = [cwd, ...(spec.inputs ?? []).map((file) => path.resolve(cwd, file))];
  const artifacts = spec.artifacts.map((file) => path.resolve(cwd, file));
  // Named build outputs are excluded from source inputs, including custom output directories.
  const sourceFiles = () => Object.fromEntries(Object.entries(fingerprint(inputs, true)).filter(([file]) =>
    !artifacts.some((output) => file === output || file.startsWith(output + path.sep)),
  ));
  const before = sourceFiles();
  if (!Object.keys(before).length) throw new Error('Build verification requires source inputs outside its output directories');
  const id = 'build-' + crypto.randomBytes(8).toString('hex');
  const directory = path.join(session, 'verification');
  fs.mkdirSync(directory, { recursive: true });
  const log = path.join(directory, id + '.log');
  const fd = fs.openSync(log, 'w');
  let result;
  try {
    result = spawnSync(spec.command[0], spec.command.slice(1), { cwd, shell: false, stdio: ['ignore', fd, fd], timeout: 300000 });
  } finally { fs.closeSync(fd); }
  if (result.error || result.status !== 0) throw new Error('Build failed; inspect ' + log);
  if (object_hash(sourceFiles()) !== object_hash(before)) throw new Error('Build changed source inputs; review changes and verify again');
  return { id, cwd, command: spec.command, inputs, artifacts, sourceFiles: before, artifactFiles: fingerprint(artifacts),
    log: path.relative(session, log), logHash: sha256(log), exitCode: 0, at: new Date().toISOString() };
}

export function validate_build(session, receipt) {
  if (!receipt || receipt.exitCode !== 0 || !receipt.id || !receipt.sourceFiles || !receipt.artifactFiles) {
    throw new Error('Use studio.js verify to record a successful build');
  }
  const current = Object.fromEntries(Object.entries(fingerprint(receipt.inputs, true)).filter(([file]) =>
    !receipt.artifacts.some((output) => file === output || file.startsWith(output + path.sep)),
  ));
  if (object_hash(current) !== object_hash(receipt.sourceFiles)) throw new Error('Build source inputs changed; run verify again');
  if (object_hash(fingerprint(receipt.artifacts)) !== object_hash(receipt.artifactFiles)) throw new Error('Build artifacts changed; run verify again');
  const log = path.resolve(session, receipt.log);
  if (!log.startsWith(path.resolve(session) + path.sep) || sha256(log) !== receipt.logHash) throw new Error('Build log changed or is outside the session');
  return receipt;
}

export function image_dimensions(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.toString('ascii', 12, 16) === 'IHDR') {
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < bytes.length && bytes[offset] === 0xff) {
      const marker = bytes[offset + 1];
      if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
      const size = bytes.readUInt16BE(offset + 2);
      if (size < 2) break;
      offset += size + 2;
    }
  }
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') {
    const kind = bytes.toString('ascii', 12, 16);
    if (kind === 'VP8X' && bytes.length >= 30) return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    if (kind === 'VP8 ' && bytes.length >= 30) return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L' && bytes.length >= 25) {
      const bits = bytes.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 };
    }
  }
  throw new Error('Screenshot must contain a readable PNG, JPEG or WebP image: ' + file);
}

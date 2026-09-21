import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { translated_copy } from '../skills/grilling-design-system/scripts/language.js';
import {
  decide,
  digest,
  finish,
  init,
  publish,
  read,
  reopen,
  snapshot,
  validate_visual_review,
  write,
} from '../skills/grilling-design-system/scripts/studio.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const designTemplate = path.join(repositoryRoot, 'skills/grilling-design-system/assets/DESIGN.template.md');

function completedDesignDocument() {
  return readFileSync(designTemplate, 'utf8')
    .replace(/\[[^\]]+\]/g, 'Fixture value')
    .replace(/^([^\n]+:)$/gm, '$1 Fixture value')
    .replace(/^((?:Desktop|Tablet|Mobile) ->)$/gm, '$1 Fixture value');
}

describe('workflow', () => {
  let temporaryDirectory;
  let project;
  let root;

  beforeEach(() => {
    temporaryDirectory = realpathSync(mkdtempSync(path.join(tmpdir(), 'grilling-design-system-')));
    project = path.join(temporaryDirectory, '.tmp/grilling-design-system');
    root = path.join(project, 'session');
    const image = path.join(temporaryDirectory, 'image.png');
    writeFileSync(image, Buffer.from('test fixture'));
    init(root, image, 'Workflow test', true);
    writeFileSync(path.join(root, 'preview.html'), '<h1>Fixture</h1>');
    writeFileSync(path.join(root, 'intent.md'), 'Fixture design intent');
    writeFileSync(path.join(root, 'screenshot.png'), Buffer.from('test screenshot fixture'));
  });

  afterEach(() => rmSync(temporaryDirectory, { recursive: true, force: true }));

  function buildFixture() {
    const dist = path.join(temporaryDirectory, 'dist');
    const assets = path.join(dist, 'assets');
    mkdirSync(assets, { recursive: true });
    writeFileSync(path.join(dist, 'index.html'), '<script type="module" src="./assets/index.js"></script>');
    writeFileSync(path.join(assets, 'index.js'), 'import "./style.css"; import("./lazy.js")');
    writeFileSync(path.join(assets, 'style.css'), 'body{background:url("./pixel.png")}');
    writeFileSync(path.join(assets, 'lazy.js'), 'export const ready=true');
    writeFileSync(path.join(assets, 'pixel.png'), Buffer.from('pixel'));
    return dist;
  }

  function publishStage(stage, reviewType = stage === 'preview' ? 'presentation' : 'choice') {
    const option = { id: 'a', title: 'A', description: 'Test option', preview: 'preview.html' };
    if (['direction', 'foundations'].includes(stage)) {
      option.tokens = { revision: 1 };
    } else {
      option.tokenHash = digest(read(path.join(root, 'session.json')).accepted.foundations.tokens);
      option.visualReview = 'visual-review.json';
      write(path.join(root, 'visual-review.json'), {
        tokenHash: option.tokenHash,
        intent: 'intent.md',
        screenshots: ['screenshot.png'],
        observations: ['reference', 'typography', 'spacing', 'shape', 'icons', 'states', 'composition', 'copy'].map((area) => ({
          area,
          finding: 'Fixture observation',
          action: 'Fixture correction',
          verification: 'Fixture reinspection',
        })),
        unresolved: [],
      });
    }
    const ids = reviewType === 'choice' ? ['a', 'b'] : ['a'];
    const spec = {
      stage,
      reviewType,
      options: ids.map((id) => ({ ...option, id })),
      title: stage,
      description: 'Test',
    };
    if (reviewType === 'derived') spec.derivation = 'Derived from the reference and existing choices';
    if (stage === 'foundations') spec.covers = ['color', 'typography', 'spacing', 'shape', 'icons', 'motion'];
    if (stage === 'preview') {
      spec.checks = Object.fromEntries(['build', 'desktop', 'mobile', 'keyboard', 'contrast'].map((key) => [key, 'fixture evidence']));
    }
    return publish(root, spec);
  }

  function choose(action = 'select', extra = {}) {
    const state = read(path.join(root, 'session.json'));
    return decide(root, { roundId: state.round.id, optionId: 'a', action, ...extra });
  }

  function advance() {
    for (const stage of ['direction', 'foundations', 'components']) {
      publishStage(stage);
      choose();
    }
    publishStage('preview');
  }

  test('snapshot is atomic, verified, and refuses an existing target', () => {
    const result = snapshot(root, buildFixture(), 'r1-preview');
    const target = path.join(root, 'candidates/r1-preview');
    assert.equal(result.preview, 'candidates/r1-preview/index.html');
    assert.equal(statSync(path.join(target, '.preview-snapshot.json')).isFile(), true);
    assert.equal(requireDirectoryNames(path.dirname(target)).some((name) => name.startsWith('.r1-preview.staging-')), false);
    assert.throws(() => snapshot(root, buildFixture(), 'r1-preview'), /already exists/);
  });

  test('invalid snapshot never publishes target', () => {
    const dist = buildFixture();
    unlinkSync(path.join(dist, 'assets/lazy.js'));
    assert.throws(() => snapshot(root, dist, 'broken-preview'), /Build asset missing/);
    assert.equal(existsSync(path.join(root, 'candidates/broken-preview')), false);
    assert.equal(requireDirectoryNames(path.join(root, 'candidates')).some((name) => name.startsWith('.broken-preview.staging-')), false);
  });

  test('publish rejects snapshot with a missing dynamic chunk', () => {
    const result = snapshot(root, buildFixture(), 'r1-preview');
    unlinkSync(path.join(root, 'candidates/r1-preview/assets/lazy.js'));
    const option = { title: 'Build', description: 'Test build', preview: result.preview, tokens: {} };
    const spec = { stage: 'direction', options: [{ ...option, id: 'a' }, { ...option, id: 'b' }] };
    assert.throws(() => publish(root, spec), /missing|changed/);
    assert.equal(read(path.join(root, 'session.json')).revision, 0);
  });

  test('publish keeps plain HTML preview compatible', () => {
    assert.equal(publishStage('direction').status, 'awaiting-user');
  });

  test('feedback invalidates downstream and requires reapproval', () => {
    advance();
    let state = choose('revise', { feedback: 'Increase icon stroke' });
    assert.equal(state.nextStage, 'foundations');
    assert.deepEqual(new Set(Object.keys(state.accepted)), new Set(['direction']));
    assert.equal(state.approval, null);
    for (const stage of ['foundations', 'components']) {
      publishStage(stage);
      choose();
    }
    publishStage('preview');
    state = choose('approve');
    assert.equal(state.status, 'approved');
    assert.equal(state.approval.simulation, true);
    assert.equal(state.history.length, 7);
    reopen(root, 'Change primary color');
    assert.equal(read(path.join(root, 'session.json')).nextStage, 'foundations');
  });

  test('stale and duplicate submissions are rejected', () => {
    const state = publishStage('direction');
    assert.throws(() => decide(root, { roundId: 'old', action: 'select', optionId: 'a' }));
    choose();
    assert.throws(() => decide(root, { roundId: state.round.id, action: 'select', optionId: 'a' }));
  });

  test('cannot skip a stage or approve early', () => {
    assert.throws(() => publishStage('foundations'));
    publishStage('direction');
    assert.throws(() => choose('approve'));
  });

  test('combined preferences need a new preview', () => {
    publishStage('direction');
    const state = choose('select', { combination: 'A colors with B icons' });
    assert.equal(state.nextStage, 'direction');
    assert.deepEqual(state.accepted, {});
  });

  test('multiple choices are rejected without mutation', () => {
    const state = publishStage('direction');
    assert.throws(() => decide(root, {
      roundId: state.round.id, optionIds: ['a', 'b'], action: 'select', source: 'ask-user-question',
    }));
    assert.deepEqual(read(path.join(root, 'session.json')), state);
    const result = decide(root, {
      roundId: state.round.id, optionIds: ['b'], action: 'select', source: 'ask-user-question',
    });
    assert.equal(result.accepted.direction.id, 'b');
    assert.equal(result.history.at(-1).source, 'ask-user-question');
  });

  test('presentation has one design and accepts freeform revision', () => {
    advance();
    const state = read(path.join(root, 'session.json'));
    assert.equal(state.round.options.length, 1);
    assert.equal(state.round.reviewType, 'presentation');
    const data = { roundId: state.round.id, optionIds: ['a', 'b'], action: 'approve' };
    assert.throws(() => decide(root, data));
    assert.deepEqual(read(path.join(root, 'session.json')), state);
    const result = decide(root, { ...data, action: 'revise', optionIds: [], feedback: 'Increase the field spacing' });
    assert.equal(result.nextStage, 'foundations');
    assert.deepEqual(new Set(Object.keys(result.accepted)), new Set(['direction']));
  });

  test('invalid selections are rejected without mutation', () => {
    const state = publishStage('direction');
    for (const optionIds of [[], ['unknown'], ['a', 'a'], 'a', [{}]]) {
      assert.throws(() => decide(root, { roundId: state.round.id, optionIds, action: 'select' }));
      assert.deepEqual(read(path.join(root, 'session.json')), state);
    }
  });

  test('choice requires two options', () => {
    const option = { id: 'a', title: 'A', description: 'Test', preview: 'preview.html', tokens: {} };
    for (const ids of [['a'], ['a', 'b', 'c']]) {
      assert.throws(() => publish(root, { stage: 'direction', options: ids.map((id) => ({ ...option, id })) }));
    }
    assert.equal(read(path.join(root, 'session.json')).revision, 0);
  });

  test('language and custom translation', () => {
    assert.equal(translated_copy('en-GB').desktop, 'Desktop');
    assert.throws(() => translated_copy('zh-CN'));
    assert.throws(() => translated_copy('ja'));
    const labels = Object.fromEntries(Object.keys(translated_copy('en')).map((key) => [key, 'Translated fixture']));
    labels.desktop = 'Localized desktop fixture';
    assert.equal(translated_copy('ja', labels).desktop, 'Localized desktop fixture');
    delete labels.desktop;
    assert.throws(() => translated_copy('ja', labels));
  });

  test('preview approval rejects unprocessed feedback', () => {
    advance();
    const before = read(path.join(root, 'session.json'));
    assert.throws(() => choose('approve', { feedback: 'But fix the padding' }));
    assert.deepEqual(read(path.join(root, 'session.json')), before);
  });

  test('resume rejects stale tokens', () => {
    publishStage('direction');
    choose();
    publishStage('foundations');
    choose();
    const before = read(path.join(root, 'session.json'));
    assert.equal(before.status, 'needs-agent');
    assert.throws(() => publish(root, {
      stage: 'components',
      reviewType: 'derived',
      derivation: 'Existing rules',
      options: [{ id: 'a', title: 'a', description: 'x', preview: 'preview.html', tokenHash: 'stale' }],
    }), /tokenHash/);
    assert.deepEqual(read(path.join(root, 'session.json')), before);
  });

  test('visual review rejects absent evidence and unresolved issues', () => {
    assert.throws(() => validate_visual_review(root, {}, 'hash'));
    publishStage('direction');
    choose();
    publishStage('foundations');
    choose();
    publishStage('components');
    const spec = read(path.join(root, 'session.json')).round.options[0];
    const reviewPath = path.join(root, 'visual-review.json');
    const review = read(reviewPath);
    review.unresolved = ['Overlapping labels on Mobile'];
    write(reviewPath, review);
    assert.throws(() => validate_visual_review(root, spec, spec.tokenHash));
    review.unresolved = [];
    review.tokenHash = 'old';
    write(reviewPath, review);
    assert.throws(() => validate_visual_review(root, spec, spec.tokenHash));
    review.tokenHash = spec.tokenHash;
    review.screenshots = ['missing.png'];
    write(reviewPath, review);
    assert.throws(() => validate_visual_review(root, spec, spec.tokenHash));
  });

  test('derived checkpoints advance without user answers', () => {
    for (const stage of ['direction', 'foundations', 'components']) {
      const state = publishStage(stage, 'derived');
      assert.equal(state.status, 'needs-agent');
      assert.equal(state.history.at(-1).source, 'agent-derived');
      assert.equal(state.history.at(-1).action, 'derive');
    }
    let state = publishStage('preview');
    assert.equal(state.status, 'awaiting-user');
    assert.equal(state.approval, null);
    state = choose('approve', { source: 'chat' });
    assert.equal(state.status, 'approved');
  });

  test('cannot derive away a pending question', () => {
    const before = publishStage('direction');
    assert.throws(() => publishStage('direction', 'derived'));
    assert.deepEqual(read(path.join(root, 'session.json')), before);
  });

  test('planned questions can share a stage', () => {
    publishStage('direction', 'derived');
    const option = { title: 'Controls', description: 'Test', preview: 'preview.html', tokens: { revision: 1 } };
    publish(root, {
      stage: 'foundations',
      continueStage: true,
      covers: ['color', 'typography', 'spacing', 'shape', 'icons', 'motion'],
      options: ['a', 'b'].map((id) => ({ ...option, id })),
    });
    let state = choose();
    assert.equal(state.nextStage, 'foundations');
    assert.equal(state.accepted.foundations.id, 'a');
    publishStage('foundations');
    state = choose();
    assert.equal(state.nextStage, 'components');
    assert.deepEqual(state.history.map(({ stage }) => stage), ['direction', 'foundations', 'foundations']);
  });

  test('presentation rejects choices and derived mode', () => {
    for (const stage of ['direction', 'foundations', 'components']) publishStage(stage, 'derived');
    const before = read(path.join(root, 'session.json'));
    for (const reviewType of ['choice', 'derived']) {
      assert.throws(() => publishStage('preview', reviewType));
      assert.deepEqual(read(path.join(root, 'session.json')), before);
    }
  });

  test('derived rationale and specimen viewport validation', () => {
    const option = {
      id: 'a', title: 'A', description: 'Test', preview: 'preview.html', tokens: {},
      viewports: [{ device: 'specimen', width: 800, height: 400 }],
    };
    const spec = { stage: 'direction', reviewType: 'derived', options: [option] };
    assert.throws(() => publish(root, spec));
    spec.derivation = 'Use the supplied reference geometry';
    option.viewports[0].width = 0;
    assert.throws(() => publish(root, spec));
    option.viewports[0].width = 800;
    assert.equal(publish(root, spec).nextStage, 'foundations');
  });

  test('source inspection requires disclosed limitations', () => {
    publishStage('direction', 'derived');
    publishStage('foundations', 'derived');
    publishStage('components', 'derived');
    const spec = read(path.join(root, 'session.json')).round.options[0];
    const reviewPath = path.join(root, 'visual-review.json');
    const review = read(reviewPath);
    Object.assign(review, { method: 'source-inspection', screenshots: [] });
    write(reviewPath, review);
    assert.throws(() => validate_visual_review(root, spec, spec.tokenHash));
    review.limitations = ['No browser capture available; layout and keyboard behavior remain unverified'];
    write(reviewPath, review);
    assert.ok(validate_visual_review(root, spec, spec.tokenHash));
    review.unresolved = ['Known overflow defect'];
    write(reviewPath, review);
    assert.throws(() => validate_visual_review(root, spec, spec.tokenHash));
  });

  test('native delivery checks root document and preserves host', () => {
    advance();
    choose('approve');
    const host = path.join(temporaryDirectory, 'web');
    const module = path.join(host, 'src/design-system');
    mkdirSync(module, { recursive: true });
    const documentPath = path.join(host, 'DESIGN.md');
    writeFileSync(documentPath, completedDesignDocument());
    write(path.join(root, '..', 'project-context.json'), {
      mode: 'integrated', webRoot: host, output: module, designDoc: documentPath,
    });
    const state = read(path.join(root, 'session.json'));
    const evidence = {
      path: module,
      designDoc: documentPath,
      tokenHash: state.approval.tokenHash,
      componentCount: 2,
      snapshotHash: 'fixture',
      checks: { build: 'Fixture host build result' },
    };
    assert.throws(() => finish(root, { ...evidence, designDoc: path.join(module, 'DESIGN.md') }));
    assert.deepEqual(read(path.join(root, 'session.json')), state);
    const result = finish(root, evidence);
    assert.equal(result.status, 'delivered');
    assert.equal(result.delivery.mode, 'integrated');
    assert.equal(result.temporaryFilesRemoved, true);
    assert.equal(existsSync(project), false);
    assert.equal(existsSync(module), true);
    assert.equal(existsSync(documentPath), true);
  });

  test('delivery refuses final output inside temporary project', () => {
    advance();
    choose('approve');
    const module = path.join(project, 'final-library');
    mkdirSync(module);
    const documentPath = path.join(project, 'DESIGN.md');
    writeFileSync(documentPath, completedDesignDocument());
    write(path.join(project, 'project-context.json'), {
      mode: 'integrated', webRoot: project, output: module, designDoc: documentPath,
    });
    const state = read(path.join(root, 'session.json'));
    const evidence = {
      path: module,
      designDoc: documentPath,
      tokenHash: state.approval.tokenHash,
      componentCount: 2,
      snapshotHash: 'fixture',
      checks: { build: 'Fixture host build result' },
    };
    assert.throws(() => finish(root, evidence), /outside the temporary PROJECT/);
    assert.equal(existsSync(project), true);
    assert.equal(existsSync(module), true);
    assert.equal(existsSync(documentPath), true);
  });

  test('standalone delivery requires generation and a completed document', () => {
    advance();
    choose('approve');
    const library = path.join(temporaryDirectory, 'design-system');
    mkdirSync(library);
    const documentPath = path.join(library, 'DESIGN.md');
    writeFileSync(documentPath, '# DESIGN.md\n\nThis is a generated documentation draft.\n');
    const sessionPath = path.join(root, 'session.json');
    const state = read(sessionPath);
    const tokenHash = state.approval.tokenHash;
    const evidence = {
      path: library,
      designDoc: documentPath,
      tokenHash,
      componentCount: 61,
      snapshotHash: 'fixture',
      checks: { build: 'Fixture build result' },
    };
    assert.throws(() => finish(root, evidence), /library\.js --deliver/);
    state.generated = { path: library, tokenHash, componentCount: 61, snapshotHash: 'fixture' };
    write(sessionPath, state);
    assert.throws(() => finish(root, evidence), /Complete DESIGN\.md/);
    assert.equal(read(sessionPath).status, 'approved');
    writeFileSync(documentPath, completedDesignDocument());
    const result = finish(root, evidence);
    assert.equal(result.status, 'delivered');
    assert.equal(result.delivery.mode, 'standalone');
    assert.equal(result.temporaryFilesRemoved, true);
    assert.equal(existsSync(project), false);
    assert.equal(existsSync(library), true);
    assert.equal(existsSync(documentPath), true);
  });
});

function requireDirectoryNames(directory) {
  return readdirSync(directory);
}

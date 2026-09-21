#!/usr/bin/env python3
"""Local design review. Standard library only; no hosted service."""
import argparse
import copy
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import mimetypes
import re
import shutil
import threading
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from language import translated_copy

ASSETS = Path(__file__).resolve().parents[1] / 'assets'
STAGES = ['direction', 'foundations', 'components', 'preview']
LOCK = threading.RLock()
TEMP_NAMESPACE = 'grilling-design-system'
TEMP_MARKER = '.temporary-workspace'
SNAPSHOT_MANIFEST = '.preview-snapshot.json'

class DecisionError(ValueError):
    def __init__(self, code):
        self.code = code
        super().__init__(code)

def public_state(state):
    result = copy.deepcopy(state)
    result.setdefault('language', 'en')
    result['uiCopy'] = translated_copy(result['language'], result.get('uiCopy'))
    return result

def read(path):
    return json.loads(Path(path).read_text())

def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    temp.replace(path)

def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode()).hexdigest()

def save(root, state):
    write(root / 'session.json', state)

def temporary_project(root):
    """Return the owned .tmp namespace for a canonical session path."""
    root = Path(root).resolve()
    project = root.parent
    if root.name != 'session' or project.name != TEMP_NAMESPACE or project.parent.name != '.tmp':
        raise ValueError('Session must be PROJECT/session under .tmp/grilling-design-system')
    return project

def contained(root, rel):
    path = (root / rel).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError('Path must remain inside the session')
    return path

def local_reference(value):
    """Return an asset path without query/fragment, or None for external/data links."""
    value = value.strip()
    parsed = urlparse(value)
    if not value or value.startswith(('#', 'data:', 'blob:')) or parsed.scheme or parsed.netloc:
        return None
    return unquote(parsed.path)

class AssetHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.module_scripts = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == 'script' and values.get('src'):
            self.references.append(values['src'])
            if values.get('type', '').lower() == 'module':
                self.module_scripts.append(values['src'])
        elif tag == 'link' and values.get('href') and values.get('rel', '').lower() in [
                'stylesheet', 'modulepreload', 'preload', 'icon']:
            self.references.append(values['href'])
        elif tag in ['img', 'source', 'video', 'audio', 'iframe']:
            if values.get('src'):
                self.references.append(values['src'])
            for item in values.get('srcset', '').split(','):
                if item.strip():
                    self.references.append(item.strip().split()[0])

JS_REFERENCE_PATTERNS = [
    re.compile(r'''(?:import|export)\s*(?:(?:[^\"'();]*?)\bfrom\s*)?[\"']([^\"']+)[\"']'''),
    re.compile(r'''import\s*\(\s*[\"']([^\"']+)[\"']\s*\)'''),
    re.compile(r'''new\s+URL\s*\(\s*[\"']([^\"']+)[\"']\s*,\s*import\.meta\.url'''),
    re.compile(r'''[\"']((?:\.\.?/)[^\"']+\.(?:js|mjs|cjs|css|wasm|json|png|jpe?g|gif|webp|svg|woff2?|ttf|otf)(?:[?#][^\"']*)?)[\"']''', re.I),
]
CSS_REFERENCE_PATTERNS = [
    re.compile(r'''@import\s+(?:url\(\s*)?[\"']?([^\"')\s;]+)'''),
    re.compile(r'''url\(\s*[\"']?([^\"')]+)'''),
]

def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def resolve_asset(root, source, reference):
    rel = local_reference(reference)
    if rel is None:
        return None
    if rel.startswith('/'):
        raise ValueError(f'Build asset references must be relative: {reference}')
    target = (source.parent / rel).resolve()
    if not target.is_relative_to(root.resolve()):
        raise ValueError(f'Build asset escapes the snapshot: {reference}')
    if not target.is_file():
        raise ValueError(f'Build asset missing: {target.relative_to(root)}')
    return target

def validate_asset_closure(root, entry='index.html'):
    """Validate the local HTML/JS/CSS dependency closure and return its files."""
    root = Path(root).resolve()
    entry_path = (root / entry).resolve()
    if not entry_path.is_relative_to(root) or not entry_path.is_file():
        raise ValueError(f'Preview entry missing: {entry}')
    pending = [entry_path]
    visited = set()
    module_entry = False
    while pending:
        source = pending.pop()
        if source in visited:
            continue
        visited.add(source)
        suffix = source.suffix.lower()
        text = source.read_text(errors='replace') if suffix in ['.html', '.htm', '.js', '.mjs', '.cjs', '.css'] else ''
        references = []
        if suffix in ['.html', '.htm']:
            parser = AssetHTMLParser()
            parser.feed(text)
            references = parser.references
            if source == entry_path and parser.module_scripts:
                module_entry = True
        elif suffix in ['.js', '.mjs', '.cjs']:
            references = [match.group(1) for pattern in JS_REFERENCE_PATTERNS for match in pattern.finditer(text)]
        elif suffix == '.css':
            references = [match.group(1) for pattern in CSS_REFERENCE_PATTERNS for match in pattern.finditer(text)]
        for reference in references:
            target = resolve_asset(root, source, reference)
            if target is not None:
                pending.append(target)
    return {'files': sorted(path.relative_to(root).as_posix() for path in visited),
            'moduleEntry': module_entry}

def validate_snapshot(root, entry='index.html', require_manifest=False):
    result = validate_asset_closure(root, entry)
    manifest_path = Path(root) / SNAPSHOT_MANIFEST
    if require_manifest and not manifest_path.is_file():
        raise ValueError('Build previews must be created with studio.py snapshot')
    if manifest_path.is_file():
        manifest = read(manifest_path)
        if manifest.get('entry') != entry or not isinstance(manifest.get('files'), dict):
            raise ValueError('Preview snapshot manifest is invalid')
        current = {path.relative_to(root).as_posix(): file_hash(path) for path in Path(root).rglob('*')
                   if path.is_file() and path.name != SNAPSHOT_MANIFEST}
        if current != manifest['files']:
            raise ValueError('Preview snapshot changed after creation')
    return result

def snapshot(root, dist, name=None):
    """Publish a verified build to a new immutable candidate directory atomically."""
    root = Path(root).resolve()
    temporary_project(root)
    if not (root / 'session.json').is_file():
        raise ValueError('Initialize the session before creating a snapshot')
    dist = Path(dist).resolve()
    if not dist.is_dir():
        raise ValueError('Build dist directory is missing')
    name = name or f"preview-{time.strftime('%Y%m%dT%H%M%SZ', time.gmtime())}-{uuid.uuid4().hex[:8]}"
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._-]*', name):
        raise ValueError('Snapshot name must be one path-safe directory name')
    candidates = root / 'candidates'
    candidates.mkdir(parents=True, exist_ok=True)
    if candidates.resolve().is_relative_to(dist):
        raise ValueError('Build dist cannot contain the session candidates directory')
    target = candidates / name
    lock = candidates / f'.{name}.snapshot.lock'
    try:
        descriptor = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
        os.close(descriptor)
    except FileExistsError as error:
        raise ValueError(f'Snapshot name is already being published: {name}') from error
    staging = candidates / f'.{name}.staging-{uuid.uuid4().hex}'
    try:
        if target.exists():
            raise ValueError(f'Snapshot target already exists: candidates/{name}')
        if any(path.is_symlink() for path in dist.rglob('*')):
            raise ValueError('Build snapshots cannot contain symlinks')
        shutil.copytree(dist, staging)
        closure = validate_asset_closure(staging)
        files = {path.relative_to(staging).as_posix(): file_hash(path) for path in staging.rglob('*') if path.is_file()}
        write(staging / SNAPSHOT_MANIFEST, {'schemaVersion': 1, 'entry': 'index.html',
                                            'closure': closure['files'], 'files': files})
        if target.exists():
            raise ValueError(f'Snapshot target already exists: candidates/{name}')
        staging.rename(target)
    finally:
        if staging.exists():
            shutil.rmtree(staging)
        lock.unlink(missing_ok=True)
    return {'preview': f'candidates/{name}/index.html', 'directory': str(target),
            'files': len(files), 'closure': closure['files']}

def validate_local_preview(root, preview):
    path = contained(root, preview)
    if not path.is_file():
        raise ValueError(f'Preview missing: {preview}')
    if path.suffix.lower() not in ['.html', '.htm']:
        return
    parser = AssetHTMLParser()
    parser.feed(path.read_text(errors='replace'))
    if parser.module_scripts:
        validate_snapshot(path.parent, path.name, require_manifest=True)

def validate_visual_review(root, option, token_hash):
    """Require auditable visual inspection; this does not grade aesthetics."""
    path = option.get('visualReview')
    if not isinstance(path, str) or not path:
        raise ValueError('Components/preview require a visualReview JSON path')
    review = read(contained(root, path))
    if review.get('tokenHash') != token_hash:
        raise ValueError('Visual review is stale for these foundation tokens')
    intent = review.get('intent')
    if not isinstance(intent, str) or not contained(root, intent).is_file():
        raise ValueError('Visual review needs an existing design-intent document')
    method = review.get('method', 'screenshots')
    if method not in ['screenshots', 'source-inspection']:
        raise ValueError('Use screenshots or source-inspection as the review method')
    screenshots = review.get('screenshots', [])
    if not isinstance(screenshots, list) or (method == 'screenshots' and not screenshots):
        raise ValueError('Screenshot review needs screenshots the agent has viewed')
    if method == 'source-inspection':
        limitations = review.get('limitations')
        if not isinstance(limitations, list) or not limitations or any(not isinstance(item, str) or not item.strip() for item in limitations):
            raise ValueError('Source inspection must disclose unavailable visual checks')
    for shot in screenshots:
        if not isinstance(shot, str) or Path(shot).suffix.lower() not in ['.png', '.jpg', '.jpeg', '.webp'] or not contained(root, shot).is_file():
            raise ValueError('Visual review screenshot is missing or invalid')
    observations = review.get('observations')
    if not isinstance(observations, list) or not observations:
        raise ValueError('Visual review needs concrete observations and repairs')
    covered = set()
    for observation in observations:
        if not isinstance(observation, dict) or any(not isinstance(observation.get(k), str) or not observation[k].strip() for k in ['area','finding','action','verification']):
            raise ValueError('Each observation needs area, finding, action and verification')
        covered.add(observation['area'])
    if not {'reference','typography','spacing','shape','icons','states','composition','copy'}.issubset(covered):
        raise ValueError('Visual review must inspect reference, typography, spacing, shape, icons, states, composition and copy')
    if review.get('unresolved') != []:
        raise ValueError('Resolve visual defects before publishing; direction changes return to foundations')
    return digest(review)

def init(root, source, name, simulation=False, language='en', ui_copy=None):
    labels = translated_copy(language, ui_copy)
    project = temporary_project(root)
    root.mkdir(parents=True, exist_ok=True)
    if (root / 'session.json').exists():
        raise ValueError('Session exists. Use status/serve to resume.')
    source = Path(source).resolve()
    if source.suffix.lower() not in ['.png', '.jpg', '.jpeg', '.webp', '.gif']:
        raise ValueError('Use a raster image: png/jpg/webp/gif')
    target = root / ('inspiration' + source.suffix.lower())
    shutil.copy2(source, target)
    state = dict(schemaVersion=3, name=name, image=target.name, simulation=simulation,
                 language=language, uiCopy=labels,
                 nextStage='direction', status='needs-agent', revision=0, round=None,
                 accepted={}, history=[], approval=None)
    (project / TEMP_MARKER).write_text('Temporary files owned by grilling-design-system.\n')
    save(root, state)
    return state

def publish(root, spec):
    state = read(root / 'session.json')
    if state['status'] != 'needs-agent':
        raise ValueError('Read/resolve the current round before publishing another.')
    stage = spec.get('stage')
    if stage != state['nextStage']:
        raise ValueError(f"Expected stage {state['nextStage']}, got {stage}")
    language = spec.get('language', state.get('language', 'en'))
    labels = translated_copy(language, spec.get('uiCopy', state.get('uiCopy') if language == state.get('language') else None))
    options = spec.get('options', [])
    if not options or len({o['id'] for o in options}) != len(options):
        raise ValueError('Provide distinct option IDs')
    review_type = spec.get('reviewType', 'presentation' if stage == 'preview' else 'choice')
    if review_type not in ['choice', 'derived', 'presentation']:
        raise ValueError('Unknown reviewType')
    if (stage == 'preview') != (review_type == 'presentation'):
        raise ValueError('Preview is a single presentation; earlier stages use choice or derived')
    expected_count = 2 if review_type == 'choice' else 1
    if len(options) != expected_count:
        raise ValueError(f'{review_type} requires exactly {expected_count} option(s)')
    if review_type == 'derived' and (not isinstance(spec.get('derivation'), str) or not spec['derivation'].strip()):
        raise ValueError('Derived checkpoints need a rationale based on existing evidence')
    if type(spec.get('continueStage', False)) is not bool or (spec.get('continueStage') and review_type != 'choice'):
        raise ValueError('continueStage is a boolean for planned choice rounds only')
    if stage == 'foundations':
        required = {'color', 'typography', 'spacing', 'shape', 'icons', 'motion'}
        if not required.issubset(set(spec.get('covers', []))):
            raise ValueError('Foundation review must cover color, typography, spacing, shape, icons, motion')
    for option in options:
        if not option.get('title') or not option.get('description') or not option.get('preview'):
            raise ValueError('Each option needs title, description and preview')
        viewports = option.get('viewports')
        if viewports is not None:
            if stage == 'preview':
                raise ValueError('The integrated presentation uses the standard Desktop and Mobile frames')
            if not isinstance(viewports, list) or not 1 <= len(viewports) <= 2:
                raise ValueError('Provide one or two specimen viewports')
            for viewport in viewports:
                if not isinstance(viewport, dict) or viewport.get('device') not in ['specimen', 'desktop', 'mobile']:
                    raise ValueError('Viewport device must be specimen, desktop or mobile')
                if any(type(viewport.get(key)) not in [int, float] or not 160 <= viewport[key] <= 2400 for key in ['width', 'height']):
                    raise ValueError('Viewport width and height must be between 160 and 2400 pixels')
        preview = option['preview']
        if preview.startswith('http'):
            if urlparse(preview).hostname not in ['localhost', '127.0.0.1']:
                raise ValueError('Preview URLs must be local')
        else:
            validate_local_preview(root, preview)
        if stage in ['direction', 'foundations'] and not isinstance(option.get('tokens'), dict):
            raise ValueError('Direction/foundation options need a complete token object')
        if stage in ['components', 'preview']:
            expected = digest(state['accepted']['foundations']['tokens'])
            if option.get('tokenHash') != expected:
                raise ValueError('Candidate tokenHash does not match accepted foundations')
            validate_visual_review(root, option, expected)
    if stage == 'preview':
        for key in ['build', 'desktop', 'mobile', 'keyboard', 'contrast']:
            if not spec.get('checks', {}).get(key):
                raise ValueError(f'Missing preview evidence: {key}')
    state['revision'] += 1
    state['language'], state['uiCopy'] = language, labels
    spec = copy.deepcopy(spec)
    spec['reviewType'] = review_type
    spec['id'] = f"r{state['revision']}-{uuid.uuid4().hex[:8]}"
    state['round'] = spec
    state['status'] = 'awaiting-user'
    state['approval'] = None
    if review_type == 'derived':
        state['accepted'][stage] = options[0]
        state['nextStage'] = STAGES[STAGES.index(stage) + 1]
        state['status'] = 'needs-agent'
        state['history'].append(dict(at=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                                    roundId=spec['id'], stage=stage, action='derive',
                                    optionId=options[0]['id'], optionIds=[options[0]['id']],
                                    feedback='', derivation=spec['derivation'], source='agent-derived',
                                    simulation=state['simulation']))
    write(root / 'rounds' / f"{spec['id']}.json", spec)
    save(root, state)
    return state

def decide(root, data):
    state = read(root / 'session.json')
    current = state['round']
    if state['status'] != 'awaiting-user' or data.get('roundId') != current['id']:
        raise DecisionError('staleRound')
    action = data.get('action')
    feedback = str(data.get('feedback', '')).strip()
    combination = str(data.get('combination', '')).strip()
    option_ids = data.get('optionIds', [data['optionId']] if data.get('optionId') else [])
    if (not isinstance(option_ids, list) or any(not isinstance(i, str) for i in option_ids)
            or len(option_ids) > 1
            or any(i not in [o['id'] for o in current['options']] for i in option_ids)):
        raise DecisionError('invalidChoice')
    selected = next((o for o in current['options'] if o['id'] == option_ids[0]), None) if len(option_ids) == 1 else None
    stage = current['stage']
    if action not in ['select', 'revise', 'approve']:
        raise DecisionError('invalidAction')
    if action == 'approve' and stage != 'preview':
        raise DecisionError('previewOnly')
    if action in ['select', 'approve'] and not option_ids:
        raise DecisionError('chooseRequired')
    if action == 'revise' and not (feedback or combination):
        raise DecisionError('feedbackRequired')
    if stage == 'preview' and action == 'select':
        raise DecisionError('previewAction')
    if action == 'approve' and (feedback or combination):
        raise DecisionError('approveChanges')
    if action == 'select' and (feedback or combination):
        action = 'revise'
    event = dict(at=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), roundId=current['id'],
                 stage=stage, action=action, optionId=option_ids[0] if selected else None, optionIds=option_ids, feedback=feedback,
                 combination=combination, source=data.get('source', 'chat'), simulation=state['simulation'])
    state['history'].append(event)
    # A textual modification is a revision request, never silently accepted.
    if action == 'revise':
        state['status'] = 'needs-agent'
        state['nextStage'] = 'foundations' if stage in ['components', 'preview'] else stage
        state['approval'] = None
        index = STAGES.index(state['nextStage'])
        for key in STAGES[index:]:
            state['accepted'].pop(key, None)
    elif action == 'approve':
        state['accepted'][stage] = selected
        state['status'] = 'approved'
        state['nextStage'] = 'delivery'
        state['approval'] = dict(roundId=current['id'], tokenHash=selected['tokenHash'],
                                 at=event['at'], simulation=state['simulation'])
    else:
        state['accepted'][stage] = selected
        state['nextStage'] = stage if current.get('continueStage') else STAGES[STAGES.index(stage) + 1]
        state['status'] = 'needs-agent'
    save(root, state)
    return state

def reopen(root, feedback):
    state = read(root / 'session.json')
    if state['status'] not in ['approved', 'delivered']:
        raise ValueError('Only an approved/delivered session can be reopened')
    state['history'].append(dict(stage='maintenance', action='revise', feedback=feedback,
                                 simulation=state['simulation']))
    state['status'], state['nextStage'], state['approval'] = 'needs-agent', 'foundations', None
    state['accepted'] = {k:v for k,v in state['accepted'].items() if k == 'direction'}
    save(root, state)

def finish(root, evidence):
    """Record delivery after actual build checks and DESIGN.md completion, in either output mode."""
    from design_document import completion_errors
    project = temporary_project(root)
    marker = project / TEMP_MARKER
    if not marker.is_file():
        raise ValueError('Temporary workspace ownership marker is missing')
    state = read(root / 'session.json')
    if state['status'] not in ['approved', 'delivered']:
        raise ValueError('Delivery requires confirmation of the current presentation')
    expected = digest(state['accepted']['foundations']['tokens'])
    if evidence.get('tokenHash') != expected or state['approval']['tokenHash'] != expected:
        raise ValueError('Delivery token hash is stale')
    for key in ['path', 'designDoc']:
        path = Path(evidence.get(key, ''))
        if not path.is_absolute() or not path.exists():
            raise ValueError('Delivery requires an existing absolute ' + key)
    if not Path(evidence['path']).is_dir() or not Path(evidence['designDoc']).is_file():
        raise ValueError('Delivery requires a component directory and DESIGN.md file')
    output, design_doc = Path(evidence['path']).resolve(), Path(evidence['designDoc']).resolve()
    if output.is_relative_to(project) or design_doc.is_relative_to(project):
        raise ValueError('Final library and DESIGN.md must remain outside the temporary PROJECT directory')
    context_path = root.parent / 'project-context.json'
    generated = state.get('generated')
    if context_path.is_file():
        context = read(context_path)
        mode = context.get('mode')
        if mode not in ['integrated', 'standalone']:
            raise ValueError('project-context.json needs mode integrated or standalone')
        doc_root = Path(context['webRoot'] if mode == 'integrated' else context['output']).resolve()
        if output != Path(context['output']).resolve() or design_doc != doc_root / 'DESIGN.md':
            raise ValueError('Delivery paths must match the ' + mode + ' project context')
    elif generated:
        mode = 'standalone'
        if output != Path(generated['path']).resolve() or design_doc != output / 'DESIGN.md':
            raise ValueError('Delivery paths must match the generated standalone library')
    else:
        raise ValueError('Delivery requires project-context.json beside the session or a library.py --deliver run')
    if mode == 'standalone' and (not generated or Path(generated['path']).resolve() != output
                                 or generated.get('tokenHash') != expected):
        raise ValueError('Standalone delivery requires library.py --deliver for the approved tokens first')
    errors = completion_errors(Path(evidence['designDoc']).read_text())
    if errors:
        raise ValueError('Complete DESIGN.md before delivery: ' + '; '.join(errors))
    if not isinstance(evidence.get('checks'), dict) or not evidence['checks'].get('build'):
        raise ValueError('Record the actual host build result')
    if type(evidence.get('componentCount')) is not int or evidence['componentCount'] < 1 or not evidence.get('snapshotHash'):
        raise ValueError('Record component coverage and the source snapshot hash')
    state['status'] = 'delivered'
    state['delivery'] = {**evidence, 'mode': mode}
    state['temporaryFilesRemoved'] = True
    save(root, state)
    shutil.rmtree(project)
    try:
        project.parent.rmdir()
    except OSError:
        pass
    return state

def serve(root, port):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, fmt, *args):
            pass
        def send(self, status, body, mime='application/json'):
            self.send_response(status)
            self.send_header('Content-Type', mime + ('; charset=utf-8' if mime.startswith('text/') else ''))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            self.wfile.write(body if isinstance(body, bytes) else json.dumps(body, ensure_ascii=False).encode())
        def do_GET(self):
            path = unquote(urlparse(self.path).path)
            try:
                if path == '/api/state':
                    with LOCK: self.send(200, public_state(read(root / 'session.json')))
                else:
                    if path == '/': target = ASSETS / 'studio.html'
                    elif path == '/studio.js': target = ASSETS / 'studio.js'
                    elif path == '/studio.css': target = ASSETS / 'studio.css'
                    elif path.startswith('/files/'): target = contained(root, path[7:])
                    else: return self.send(404, {'error':'Not found'})
                    self.send(200, target.read_bytes(), mimetypes.guess_type(target.name)[0] or 'application/octet-stream')
            except (OSError, ValueError) as error:
                self.send(404, {'error':str(error)})
        def do_POST(self):
            try:
                origin = self.headers.get('Origin')
                if origin and origin != 'http://' + self.headers.get('Host', ''):
                    raise ValueError('Cross-origin submissions are not allowed')
                if self.path != '/api/decision': return self.send(404, {'error':'Not found'})
                if 'application/json' not in self.headers.get('Content-Type', ''):
                    raise ValueError('JSON required')
                length = int(self.headers.get('Content-Length', 0))
                if length > 65536: raise ValueError('Submission too large')
                data = json.loads(self.rfile.read(length))
                with LOCK: state = decide(root, data)
                self.send(200, state)
            except (ValueError, KeyError) as error:
                self.send(409, {'error': str(error), 'code': getattr(error, 'code', 'submitFailed')})
    server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    print(f'Studio: http://127.0.0.1:{server.server_port}', flush=True)
    server.serve_forever()

def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest='cmd', required=True)
    for command in ['init', 'snapshot', 'publish', 'status', 'serve', 'wait', 'reopen', 'decide', 'finish']:
        s = sub.add_parser(command)
        s.add_argument('--session', required=True, type=Path)
        if command == 'init':
            s.add_argument('--image', required=True)
            s.add_argument('--name', required=True)
            s.add_argument('--simulation', action='store_true')
            s.add_argument('--language', required=True, help='User language, e.g. zh-CN or en')
            s.add_argument('--ui-copy', type=Path, help='Translated studio text for other languages')
        if command == 'publish': s.add_argument('--spec', required=True, type=Path)
        if command == 'snapshot':
            s.add_argument('--dist', required=True, type=Path, help='Completed build output directory')
            s.add_argument('--name', help='Optional new immutable candidate directory name; omitted generates one')
        if command == 'serve': s.add_argument('--port', type=int, default=4310)
        if command == 'wait': s.add_argument('--timeout', type=int, default=45)
        if command == 'reopen': s.add_argument('--feedback', required=True)
        if command == 'finish': s.add_argument('--evidence', required=True, type=Path)
        if command == 'decide':
            s.add_argument('--decision', required=True, type=Path, help='Actual user response mapped to the decision format')
            s.add_argument('--url', required=True, help='Running studio URL; shares its submission lock')
    args = p.parse_args()
    root = args.session.resolve()
    try:
        if args.cmd == 'init': init(root, args.image, args.name, args.simulation, args.language, read(args.ui_copy) if args.ui_copy else None)
        elif args.cmd == 'snapshot':
            print(json.dumps(snapshot(root, args.dist, args.name), ensure_ascii=False, indent=2))
            return
        elif args.cmd == 'publish': publish(root, read(args.spec))
        elif args.cmd == 'serve': return serve(root, args.port)
        elif args.cmd == 'reopen': reopen(root, args.feedback)
        elif args.cmd == 'finish':
            result = finish(root, read(args.evidence))
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return
        elif args.cmd == 'decide':
            if urlparse(args.url).hostname not in ['localhost', '127.0.0.1']:
                raise ValueError('Use the local studio URL')
            payload = read(args.decision)
            payload.setdefault('source', 'ask-user-question')
            request = Request(args.url.rstrip('/') + '/api/decision', data=json.dumps(payload).encode(), headers={'Content-Type':'application/json'})
            try:
                with urlopen(request, timeout=10) as response:
                    result = json.load(response)
            except HTTPError as error:
                result = json.load(error)
                raise ValueError(result.get('error', 'Submission failed')) from error
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return
        elif args.cmd == 'wait':
            deadline = time.time() + min(args.timeout, 55)
            while time.time() < deadline and read(root/'session.json')['status'] == 'awaiting-user':
                time.sleep(1)
        print(json.dumps(read(root/'session.json'), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, OSError) as e:
        p.exit(1, f'Error: {e}\n')

if __name__ == '__main__': main()

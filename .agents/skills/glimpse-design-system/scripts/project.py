"""Inspect the current application and resolve output paths without modifying it."""
import argparse
import json
from pathlib import Path
import re


WEB_DEPENDENCIES = {'react-dom', 'next', 'vue', 'nuxt', 'svelte', '@sveltejs/kit',
                    '@angular/core', '@remix-run/react', 'react-router-dom', 'astro',
                    'solid-js', 'preact', 'gatsby', '@web/dev-server', 'vite',
                    'react-scripts', '@vue/cli-service', '@angular/cli', 'parcel'}
WEB_CONFIGS = ['next.config.*', 'nuxt.config.*', 'svelte.config.*', 'astro.config.*',
               'vite.config.*', 'angular.json', '.parcelrc']
SOURCE_FILES = ['src/**/*.tsx', 'src/**/*.jsx', 'src/**/*.vue', 'src/**/*.svelte',
                'app/**/*.tsx', 'app/**/*.jsx', 'pages/**/*.tsx', 'pages/**/*.jsx',
                'templates/**/*.html', 'resources/views/**/*.blade.php']


def web_evidence(root):
    """Heuristic evidence; the agent must inspect ambiguous/custom projects."""
    evidence, package = [], {}
    path = root / 'package.json'
    if path.is_file():
        package = json.loads(path.read_text())
        dependencies = set(package.get('dependencies', {})) | set(package.get('devDependencies', {}))
        evidence += ['dependency:' + name for name in sorted(dependencies & WEB_DEPENDENCIES)]
        for name, command in package.get('scripts', {}).items():
            if re.search(r'\b(next|nuxt|vite|astro|react-scripts|vue-cli-service|webpack-dev-server|parcel)\b', command):
                evidence.append('script:' + name)
    for pattern in WEB_CONFIGS:
        evidence += ['config:' + path.name for path in root.glob(pattern) if path.is_file()]
    if (root / 'index.html').is_file():
        evidence.append('entry:index.html')
    for pattern in SOURCE_FILES:
        if next(root.glob(pattern), None) is not None:
            evidence.append('source:' + pattern)
    return evidence, package


def find_web_project(cwd):
    start = Path(cwd).resolve()
    source_candidate = None
    for root in [start, *start.parents]:
        evidence, package = web_evidence(root)
        if evidence and (package or any(item.startswith(('config:', 'entry:')) for item in evidence)):
            return root, evidence, package
        if evidence:
            source_candidate = (root, evidence, package)
        # A nested package is its own application boundary; do not inherit a sibling app.
        if (root / 'package.json').exists() or (root / '.git').exists():
            break
    return source_candidate or (None, [], {})


def source_root(root, override=None):
    if override:
        return (root / override).resolve()
    for name in ['src', 'app', 'resources/js', 'client', 'frontend', 'source', 'pages']:
        if (root / name).is_dir():
            return root / name
    # Flat applications keep code at their root; never manufacture a src layout.
    return root


def resolve_project(cwd, output=None, web_root=None, source=None):
    cwd = Path(cwd).resolve()
    if web_root:
        root = (cwd / web_root).resolve()
        if not root.is_dir():
            raise ValueError('Web project root must exist')
        evidence, package = web_evidence(root)
        evidence.append('agent-confirmed-root')
    else:
        root, evidence, package = find_web_project(cwd)
    requested = (cwd / output).resolve() if output is not None else None
    if root is None and requested is not None:
        root, evidence, package = find_web_project(requested)
    if root:
        source_path = source_root(root, source)
        target = requested if requested is not None else source_path / 'design-system'
        mode, design_root, work = 'integrated', root, root / '.glimpse'
    else:
        source_path = None
        target = requested if requested is not None else cwd / 'design-system'
        mode, design_root, work = 'standalone', target, target / '.glimpse'
    locks = []
    if root:
        for parent in [root, *root.parents]:
            locks += [str(parent / name) for name in ['pnpm-lock.yaml', 'yarn.lock', 'package-lock.json', 'bun.lock', 'bun.lockb'] if (parent / name).exists()]
            if (parent / '.git').exists():
                break
    return {'mode': mode, 'cwd': str(cwd), 'webRoot': str(root) if root else None,
            'sourceRoot': str(source_path) if source_path else None, 'output': str(target),
            'designDoc': str(design_root / 'DESIGN.md'), 'workDir': str(work),
            'userSpecifiedOutput': requested is not None, 'evidence': evidence,
            'packageManager': package.get('packageManager'), 'lockfiles': locks,
            'scripts': package.get('scripts', {})}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cwd', type=Path, default=Path.cwd())
    parser.add_argument('--output', type=Path, help='User-specified component directory or standalone root')
    parser.add_argument('--web-root', type=Path, help='Application root confirmed from source/config inspection')
    parser.add_argument('--source-root', type=Path, help='Actual source root relative to the Web application root')
    args = parser.parse_args()
    try:
        print(json.dumps(resolve_project(args.cwd, args.output, args.web_root, args.source_root), indent=2))
    except (OSError, ValueError) as error:
        parser.exit(1, str(error) + chr(10))

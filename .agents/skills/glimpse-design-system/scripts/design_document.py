"""Render the user's canonical DESIGN.md template using actual artifact facts."""
from pathlib import Path
import os
import json
import re

from studio import digest
from theme import contrast, geometry

TEMPLATE = Path(__file__).resolve().parents[1] / 'assets' / 'DESIGN.template.md'
FENCE = chr(96) * 3
DRAFT_NOTICE = 'This is a generated documentation draft.'


def document(output, tokens, state, snapshot, checks, context=None):
    """Generate an intermediate draft for agent completion before delivery."""
    output = Path(output).resolve()
    context = context or {}
    integrated = context.get('mode') == 'integrated'
    doc_root = Path(context['webRoot']).resolve() if integrated else output
    parts = re.split(r'(?m)^(## \d+\. .+)$', TEMPLATE.read_text())
    sections = {int(parts[i].split('.')[0][3:]): [parts[i], parts[i + 1]]
                for i in range(1, len(parts), 2)}

    def fields(number, values):
        text = sections[number][1]
        for key, value in values.items():
            text = re.sub(r'(?m)^' + re.escape(key) + r':(?:\n\[path\])?$',
                          lambda match: key + ': ' + str(value), text)
        sections[number][1] = text

    def append(number, text):
        body = sections[number][1].rstrip()
        if body.endswith('---'):
            body = body[:-3].rstrip()
        sections[number][1] = body + '\n\n' + text.strip() + ('\n\n---\n\n' if number < 13 else '\n')

    def source(path):
        if not path:
            return '[fill here: existing path or Not applicable with reason]'
        actual = (doc_root / path).resolve()
        return Path(os.path.relpath(actual, doc_root)).as_posix() if actual.exists() else '[fill here: existing path or Not applicable with reason]'

    colors, craft = tokens['colors'], geometry(tokens)
    aliases = {'background': 'background', 'surface': 'card', 'border': 'border',
               'text-primary': 'foreground', 'text-muted': 'muted-foreground',
               'primary': 'primary', 'error': 'destructive'}
    values = {}
    for role in ['background', 'surface', 'border', 'text-primary', 'text-secondary',
                 'text-muted', 'primary', 'primary-hover', 'success', 'warning', 'error']:
        key = role if role in colors else aliases.get(role)
        values[role] = f'var(--{key}) = {colors[key]}' if key else '[fill here: map to the implemented semantic token or state rule]'
    fields(2, values)
    fields(2, {'font-family': tokens['font']['family'],
               'body': f'{tokens["font"]["bodySize"]}px; line-height {craft["bodyLineHeight"]}; var(--font-sans)',
               'sm': f'{tokens["radius"] * .6:g}px; --radius-sm',
               'md': f'{tokens["radius"] * .8:g}px; --radius-md',
               'lg': f'{tokens["radius"]:g}px; --radius-lg',
               'full': '9999px; pill or circle',
               'Library': tokens['icons']['family'],
               'Sizes': f'{tokens["icons"]["size"]}px base; inspect component overrides'})
    color_table = ['### Complete semantic color map', '', '| Token | Value |', '| --- | --- |']
    color_table += [f'| --{key} | {value} |' for key, value in colors.items()]
    if tokens.get('alternate'):
        color_table += ['', '### Requested alternate mode: ' + tokens['alternate']['mode'],
                        '', '| Token | Value |', '| --- | --- |']
        color_table += [f'| --{key} | {value} |' for key, value in tokens['alternate']['colors'].items()]
    color_table += ['', '### Additional implemented tokens', '',
                    f'- Heading family: {tokens["font"]["heading"]}; weight {tokens["font"]["headingWeight"]}.',
                    f'- Heading line-height: {craft["headingLineHeight"]}; tracking: {craft["headingTracking"]}em; label weight: {craft["labelWeight"]}.',
                    f'- Spacing base: {tokens["spacing"]["unit"]}px; control height: {tokens["spacing"]["controlHeight"]}px.',
                    f'- Control radius: {craft["controlRadius"]}px; surface radius: {craft["surfaceRadius"]}px; overlay radius: {craft["overlayRadius"]}px.',
                    f'- Control inline padding: {craft["controlPadding"]}px; icon gap: {craft["iconGap"]}px; icon stroke: {tokens["icons"]["stroke"]}.',
                    f'- Shadow: {tokens["shadow"]}.',
                    f'- Motion: {tokens["motion"]["duration"]}ms {tokens["motion"]["easing"]}; honor reduced motion.',
                    '- Font smoothing: -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale.',
                    '- Reconcile role sizes, allowed spacing, and component overrides with the final source before delivery.']
    append(2, '\n'.join(color_table))
    confirmed = bool(state and state.get('status') in ['approved', 'delivered']
                     and (state.get('approval') or {}).get('tokenHash') == digest(tokens))
    status = 'SIMULATED APPROVAL (validation only)' if confirmed and state.get('simulation') else 'Approved' if confirmed else 'Draft'
    append(1, f'### Source and status\n\nName: {tokens["name"]}\n\nStatus: {status}\n\nMode: {tokens["mode"]}\n\n'
           + tokens.get('rationale', 'Use the image interpretation and recorded decisions.') + '\n\n'
           + DRAFT_NOTICE + ' Complete every placeholder and verify all rules against the final library before delivery. '
           'Infer missing documentation from the project and confirmed visual choices; do not turn template fields into a user questionnaire.')
    append(4, '### Public API mapping\n\n' + (context.get('apiMapping', '[fill here: map design roles to actual host component APIs]') if integrated else
           'Preserve shadcn/ui APIs. The design role primary maps to Button variant="default"; '
           'size md maps to size="default". Keep secondary, ghost, destructive, sm, and lg identifiers unchanged. '
           'Inspect the actual Button source before documenting extra variants. Modal maps to Dialog; Toast maps to Sonner.'))
    sections[8][1] = sections[8][1].replace('[44x44 / other]', '44x44 CSS px minimum for primary touch targets')
    sections[8][1] = sections[8][1].replace('[WCAG AA / other]', 'WCAG AA target; not a claim of full compliance')
    evidence = ['### Accessibility evidence', '',
                'Token contrast results cover only these pairs. Verify rendered colors, labels, keyboard behavior, focus, and layout separately.', '',
                '| Mode | Pair | Ratio | Minimum | Result |', '| --- | --- | --- | --- | --- |']
    evidence += [f'| {r["mode"]} | {r["pair"]} | {r["ratio"]} | {r["minimum"]} | {"Pass" if r["passAA"] else "FAIL"} |' for r in contrast(tokens)]
    evidence += ['', '### Verification and limitations', '']
    evidence += [f'- {key}: {value}' for key, value in checks.items()] or ['- No runtime verification recorded.']
    append(8, '\n'.join(evidence))
    implementation = context.get('implementationPaths', {})
    fields(9, {'Framework': context.get('framework', '[fill here: actual host framework]') if integrated else 'React + TypeScript + Vite',
               'Styling': context.get('styling', '[fill here: actual host styling]') if integrated else 'Tailwind CSS 4 + semantic CSS variables',
               'Component library': context.get('componentLibrary', '[fill here: actual compatible component library]') if integrated else 'shadcn/ui', 'Icon library': tokens['icons']['family'],
               'UI components': source(implementation.get('UI components') if integrated else 'src/components/ui'),
               'Shared components': source(implementation.get('Shared components') if integrated else 'src/components/shared'),
               'Domain components': source(implementation.get('Domain components') if integrated else 'src/components/custom'),
               'Design tokens': source(implementation.get('Design tokens') if integrated else 'tokens.json')})
    append(9, '### Build and distribution\n\n' + (context.get('buildInstructions', '[fill here: actual host install, build, and preview commands]') if integrated else
           'Run npm install, npm run dev, and npm run build. Import src/index.css once. '
           'The installable registry is public/r/all.json; install it with npx shadcn@4.21.0 add <registry-url> '
           'in an initialized React + Tailwind 4 project. It installs src/glimpse-theme.css. '
           'Keep dependencies, custom components, fonts, assets, and SHADCN-LICENSE.txt with the library.'))
    fields(11, {name: source(path) for name, path in context.get('referencePaths', {}).items()} if integrated else {'App shell': source('src/App.tsx')})
    fields(12, {name: source(context.get('canonicalPaths', {}).get(name) if integrated else 'src/components/ui/' + file + '.tsx') for name, file in
                [('Button', 'button'), ('Input', 'input'), ('Select', 'select'), ('Dialog', 'dialog'),
                 ('Table', 'table'), ('Tabs', 'tabs'), ('Toast', 'sonner')]})
    extra = ['### Source snapshot', '', f'Source: {snapshot["url"]}; fetched: {snapshot["fetchedAt"]}.',
             f'Token hash: {digest(tokens)}.', '', '| Component | Source |', '| --- | --- |']
    inventory_source = context.get('componentLibrary', 'shadcn-derived; verify host adaptation') if integrated else 'shadcn/ui'
    extra += [f'| {name} | {inventory_source} |' for name in snapshot['ui']]
    custom_root = doc_root / implementation['Domain components'] if integrated and implementation.get('Domain components') else output / ('custom' if integrated else 'src/components/custom')
    extra += [f'| {source(path)} | Image-derived component |' for path in sorted(custom_root.rglob('*'))
              if path.is_file() and path.suffix in ['.tsx', '.jsx', '.vue', '.svelte']]
    extra += ['', '### Decisions', '']
    if state:
        extra += ['- ' + event['stage'] + ' / ' + event['action'] + ': ' + str(event.get('optionId') or '')
                  + ' ' + ' '.join(event.get(key, '') for key in ['feedback', 'combination', 'derivation'])
                  for event in state.get('history', [])]
    if (output / 'IMAGE-COMPONENTS.md').exists():
        extra += ['', 'See ' + source(output / 'IMAGE-COMPONENTS.md') + ' for image-specific component APIs and usage.']
    for filename, heading in [('design-notes.md', 'Additional project rules'), ('design-intent.md', 'Visual intent')]:
        path = output / filename
        if path.exists():
            lines, fenced = [], False
            for line in path.read_text().splitlines():
                if line.startswith((FENCE, '~~~')):
                    fenced = not fenced
                if not fenced:
                    line = re.sub(r'^#{1,3} ', '#### ', line)
                lines.append(line)
            extra += ['', '### ' + heading, '', '\n'.join(lines)]
    append(13, '\n'.join(extra))
    result = parts[0] + ''.join(heading + body for heading, body in sections.values())
    destination = doc_root / 'DESIGN.md'
    # Only an unedited generated draft may be replaced; completed or host documents get a separate draft.
    if destination.exists() and (integrated or DRAFT_NOTICE not in destination.read_text()):
        draft_root = Path(context.get('workDir', doc_root / '.glimpse'))
        draft_root.mkdir(parents=True, exist_ok=True)
        destination = draft_root / 'DESIGN.draft.md'
    destination.write_text(result)
    return destination


def completion_errors(text):
    """Validate structure and filled slots; source consistency needs inspection."""
    errors = []
    if not text.startswith('# DESIGN.md' + chr(10)):
        errors.append('Keep the # DESIGN.md title')
    expected = re.findall(r'(?m)^## .+$', TEMPLATE.read_text())
    if re.findall(r'(?m)^## .+$', text) != expected:
        errors.append('Keep all 13 canonical section headings in order')
    template_sections = re.split(r'(?m)^## .+$', TEMPLATE.read_text())[1:]
    actual_sections = re.split(r'(?m)^## .+$', text)[1:]
    if len(actual_sections) == len(template_sections):
        for index, (template, actual) in enumerate(zip(template_sections, actual_sections), 1):
            labels = re.findall(r'(?m)^(?:### .+|[A-Za-z][A-Za-z -]+:|(?:Desktop|Tablet|Mobile) ->)$', template)
            for label in set(labels):
                count = len(re.findall(r'(?m)^' + re.escape(label) + r'(?: .*)?$', actual))
                if count < labels.count(label):
                    errors.append(f'Section {index} is missing required heading or field: {label}')
    markers = ['[fill here', '[path]', '[rule]', '[e.g.',
               '[concise / professional / friendly / technical]', '[44x44 / other]', '[WCAG AA / other]']
    for marker in markers:
        if marker in text:
            errors.append('Complete template placeholder: ' + marker)
    if DRAFT_NOTICE in text:
        errors.append('Complete the draft and remove its draft notice')
    for block in re.findall(FENCE + 'txt' + chr(10) + '(.*?)' + FENCE, text, re.DOTALL):
        lines = block.strip().splitlines()
        for index, line in enumerate(lines):
            line = line.strip()
            if not line.endswith((':', '->')):
                continue
            next_line = lines[index + 1].strip() if index + 1 < len(lines) else ''
            if not next_line or next_line.endswith((':', '->')):
                errors.append('Fill empty value: ' + line)
    return errors


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', type=Path, help='Check a completed DESIGN.md')
    parser.add_argument('--context', type=Path, help='Inspected project-context.json for native integration')
    parser.add_argument('--tokens', type=Path)
    parser.add_argument('--snapshot', type=Path)
    parser.add_argument('--checks', type=Path)
    parser.add_argument('--session', type=Path)
    args = parser.parse_args()
    if args.context:
        if args.check or not args.tokens or not args.snapshot:
            parser.error('Draft generation requires --context, --tokens, and --snapshot, without --check')
        from studio import read
        context = read(args.context)
        if context.get('mode') != 'integrated':
            parser.error('Use library.py to generate standalone documentation')
        state = read(args.session/'session.json') if args.session else None
        path = document(Path(context['output']), read(args.tokens), state, read(args.snapshot),
                        read(args.checks) if args.checks else {}, context)
        print(json.dumps({'document': str(path), 'finalDocument': str(Path(context['webRoot'])/'DESIGN.md')}))
        raise SystemExit(0)
    if not args.check:
        parser.error('Provide --check or generation arguments with --context')
    errors = completion_errors(args.check.read_text())
    if errors:
        parser.exit(1, chr(10).join(errors) + chr(10))
    print('DESIGN.md structure and fields are complete; verify implementation consistency separately.')

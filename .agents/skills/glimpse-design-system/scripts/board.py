#!/usr/bin/env python3
"""Render agent-authored content inside a neutral, token-aware review shell."""
import argparse
import html
import json
from pathlib import Path
from theme import css, validate, contrast
import re


def render(t, content):
    validate(t)
    if not isinstance(content, dict) or not all(content.get(k) for k in ['title', 'headline', 'description']):
        raise ValueError('Provide image-specific title, headline and description; no default product scene is supplied')
    if not content.get('bodyHtml') and not content.get('cards'):
        raise ValueError('Provide bodyHtml or content cards derived from the image')
    language = content.get('language')
    if not isinstance(language, str) or not re.fullmatch(r'[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*', language):
        raise ValueError('Set content.language to the user language, e.g. zh-CN or en')
    esc = html.escape
    title = esc(content['title'])
    panels = []
    for card in content.get('cards', []):
        tone = card.get('tone', 'card')
        foreground = 'foreground' if tone == 'background' else tone + '-foreground'
        if tone not in t['colors'] or foreground not in t['colors']:
            raise ValueError('Card tone must have a semantic foreground pair')
        panels.append('<article class="tile" style="background:var(--' + tone + ');color:var(--' + foreground + ')"><h2>' + esc(card['title']) + '</h2><p>' + esc(card.get('description', '')) + '</p></article>')
    # Markup/CSS is authored by the agent. Never feed raw user feedback here.
    body = content.get('bodyHtml') or '<div class="deck">' + ''.join(panels) + '</div>'
    body += content.get('extraHtml', '')
    custom_css = content.get('css', '')
    if '</style' in custom_css.lower():
        raise ValueError('Invalid CSS closing tag')
    style = '''
main{max-width:1000px;padding:28px;margin:auto}header{margin-bottom:28px;font-size:14px;font-weight:var(--label-weight)}h1{font-size:32px;margin:0 0 16px;max-width:24ch;text-wrap:balance}p{max-width:68ch;font-size:14px}.deck{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;margin-top:28px}.tile{padding:24px;border-radius:var(--surface-radius)}.tile h2{font-size:22px;margin:0 0 12px}.tile p{margin:0}.review-tokens{margin-top:32px;padding-top:18px;border-top:1px solid var(--border);display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;color:var(--muted-foreground);font-size:12px}@media(max-width:600px){main{padding:22px}.deck{grid-template-columns:1fr}h1{font-size:28px}}'''
    return '<!doctype html><html lang="' + esc(language) + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title><style>' + css(t, False) + style + custom_css + '</style></head><body><main><header>' + title + '</header><h1>' + esc(content['headline']) + '</h1><p>' + esc(content['description']) + '</p>' + body + '</main></body></html>'


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--tokens', type=Path, required=True)
    p.add_argument('--content', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    args = p.parse_args()
    try:
        tokens = json.loads(args.tokens.read_text())
        result = render(tokens, json.loads(args.content.read_text()))
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(result)
        print(json.dumps({'output': str(args.output), 'contrast': contrast(tokens)}, indent=2))
    except (ValueError, KeyError) as error:
        p.exit(1, str(error) + '\n')

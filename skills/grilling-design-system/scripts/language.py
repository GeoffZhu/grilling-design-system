"""Load review text in the user's language."""
import json
import re
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[1] / 'assets'


def translated_copy(language, overrides=None, asset='studio-copy.json'):
    if not isinstance(language, str) or not re.fullmatch(r'[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*', language):
        raise ValueError('Provide a language tag such as zh-CN, en or ja')
    copies = json.loads((ASSETS / asset).read_text())
    base = 'en' if language.lower().split('-')[0] == 'en' else None
    result = dict(copies[base]) if base else {}
    if overrides is not None:
        if not isinstance(overrides, dict):
            raise ValueError('UI copy must be an object of translated strings')
        result.update(overrides)
    required = copies['en']
    if any(not isinstance(result.get(key), str) or not result[key].strip() for key in required):
        raise ValueError('Translate every UI text key for ' + language + ' using --ui-copy')
    return result

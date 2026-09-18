"""Regression tests for the shared preview and gallery header."""
import json
from pathlib import Path
import unittest

from board import render


SKILL = Path(__file__).resolve().parents[1]
ASSETS = SKILL / 'assets'
REPOSITORY = 'https://github.com/GeoffZhu/grilling-design-system'


class BrandHeaderTest(unittest.TestCase):
    def test_studio_header_has_brand_and_github_link(self):
        source = (ASSETS / 'studio.html').read_text()
        self.assertIn('>grilling design system</a>', source)
        self.assertIn(f'href="{REPOSITORY}"', source)
        self.assertIn('aria-label="GitHub"', source)
        self.assertIn('<svg', source)

    def test_board_header_has_brand_and_github_link(self):
        colors = {
            'background': '#ffffff', 'foreground': '#111111',
            'card': '#ffffff', 'card-foreground': '#111111',
            'popover': '#ffffff', 'popover-foreground': '#111111',
            'primary': '#111111', 'primary-foreground': '#ffffff',
            'secondary': '#eeeeee', 'secondary-foreground': '#111111',
            'muted': '#eeeeee', 'muted-foreground': '#555555',
            'accent': '#eeeeee', 'accent-foreground': '#111111',
            'destructive': '#aa0000', 'border': '#dddddd',
            'input': '#dddddd', 'ring': '#111111',
            **{f'chart-{index}': '#555555' for index in range(1, 6)},
            'sidebar': '#ffffff', 'sidebar-foreground': '#111111',
            'sidebar-primary': '#111111', 'sidebar-primary-foreground': '#ffffff',
            'sidebar-accent': '#eeeeee', 'sidebar-accent-foreground': '#111111',
            'sidebar-border': '#dddddd', 'sidebar-ring': '#111111',
        }
        tokens = {
            'name': 'Fixture', 'slug': 'fixture', 'mode': 'light', 'colors': colors,
            'radius': 10, 'font': {'family': 'system-ui', 'heading': 'system-ui', 'bodySize': 16, 'headingWeight': 700},
            'spacing': {'unit': 4, 'controlHeight': 44},
            'icons': {'family': 'Lucide', 'size': 20, 'stroke': 2},
            'motion': {'duration': 160, 'easing': 'ease-out'}, 'shadow': 'none', 'rationale': 'Fixture',
        }
        result = render(tokens, {'language': 'en', 'title': 'Fixture title', 'headline': 'Fixture headline',
                                 'description': 'Fixture description', 'bodyHtml': '<button>Fixture</button>'})
        self.assertIn('<span class="review-brand">grilling design system</span>', result)
        self.assertIn(f'href="{REPOSITORY}"', result)
        self.assertIn('aria-label="GitHub"', result)

    def test_gallery_template_keeps_project_name_and_github_link(self):
        source = (ASSETS / 'App.tsx').read_text()
        self.assertIn('>{tokens.name}</a>', source)
        self.assertIn(f'href="{REPOSITORY}"', source)
        self.assertIn('<Github aria-hidden="true"/>', source)
        self.assertNotIn('component-count', source)

    def test_studio_copy_remains_valid(self):
        copy = json.loads((ASSETS / 'studio-copy.json').read_text())
        self.assertIn('en', copy)


if __name__ == '__main__':
    unittest.main()

"""Output routing and scaffold protection using isolated project fixtures."""
import argparse
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from project import resolve_project
from library import build


class ProjectTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name).resolve()
        (self.root/'.git').mkdir()

    def tearDown(self):
        self.temp.cleanup()

    def web(self, root=None, framework='next', source='src'):
        root = root or self.root
        root.mkdir(parents=True, exist_ok=True)
        (root/'package.json').write_text(json.dumps({'dependencies': {framework:'1.0'},
             'packageManager':'pnpm@9.0.0', 'scripts':{'build':'next build'}}))
        (root/source).mkdir(parents=True, exist_ok=True)
        return root

    def test_four_output_scenarios(self):
        plain = resolve_project(self.root)
        self.assertEqual(plain['mode'], 'standalone')
        self.assertEqual(plain['output'], str(self.root/'design-system'))
        self.assertEqual(plain['designDoc'], str(self.root/'design-system/DESIGN.md'))
        explicit = resolve_project(self.root, Path('chosen'))
        self.assertEqual(explicit['output'], str(self.root/'chosen'))
        self.assertEqual(explicit['designDoc'], str(self.root/'chosen/DESIGN.md'))
        self.web()
        native = resolve_project(self.root)
        self.assertEqual(native['mode'], 'integrated')
        self.assertEqual(native['output'], str(self.root/'src/design-system'))
        self.assertEqual(native['designDoc'], str(self.root/'DESIGN.md'))
        self.assertEqual(native['workDir'], str(self.root/'.tmp/grilling-design-system'))
        explicit = resolve_project(self.root, Path('chosen'))
        self.assertEqual(explicit['mode'], 'integrated')
        self.assertEqual(explicit['output'], str(self.root/'chosen'))
        self.assertEqual(explicit['designDoc'], str(self.root/'DESIGN.md'))
        self.assertFalse((self.root/'chosen').exists())

    def test_nested_web_cwd_finds_application_root(self):
        self.web()
        nested = self.root/'src/pages'
        (nested/'src').mkdir(parents=True)
        (nested/'src/demo.tsx').write_text('export default null')
        result = resolve_project(nested, Path('local-output'))
        self.assertEqual(result['webRoot'], str(self.root))
        self.assertEqual(result['output'], str(nested/'local-output'))
        self.assertEqual(result['designDoc'], str(self.root/'DESIGN.md'))

    def test_non_react_and_non_src_layout(self):
        self.web(framework='nuxt', source='app')
        result = resolve_project(self.root)
        self.assertEqual(result['output'], str(self.root/'app/design-system'))
        self.assertEqual(result['packageManager'], 'pnpm@9.0.0')

    def test_backend_manifest_alone_is_not_a_web_application(self):
        (self.root/'package.json').write_text(json.dumps({'dependencies':{'express':'5'}}))
        self.assertEqual(resolve_project(self.root)['mode'], 'standalone')

    def test_monorepo_uses_owning_app_and_workspace_lock(self):
        (self.root/'package.json').write_text(json.dumps({'workspaces':['apps/*']}))
        (self.root/'pnpm-lock.yaml').write_text('lockfileVersion: 9')
        app = self.web(self.root/'apps/site')
        result = resolve_project(app/'src')
        self.assertEqual(result['webRoot'], str(app))
        self.assertEqual(result['designDoc'], str(app/'DESIGN.md'))
        self.assertIn(str(self.root/'pnpm-lock.yaml'), result['lockfiles'])
        self.assertEqual(resolve_project(self.root)['mode'], 'standalone')

    def test_custom_source_override_and_external_requested_path(self):
        self.web()
        (self.root/'custom-ui').mkdir()
        target = self.root.parent/(self.root.name+'-components')
        result = resolve_project(self.root, target, self.root, Path('custom-ui'))
        self.assertEqual(result['output'], str(target))
        self.assertEqual(result['sourceRoot'], str(self.root/'custom-ui'))
        self.assertEqual(result['designDoc'], str(self.root/'DESIGN.md'))

    def test_standalone_scaffold_refuses_host_before_mutating(self):
        self.web()
        before = (self.root/'package.json').read_bytes()
        args = argparse.Namespace(output=self.root/'src/design-system', cache=self.root/'.tmp/grilling-design-system/cache')
        with patch('library.Path.cwd', return_value=self.root):
            with self.assertRaisesRegex(ValueError, 'Existing Web project'):
                build(args)
        self.assertEqual((self.root/'package.json').read_bytes(), before)
        self.assertFalse(args.output.exists())
        self.assertFalse(args.cache.exists())

    def test_failed_fetch_leaves_standalone_output_untouched(self):
        tokens = self.root/'tokens.json'
        from test_design_document import DesignDocumentTest
        fixture = DesignDocumentTest(); fixture.setUp()
        tokens.write_text(json.dumps(fixture.tokens)); fixture.tearDown()
        output = self.root/'design-system'
        args = argparse.Namespace(output=output, cache=self.root/'cache', session=None, tokens=tokens,
                                  language='en', ui_copy=None, deliver=False, full=False, install=False, build=False)
        with patch('library.Path.cwd', return_value=self.root/'empty'), \
             patch('library.fetch', side_effect=RuntimeError('offline fixture')):
            (self.root/'empty').mkdir()
            with self.assertRaisesRegex(RuntimeError, 'offline'):
                build(args)
        self.assertFalse(output.exists())

    def test_interrupted_generator_output_is_not_mistaken_for_a_host(self):
        output = self.root/'design-system'
        output.mkdir()
        marker = output/'.tmp/grilling-design-system/standalone-owner'
        marker.parent.mkdir(parents=True)
        marker.write_text('marker')
        (output/'index.html').write_text('<div id="root"></div>')
        (output/'vite.config.ts').write_text('export default {}')
        args = argparse.Namespace(output=output, cache=self.root/'cache', session=None, tokens=None,
                                  language='en', ui_copy=None, deliver=False, full=False, install=False, build=False)
        with patch('library.Path.cwd', return_value=self.root/'empty'):
            (self.root/'empty').mkdir()
            with self.assertRaisesRegex(ValueError, 'Provide --tokens'):
                build(args)

    def test_existing_requested_application_is_detected(self):
        app = self.web(self.root/'existing')
        result = resolve_project(self.root, app)
        self.assertEqual(result['mode'], 'integrated')
        self.assertEqual(result['designDoc'], str(app/'DESIGN.md'))


if __name__ == '__main__':
    unittest.main()

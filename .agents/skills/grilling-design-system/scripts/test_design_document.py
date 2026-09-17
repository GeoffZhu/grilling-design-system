"""Document generation and completion checks without network dependencies."""
import copy
from pathlib import Path
import re
import tempfile
import unittest

from design_document import TEMPLATE, FENCE, completion_errors, document
from studio import digest
from theme import COLOR_KEYS, validate


class DesignDocumentTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.output = Path(self.temp.name)
        colors = {key: '#FFFFFF' if key.endswith('foreground') else '#222222' for key in COLOR_KEYS}
        colors.update(background='#FFFFFF', foreground='#222222', card='#FFFFFF')
        colors['card-foreground'] = '#222222'
        self.tokens = dict(name='Fixture', slug='fixture-theme', mode='light', colors=colors, radius=10,
            font=dict(family='system-ui', heading='system-ui', bodySize=16, headingWeight=700),
            spacing=dict(unit=4, controlHeight=44), icons=dict(family='Lucide', size=24, stroke=2),
            motion=dict(duration=160, easing='ease-out'), shadow='none')
        self.snapshot = dict(url='fixture registry', fetchedAt='2026-09-16', ui=['button', 'input'])
        self.state = dict(status='approved', simulation=True, approval={'tokenHash': digest(self.tokens)},
                          history=[dict(stage='foundations', action='derive', derivation='Retain selected geometry')])
        (self.output/'src/components/ui').mkdir(parents=True)
        (self.output/'src/components/ui/button.tsx').write_text('// fixture source')
        (self.output/'src/App.tsx').write_text('// fixture app')
        (self.output/'tokens.json').write_text('{}')

    def tearDown(self):
        self.temp.cleanup()

    def generate(self, state=None):
        document(self.output, self.tokens, state, self.snapshot, {'keyboard': 'Not run: no browser fixture'})
        return (self.output/'DESIGN.md').read_text()

    def test_template_sections_actual_tokens_and_paths(self):
        result = self.generate(self.state)
        self.assertEqual(re.findall(r'^## .+$', result, re.M), re.findall(r'^## .+$', TEMPLATE.read_text(), re.M))
        self.assertIn('surface: var(--card) = #FFFFFF', result)
        self.assertIn('sm: 6px; --radius-sm', result)
        self.assertIn('Button: src/components/ui/button.tsx', result)
        self.assertNotIn('Table: src/components/ui/table.tsx', result)
        self.assertIn('primary-hover: [fill here:', result)
        self.assertIn('variant="default"', result)
        self.assertIn('Not run: no browser fixture', result)
        self.assertIn('src/fixture-theme.css', result)
        self.assertIn('SIMULATED APPROVAL', result)
        self.assertTrue(completion_errors(result))

    def test_model_authored_names_are_required(self):
        missing = copy.deepcopy(self.tokens)
        del missing['slug']
        with self.assertRaisesRegex(ValueError, 'Missing token group: slug'):
            validate(missing)
        invalid = copy.deepcopy(self.tokens)
        invalid['slug'] = 'Fixed Theme.css'
        with self.assertRaisesRegex(ValueError, 'model-authored kebab-case'):
            validate(invalid)

    def test_regeneration_preserves_guidance_and_refreshes_facts(self):
        note = '# Custom guidance\n\nUse compact groups.\n\n' + FENCE + 'txt\n# Literal example\n' + FENCE
        (self.output/'design-notes.md').write_text(note)
        first = self.generate(self.state)
        self.tokens['colors']['primary'] = '#123456'
        second = self.generate()
        self.assertIn('primary: var(--primary) = #123456', second)
        self.assertNotIn('primary: var(--primary) = #123456', first)
        self.assertIn('#### Custom guidance', second)
        self.assertIn(FENCE + 'txt\n# Literal example\n' + FENCE, second)
        self.assertEqual((self.output/'design-notes.md').read_text(), note)
        self.assertIn('Retain selected geometry', first)
        self.assertIn('Status: Draft', second)

    def test_unapproved_session_is_never_labeled_approved(self):
        state = copy.deepcopy(self.state)
        state.update(status='awaiting-user', approval=None)
        self.assertIn('Status: Draft', self.generate(state))

    def test_integrated_document_uses_host_root_and_existing_source_paths(self):
        app = self.output/'host'
        library = app/'app/design-system'
        (library/'ui').mkdir(parents=True)
        (library/'ui/Button.vue').write_text('<button />')
        (library/'tokens.json').write_text('{}')
        context = {'mode':'integrated','webRoot':str(app),'output':str(library),
                   'workDir':str(app/'.tmp/grilling-design-system'),'framework':'Nuxt + Vue',
                   'styling':'Existing scoped CSS','buildInstructions':'Run pnpm build.',
                   'implementationPaths':{'UI components':'app/design-system/ui','Design tokens':'app/design-system/tokens.json'},
                   'canonicalPaths':{'Button':'app/design-system/ui/Button.vue'}}
        path = document(library,self.tokens,None,self.snapshot,{},context)
        self.assertEqual(path,(app/'DESIGN.md').resolve())
        result = path.read_text()
        self.assertIn('Framework: Nuxt + Vue',result)
        self.assertIn('Button: app/design-system/ui/Button.vue',result)
        self.assertIn('Run pnpm build.',result)
        self.assertNotIn('Run npm install',result)
        self.assertFalse((library/'DESIGN.md').exists())
        path.write_text('Existing project rules')
        draft = document(library,self.tokens,None,self.snapshot,{},context)
        self.assertEqual(draft,app/'.tmp/grilling-design-system/DESIGN.draft.md')
        self.assertEqual(path.read_text(),'Existing project rules')

    def test_completed_standalone_document_is_never_overwritten(self):
        first = self.generate(self.state)
        self.assertIn('This is a generated documentation draft.', first)
        completed = self.completed_fixture()
        (self.output/'DESIGN.md').write_text(completed)
        draft = document(self.output, self.tokens, self.state, self.snapshot, {})
        self.assertEqual(draft, self.output.resolve()/'.tmp/grilling-design-system/DESIGN.draft.md')
        self.assertEqual((self.output/'DESIGN.md').read_text(), completed)

    def completed_fixture(self):
        # A structural fixture only; this does not claim design/source validity.
        text = TEMPLATE.read_text()
        text = re.sub(r'\[[^\]]+\]', 'Fixture value', text)
        text = re.sub(r'(?m)^([^\n]+:)$', r'\1 Fixture value', text)
        return re.sub(r'(?m)^((?:Desktop|Tablet|Mobile) ->)$', r'\1 Fixture value', text)

    def test_completion_checker_rejects_blanks_missing_fields_and_placeholders(self):
        valid = self.completed_fixture()
        self.assertEqual(completion_errors(valid), [])
        for broken in [valid.replace('font-family: Fixture value', 'font-family:'),
                       valid.replace('font-family: Fixture value', ''),
                       valid.replace('### Input', '### Missing'),
                       valid.replace('## 13. Project-Specific Rules', '## 14. Rules'),
                       valid + '\n[path]\n']:
            with self.subTest(broken=broken[-50:]):
                self.assertTrue(completion_errors(broken))
        self.assertTrue(completion_errors(TEMPLATE.read_text()))


if __name__ == '__main__':
    unittest.main()

"""Unit tests for standalone gallery metadata."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from library import COMPONENT_CATEGORIES, component_title, examples_by_component, load_custom_components, main_source, registry


class LibraryGalleryTest(unittest.TestCase):
    def test_registry_uses_model_authored_artifact_name(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            (root/'src').mkdir()
            package={'dependencies':{'react':'19.1.0'}}
            tokens={'name':'Northstar Atelier','slug':'northstar-atelier'}
            with patch('library.css',return_value=':root{}'):
                registry(root,{},tokens,package,[])
            item=json.loads((root/'public/r/all.json').read_text())
            catalog=json.loads((root/'registry.json').read_text())
            self.assertEqual(catalog['name'],'northstar-atelier')
            self.assertIn('@import "./northstar-atelier.css"',item['css'])
            self.assertIn('src/northstar-atelier.css',[entry['path'] for entry in item['files']])

    def test_main_source_mounts_global_component_hosts(self):
        source = main_source({'mode': 'light'}, ['button', 'tooltip', 'sonner'])
        self.assertIn('import { Toaster } from "@/components/ui/sonner";', source)
        self.assertEqual(source.count('<Toaster />'), 1)
        self.assertIn('<TooltipProvider><App /><Toaster /></TooltipProvider>', source)

    def test_main_source_omits_unavailable_global_hosts(self):
        source = main_source({'mode': 'light'}, ['button', 'tooltip'])
        self.assertNotIn('@/components/ui/sonner', source)
        self.assertNotIn('<Toaster />', source)

    def test_component_title(self):
        self.assertEqual(component_title('alert-dialog'), 'Alert Dialog')
        self.assertEqual(component_title('input-otp'), 'Input OTP')
        self.assertEqual(component_title('kbd'), 'KBD')

    def test_representative_components_are_grouped(self):
        expected = {
            'button': 'Actions',
            'input': 'Inputs',
            'tabs': 'Navigation',
            'dialog': 'Overlays',
            'alert': 'Feedback',
            'table': 'Data display',
            'accordion': 'Layout',
            'message': 'Messaging',
            'direction': 'Utilities',
        }
        for name, category in expected.items():
            with self.subTest(name=name):
                self.assertEqual(COMPONENT_CATEGORIES[name], category)

    def test_example_ownership_prefers_longest_component_name(self):
        available = {name: {'name': name, 'type': 'registry:example'} for name in [
            'button-demo', 'button-outline', 'button-responsive', 'button-group-demo', 'input-demo', 'input-group-demo'
        ]}
        result = examples_by_component(['button', 'button-group', 'input', 'input-group'], available)
        self.assertEqual(result['button-group'], ['button-group-demo'])
        self.assertEqual(result['input-group'], ['input-group-demo'])
        self.assertEqual(result['button'], ['button-demo', 'button-outline'])

    def test_custom_component_manifest(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            source=root/'src/components/custom/metric-card.tsx'
            preview=root/'src/components/custom/metric-card.preview.tsx'
            source.parent.mkdir(parents=True)
            source.write_text('export function MetricCard() { return null }')
            preview.write_text('export default function Preview() { return null }')
            manifest={'components':[{'name':'metric-card','title':'Metric Card',
                'description':'Reference-derived metric surface.','files':['src/components/custom/metric-card.tsx'],
                'preview':{'path':'src/components/custom/metric-card.preview.tsx'},
                'dependencies':[],'registryDependencies':['card']}]}
            (root/'custom-components.json').write_text(json.dumps(manifest))
            entries=load_custom_components(root)
            self.assertEqual(entries[0]['name'],'metric-card')
            self.assertEqual(entries[0]['export'],'default')

    def test_custom_component_manifest_rejects_missing_preview(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            source=root/'src/components/custom/metric-card.tsx'
            source.parent.mkdir(parents=True)
            source.write_text('export function MetricCard() { return null }')
            manifest={'components':[{'name':'metric-card','title':'Metric Card',
                'description':'Reference-derived metric surface.','files':['src/components/custom/metric-card.tsx'],
                'preview':{'path':'src/components/custom/missing.preview.tsx'}}]}
            (root/'custom-components.json').write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError,'Missing custom component file'):
                load_custom_components(root)

    def test_custom_component_manifest_rejects_custom_category(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            source=root/'src/components/custom/metric-card.tsx'
            preview=root/'src/components/custom/metric-card.preview.tsx'
            source.parent.mkdir(parents=True)
            source.write_text('export function MetricCard() { return null }')
            preview.write_text('export default function Preview() { return null }')
            manifest={'components':[{'name':'metric-card','title':'Metric Card','category':'Image-derived',
                'description':'Reference-derived metric surface.','files':['src/components/custom/metric-card.tsx'],
                'preview':{'path':'src/components/custom/metric-card.preview.tsx'}}]}
            (root/'custom-components.json').write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError,'fixed Custom components category'):
                load_custom_components(root)


if __name__ == '__main__':
    unittest.main()

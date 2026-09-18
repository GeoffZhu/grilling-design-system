"""Unit tests for standalone gallery metadata."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from library import (COMPONENT_CATEGORIES, SOURCE_ROOT, UPSTREAM_BASE, UPSTREAM_COMMIT, component_title, examples_by_component,
                     filename, load_custom_components, local_registry_imports, main_source,
                     preserve_previous_dependencies, registry, scaffold, transform)
from theme import STATE_RULES, audit_visual_css, classify_hooks, component_css, visual_contract


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

    def test_main_source_mounts_base_ui_toast_host(self):
        source = main_source({'mode': 'light'}, ['toast'])
        self.assertIn('from "@/components/ui/toast"', source)
        self.assertIn('<App /><BaseToaster />', source)
        self.assertNotIn('TooltipProvider', source)

    def test_scaffold_uses_generated_style_name(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            scaffold(root,'en','Test','test-style')
            config=json.loads((root/'components.json').read_text())
            self.assertEqual(UPSTREAM_BASE,'base')
            self.assertRegex(UPSTREAM_COMMIT,r'^[0-9a-f]{40}$')
            self.assertIn(UPSTREAM_COMMIT,SOURCE_ROOT)
            self.assertIn('/registry/bases/base/',SOURCE_ROOT)
            self.assertEqual(config['style'],'test-style')

    def test_base_ui_source_path_and_icon_transform(self):
        self.assertEqual(filename('registry/bases/base/ui/button.tsx'),'src/components/ui/button.tsx')
        source='''"use client"
import { IconPlaceholder } from "@/app/(create)/components/icon-placeholder"
import { Button } from "@/registry/bases/base/ui/button"
export function Demo(){return <div className="p-4 style-nova:p-2 style-vega:p-6"><IconPlaceholder lucide="XIcon" tabler="IconX" className="size-4" /></div>}
'''
        result=transform(source)
        self.assertIn('import { XIcon } from "lucide-react"',result)
        self.assertIn('from "@/components/ui/button"',result)
        self.assertIn('<XIcon className="size-4" />',result)
        self.assertNotIn('IconPlaceholder',result)
        self.assertNotIn('style-nova',result)
        self.assertNotIn('style-vega',result)

    def test_local_registry_imports_find_missing_ui_dependency(self):
        item={'files':[{'content':'import { ToggleGroup } from "@/registry/bases/base/ui/toggle-group"'}]}
        self.assertEqual(local_registry_imports(item),{'toggle-group'})

    def test_unused_legacy_primitive_dependencies_are_not_preserved(self):
        current={'@base-ui/react':'latest','react':'^19'}
        previous={'radix-ui':'1.4.3','@radix-ui/react-slot':'1.2.3','react':'19.3.0','zod':'4.0.0'}
        result=preserve_previous_dependencies(current,previous)
        self.assertNotIn('radix-ui',result)
        self.assertNotIn('@radix-ui/react-slot',result)
        self.assertEqual(result['react'],'19.3.0')
        self.assertEqual(result['zod'],'4.0.0')

    def test_generated_visual_layer_styles_raw_base_hooks(self):
        styles=component_css()
        for hook in ['.cn-button','.cn-input','.cn-card','.cn-dialog-content','.cn-select-item','.cn-tabs-trigger']:
            with self.subTest(hook=hook):
                self.assertIn(hook,styles)

    def test_visual_contract_covers_every_hook_and_state(self):
        files=[[{'content':'className="cn-button cn-dialog-content data-open:opacity-100 data-highlighted:bg-accent data-disabled:opacity-50 data-starting-style:opacity-0 aria-pressed:bg-accent"'}]]
        contract=visual_contract(files)
        styles=component_css(contract['hooks'])
        self.assertEqual(contract['hooks'],['cn-button','cn-dialog-content'])
        for hook in contract['hooks']:
            self.assertIn('.'+hook+'{',styles)
        self.assertEqual(set(contract['observedStates']),{'open','highlighted','disabled','starting-style','pressed'})
        self.assertEqual(set(contract['requiredStates']),set(STATE_RULES))
        for state,markers in contract['requiredStates'].items():
            with self.subTest(state=state):
                self.assertTrue(any(marker in styles for marker in markers[0].split(',')))
                self.assertTrue(markers[1])

    def test_visual_audit_rejects_missing_visible_state(self):
        contract={'hooks':['cn-button'],'requiredStates':{'open':STATE_RULES['open']}}
        audit=audit_visual_css(contract,'.cn-button{color:red}', '.cn-button{color:red}')
        self.assertEqual(audit['missingStates'],['open'])
        self.assertEqual(audit['explicitHooks'],['cn-button'])

    def test_hook_classification_rejects_unknown_hooks(self):
        classes=classify_hooks(['cn-button','cn-mystery'],' .cn-button{color:red}')
        self.assertEqual(classes['explicitHooks'],['cn-button'])
        self.assertEqual(classes['unclassifiedHooks'],['cn-mystery'])

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
            'button-example', 'button-outline', 'button-responsive', 'button-group-example', 'input-example', 'input-group-example'
        ]}
        result = examples_by_component(['button', 'button-group', 'input', 'input-group'], available)
        self.assertEqual(result['button-group'], ['button-group-example'])
        self.assertEqual(result['input-group'], ['input-group-example'])
        self.assertEqual(result['button'], ['button-example', 'button-outline'])

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

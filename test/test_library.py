"""Unit tests for standalone gallery metadata."""
import json
from pathlib import Path
import re
import sys
import tempfile
import unittest
from unittest.mock import patch


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SKILL = REPOSITORY_ROOT / 'skills/grilling-design-system'
SCRIPTS = SKILL / 'scripts'
sys.path.insert(0, str(SCRIPTS))

from library import (COMPONENT_CATEGORIES, SOURCE_ROOT, UPSTREAM_BASE, UPSTREAM_COMMIT, component_catalog_entries,
                     component_title, examples_by_component,
                     filename, load_custom_components, local_registry_imports, main_source,
                     nonstandard_placeholder_urls, normalize_generated_sources, normalize_placeholder_images,
                     prepare_integrated_preview, preserve_previous_dependencies, registry, remote_example_image_urls,
                     scaffold, theme_example, transform)
from theme import (STATE_RULES, STRUCTURAL_REQUIREMENTS, THEME_SIGNATURE_MATRIX, audit_visual_css, button_group_css, classify_hooks, component_css,
                   input_group_composition_css,
                   semantic_hook_properties, state_css, state_selectors, theme_signature_css, truthy_data_selector, visual_contract)


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

    def test_integrated_preview_is_docs_only_not_registry_or_catalog(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            (root/'src/components/custom').mkdir(parents=True)
            (root/'src/IntegratedPreview.tsx').write_text('export default function IntegratedPreview(){return null}')
            (root/'src/components/custom/metric-card.tsx').write_text('export function MetricCard(){return null}')
            custom=[{'name':'metric-card','title':'Metric Card','description':'Metric',
                     'files':['src/components/custom/metric-card.tsx'],'preview':{'path':'src/components/custom/metric-card.tsx'},
                     'dependencies':[],'registryDependencies':[]}]
            labels={key:key for key in set(COMPONENT_CATEGORIES.values())|{'Utilities','Custom components','Visual preview, variants and interaction states for this component.'}}
            with patch('library.css',return_value=':root{}'):
                registry(root,{}, {'name':'Test','slug':'test'}, {'dependencies':{}}, custom)
            all_item=json.loads((root/'public/r/all.json').read_text())
            catalog=json.loads((root/'registry.json').read_text())
            paths={entry['path'] for entry in all_item['files']}
            entries=component_catalog_entries(['button'],custom,labels)
            self.assertNotIn('src/IntegratedPreview.tsx',paths)
            self.assertNotIn('integrated-preview',[entry['name'] for entry in entries])
            self.assertNotIn('integrated-preview',[entry['name'] for entry in catalog['items']])
            self.assertEqual([entry['name'] for entry in entries],['button','metric-card'])

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

    def test_transform_keeps_semantic_hook_when_preset_branch_is_removed(self):
        result=transform('className="cn-input-otp-slot style-nova:size-10 style-vega:border"')
        self.assertIn('cn-input-otp-slot',result)
        self.assertNotIn('style-nova:',result)
        self.assertNotIn('style-vega:',result)

    def test_transform_removes_unused_react_namespace_from_scroll_area(self):
        source='''import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
function ScrollArea(props: ScrollAreaPrimitive.Root.Props) { return <div {...props} /> }
'''
        result=transform(source)
        self.assertNotIn('import * as React from "react"',result)

    def test_placeholder_services_and_demo_photos_use_dummyimage(self):
        source='''
const mock = "https://picsum.photos/id/22/640/360"
const random = "https://source.unsplash.com/random/720x480?nature"
const legacy = "https://via.placeholder.com/300x200.png?text=Legacy"
const flickr = "https://loremflickr.com/480/320/city"
const fake = "https://fakeimg.pl/250x100/"
'''
        result=transform(source)
        for size in ['640x360','720x480','300x200','480x320','250x100']:
            with self.subTest(size=size):
                self.assertIn('https://dummyimage.com/'+size+'/000/fff',result)
        self.assertEqual(nonstandard_placeholder_urls(result),[])

    def test_html_and_jsx_image_geometry_controls_placeholder_size(self):
        source='''
<img src="https://placehold.co/900x900/png" width="640" height="360" alt="Demo" />
<Image src={'https://placeholder.com/200x200'} width={320} height={180} alt="Demo" />
<Image fill src="https://images.unsplash.com/photo-demo?w=1200&h=800" alt="Demo" />
<img className="aspect-video w-full" src="https://images.unsplash.com/photo-wide?w=800" alt="Demo" />
'''
        result=transform(source)
        self.assertIn('https://dummyimage.com/640x360/000/fff',result)
        self.assertIn('https://dummyimage.com/320x180/000/fff',result)
        self.assertIn('https://dummyimage.com/1200x800/000/fff',result)
        self.assertIn('https://dummyimage.com/800x450/000/fff',result)
        self.assertNotIn('#000',result)
        self.assertNotIn('#fff',result)

    def test_placeholder_conversion_preserves_real_and_user_resources(self):
        source='''
import heroImage from "./hero.jpg"
<img src="/images/customer-reference.png" alt="Reference" />
<Image src={heroImage} fill alt="Licensed campaign" />
<img src="https://cdn.example.com/licensed/campaign.jpg" width="800" height="600" />
<AvatarImage src="https://github.com/evilrabbit.png" />
<img src="data:image/png;base64,AAAA" />
'''
        self.assertEqual(normalize_placeholder_images(source),source)

    def test_generated_example_rewrites_all_remote_image_and_avatar_sources(self):
        source='''
<AvatarImage src="https://github.com/example.png" />
<img src="https://cdn.example.com/example-photo.jpg" width="800" height="600" />
<Image src="https://assets.example.com/hero.webp" fill className="aspect-video" />
<a href="https://example.com/docs">Docs</a>
'''
        result=transform(source,generated_example=True)
        self.assertIn('https://dummyimage.com/600x600/000/fff',result)
        self.assertIn('https://dummyimage.com/800x600/000/fff',result)
        self.assertIn('https://dummyimage.com/600x338/000/fff',result)
        self.assertIn('href="https://example.com/docs"',result)
        self.assertEqual(remote_example_image_urls(result),[])
        self.assertNotIn('github.com/example.png',result)
        self.assertNotIn('cdn.example.com/example-photo.jpg',result)

    def test_non_example_sources_preserve_user_and_licensed_remote_images(self):
        source='<AvatarImage src="https://cdn.example.com/licensed-avatar.png" /><img src="https://cdn.example.com/campaign.jpg" />'
        self.assertEqual(transform(source),source)

    def test_dummyimage_is_normalized_to_path_colors_without_hashes(self):
        result=normalize_placeholder_images('<img src="https://dummyimage.com/1024x512/abcdef/123456.png&text=Demo" />')
        self.assertEqual(result,'<img src="https://dummyimage.com/1024x512/000/fff" />')

    def test_generated_source_pass_catches_templates_and_preserves_real_assets(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            examples=root/'src/examples'
            custom=root/'src/components/custom'
            examples.mkdir(parents=True)
            custom.mkdir(parents=True)
            (examples/'gallery.tsx').write_text(
                '<Image fill src="https://images.unsplash.com/photo-demo?w=960&h=540" />'
                '<AvatarImage src="https://github.com/example.png" />')
            (custom/'promo.tsx').write_text(
                '<img src="https://placekitten.com/400/300" /><img src="/customer.png" />'
                '<img src="https://cdn.example.com/licensed.jpg" />')
            normalize_generated_sources(root)
            generated='\n'.join(path.read_text() for path in root.rglob('*.tsx'))
            self.assertIn('https://dummyimage.com/960x540/000/fff',generated)
            self.assertIn('https://dummyimage.com/600x600/000/fff',generated)
            self.assertIn('https://dummyimage.com/400x300/000/fff',generated)
            self.assertNotIn('images.unsplash.com',generated)
            self.assertNotIn('github.com/example.png',generated)
            self.assertNotIn('placekitten.com',generated)
            self.assertIn('/customer.png',generated)
            self.assertIn('https://cdn.example.com/licensed.jpg',generated)

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

    def test_progress_root_keeps_labels_and_file_upload_rows_visible(self):
        styles=''.join(component_css().split())
        root=re.search(r'\.cn-progress-root\{([^}]*)\}',styles).group(1)
        track=re.search(r'\.cn-progress-track\{([^}]*)\}',styles).group(1)
        self.assertIn('@applyflexflex-wrapgap-3;',root)
        self.assertNotIn('h-2',root)
        self.assertNotIn('overflow-hidden',root)
        self.assertIn('@applyh-2overflow-hiddenrounded-fullbg-muted;',track)

    def test_item_defaults_to_lightweight_surface_without_weakening_cards(self):
        styles=''.join(component_css().split())
        item=re.search(r'(?:^|})\.cn-item\{([^}]*)\}',styles).group(1)
        self.assertIn('shadow-none',item)
        self.assertNotIn('var(--design-shadow)',item)
        raised=re.search(r'\.cn-card,\.cn-attachment,\.cn-alert\{([^}]*)\}',styles).group(1)
        self.assertIn('shadow-[var(--design-shadow)]',raised)

    def test_progress_file_upload_example_wraps_without_squeezing_filename(self):
        source='''function FileUploadList() {
  return <Item className="px-0">
    <ItemContent className="inline-block truncate">name</ItemContent>
    <ItemContent>
      <Progress value={file.progress} className="w-32" />
    </ItemContent>
    <ItemActions className="w-16 justify-end">time</ItemActions>
  </Item>
}'''
        result=theme_example('progress-example',source)
        self.assertIn('className="min-w-0 inline-block truncate"',result)
        self.assertIn('className="order-last !flex-[0_0_100%] pl-8"',result)
        self.assertIn('className="w-full"',result)
        self.assertIn('className="w-16 shrink-0 justify-end"',result)
        self.assertNotIn('className="w-32"',result)

    def test_gallery_responds_to_preview_container_and_owns_overflow_locally(self):
        gallery=(SKILL/'assets/gallery.css').read_text()
        compact=''.join(gallery.split())
        self.assertIn('container:visual-preview/inline-size',compact)
        self.assertIn('@containervisual-preview(min-width:960px)',compact)
        self.assertIn('grid-template-columns:minmax(0,1fr)!important',compact)
        self.assertIn('grid-template-columns:repeat(2,minmax(0,1fr))!important',compact)
        self.assertIn('.demo-canvas{position:relative;min-width:0;min-height:420px;overflow-x:hidden',compact)
        self.assertIn('[data-slot=table-container]',gallery)
        self.assertIn('overflow-x:auto',gallery)
        self.assertIn('.visual-example:has(.cn-calendar)',gallery)
        self.assertIn('.visual-example-canvas:has(.cn-calendar)[data-slot=example-content]',compact)

    def test_calendar_has_readable_cells_and_card_footer_centers_content(self):
        styles=''.join(component_css().split())
        calendar=re.search(r'\.cn-calendar\{([^}]*)\}',styles).group(1)
        day=re.search(r'\.cn-calendar-day-button\{([^}]*)\}',styles).group(1)
        footer=re.search(r'\.cn-card-footer\{([^}]*)\}',styles).group(1)
        self.assertIn('--cell-size:max(2.5rem,var(--control-height))',calendar)
        self.assertIn('min-h-[var(--cell-size)]',day)
        self.assertIn('min-w-[var(--cell-size)]',day)
        self.assertIn('@applyflex',footer)
        self.assertIn('items-center',footer)
        self.assertIn('min-h-[calc(var(--control-height)+2rem)]',footer)
        self.assertIn('py-4',footer)
        self.assertNotIn('pt-4',footer)

    def test_sheet_content_stacks_above_overlay_and_gallery_chrome(self):
        styles=''.join(component_css().split())
        overlay=re.search(r'\.cn-sheet-overlay\{([^}]*)\}',styles).group(1)
        content=re.search(r'\.cn-sheet-content\{([^}]*)\}',styles).group(1)
        gallery=''.join((SKILL/'assets/gallery.css').read_text().split())
        chrome_levels=[int(value) for value in re.findall(r'z-index:(\d+)',gallery)]
        self.assertIn('position:fixed',overlay)
        self.assertIn('inset:0',overlay)
        self.assertIn('z-index:80',overlay)
        self.assertIn('position:fixed',content)
        self.assertIn('z-index:81',content)
        self.assertGreater(80,max(chrome_levels))
        self.assertGreater(81,80)
        for side in ['right','left','top','bottom']:
            self.assertIn('.cn-sheet-content[data-side="'+side+'"]',styles)

    def test_switch_uses_base_ui_checked_attributes_for_track_and_thumb(self):
        styles=''.join(component_css().split())
        checked='[data-checked]:not([data-checked="false"])'
        unchecked='[data-unchecked]:not([data-unchecked="false"])'
        self.assertIn('.cn-switch'+checked+'{background-color:var(--primary)}',styles)
        self.assertIn('.cn-switch'+unchecked+'{background-color:var(--input)}',styles)
        self.assertIn('.cn-switch'+checked+'.cn-switch-thumb{transform:translateX(calc(var(--switch-width)-var(--switch-thumb-size)-var(--switch-inset)-var(--switch-inset)));background-color:var(--primary-foreground)}',styles)
        self.assertIn('.cn-switch'+unchecked+'.cn-switch-thumb{transform:translateX(0);background-color:var(--background)}',styles)
        self.assertNotIn('[data-slot="switch-thumb"][data-state="checked"]',styles)

    def test_input_group_owns_single_frame_without_inner_control_borders(self):
        styles=''.join(component_css().split())
        compact_signature=''.join(theme_signature_css().split())
        input_rule=re.search(r'\.cn-input-group>\.cn-input-group-input\{([^}]*)\}',styles).group(1)
        textarea_rule=re.search(r'\.cn-input-group>\.cn-input-group-textarea\{([^}]*)\}',styles).group(1)
        addon_rule=re.search(r'\.cn-input-group>\.cn-input-group-addon\{([^}]*)\}',styles).group(1)
        for rule in [input_rule,textarea_rule,addon_rule]:
            self.assertIn('border:0',rule)
            self.assertIn('box-shadow:none',rule)
            self.assertIn('background:transparent',rule)
        self.assertIn('.cn-input:not(.cn-input-group-input)',compact_signature)
        self.assertIn('.cn-textarea:not(.cn-input-group-textarea)',compact_signature)
        self.assertNotIn('.cn-input,.cn-textarea,.cn-select-trigger',compact_signature)

    def test_button_group_owns_frame_and_children_share_single_separators(self):
        styles=''.join(button_group_css().split())
        frame=re.search(r'\.cn-button-group\{([^}]*)\}',styles).group(1)
        children=re.search(r'\.cn-button-group>\[data-slot\]:not\(\[data-slot="button-group-separator"\]\)\{([^}]*)\}',styles).group(1)
        horizontal=re.search(r'\.cn-button-group:not\(\[data-orientation="vertical"\]\)>\[data-slot\]\+\[data-slot\]\{([^}]*)\}',styles).group(1)
        vertical=re.search(r'\.cn-button-group\[data-orientation="vertical"\]>\[data-slot\]\+\[data-slot\]\{([^}]*)\}',styles).group(1)
        nested=re.search(r'\.cn-button-group>\.cn-button-group\{([^}]*)\}',styles).group(1)
        for value in ['border:2pxsolidvar(--border)','border-radius:var(--control-radius)','box-shadow:03px0color-mix(insrgb,var(--foreground)18%,transparent)','overflow:hidden','isolation:isolate']:
            self.assertIn(value,frame)
        for value in ['border:0','border-radius:0','box-shadow:none','margin:0']:
            self.assertIn(value,children)
        self.assertIn('border-inline-start:1pxsolidvar(--border)',horizontal)
        self.assertIn('border-block-start:1pxsolidvar(--border)',vertical)
        for value in ['border:0','border-radius:0','box-shadow:none']:
            self.assertIn(value,nested)
        supported=['button','input','select-trigger','dropdown-menu-trigger','button-group-text','input-group','button-group']
        generic_selector='.cn-button-group>[data-slot]:not([data-slot="button-group-separator"])'
        self.assertIn(generic_selector,styles)
        self.assertTrue(all(slot for slot in supported))

    def test_button_group_focus_pressed_and_explicit_separator_do_not_double_frame(self):
        styles=''.join(button_group_css().split())
        focus=re.search(r'\.cn-button-group>\[data-slot\]:focus-visible\{([^}]*)\}',styles).group(1)
        pressed=re.search(r'\.cn-button-group\.cn-button:active\{([^}]*)\}',styles).group(1)
        separator=re.search(r'\.cn-button-group>\[data-slot="button-group-separator"\]\{([^}]*)\}',styles).group(1)
        for value in ['position:relative','z-index:2','outline:2pxsolidvar(--ring)','outline-offset:-2px','box-shadow:none!important']:
            self.assertIn(value,focus)
        self.assertIn('transform:none',pressed)
        self.assertIn('box-shadow:none!important',pressed)
        for value in ['width:1px','margin:0','border:0','background:var(--border)']:
            self.assertIn(value,separator)
        self.assertIn('[data-slot="button-group-separator"]+[data-slot]{border-inline-start:0}',styles)
        self.assertIn('[data-slot="button-group-separator"]+[data-slot]{border-block-start:0}',styles)
        self.assertIn('[data-slot]+[data-slot="button-group-separator"]{border-inline-start:0}',styles)
        self.assertIn('[data-slot]+[data-slot="button-group-separator"]{border-block-start:0}',styles)
        signature=theme_signature_css()
        self.assertGreater(signature.rfind('.cn-button-group .cn-button:active'),
                           signature.rfind('.cn-button-variant-default:active'))

    def test_input_group_inline_addons_and_buttons_share_one_frame(self):
        styles=''.join(input_group_composition_css().split())
        frame=re.search(r'\.cn-input-group\{([^}]*)\}',styles).group(1)
        start=re.search(r'\.cn-input-group>\.cn-input-group-addon\[data-align="inline-start"\]\{([^}]*)\}',styles).group(1)
        end=re.search(r'\.cn-input-group>\.cn-input-group-addon\[data-align="inline-end"\]\{([^}]*)\}',styles).group(1)
        button=re.search(r'\.cn-input-group-addon\.cn-input-group-button\{([^}]*)\}',styles).group(1)
        button_addon=re.search(r'\.cn-input-group>\.cn-input-group-addon:has\(>\.cn-input-group-button\):not\(:has\(>:not\(\.cn-input-group-button\)\)\)\{([^}]*)\}',styles).group(1)
        button_fill=re.search(r'\.cn-input-group>\.cn-input-group-addon:has\(>\.cn-input-group-button\):not\(:has\(>:not\(\.cn-input-group-button\)\)\)>\.cn-input-group-button\{([^}]*)\}',styles).group(1)
        self.assertIn('overflow:hidden',frame)
        for rule,boundary in [(start,'border-inline-end:1pxsolidvar(--border)'),
                              (end,'border-inline-start:1pxsolidvar(--border)')]:
            for value in ['flex:none','min-height:var(--control-height)','gap:.5rem','padding-inline:.75rem',boundary]:
                self.assertIn(value,rule)
        for value in ['min-height:2rem','margin:0','border:0','box-shadow:none!important','padding-inline:.625rem']:
            self.assertIn(value,button)
        for value in ['align-self:stretch','padding:0']:
            self.assertIn(value,button_addon)
        for value in ['height:100%','min-height:var(--control-height)','border-radius:0','padding-inline:.875rem']:
            self.assertIn(value,button_fill)
        self.assertIn(':not(:has(>:not(.cn-input-group-button)))',styles)
        self.assertIn('.cn-input-group-addon.cn-input-group-button:active{transform:none;box-shadow:none!important}',styles)

    def test_input_group_block_addons_and_textarea_form_vertical_sections(self):
        styles=''.join(input_group_composition_css().split())
        self.assertIn('.cn-input-group{overflow:hidden}',styles)
        start=re.search(r'\.cn-input-group>\.cn-input-group-addon\[data-align="block-start"\]\{([^}]*)\}',styles).group(1)
        end=re.search(r'\.cn-input-group>\.cn-input-group-addon\[data-align="block-end"\]\{([^}]*)\}',styles).group(1)
        textarea=re.search(r'\.cn-input-group>\.cn-input-group-textarea\[data-slot="input-group-control"\]\{([^}]*)\}',styles).group(1)
        textarea_wrapper=re.search(r'\.cn-input-group:has\(>\.cn-input-group-textarea\)\{([^}]*)\}',styles).group(1)
        self.assertIn('flex-wrap:wrap',styles)
        self.assertIn('align-items:stretch',styles)
        for rule,boundary in [(start,'border-bottom:1pxsolidvar(--border)'),
                              (end,'border-top:1pxsolidvar(--border)')]:
            for value in ['flex:00100%','width:100%','min-height:2.5rem','padding:.75rem1rem',boundary]:
                self.assertIn(value,rule)
        for value in ['flex-direction:column','flex-wrap:nowrap','align-items:stretch','height:auto','min-height:7rem']:
            self.assertIn(value,textarea_wrapper)
        self.assertIn('.cn-input-group:has(>.cn-input-group-textarea):has(>.cn-input-group-addon[data-align^="block"]){flex-wrap:nowrap}',styles)
        self.assertIn('.cn-input-group:has(>.cn-input-group-textarea)>.cn-input-group-addon[data-align^="block"]{flex:00auto}',styles)
        for value in ['width:100%','min-height:5.5rem','flex:11auto','padding:1rem','line-height:1.5']:
            self.assertIn(value,textarea)

    def test_card_form_spacing_and_invalid_feedback_are_structured_and_lightweight(self):
        styles=''.join(input_group_composition_css().split())
        self.assertIn('.cn-card-content>.cn-field-group{gap:1.25rem}',styles)
        self.assertIn('.cn-card-content>form>.cn-field-group{gap:1.25rem}',styles)
        self.assertIn('.cn-card-content.cn-field{gap:.5rem}',styles)
        self.assertIn('.cn-card>.cn-card-footer{gap:.5rem}',styles)
        standalone=re.search(r'\.cn-input\[aria-invalid="true"\]\{([^}]*)\}',styles).group(1)
        wrapper=re.search(r'\.cn-input-group:has\(>\[aria-invalid="true"\]\)\{([^}]*)\}',styles).group(1)
        child=re.search(r'\.cn-input-group>\[aria-invalid="true"\]\{([^}]*)\}',styles).group(1)
        for rule in [standalone,wrapper]:
            self.assertIn('border-color:var(--destructive)',rule)
            self.assertIn('box-shadow:0002pxcolor-mix(insrgb,var(--destructive)16%,transparent)',rule)
            self.assertNotIn('3px',rule)
        for value in ['border:0','box-shadow:none!important','outline:none']:
            self.assertIn(value,child)
        self.assertIn('.cn-field[data-invalid]>.cn-field-error,.cn-field[data-invalid]>.cn-field-description{margin-top:.25rem}',styles)
        self.assertIn('.cn-input-group{overflow:hidden}',styles)
        full=''.join(component_css().split())
        self.assertIn('.cn-input-group:not(.cn-command-input-group):focus-within{border-color:var(--ring);box-shadow:',full)
        self.assertIn('.cn-input-group:has(>[aria-invalid="true"]){border-color:var(--destructive);box-shadow:',styles)
        invalid=''.join(state_css(['invalid']).split())
        self.assertNotIn('[class*="cn-"][data-invalid',invalid)
        self.assertNotIn('.cn-field[data-invalid',invalid)
        self.assertIn('.cn-input[aria-invalid="true"]',invalid)
        all_styles=''.join(component_css().split())
        self.assertNotIn('3pxcolor-mix(insrgb,var(--destructive)',all_styles)

    def test_checkbox_computed_geometry_centers_indicator_and_icon(self):
        styles=''.join(component_css().split())
        root=re.search(r'\.cn-checkbox\{([^}]*)\}',styles).group(1)
        indicator=re.search(r'\.cn-checkbox-indicator\{([^}]*)\}',styles).group(1)
        icon=re.search(r'\.cn-checkbox-indicator>svg\{([^}]*)\}',styles).group(1)
        for declaration in ['display:inline-grid','place-items:center','width:1rem','height:1rem',
                            'min-width:1rem','min-height:1rem','padding:0','line-height:0']:
            self.assertIn(declaration,root)
        for declaration in ['position:absolute','inset:0','display:grid','place-items:center',
                            'width:100%','height:100%','line-height:0','pointer-events:none']:
            self.assertIn(declaration,indicator)
        for declaration in ['display:block','width:.75rem','height:.75rem','margin:auto','flex:none']:
            self.assertIn(declaration,icon)
        theme_source=(SCRIPTS/'theme.py').read_text()
        coarse=re.search(r'@media\(pointer:coarse\)\{([^}]*)\}',theme_source).group(1)
        self.assertIn(':not([role="checkbox"])',coarse)
        self.assertNotIn('[role="checkbox"],',coarse)

    def test_command_input_uses_one_boundary_and_flexible_input(self):
        styles=''.join(component_css().split())
        wrapper=re.search(r'\.cn-command-input-wrapper\{([^}]*)\}',styles).group(1)
        group=re.search(r'\.cn-command-input-group\{([^}]*)\}',styles).group(1)
        control=re.search(r'\.cn-command-input\{([^}]*)\}',styles).group(1)
        self.assertIn('border-bottom:1pxsolidvar(--border)',wrapper)
        self.assertIn('padding:0',wrapper)
        for value in ['display:flex','align-items:center','width:100%','border:0','box-shadow:none','background:transparent']:
            self.assertIn(value,group)
        for value in ['min-width:0','height:var(--control-height)','flex:1','border:0','padding-inline:0']:
            self.assertIn(value,control)
        self.assertIn('.cn-input-group:not(.cn-command-input-group)', ''.join(theme_signature_css().split()))

    def test_navigation_and_tabs_use_actual_base_ui_boolean_states(self):
        styles=''.join(component_css().split())
        popup='[data-popup-open]:not([data-popup-open="false"])'
        active='[data-active]:not([data-active="false"])'
        self.assertIn('.cn-navigation-menu-trigger'+popup+'{background-color:var(--accent);color:var(--accent-foreground)}',styles)
        self.assertIn('.cn-navigation-menu-trigger'+popup+'.cn-navigation-menu-trigger-icon{transform:rotate(180deg)}',styles)
        active_rule=re.search(r'\.cn-tabs-trigger\[data-active\]:not\(\[data-active="false"\]\)\{([^}]*)\}',styles).group(1)
        inactive_rule=re.search(r'\.cn-tabs-trigger:not\(\[data-active\]\),\.cn-tabs-trigger\[data-active="false"\]\{([^}]*)\}',styles).group(1)
        line_rule=re.search(r'\.cn-tabs-list\[data-variant="line"\]\.cn-tabs-trigger\[data-active\]:not\(\[data-active="false"\]\)\{([^}]*)\}',styles).group(1)
        for value in ['background-color:var(--accent)','color:var(--accent-foreground)','border-color:var(--border)','box-shadow:02px0color-mix(insrgb,var(--foreground)18%,transparent)']:
            self.assertIn(value,active_rule)
        for value in ['background-color:transparent','border-color:transparent','box-shadow:none']:
            self.assertIn(value,inactive_rule)
            self.assertIn(value,line_rule)
        self.assertIn('color:var(--foreground)',line_rule)
        self.assertNotIn('sidebar-accent',active_rule)
        signature=''.join(theme_signature_css().split())
        default_selector='.cn-tabs-list:not([data-variant="line"]).cn-tabs-trigger'+active
        self.assertIn(default_selector+',.cn-toggle[data-pressed="true"]{background-color:var(--accent);color:var(--accent-foreground)}',signature)
        signature_rules=re.findall(r'([^{}]+)\{([^{}]*)\}',signature)
        tab_color_selectors=[selector for selectors,declarations in signature_rules
                             if 'color:var(--accent-foreground)' in declarations
                             for selector in selectors.split(',') if '.cn-tabs-trigger' in selector]
        self.assertTrue(tab_color_selectors)
        self.assertTrue(all(selector.startswith('.cn-tabs-list:not([data-variant="line"])')
                            for selector in tab_color_selectors),tab_color_selectors)
        # theme_signature_css is appended after the line rule, so it must not contain
        # any selector capable of recoloring line tabs to accent-foreground.
        line_rule_end=styles.index(line_rule)+len(line_rule)
        trailing_rules=re.findall(r'([^{}]+)\{([^{}]*)\}',styles[line_rule_end:])
        trailing_tab_selectors=[selector for selectors,declarations in trailing_rules
                                if 'color:' in declarations for selector in selectors.split(',')
                                if '.cn-tabs-trigger' in selector]
        self.assertTrue(all(selector.startswith('.cn-tabs-list:not([data-variant="line"])')
                            for selector in trailing_tab_selectors),trailing_tab_selectors)
        self.assertNotIn('.cn-navigation-menu-trigger[data-active',styles)

    def test_navigation_link_hover_promotes_muted_descendants(self):
        styles=''.join(component_css().split())
        link_box=re.search(r'\.cn-navigation-menu-content\.cn-navigation-menu-link\{([^}]*)\}',styles).group(1)
        self.assertIn('display:block',link_box)
        self.assertIn('width:100%',link_box)
        self.assertIn('[data-slot="navigation-menu-content"][data-slot="navigation-menu-link"]{display:block;width:100%}',styles)
        for selector in ['.cn-navigation-menu-link:hover.text-muted-foreground',
                         '.cn-navigation-menu-link:focus-visible.text-muted-foreground',
                         '.cn-navigation-menu-link[data-active]:not([data-active="false"]).text-muted-foreground']:
            self.assertIn(selector+'{color:var(--accent-foreground)!important}',styles)
        self.assertIn('[data-slot="navigation-menu-link"]:hover.text-muted-foreground{color:var(--accent-foreground)!important}',styles)

    def test_sidebar_dropdown_has_open_trigger_flat_item_and_portal_geometry(self):
        styles=''.join(component_css().split())
        trigger=re.search(r'\.cn-sidebar-inner\.cn-sidebar-menu-button\[data-popup-open\]:not\(\[data-popup-open="false"\]\)\{([^}]*)\}',styles).group(1)
        item=re.search(r'\.cn-sidebar-inner\.cn-sidebar-menu-button>\.cn-item\{([^}]*)\}',styles).group(1)
        popup=re.search(r'\.cn-sidebar-dropdown-content\{([^}]*)\}',styles).group(1)
        positioner=re.search(r'\.cn-dropdown-menu-positioner:has\(>\.cn-sidebar-dropdown-content\)\{([^}]*)\}',styles).group(1)
        for value in ['background-color:var(--sidebar-accent)!important','color:var(--sidebar-accent-foreground)!important']:
            self.assertIn(value,trigger)
        for value in ['border:0!important','background:transparent!important','box-shadow:none!important']:
            self.assertIn(value,item)
        for value in ['z-index:75!important','width:var(--anchor-width)','min-width:min(var(--anchor-width),calc(100vw-2rem))','max-width:calc(100vw-2rem)']:
            self.assertIn(value,popup)
        self.assertIn('z-index:75!important',positioner)
        self.assertIn('[data-slot="sidebar-inner"][data-slot="sidebar-menu-button"][data-popup-open]:not([data-popup-open="false"])',styles)
        self.assertIn('[data-slot="dropdown-menu-positioner"]:has(>[data-slot="dropdown-menu-content"].cn-sidebar-dropdown-content){z-index:75!important}',styles)
        gallery=''.join((SKILL/'assets/gallery.css').read_text().split())
        self.assertIn('.visual-example-canvas:has(.cn-navigation-menu),.visual-example-canvas:has(.cn-sidebar-menu-button){overflow:visible}',gallery)
        self.assertIn('.visual-example-canvas:has(.cn-sidebar-inner)[data-slot=example-content]{overflow:visible}',gallery)

    def test_sidebar_example_marks_portaled_dropdown_and_source_has_positioner_hook(self):
        source='''function DropdownMenuContent(){return <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"><MenuPrimitive.Popup /></MenuPrimitive.Positioner>}'''
        transformed=transform(source)
        self.assertIn('data-slot="dropdown-menu-positioner"',transformed)
        self.assertIn('className="cn-dropdown-menu-positioner isolate z-50 outline-none"',transformed)
        sidebar='''<Sidebar><DropdownMenuContent><span>One</span></DropdownMenuContent><DropdownMenuContent><span>Two</span></DropdownMenuContent></Sidebar>'''
        themed=theme_example('sidebar-example',sidebar)
        self.assertEqual(themed.count('cn-sidebar-dropdown-content'),1)
        self.assertIn('<DropdownMenuContent className="cn-sidebar-dropdown-content">',themed)

    def test_dialog_close_is_positioned_and_visibly_interactive(self):
        styles=''.join(component_css().split())
        close=re.search(r'\.cn-dialog-close\{([^}]*)\}',styles).group(1)
        icon=re.search(r'\.cn-dialog-close>svg\{([^}]*)\}',styles).group(1)
        for value in ['position:absolute','top:1rem','right:1rem','z-index:1','display:inline-grid','place-items:center']:
            self.assertIn(value,close)
        self.assertIn('width:1rem',icon)
        self.assertIn('height:1rem',icon)
        self.assertIn('.cn-dialog-close:hover{border-color:var(--border);background-color:var(--accent);color:var(--accent-foreground)}',styles)
        self.assertIn('.cn-dialog-content:has(>.cn-dialog-close){padding-inline-end:3.5rem}',styles)

    def test_alert_leading_area_avatar_scale_and_message_spacing(self):
        styles=''.join(component_css().split())
        alert=re.search(r'\.cn-alert\{([^}]*)\}',styles).group(1)
        leading=re.search(r'\.cn-alert:has\(>svg\)\{([^}]*)\}',styles).group(1)
        icon=re.search(r'\.cn-alert>svg\{([^}]*)\}',styles).group(1)
        avatar=re.search(r'\.cn-avatar\{([^}]*)\}',styles).group(1)
        messages=re.search(r'\.cn-message-scroller-content\{([^}]*)\}',styles).group(1)
        self.assertIn('grid-template-columns:minmax(0,1fr)auto',alert)
        self.assertIn('grid-template-columns:autominmax(0,1fr)auto',leading)
        for value in ['grid-column:1','grid-row:1/span2','align-self:start','width:1.125rem']:
            self.assertIn(value,icon)
        self.assertIn('.cn-alert:has(>[data-slot="alert-leading"])',styles)
        leading_slot=re.search(r'\.cn-alert>\[data-slot="alert\-leading"\]\{([^}]*)\}',styles).group(1)
        for value in ['grid-column:1','grid-row:1/span2','align-self:start','display:grid','place-items:center','min-width:1.125rem']:
            self.assertIn(value,leading_slot)
        for value in ['width:2.5rem','height:2.5rem','aspect-ratio:1','overflow:hidden']:
            self.assertIn(value,avatar)
        self.assertIn('.cn-avatar[data-size="sm"]{width:2rem;height:2rem}',styles)
        self.assertIn('.cn-avatar[data-size="lg"]{width:3rem;height:3rem}',styles)
        self.assertIn('gap:.75rem',messages)
        self.assertIn('padding-block:.5rem',messages)
        gallery=''.join((SKILL/'assets/gallery.css').read_text().split())
        self.assertIn('.visual-example-canvas:has(.cn-avatar)[data-slot=example-content]{min-height:180px}',gallery)

    def test_collapsible_trigger_pairs_background_and_foreground_for_all_states(self):
        styles=''.join(component_css().split())
        states=[
            '.cn-button[data-slot="collapsible-trigger"]:hover',
            '.cn-button[data-slot="collapsible-trigger"]:focus-visible',
            '.cn-button[data-slot="collapsible-trigger"][data-panel-open]:not([data-panel-open="false"])',
        ]
        for selector in states:
            with self.subTest(selector=selector):
                rule=re.search(re.escape(selector)+r'\{([^}]*)\}',styles).group(1)
                self.assertIn('background-color:var(--muted)!important',rule)
                self.assertIn('color:var(--foreground)!important',rule)
        for suffix in [':hover',':focus-visible','[data-panel-open]:not([data-panel-open="false"])']:
            self.assertIn('.cn-button[data-slot="collapsible-trigger"]'+suffix+'.text-muted-foreground{color:var(--foreground)!important}',styles)
            self.assertIn('.cn-button[data-slot="collapsible-trigger"]'+suffix+'svg{color:var(--foreground)!important;stroke:currentColor}',styles)
        self.assertIn('[data-panel-open]:not([data-panel-open="false"])>svg:first-of-type{transform:rotate(90deg)}',styles)

    def test_collapsible_example_uses_base_ui_open_state_and_no_fixed_accent_hover(self):
        source='''<Button className="group w-full hover:bg-accent hover:text-accent-foreground" />
<Chevron className="transition-transform group-data-[state=open]:rotate-90" />'''
        result=theme_example('collapsible-example',source)
        self.assertNotIn('hover:bg-accent',result)
        self.assertNotIn('hover:text-accent-foreground',result)
        self.assertIn('group-data-[panel-open]:rotate-90',result)
        self.assertNotIn('group-data-[state=open]',result)

    def test_overview_places_integrated_preview_before_component_directory(self):
        app=(SKILL/'assets/App.tsx').read_text()
        preview=app.index('data-slot="integrated-preview"')
        directory=app.index('className="component-directory"')
        self.assertLess(preview,directory)
        self.assertIn("import IntegratedPreview from './IntegratedPreview'",app)

    def test_delivery_rejects_unfinished_or_hidden_integrated_preview(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            prepare_integrated_preview(root)
            self.assertTrue((root/'src/IntegratedPreview.tsx').is_file())
            with self.assertRaisesRegex(ValueError,'confirmed Key Visual'):
                prepare_integrated_preview(root,require_authored=True)
            preview=root/'src/IntegratedPreview.tsx'
            preview.write_text('import { Button } from "@/components/ui/button"; export default function IntegratedPreview(){return <Button>Key visual</Button>}')
            (root/'src/App.tsx').write_text('<section className="component-directory"/><section data-slot="integrated-preview"/>')
            with self.assertRaisesRegex(ValueError,'before the component directory'):
                prepare_integrated_preview(root,require_authored=True)
            (root/'src/App.tsx').write_text('<section data-slot="integrated-preview"/><section className="component-directory"/>')
            prepare_integrated_preview(root,require_authored=True)

    def test_delivery_rejects_integrated_preview_that_does_not_use_library_components(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            (root/'src').mkdir(parents=True)
            (root/'src/IntegratedPreview.tsx').write_text('export default function IntegratedPreview(){return <main>Key visual</main>}')
            (root/'src/App.tsx').write_text('<section data-slot="integrated-preview"/><section className="component-directory"/>')
            with self.assertRaisesRegex(ValueError,'delivered components'):
                prepare_integrated_preview(root,require_authored=True)

    def test_example_wrapper_drops_viewport_two_column_breakpoint(self):
        source='<div data-slot="example-wrapper" className="grid min-h-screen md:grid-cols-2 gap-8" />'
        result=theme_example('example',source)
        self.assertNotIn('md:grid-cols-2',result)
        self.assertNotIn('min-h-screen',result)
        self.assertIn('min-h-0',result)

    def test_theme_signature_matrix_covers_representative_families(self):
        required={'actions','inputs','selection','navigation','data-display','overlays','feedback'}
        self.assertEqual(set(THEME_SIGNATURE_MATRIX),required)
        for family,facets in THEME_SIGNATURE_MATRIX.items():
            with self.subTest(family=family):
                self.assertEqual(set(facets),{'depth','color','state'})
                self.assertTrue(all(facets.values()))
        signatures=theme_signature_css()
        for hook in ['cn-button','cn-input','cn-checkbox','cn-tabs','cn-card','cn-item','cn-table-container',
                     'cn-dialog-content','cn-dropdown-menu-content','cn-alert','cn-toast','cn-progress-track']:
            with self.subTest(hook=hook):
                self.assertIn(hook,signatures)
        item_rule=re.search(r'\.cn-item\{([^}]*)\}',signatures).group(1)
        self.assertIn('box-shadow:none',item_rule)
        self.assertNotIn('var(--design-shadow)',item_rule)
        self.assertIn('background-color:var(--accent)',signatures)
        self.assertIn('color:var(--accent-foreground)',signatures)
        self.assertNotIn('background-color:var(--sidebar-accent)',signatures)
        self.assertIn('border-inline-start:6px solid var(--secondary)',signatures)
        self.assertIn('border-inline-start:6px solid var(--accent)',signatures)

    def test_table_container_owns_horizontal_overflow(self):
        styles=''.join(component_css().split())
        table=re.search(r'\.cn-table-container\{([^}]*)\}',styles).group(1)
        self.assertIn('overflow-x-auto',table)
        self.assertIn('max-w-full',table)

    def test_semantic_hook_inference_does_not_guess_layout_from_names(self):
        risky_hooks=['cn-command-item','cn-input-otp-input','cn-input-otp-caret',
                     'cn-native-select-icon','cn-command-separator']
        destructive=('cursor:','width:','height:','background-color:','border-radius:')
        for hook in risky_hooks:
            with self.subTest(hook=hook):
                declarations=';'.join(semantic_hook_properties(hook))
                self.assertFalse(any(prop in declarations for prop in destructive), declarations)

    def test_boolean_state_rules_exclude_explicit_false(self):
        styles=component_css()
        self.assertIn('.cn-command-item[data-selected="true"]',styles)
        self.assertIn('.cn-tabs-trigger[data-active]:not([data-active="false"])',styles)
        self.assertNotIn('[class*="cn-"][data-selected]{',styles)
        self.assertNotIn('[class*="cn-"][data-active]{',styles)
        for attribute in ['disabled','invalid','open','highlighted','expanded','loading']:
            with self.subTest(attribute=attribute):
                self.assertNotIn('[class*="cn-"][data-'+attribute+']{',styles)
                self.assertIn('[data-'+attribute+'="false"]',styles)

    def test_invalid_state_only_targets_frame_owning_controls(self):
        invalid=state_css(['invalid'])
        compact=''.join(invalid.split())
        self.assertNotIn('[class*="cn-"]',invalid)
        for non_frame in ['.cn-field[data-invalid','.cn-field-group[data-invalid',
                          '.cn-field-description[data-invalid','.cn-field-error[data-invalid']:
            self.assertNotIn(non_frame,compact)
        for frame in ['.cn-button','.cn-input','.cn-textarea','.cn-select-trigger',
                      '.cn-native-select','.cn-checkbox','.cn-radio-group-item',
                      '.cn-switch','.cn-input-otp-slot','.cn-input-group']:
            self.assertIn(frame,invalid)
        self.assertIn('box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)',invalid)

    def test_base_ui_active_selector_accepts_empty_and_true_but_rejects_false(self):
        selector=truthy_data_selector('active')
        self.assertEqual(selector,'[data-active]:not([data-active="false"])')
        # In CSS, presence matches both data-active="" and data-active="true";
        # the negation excludes the explicitly reflected false value.
        for value,expected in [('',True),('true',True),('false',False)]:
            matches=value!='false'
            self.assertEqual(matches,expected,value)
        active=''.join(state_css(['active']).split())
        signature=''.join(theme_signature_css().split())
        self.assertIn('.cn-tabs-trigger'+selector,active)
        self.assertIn('.cn-tabs-trigger'+selector,signature)
        self.assertNotIn('.cn-tabs-trigger[data-active="true"]',signature)

    def test_command_input_expanded_state_does_not_receive_accent_paint(self):
        expanded=state_css(['expanded'])
        self.assertIn('.cn-command-item[data-selected="true"]',component_css())
        self.assertNotIn('.cn-command-input',expanded)
        self.assertNotIn('background-color:',expanded)
        self.assertNotIn('color:',expanded)
        self.assertNotIn('[class*="cn-"][aria-expanded="true"]{background',component_css())

    def test_critical_components_have_explicit_geometry_and_states(self):
        styles=''.join(component_css().split())
        expected=[
            '.cn-command-item{display:flex;align-items:center;',
            'line-height:1.25rem;cursor:default',
            '.cn-command-item[data-selected="true"]{background-color:var(--accent);',
            '.cn-input-otp-slot{position:relative;display:flex;align-items:center;justify-content:center;width:var(--control-height);height:var(--control-height);border:1pxsolidvar(--input);',
            '.cn-input-otp-slot+.cn-input-otp-slot{margin-inline-start:-1px}',
            '.cn-input-otp-slot[data-active="true"]{z-index:1;border-color:var(--ring);',
            '.cn-input-otp:has(.cn-input-otp-input[aria-invalid="true"]).cn-input-otp-slot{border-color:var(--destructive)',
            '.cn-input-otp-caret-line{width:1px;height:1.25rem;',
            '.cn-native-select{width:100%;height:var(--control-height);appearance:none;',
            'padding-inline-end:calc(var(--control-padding)+var(--icon-size));',
            '.cn-native-select[data-size="sm"]{height:2rem;',
            '.cn-native-select-icon{position:absolute;right:var(--control-padding);top:50%;',
        ]
        for fragment in expected:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment,styles)

    def test_visual_contract_covers_every_hook_and_state(self):
        files=[[{'content':'className="cn-button cn-dialog-content data-open:opacity-100 data-highlighted:bg-accent data-disabled:opacity-50 data-starting-style:opacity-0 aria-pressed:bg-accent"'}]]
        contract=visual_contract(files)
        styles=component_css(contract['hooks'])
        self.assertEqual(contract['hooks'],['cn-button','cn-dialog-content'])
        audit=audit_visual_css(contract,styles,component_css([]))
        self.assertEqual(audit['missingHooks'],[])
        self.assertEqual(audit['unclassifiedHooks'],[])
        self.assertEqual(set(contract['observedStates']),{'open','highlighted','disabled','starting-style','pressed'})
        self.assertEqual(set(contract['requiredStates']),set(STATE_RULES))
        for state,markers in contract['requiredStates'].items():
            with self.subTest(state=state):
                self.assertTrue(any(marker in styles for marker in state_selectors(state)))
                self.assertTrue(markers[1])

    def test_visual_audit_rejects_missing_visible_state(self):
        contract={'hooks':['cn-button'],'requiredStates':{'open':STATE_RULES['open']}}
        audit=audit_visual_css(contract,'.cn-button{color:red}', '.cn-button{color:red}')
        self.assertEqual(audit['missingStates'],['open'])
        self.assertEqual(audit['explicitHooks'],['cn-button'])

    def test_visual_audit_rejects_missing_critical_structure(self):
        hooks=['cn-command-item','cn-input-otp','cn-input-otp-slot','cn-input-otp-caret-line',
               'cn-native-select','cn-native-select-icon']
        contract={'hooks':hooks,'requiredStates':{}}
        styles=component_css(hooks)
        audit=audit_visual_css(contract,styles,component_css([]))
        self.assertEqual(audit['missingStructures'],[])
        broken=styles.replace('display:flex;align-items:center;gap:var(--icon-gap);','display:block;')
        audit=audit_visual_css(contract,broken,component_css([]))
        self.assertIn('command-item-layout',audit['missingStructures'])

    def test_visual_audit_enforces_sheet_switch_and_input_group_structure(self):
        hooks=['cn-sheet-overlay','cn-sheet-content','cn-switch','cn-switch-thumb',
               'cn-input-group','cn-input-group-input','cn-input-group-textarea','cn-input-group-addon']
        contract={'hooks':hooks,'requiredStates':{}}
        styles=component_css(hooks)
        audit=audit_visual_css(contract,styles,component_css([]))
        self.assertEqual(audit['missingStructures'],[])
        for fragment,requirement in [
            ('z-index:81','sheet-content-layer'),
            ('transform:translateX(calc(var(--switch-width) - var(--switch-thumb-size) - var(--switch-inset) - var(--switch-inset)))','switch-checked-thumb'),
            ('box-shadow:none','input-group-control-frame'),
        ]:
            with self.subTest(requirement=requirement):
                broken=styles.replace(fragment,'')
                self.assertIn(requirement,audit_visual_css(contract,broken,component_css([]))['missingStructures'])

    def test_visual_audit_enforces_navigation_and_compound_component_repairs(self):
        hooks=['cn-command-input-wrapper','cn-command-input-group','cn-command-input',
               'cn-navigation-menu-trigger','cn-navigation-menu-trigger-icon','cn-navigation-menu-content','cn-navigation-menu-link','cn-sidebar-inner',
               'cn-sidebar-menu-button','cn-item','cn-sidebar-dropdown-content','cn-dropdown-menu-positioner','cn-tabs-list','cn-tabs-trigger','cn-dialog-close',
               'cn-alert','cn-avatar','cn-message-scroller-content']
        contract={'hooks':hooks,'requiredStates':{}}
        styles=component_css(hooks)
        self.assertEqual(audit_visual_css(contract,styles,component_css([]))['missingStructures'],[])
        repairs=[
            ('border-bottom:1px solid var(--border)','command-input-boundary'),
            ('background-color:var(--accent);color:var(--accent-foreground)','navigation-open-state'),
            ('.cn-navigation-menu-link:hover .text-muted-foreground{color:var(--accent-foreground)!important}','navigation-link-descendant-hover'),
            ('.cn-navigation-menu-content .cn-navigation-menu-link{display:block;width:100%}','navigation-content-link-box'),
            ('background-color:var(--sidebar-accent)!important;color:var(--sidebar-accent-foreground)!important','sidebar-dropdown-trigger'),
            ('border:0!important;background:transparent!important;box-shadow:none!important','sidebar-dropdown-item-reset'),
            ('.cn-sidebar-dropdown-content{z-index:75!important;width:var(--anchor-width)','sidebar-dropdown-content'),
            ('.cn-dropdown-menu-positioner:has(>.cn-sidebar-dropdown-content){z-index:75!important}','sidebar-dropdown-positioner'),
            ('background-color:var(--accent);border-color:var(--border);color:var(--accent-foreground);box-shadow:0 2px 0 color-mix(in srgb,var(--foreground) 18%,transparent)','tabs-active-state'),
            ('.cn-tabs-trigger[data-active="false"]{background-color:transparent;border-color:transparent;color:var(--muted-foreground);box-shadow:none}','tabs-inactive-state'),
            ('background-color:transparent;border-color:transparent;color:var(--foreground);box-shadow:none','tabs-line-active-state'),
            ('color:var(--foreground)','tabs-line-active-color'),
            ('position:absolute;top:1rem;right:1rem','dialog-close-position'),
            ('grid-template-columns:auto minmax(0,1fr) auto','alert-leading-layout'),
            ('.cn-avatar[data-size="default"]{width:2.5rem;height:2.5rem;aspect-ratio:1}','avatar-default-size'),
            ('gap:.75rem;padding-block:.5rem','message-scroller-spacing'),
        ]
        for fragment,requirement in repairs:
            with self.subTest(requirement=requirement):
                broken=styles.replace(fragment,'')
                self.assertIn(requirement,audit_visual_css(contract,broken,component_css([]))['missingStructures'])

    def test_visual_audit_enforces_collapsible_contrast_contract(self):
        hooks=['cn-button']
        contract={'hooks':hooks,'requiredStates':{}}
        styles=component_css(hooks)
        self.assertEqual(audit_visual_css(contract,styles,component_css([]))['missingStructures'],[])
        for requirement in ['collapsible-trigger-hover','collapsible-trigger-focus','collapsible-trigger-open',
                            'collapsible-trigger-muted-hover','collapsible-trigger-icon-hover']:
            with self.subTest(requirement=requirement):
                selector=''.join(STRUCTURAL_REQUIREMENTS[requirement][0].split())
                compact=''.join(styles.split())
                broken=re.sub(r'\.'+re.escape(selector)+r'\{[^}]*\}','',compact)
                self.assertNotEqual(broken,compact,selector)
                self.assertIn(requirement,audit_visual_css(contract,broken,component_css([]))['missingStructures'])

    def test_visual_audit_enforces_button_group_single_frame_contract(self):
        hooks=['cn-button-group','cn-button-group-separator','cn-button-group-text','cn-button']
        contract={'hooks':hooks,'requiredStates':{}}
        styles=component_css(hooks)
        self.assertEqual(audit_visual_css(contract,styles,component_css([]))['missingStructures'],[])
        repairs=[
            ('box-shadow:0 3px 0 color-mix(in srgb,var(--foreground) 18%,transparent)','button-group-frame'),
            ('margin:0;border:0;border-radius:0;box-shadow:none','button-group-child-reset'),
            ('border-inline-start:1px solid var(--border)','button-group-horizontal-separator'),
            ('border-block-start:1px solid var(--border)','button-group-vertical-separator'),
            ('outline:2px solid var(--ring)','button-group-focus'),
            ('transform:none;box-shadow:none!important','button-group-pressed'),
        ]
        for fragment,requirement in repairs:
            with self.subTest(requirement=requirement):
                broken=styles.replace(fragment,'')
                self.assertIn(requirement,audit_visual_css(contract,broken,component_css([]))['missingStructures'])

    def test_visual_audit_enforces_input_group_composition_and_invalid_contract(self):
        hooks=['cn-input-group','cn-input-group-addon','cn-input-group-button','cn-input-group-textarea',
               'cn-input','cn-card','cn-card-content','cn-field-group','cn-card-footer']
        contract={'hooks':hooks,'requiredStates':{}}
        styles=component_css(hooks)
        self.assertEqual(audit_visual_css(contract,styles,component_css([]))['missingStructures'],[])
        repairs=[
            ('overflow:hidden','input-group-frame-clipping'),
            ('border-inline-end:1px solid var(--border)','input-group-inline-addon'),
            ('border-inline-start:1px solid var(--border)','input-group-inline-end-addon'),
            ('box-shadow:none!important','input-group-button-reset'),
            ('align-self:stretch;padding:0','input-group-button-addon'),
            ('height:100%;min-height:var(--control-height)','input-group-button-fill'),
            ('flex-wrap:wrap;align-items:stretch','input-group-block-layout'),
            ('border-bottom:1px solid var(--border)','input-group-block-addon'),
            ('border-top:1px solid var(--border)','input-group-block-end-addon'),
            ('flex-direction:column;align-items:stretch;height:auto;min-height:7rem','input-group-textarea-wrapper'),
            ('min-height:5.5rem','input-group-textarea-layout'),
            ('box-shadow:0 0 0 2px color-mix(in srgb,var(--destructive) 16%,transparent)','input-group-invalid-frame'),
            ('box-shadow:none!important','input-group-invalid-control-reset'),
            ('gap:1.25rem','card-field-spacing'),
            ('gap:.5rem','card-footer-spacing'),
        ]
        compact_styles=''.join(styles.split())
        for fragment,requirement in repairs:
            with self.subTest(requirement=requirement):
                selector=''.join(STRUCTURAL_REQUIREMENTS[requirement][0].split())
                broken=re.sub(r'\.'+re.escape(selector)+r'\{[^}]*\}','',compact_styles)
                self.assertNotEqual(broken,compact_styles,selector)
                self.assertIn(requirement,audit_visual_css(contract,broken,component_css([]))['missingStructures'])

    def test_hook_classification_rejects_unknown_hooks(self):
        classes=classify_hooks(['cn-button','cn-mystery'],' .cn-button{color:red}')
        self.assertEqual(classes['explicitHooks'],['cn-button'])
        self.assertEqual(classes['unclassifiedHooks'],['cn-mystery'])

    def test_representative_base_ui_hooks_are_classified_and_audited(self):
        hooks=['cn-avatar-badge','cn-chart-tooltip','cn-combobox-chips',
               'cn-context-menu-subcontent','cn-sidebar-menu-badge',
               'cn-command-item','cn-input-otp','cn-input-otp-input',
               'cn-input-otp-slot','cn-input-otp-caret-line',
               'cn-native-select','cn-native-select-icon']
        files=[[{'content':'className="'+' '.join(hooks)+'"'}]]
        contract=visual_contract(files)
        styles=component_css(contract['hooks'])
        audit=audit_visual_css(contract,styles,component_css([]))
        self.assertEqual(contract['hooks'],sorted(hooks))
        self.assertEqual(audit['unclassifiedHooks'],[])
        self.assertEqual(audit['missingHooks'],[])
        self.assertEqual(audit['missingStates'],[])
        self.assertEqual(audit['missingStructures'],[])

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

    def test_custom_component_manifest_rejects_integrated_preview(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            source=root/'src/components/custom/integrated-preview.tsx'
            source.parent.mkdir(parents=True)
            source.write_text('export default function IntegratedPreview(){return null}')
            manifest={'components':[{'name':'integrated-preview','title':'Integrated Preview','description':'Docs composition',
                'files':['src/components/custom/integrated-preview.tsx'],
                'preview':{'path':'src/components/custom/integrated-preview.tsx'}}]}
            (root/'custom-components.json').write_text(json.dumps(manifest))
            with self.assertRaisesRegex(ValueError,'reserved for the docs-only gallery composition'):
                load_custom_components(root)

    def test_component_catalog_rejects_docs_only_name(self):
        labels={key:key for key in set(COMPONENT_CATEGORIES.values())|{'Utilities','Custom components','Visual preview, variants and interaction states for this component.'}}
        with self.assertRaisesRegex(ValueError,'Docs-only component names'):
            component_catalog_entries(['button','integrated-preview'],[],labels)


if __name__ == '__main__':
    unittest.main()

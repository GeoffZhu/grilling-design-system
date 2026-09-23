import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { build, load_custom_components, parse_args, component_catalog_entries } from '../skills/grilling-design-system/scripts/library.js';
import { product_context, required_custom, validate_custom_coverage, assert_same_product, assert_target_build } from '../skills/grilling-design-system/scripts/product.js';
import { custom_source_snapshot, validate_source_snapshot } from '../skills/grilling-design-system/scripts/source_snapshot.js';
import { foundation_css } from '../skills/grilling-design-system/scripts/theme.js';
import { render } from '../skills/grilling-design-system/scripts/board.js';
import { init, read } from '../skills/grilling-design-system/scripts/studio.js';
import { marketingFixture, tokens } from './fixtures/marketing.js';

function temporary(t) { const root=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'grilling-product-'))); t.after(()=>fs.rmSync(root,{recursive:true,force:true})); return root; }
async function setup(t, fixture=true) {
  const root=temporary(t), output=path.join(root,'library');
  const context={mode:'standalone',output,workDir:path.join(output,'.tmp/grilling-design-system'),productType:'marketing',taskType:'new',includeMarketingHomepage:false,targetPaths:[]};
  const contextPath=path.join(root,'context.json'),tokenPath=path.join(root,'tokens.json');
  fs.writeFileSync(contextPath,JSON.stringify(context));fs.writeFileSync(tokenPath,JSON.stringify(tokens()));
  t.mock.method(process,'cwd',()=>root);
  t.mock.method(globalThis,'fetch',()=>{throw new Error('Upstream download forbidden')});
  const draftArgs = {output,context:contextPath,tokens:tokenPath,language:'en'};
  if(fixture) { await build(draftArgs); marketingFixture(output); }
  return {root,output,context,args:{output,context:contextPath,tokens:tokenPath,language:'en',full:fixture}};
}

test('context defaults, CLI and homepage coverage',()=>{
  assert.equal(product_context().productType,'saas');
  assert.equal(parse_args(['--context','context.json']).context,'context.json');
  assert.equal(required_custom({}).length,0);
  assert.deepEqual(required_custom({includeMarketingHomepage:true}),required_custom({productType:'marketing'}).map(n=>'marketing-'+n));
  assert.throws(()=>validate_custom_coverage([], {productType:'marketing'},true),/Missing required/);
  assert.throws(()=>product_context({productType:'marketing',includeMarketingHomepage:true}),/only to SaaS/);
  assert.throws(()=>product_context({taskType:'optimize'}),/Optimization requires/);
  assert.throws(()=>assert_same_product({productType:'marketing'},{}),/Product context changed/);
  const names=required_custom({includeMarketingHomepage:true});
  validate_custom_coverage(names,{includeMarketingHomepage:true},true);
  const catalog=component_catalog_entries(['button','card','select'],names.map(name=>({name,title:name,description:name})),{});
  assert.equal(new Set(catalog.map(e=>e.name)).size,catalog.length);
});

test('marketing full generation has no upstream, registry or shadcn visual layer',async t=>{
  const {output,args}=await setup(t);
  const result=await build(args);
  assert.equal(result.components,9);assert.equal(result.officialComponents,0);
  const snapshot=read(path.join(output,'source-snapshot.json'));
  assert.equal(snapshot.custom.length,9);validate_source_snapshot(output,snapshot);
  assert.ok(!Object.keys(snapshot.files).some(file=>file.includes('preview')||file.includes('Gallery')));
  assert.ok(snapshot.files['src/components/custom/brand.css']);
  for(const file of ['components.json','registry.json','shadcn-snapshot.json','SHADCN-LICENSE.txt','src/components/ui'])assert.equal(fs.existsSync(path.join(output,file)),false,file);
  const pkg=read(path.join(output,'package.json'));
  assert.equal(pkg.dependencies.shadcn,undefined);assert.equal(pkg.dependencies['@base-ui/react'],undefined);
  const css=fs.readFileSync(path.join(output,'src/index.css'),'utf8');assert.ok(!css.includes('cn-'));assert.ok(!css.includes('shadcn'));
  const doc=fs.readFileSync(result.designDocument,'utf8');assert.match(doc,/Product type: Marketing site/);assert.match(doc,/Component library: Custom marketing/);assert.doesNotMatch(doc,/npx shadcn|Modal maps to Dialog|undefined; fetched/);
  assert.equal((doc.match(/^## \d+\./gm)||[]).length,13);
  assert.match(doc,/Dialog: Not applicable/);
  // Regeneration resumes the durable product profile even when --context is omitted.
  await build({...args,context:undefined});
  fs.writeFileSync(path.join(output,'src/components/custom/card.tsx'),'export const Card=()=>null');
  assert.throws(()=>validate_source_snapshot(output,snapshot),/stale/);
});

test('draft allows empty inventory but full and deliver do not',async t=>{
  const {output,args}=await setup(t,false);await build(args);
  assert.match(fs.readFileSync(path.join(output,'src/IntegratedPreview.tsx'),'utf8'),/PLACEHOLDER/);
  await assert.rejects(()=>build({...args,full:true}),/Missing required custom/);
  await assert.rejects(()=>build({...args,deliver:true}),/explicit approval/);
});

test('marketing snapshots reject broken and docs-only imports',async t=>{
  const {output,args}=await setup(t);await build(args);
  const file=path.join(output,'src/components/custom/card.tsx'),entries=load_custom_components(output);
  fs.writeFileSync(file,'import "./missing.css"; export const Card=()=>null');
  assert.throws(()=>custom_source_snapshot(output,entries,{react:'19',tailwindcss:'4'}),/Missing custom source/);
  fs.writeFileSync(file,'import "../../IntegratedPreview"; export const Card=()=>null');
  assert.throws(()=>custom_source_snapshot(output,entries,{react:'19',tailwindcss:'4'}),/docs-only/);
});

test('marketing boards use foundations without SaaS component rules',()=>{
  assert.ok(!foundation_css(tokens()).includes('.cn-'));
  const html=render(tokens(),{productType:'marketing',language:'en',title:'Choice',headline:'Corners',description:'Compare',bodyHtml:'<button>CTA</button>',css:'button{border-radius:8px}'});
  assert.ok(!html.includes('.cn-'));assert.ok(html.includes('antialiased'));
});

test('session stores product context and optimization targets must be built',t=>{
  const root=temporary(t),target=path.join(root,'settings.vue');fs.writeFileSync(target,'<template>Settings</template>');
  const context={mode:'integrated',webRoot:root,output:path.join(root,'design-system'),productType:'saas',taskType:'optimize',includeMarketingHomepage:false,targetPaths:['settings.vue']};
  const session=path.join(root,'.tmp/grilling-design-system/session'),image=path.join(root,'reference.png');fs.writeFileSync(image,'fixture');
  init(session,image,'Revision',true,'en',undefined,context);
  assert.deepEqual(read(path.join(session,'session.json')).context,context);
  assert.throws(()=>assert_target_build(context,{sourceFiles:{}}),/must include optimization target/);
  assert_target_build(context,{sourceFiles:{[target]:'hash'}});
});

test('integrated source closure supports inspected aliases without copying host components',t=>{
  const root=temporary(t),output=path.join(root,'system');fs.mkdirSync(output);
  const source=path.join(root,'Button.vue');fs.writeFileSync(source,'<template><button>CTA</button></template>');
  fs.writeFileSync(path.join(output,'header.vue'),'<script>import Button from "~/Button.vue"</script>');
  const entries=[{name:'header',files:['header.vue'],preview:{path:'preview.vue'}}];
  const snapshot=custom_source_snapshot(output,entries,{},[],{allowedRoots:[root],aliases:{'~/':root}});
  assert.ok(snapshot.files['../Button.vue']);validate_source_snapshot(output,snapshot,[root]);
  assert.throws(()=>validate_source_snapshot(output,snapshot),/escapes/);
});

test('standalone marketing never bypasses an existing host even with supplied context',async t=>{
  const root=temporary(t),output=path.join(root,'src/design-system');fs.mkdirSync(path.join(root,'src'));
  fs.writeFileSync(path.join(root,'package.json'),JSON.stringify({dependencies:{vue:'3', 'element-plus':'2'},scripts:{build:'vite build'}}));
  fs.writeFileSync(path.join(root,'src/App.vue'),'<template>Existing app</template>');
  const context=path.join(root,'context.json');
  fs.writeFileSync(context,JSON.stringify({mode:'standalone',output,productType:'marketing'}));
  const before=fs.readFileSync(path.join(root,'package.json'));
  t.mock.method(process,'cwd',()=>root);
  await assert.rejects(()=>build({output,context}),/Existing Web project/);
  assert.deepEqual(fs.readFileSync(path.join(root,'package.json')),before);
  assert.equal(fs.existsSync(output),false);
});

test('integrated custom document retains Ant Design APIs and homepage family names',async t=>{
  const {document}=await import('../skills/grilling-design-system/scripts/design_document.js');
  const root=temporary(t),output=path.join(root,'system');fs.mkdirSync(output);
  const context={mode:'integrated',webRoot:root,output,productType:'saas',taskType:'optimize',includeMarketingHomepage:true,targetPaths:['settings.tsx'],componentLibrary:'Ant Design',framework:'React',apiMapping:'Preserve Ant Design Button type and Form APIs'};
  fs.writeFileSync(path.join(root,'settings.tsx'),'export default null');
  const doc=document(output,tokens(),null,{ui:['button'],custom:required_custom(context),sourceLayer:'Host components'}, {},context);
  const text=fs.readFileSync(doc,'utf8');
  assert.match(text,/Component library: Ant Design/);assert.match(text,/Preserve Ant Design Button/);assert.match(text,/marketing-hero/);assert.doesNotMatch(text,/npx shadcn|Modal maps to Dialog/);
});

let stamp, observers = [], resizers = [], scrolledHash = null, copy = {};
const $ = id => document.getElementById(id);
const stages = ['direction','foundations','components','preview','delivery'];
const t = (key, values = {}) => Object.entries(values).reduce((text, [name, value]) => text.replaceAll('{'+name+'}', value), copy[key] || '');
function node(tag, text, cls) { const n=document.createElement(tag); if(text) n.textContent=text; if(cls) n.className=cls; return n; }
function localize(s) {
  copy=s.uiCopy; document.documentElement.lang=s.language; document.title=t('pageTitle');
  for (const [data, attr] of [['copy',null],['aria','aria-label'],['alt','alt']]) {
    document.querySelectorAll('[data-'+data+']').forEach(el=>{const value=t(el.dataset[data]); if(attr) el.setAttribute(attr,value); else el.textContent=value;});
  }
}
function devicePreview(option, viewport) {
  const {device,width,height}=viewport;
  const section=node('section',null,'device-preview'), bar=node('div',null,'preview-bar');
  const title=device==='specimen'?option.title:t(device), link=node('a',t('open'));
  link.href=option.preview.startsWith('http')?option.preview:'/files/'+option.preview;
  const previewTitle=device==='specimen'?option.title:option.title+' · '+title;
  link.target='_blank';link.rel='noopener';link.setAttribute('aria-label',previewTitle+' · '+t('open'));
  bar.append(node('strong',title),link);
  const wrap=node('div',null,'frame-wrap'), canvas=node('div',null,'frame-canvas'), frame=node('iframe');
  wrap.tabIndex=0;wrap.setAttribute('aria-label',previewTitle);
  frame.title=previewTitle;frame.src=link.href;frame.style.width=width+'px';frame.style.height=height+'px';
  frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-popups');
  canvas.append(frame);wrap.append(canvas);
  let scale=1, fitting=true;
  function resize() {
    // Never enlarge beyond the designed size; only shrink to fit narrow columns.
    const available=Math.max(1,wrap.clientWidth), fit=Math.min(1,available/width);
    if(fitting) scale=fit;
    // Keep the full device frame visible at fit size. Zoom changes the rendered
    // pixels, not the iframe viewport, so Desktop never becomes a Mobile layout.
    wrap.style.height=(height*fit+2)+'px';
    canvas.style.width=(width*scale)+'px';canvas.style.height=(height*scale)+'px';
    frame.style.transform='scale('+scale+')';
  }
  function zoom(value) { fitting=false;scale=Math.max(.05,Math.min(2,value));resize(); }
  function wheel(event) {
    if(!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    zoom(scale*Math.exp(-event.deltaY*.005));
  }
  wrap.addEventListener('wheel',wheel,{passive:false});
  wrap.addEventListener('keydown',event=>{
    if(event.target!==wrap || !['+','=','-','0'].includes(event.key)) return;
    event.preventDefault();
    if(event.key==='0'){fitting=true;resize();wrap.scrollTo(0,0);}
    else zoom(scale*(event.key==='-'?.9:1.1));
  });
  frame.addEventListener('load',()=>{
    // Local static previews can handle trackpad pinches inside the frame too.
    // Other origins retain the browser's own zoom and touch gestures.
    try { frame.contentWindow.addEventListener('wheel',wheel,{passive:false}); } catch {}
  });
  section.append(bar,wrap);
  const observer=new ResizeObserver(resize);observer.observe(wrap);observers.push(observer);resizers.push(resize);
  return section;
}
function render(s) {
  observers.forEach(o=>o.disconnect());observers=[];resizers=[];localize(s);
  $('session-name').textContent=s.name;$('simulation').hidden=!s.simulation;$('inspiration').src='/files/'+s.image;
  $('steps').replaceChildren(...stages.map(key=>node('span',t(key),key===s.nextStage?'active':'')));
  const actionNames={select:'select',revise:'reviseAction',approve:'approveAction'};
  $('history').replaceChildren(...s.history.map(h=>node('li',t(h.stage)+' · '+(h.action==='derive'?h.derivation:t(actionNames[h.action]))+' · '+(h.optionIds||[h.optionId]).filter(Boolean).join(', ')+' '+(h.feedback||'')+' '+(h.combination||'')+(h.simulation?t('testSuffix'):''))));
  const r=s.round, awaiting=s.status==='awaiting-user';$('options').replaceChildren();
  $('title').textContent=awaiting?r.title:t(s.status==='needs-agent'?'waiting':s.status==='approved'?'approved':'delivered');
  $('description').textContent=awaiting?(r.description||''):t('saved');
  $('notice').textContent=awaiting?'':s.status==='needs-agent'?t('next',{stage:t(s.nextStage)}):t('approvedVersion');
  if(!r) return;
  r.options.forEach(o=>{
    const card=node('article',null,'option'), heading=node('div',null,'option-heading');
    card.id='option-'+o.id;heading.append(node('h2',o.title),node('p',o.description));
    const viewports=o.viewports||(r.stage==='preview'?[{device:'desktop',width:1440,height:810},{device:'mobile',width:390,height:390*16/9}]:[{device:'specimen',width:960,height:540}]);
    const previews=node('div',null,'device-grid');
    previews.dataset.count=String(viewports.length);
    previews.style.setProperty('--preview-columns',viewports.map(v=>'minmax(0,'+v.width+'fr)').join(' '));
    previews.append(...viewports.map(v=>devicePreview(o,v)));
    card.append(heading,previews);$('options').append(card);
  });
  // Size frames synchronously first; otherwise the target moves after scrolling.
  resizers.forEach(fn=>fn());
  scrollToHash();
}
function scrollToHash(){
  // Scroll once per hash so periodic re-renders do not pull the reader back.
  if(!location.hash || location.hash===scrolledHash) return;
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if(target){target.scrollIntoView();scrolledHash=location.hash;}
}
addEventListener('hashchange',()=>{scrolledHash=null;scrollToHash();});
async function refresh(){try{const response=await fetch('/api/state');if(!response.ok)throw Error();const s=await response.json();const next=JSON.stringify([s.revision,s.status,s.history.length,s.language,s.uiCopy]);if(next!==stamp){render(s);stamp=next;}}catch{$('notice').textContent=t('offline');}}
refresh();setInterval(refresh,1800);

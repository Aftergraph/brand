#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const roles = readJson('characters/roles.json').roles;
const states = readJson('characters/states.json').states;
const release = readJson('characters/release.json');
const icons = readJson('characters/source/icons/icon-mapping.json')
  .filter((x) => x.action === 'new').map((x) => x.concept);
const out = path.join(root, 'characters/review/index.html');

const esc = (v) => String(v).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const attr = (v) => esc(Array.isArray(v) ? v.join(', ') : v);
const themeRoot = (theme) => theme === 'light' ? '../generated/themes/light' : '../generated';
const option = (id, label=id) => `<option value="${esc(id)}">${esc(label)}</option>`;
const image = (src, alt, id='') => `<img${id ? ` id="${id}"` : ''} src="${src}" alt="${esc(alt)}">`;
function compositionCard(theme, role, state) {
  const src = `${themeRoot(theme)}/compositions/${role.id}--${state.id}.svg`;
  return `<article class="composition-card" tabindex="0" data-theme="${theme}" data-role="${role.id}" data-state="${state.id}" data-role-verbs="${attr(role.verbs)}" data-state-meaning="${attr(state.meaning)}">
    ${image(src, `${role.displayName}, ${state.id}`)}
    <div class="card-meta"><strong>${esc(role.displayName)}</strong><span>${esc(state.id)}</span></div>
  </article>`;
}

function roleCard(theme, role) {
  const src = `${themeRoot(theme)}/roles/${role.id}.svg`;
  return `<article class="asset-card" data-theme="${theme}" data-role="${role.id}">${image(src, `${role.displayName} role`)}<div class="asset-meta"><strong>${esc(role.displayName)}</strong><span>${esc(role.archetype)}</span></div></article>`;
}

function avatarCard(theme, role) {
  const src = `${themeRoot(theme)}/avatars/${role.id}.svg`;
  return `<article class="avatar-card" data-theme="${theme}" data-role="${role.id}">${image(src, `${role.displayName} avatar`)}<strong>${esc(role.displayName)}</strong></article>`;
}

function stateCard(theme, state) {
  const src = `${themeRoot(theme)}/states/${state.id}.svg`;
  return `<article class="asset-card" data-theme="${theme}" data-state="${state.id}">${image(src, `${state.id} state`)}<div class="asset-meta"><strong>${esc(state.id)}</strong><span>${esc(state.attention)}</span></div></article>`;
}
function iconCard(icon) {
  const src = `../generated/icons/${icon}.svg`;
  return `<article class="icon-card" data-icon="${esc(icon)}">${image(src, `${icon} supporting icon`)}<strong>${esc(icon)}</strong></article>`;
}

function themeSection(theme) {
  const roleCards = roles.map((r) => roleCard(theme, r)).join('\n');
  const avatarCards = roles.map((r) => avatarCard(theme, r)).join('\n');
  const stateCards = states.map((s) => stateCard(theme, s)).join('\n');
  const matrix = roles.flatMap((r) => states.map((s) => compositionCard(theme, r, s))).join('\n');
  return `<section class="theme-section" data-theme="${theme}" id="theme-${theme}">
    <header class="section-heading"><div><p class="section-index">${theme === 'dark' ? '01' : '02'}</p><h2>${theme[0].toUpperCase() + theme.slice(1)} theme</h2></div><p>Same governed geometry, derived through canonical Brand OS tokens.</p></header>
    <div class="subsection"><div class="subhead"><h3>Roles</h3><span>${roles.length} archetypes</span></div><div class="asset-grid roles">${roleCards}</div></div>
    <div class="subsection"><div class="subhead"><h3>Avatars</h3><span>${roles.length} compact derivatives</span></div><div class="asset-grid avatars">${avatarCards}</div></div>
    <div class="subsection"><div class="subhead"><h3>States</h3><span>${states.length} runtime states</span></div><div class="asset-grid states">${stateCards}</div></div>
    <div class="subsection matrix-section"><div class="subhead"><h3>Role × state matrix</h3><span class="matrix-count-label">${roles.length * states.length} combinations</span></div><div class="matrix">${matrix}</div></div>
  </section>`;
}
const roleOptions = roles.map((r) => option(r.id, r.displayName)).join('');
const stateOptions = states.map((s) => option(s.id)).join('');
const sections = ['dark','light'].map(themeSection).join('\n');
const iconCards = icons.map(iconCard).join('\n');
const defaultRole = roles[0];
const defaultState = states[0];
const defaultPreview = `${themeRoot('dark')}/compositions/${defaultRole.id}--${defaultState.id}.svg`;

const gateItems = [
  ['Automated verification', release.gates.automatedVerification === 'required' ? 'required' : release.gates.automatedVerification, 'CI, semantic validation, visual regression, packaging'],
  ['Rive runtime', release.gates.riveRuntimeBinary, 'Derived runtime binary and headless motion QA'],
  ['Illustrator roundtrip', release.gates.illustratorRoundtrip, 'External editable-source survival check'],
  ['Human brand review', release.gates.humanBrandReview, 'Aesthetic, semantic, compact-size and institutional fit'],
];
const gateCards = gateItems.map(([name,status,detail]) => `<article class="gate-card" data-status="${esc(status)}"><div class="gate-top"><strong>${esc(name)}</strong><span>${esc(status)}</span></div><p>${esc(detail)}</p></article>`).join('\n');
const iconSection = `<section class="icon-section" id="icons"><div class="section-heading"><div><p class="section-index">03</p><h2>Supporting icons</h2></div><p>Only concepts marked <code>new</code> in the Brand OS icon diff. Existing semantic icons remain canonical.</p></div><div class="asset-grid icons">${iconCards}</div></section>`;
const css = `
:root{font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#F5F7FA;background:#080C14;color-scheme:dark;--bg:#080C14;--surface:#0E1630;--surface-2:#121D39;--border:#24304A;--text:#F5F7FA;--muted:#8993A4;--cyan:#42C7E8;--teal:#24C4AD;--amber:#F0A64A;--danger:#FF6B7A;--max:1600px}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 75% -10%,rgba(66,199,232,.09),transparent 30rem),var(--bg);color:var(--text)}a{color:inherit}button,select{font:inherit}button{cursor:pointer}img{max-width:100%}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}.site-shell{max-width:var(--max);margin:auto;padding:0 32px 80px}
.site-header{min-height:72px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(137,147,164,.18);gap:24px}.brand-lockup{display:flex;align-items:center;gap:12px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.brand-mark{width:30px;height:30px;border:1px solid var(--border);border-radius:50%;display:grid;place-items:center;color:var(--cyan)}.brand-mark:before{content:"";width:8px;height:8px;border:2px solid currentColor;border-radius:50%;box-shadow:11px -5px 0 -3px var(--cyan),-9px 8px 0 -3px var(--cyan)}.header-meta{display:flex;gap:18px;color:var(--muted);font-size:12px}
.hero{padding:72px 0 36px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(420px,.95fr);gap:56px;align-items:center}.hero-copy h1{font-size:clamp(48px,7vw,104px);line-height:.93;letter-spacing:-.06em;margin:0;max-width:10ch}.hero-copy>p{color:var(--muted);font-size:17px;line-height:1.65;max-width:62ch;margin:24px 0}.truth{color:var(--teal)!important;font-size:14px!important;font-weight:700;letter-spacing:.02em}.stats{display:flex;gap:28px;flex-wrap:wrap;margin-top:32px}.stat{min-width:96px}.stat strong{display:block;font-size:28px;letter-spacing:-.04em}.stat span{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.08em}
.focus-stage{background:linear-gradient(180deg,rgba(18,29,57,.96),rgba(14,22,48,.92));border:1px solid var(--border);border-radius:26px;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.28)}.focus-canvas{position:relative;min-height:500px;display:grid;place-items:center;border:1px solid rgba(137,147,164,.14);border-radius:18px;background:radial-gradient(circle at 50% 35%,rgba(66,199,232,.09),transparent 47%),#0B1124;overflow:hidden}.focus-canvas img{width:min(86%,500px);aspect-ratio:1;object-fit:contain}.focus-caption{display:grid;grid-template-columns:1fr auto;gap:16px;padding:18px 6px 4px}.focus-caption strong{display:block;font-size:18px}.focus-caption p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.5}.focus-state{color:var(--cyan);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;align-self:start;padding-top:3px}
`;const css2 = `
.toolbar-wrap{position:sticky;top:0;z-index:20;margin:24px -16px 0;padding:12px 16px;background:rgba(8,12,20,.82);backdrop-filter:blur(18px);border-top:1px solid transparent;border-bottom:1px solid rgba(137,147,164,.14)}.toolbar{display:flex;align-items:end;gap:12px;flex-wrap:wrap}.toolbar label{display:grid;gap:7px;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}.toolbar select{min-width:164px;padding:11px 36px 11px 12px;border:1px solid var(--border);border-radius:10px;background:#0E1630;color:var(--text)}.toolbar .toolbar-spacer{flex:1}.result-count{color:var(--muted);font-size:12px;padding:0 4px 10px}.reset{padding:10px 14px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--text)}.reset:hover{border-color:#405073}.toolbar select:focus-visible,.reset:focus-visible,.composition-card:focus-visible{outline:2px solid var(--cyan);outline-offset:3px}
.review-gates{margin:56px 0 72px;border-top:1px solid rgba(137,147,164,.18);padding-top:32px}.review-gates .section-heading{margin-bottom:20px}.gate-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.gate-card{padding:18px;border:1px solid var(--border);border-radius:14px;background:rgba(14,22,48,.72)}.gate-top{display:flex;justify-content:space-between;gap:14px;align-items:start}.gate-top span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);border:1px solid var(--border);border-radius:999px;padding:4px 7px}.gate-card[data-status="verified"] .gate-top span{color:var(--teal);border-color:rgba(36,196,173,.36)}.gate-card[data-status="pending"] .gate-top span{color:var(--amber);border-color:rgba(240,166,74,.36)}.gate-card p{color:var(--muted);font-size:12px;line-height:1.5;margin:12px 0 0}
.theme-section,.icon-section{margin-top:72px;scroll-margin-top:100px}.section-heading{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.6fr);gap:32px;align-items:end;margin-bottom:32px}.section-heading h2{margin:0;font-size:clamp(32px,4vw,56px);letter-spacing:-.04em}.section-heading>p{margin:0;color:var(--muted);line-height:1.6}.section-index{margin:0 0 8px!important;color:var(--cyan)!important;font:11px ui-monospace,SFMono-Regular,Menlo,monospace}.subsection{margin-top:38px}.subhead{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:14px;border-bottom:1px solid rgba(137,147,164,.12);padding-bottom:10px}.subhead h3{margin:0;font-size:15px}.subhead span{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}
`;const css3 = `
.asset-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}.matrix{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}.asset-card,.avatar-card,.icon-card,.composition-card{border:1px solid var(--border);border-radius:14px;overflow:hidden;background:var(--surface);transition:transform .16s ease,border-color .16s ease,background .16s ease}.composition-card{cursor:pointer}.composition-card:hover{transform:translateY(-2px);border-color:#405073}.asset-card img,.avatar-card img,.icon-card img,.composition-card img{display:block;width:100%;aspect-ratio:1;object-fit:contain}.asset-meta,.card-meta{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px}.asset-meta span,.card-meta span{color:var(--muted);font-size:11px}.avatar-card strong,.icon-card strong{display:block;padding:10px 12px}.icon-card{background:#FFF;color:#080C14;border-color:#D7DCE3}.icon-card img{padding:34px}.icon-card strong{text-transform:capitalize}.theme-section[data-theme="light"]{background:#F5F7FA;color:#080C14;margin-left:-20px;margin-right:-20px;padding:36px 20px 44px;border-radius:22px}.theme-section[data-theme="light"] .asset-card,.theme-section[data-theme="light"] .avatar-card,.theme-section[data-theme="light"] .composition-card{background:#FFF;border-color:#D7DCE3}.theme-section[data-theme="light"] .subhead{border-color:#D7DCE3}.theme-section[data-theme="light"] .subhead span,.theme-section[data-theme="light"] .asset-meta span,.theme-section[data-theme="light"] .card-meta span,.theme-section[data-theme="light"] .section-heading>p{color:#4F5868}.theme-section[data-theme="light"] .section-index{color:#255B82!important}
[hidden]{display:none!important}.site-footer{margin-top:72px;padding-top:28px;border-top:1px solid rgba(137,147,164,.18);display:flex;justify-content:space-between;gap:24px;color:var(--muted);font-size:12px}.site-footer strong{color:var(--text)}
@media (max-width:900px){.site-shell{padding:0 18px 56px}.site-header{min-height:64px}.header-meta{display:none}.hero{padding-top:44px;grid-template-columns:1fr;gap:28px}.focus-canvas{min-height:380px}.gate-grid{grid-template-columns:1fr 1fr}.section-heading{grid-template-columns:1fr}.toolbar{align-items:stretch}.toolbar label{flex:1 1 150px}.toolbar select{width:100%;min-width:0}.toolbar-spacer{display:none}.result-count{width:100%;padding:2px 0 4px}.theme-section[data-theme="light"]{margin-left:-8px;margin-right:-8px}.site-footer{flex-direction:column}}
@media (max-width:560px){.hero-copy h1{font-size:48px}.stats{gap:20px}.stat strong{font-size:24px}.focus-canvas{min-height:310px}.gate-grid{grid-template-columns:1fr}.asset-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.matrix{grid-template-columns:repeat(2,minmax(0,1fr))}.section-heading h2{font-size:36px}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.asset-card,.avatar-card,.icon-card,.composition-card{transition:none}.composition-card:hover{transform:none}}
`;
const html = `<!doctype html>
<html lang="en" data-review-surface="v2"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"><title>Aftergraph Character System Review</title><style>${css}${css2}${css3}</style></head>
<body><div class="site-shell">
<header class="site-header"><div class="brand-lockup"><span class="brand-mark" aria-hidden="true"></span><span>Aftergraph / Character System</span></div><div class="header-meta"><span>v${esc(release.version)}</span><span>${esc(release.status)}</span><span>${release.counts.logicalAssets} logical assets</span></div></header>
<main>
<section class="hero" id="overview"><div class="hero-copy"><h1>Actor presence, without pretending it is proof.</h1><p>One governed character species, six reusable roles, eleven runtime states and two derived themes. This surface exists to review visual consistency, semantic legibility and brand fit before release.</p><p class="truth">${esc(release.truthBoundary)}</p><div class="stats"><div class="stat"><strong>${release.counts.roles}</strong><span>roles</span></div><div class="stat"><strong>${release.counts.states}</strong><span>states</span></div><div class="stat"><strong>${release.counts.compositionsPerTheme * 2}</strong><span>compositions</span></div><div class="stat"><strong>${release.counts.formatFiles}</strong><span>export files</span></div></div></div>
<aside class="focus-stage" aria-label="Selected character preview"><div class="focus-canvas">${image(defaultPreview, `${defaultRole.displayName}, ${defaultState.id}`, 'focus-preview')}</div><div class="focus-caption"><div><strong id="focus-role">${esc(defaultRole.displayName)}</strong><p id="focus-detail">${esc(defaultState.meaning)}</p></div><span class="focus-state" id="focus-state">${esc(defaultState.id)}</span></div></aside></section>
<section class="review-gates" id="gates"><div class="section-heading"><div><p class="section-index">Release gates</p><h2>Evidence before release.</h2></div><p>The site can help a reviewer inspect the system. It cannot convert visual review into verification, approval or evidence by itself.</p></div><div class="gate-grid">${gateCards}</div></section>
<div class="toolbar-wrap"><div class="toolbar" aria-label="Character review filters"><label>Theme<select id="theme"><option value="all">Both themes</option><option value="dark" selected>Dark</option><option value="light">Light</option></select></label><label>Role<select id="role"><option value="all">All roles</option>${roleOptions}</select></label><label>State<select id="state"><option value="all">All states</option>${stateOptions}</select></label><button type="button" class="reset" id="reset">Reset</button><div class="toolbar-spacer"></div><div id="result-count" class="result-count" role="status" aria-live="polite"></div></div></div>
${sections}${iconSection}
</main>
<footer class="site-footer"><span><strong>Aftergraph Character System</strong> · Canonical source: <code>${esc(release.sourceOfTruth)}</code></span><span>Human review surface only · no evidence is written here</span></footer>
</div>
<script>
const roleData=${JSON.stringify(Object.fromEntries(roles.map((r)=>[r.id,{displayName:r.displayName,verbs:r.verbs}])))};
const stateData=${JSON.stringify(Object.fromEntries(states.map((s)=>[s.id,{meaning:s.meaning,attention:s.attention}])))};
const controls={theme:document.getElementById('theme'),role:document.getElementById('role'),state:document.getElementById('state')};
const focus={image:document.getElementById('focus-preview'),role:document.getElementById('focus-role'),state:document.getElementById('focus-state'),detail:document.getElementById('focus-detail')};
const resultCount=document.getElementById('result-count');
const rootFor=(theme)=>theme==='light'?'../generated/themes/light':'../generated';
function currentTheme(){return controls.theme.value==='all'?'dark':controls.theme.value;}
function updateFocus(role,state,theme=currentTheme()){const r=roleData[role]||roleData.entity;const s=stateData[state]||stateData.idle;focus.image.src=rootFor(theme)+'/compositions/'+role+'--'+state+'.svg';focus.image.alt=r.displayName+', '+state;focus.role.textContent=r.displayName;focus.state.textContent=state;focus.detail.textContent=s.meaning;}
function apply(){
  const {theme,role,state}=Object.fromEntries(Object.entries(controls).map(([k,v])=>[k,v.value]));
  let visible=0;
  document.querySelectorAll('.composition-card').forEach((el)=>{
    const show=(theme==='all'||el.dataset.theme===theme)&&(role==='all'||el.dataset.role===role)&&(state==='all'||el.dataset.state===state);
    el.hidden=!show;if(show) visible++;
  });
  document.querySelectorAll('.theme-section').forEach((el)=>{el.hidden=theme!=='all'&&el.dataset.theme!==theme;});
  document.querySelectorAll('.roles .asset-card,.avatars .avatar-card').forEach((el)=>{el.hidden=role!=='all'&&el.dataset.role!==role;});
  document.querySelectorAll('.states .asset-card').forEach((el)=>{el.hidden=state!=='all'&&el.dataset.state!==state;});
  resultCount.textContent=visible+' matrix result'+(visible===1?'':'s');
  const params=new URLSearchParams(location.search);for(const [k,v] of Object.entries({theme,role,state}))v==='all'?params.delete(k):params.set(k,v);history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));
  const focusRole=role==='all'?'entity':role,focusState=state==='all'?'idle':state;updateFocus(focusRole,focusState,currentTheme());
}
function selectCard(el){controls.theme.value=el.dataset.theme;controls.role.value=el.dataset.role;controls.state.value=el.dataset.state;apply();updateFocus(el.dataset.role,el.dataset.state,el.dataset.theme);document.querySelector('.focus-stage').scrollIntoView({behavior:'smooth',block:'center'});}
Object.values(controls).forEach((el)=>el.addEventListener('change',apply));
document.getElementById('reset').addEventListener('click',()=>{controls.theme.value='dark';controls.role.value='all';controls.state.value='all';apply();});
document.querySelectorAll('.composition-card').forEach((el)=>{el.addEventListener('click',()=>selectCard(el));el.addEventListener('keydown',(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCard(el);}});});
const incoming=new URLSearchParams(location.search);for(const [key,control] of Object.entries(controls)){const value=incoming.get(key);if(value&&[...control.options].some((o)=>o.value===value))control.value=value;}apply();
</script></body></html>`;

fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, html);
console.log(`Generated review surface v2 with ${roles.length * states.length * 2} role/state cards, ${roles.length * 2} avatars, and ${icons.length} supporting icons.`);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const roles = readJson('characters/roles.json').roles;
const states = readJson('characters/states.json').states;
const icons = readJson('characters/source/icons/icon-mapping.json').filter((x) => x.action === 'new').map((x) => x.concept);
const out = path.join(root, 'characters/review/index.html');

const esc = (v) => String(v).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const themeRoot = (theme) => theme === 'light' ? '../generated/themes/light' : '../generated';
const option = (id, label=id) => `<option value="${esc(id)}">${esc(label)}</option>`;
const image = (src, alt) => `<img src="${src}" alt="${esc(alt)}">`;

function compositionCard(theme, role, state) {
  const src = `${themeRoot(theme)}/compositions/${role.id}--${state.id}.svg`;
  return `<article class="composition-card" data-theme="${theme}" data-role="${role.id}" data-state="${state.id}">
    ${image(src, `${role.displayName}, ${state.id}`)}
    <div><strong>${esc(role.displayName)}</strong><span>${esc(state.id)}</span></div>
  </article>`;
}

function roleCard(theme, role) {
  const src = `${themeRoot(theme)}/roles/${role.id}.svg`;
  return `<article class="asset-card" data-theme="${theme}" data-role="${role.id}">${image(src, `${role.displayName} role`)}<strong>${esc(role.displayName)}</strong></article>`;
}
function avatarCard(theme, role) {
  const src = `${themeRoot(theme)}/avatars/${role.id}.svg`;
  return `<article class="avatar-card" data-theme="${theme}" data-role="${role.id}">${image(src, `${role.displayName} avatar`)}<strong>${esc(role.displayName)}</strong></article>`;
}

function iconCard(icon) {
  const src = `../generated/icons/${icon}.svg`;
  return `<article class="icon-card" data-icon="${esc(icon)}">${image(src, `${icon} supporting icon`)}<strong>${esc(icon)}</strong></article>`;
}

function stateCard(theme, state) {
  const src = `${themeRoot(theme)}/states/${state.id}.svg`;
  return `<article class="asset-card" data-theme="${theme}" data-state="${state.id}">${image(src, `${state.id} state`)}<strong>${esc(state.id)}</strong></article>`;
}

function themeSection(theme) {
  const roleCards = roles.map((r) => roleCard(theme, r)).join('\n');
  const avatarCards = roles.map((r) => avatarCard(theme, r)).join('\n');
  const stateCards = states.map((s) => stateCard(theme, s)).join('\n');
  const matrix = roles.flatMap((r) => states.map((s) => compositionCard(theme, r, s))).join('\n');
  return `<section class="theme-section" data-theme="${theme}">
    <header><h2>${theme[0].toUpperCase() + theme.slice(1)} theme</h2><p>Derived from canonical Brand OS tokens.</p></header>
    <h3>Roles</h3><div class="asset-grid roles">${roleCards}</div>
    <h3>Avatars</h3><div class="asset-grid avatars">${avatarCards}</div>
    <h3>States</h3><div class="asset-grid states">${stateCards}</div>
    <h3>Role × state matrix</h3><div class="matrix">${matrix}</div>
  </section>`;
}

const roleOptions = roles.map((r) => option(r.id, r.displayName)).join('');
const stateOptions = states.map((s) => option(s.id)).join('');
const sections = ['dark','light'].map(themeSection).join('\n');
const iconCards = icons.map(iconCard).join('\n');
const iconSection = `<section class="icon-section"><header><h2>Supporting icons</h2><p>Only concepts marked <code>new</code> in the Brand OS icon diff are rendered here.</p></header><div class="asset-grid icons">${iconCards}</div></section>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Aftergraph Character System Review</title>
<style>
:root{font-family:Inter,system-ui,sans-serif;color:#F5F7FA;background:#080C14;color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#080C14;color:#F5F7FA}main{max-width:1600px;margin:auto;padding:32px}h1{margin:0 0 8px}h2{margin-top:48px}h3{margin:32px 0 12px;color:#8993A4}p{color:#8993A4;max-width:80ch}.truth{color:#24C4AD;font-weight:700}.toolbar{position:sticky;top:0;z-index:5;display:flex;gap:12px;flex-wrap:wrap;padding:16px 0;background:#080C14E8;backdrop-filter:blur(12px)}label{display:grid;gap:4px;font-size:12px;color:#8993A4}select{min-width:160px;padding:8px;border:1px solid #2A3348;border-radius:8px;background:#0E1630;color:#F5F7FA}.asset-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.matrix{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}.asset-card,.avatar-card,.icon-card,.composition-card{border:1px solid #24304A;border-radius:12px;overflow:hidden;background:#0E1630}.asset-card img,.avatar-card img,.icon-card img,.composition-card img{display:block;width:100%;aspect-ratio:1;object-fit:contain}.asset-card strong,.avatar-card strong,.icon-card strong{display:block;padding:10px 12px}.composition-card div{display:flex;justify-content:space-between;gap:8px;padding:8px 10px;font-size:12px}.composition-card span{color:#8993A4}.theme-section[data-theme="light"]{background:#F5F7FA;color:#080C14;margin:48px -24px 0;padding:24px;border-radius:16px}.theme-section[data-theme="light"] .asset-card,.theme-section[data-theme="light"] .avatar-card,.theme-section[data-theme="light"] .composition-card{background:#FFF;border-color:#D7DCE3}.theme-section[data-theme="light"] h3,.theme-section[data-theme="light"] p,.theme-section[data-theme="light"] .composition-card span{color:#4F5868}.icon-section{margin-top:48px;padding:24px;border:1px solid #24304A;border-radius:16px}.icon-card{background:#FFFFFF;color:#080C14;border-color:#D7DCE3}.icon-card img{padding:34px}.icon-card strong{text-transform:capitalize}[hidden]{display:none!important}
</style></head><body><main>
<h1>Aftergraph Character System Review</h1><p class="truth">Characters are a view. Evidence is the truth.</p>
<p>This surface renders canonical generated SVGs only. It exists for human visual review; it does not replace source validation or evidence.</p>
<div class="toolbar"><label>Theme<select id="theme"><option value="all">All</option><option value="dark">Dark</option><option value="light">Light</option></select></label><label>Role<select id="role"><option value="all">All</option>${roleOptions}</select></label><label>State<select id="state"><option value="all">All</option>${stateOptions}</select></label></div>
${sections}
${iconSection}
<script>
const controls=['theme','role','state'].map(id=>document.getElementById(id));
function apply(){const [theme,role,state]=controls.map(x=>x.value);document.querySelectorAll('.composition-card').forEach(el=>{el.hidden=(theme!=='all'&&el.dataset.theme!==theme)||(role!=='all'&&el.dataset.role!==role)||(state!=='all'&&el.dataset.state!==state)});document.querySelectorAll('.theme-section').forEach(el=>{el.hidden=theme!=='all'&&el.dataset.theme!==theme});}
controls.forEach(x=>x.addEventListener('change',apply));apply();
</script></main></body></html>`;

fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, html);
console.log(`Generated review surface with ${roles.length * states.length * 2} role/state cards, ${roles.length * 2} avatars, and ${icons.length} supporting icons.`);

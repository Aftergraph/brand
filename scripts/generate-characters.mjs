#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const roles = JSON.parse(fs.readFileSync(path.join(root, 'characters', 'roles.json'), 'utf8')).roles;
const states = JSON.parse(fs.readFileSync(path.join(root, 'characters', 'states.json'), 'utf8')).states;

const C = Object.freeze({
  black: '#080C14', midnight: '#0E1630', white: '#F5F7FA', slate: '#8993A4',
  cyan: '#42C7E8', teal: '#24C4AD', violet: '#7759E8', amber: '#F0A64A',
  blue: '#4C8BD8', danger: '#FF6B7A',
});
const tokenColor = Object.freeze({
  evidence_white:C.white, control_cyan:C.cyan, evidence_teal:C.teal,
  authority_violet:C.violet, decision_amber:C.amber, system_blue:C.blue, slate:C.slate,
  'semantic.dark.danger':C.danger,
});

const ensure = (p) => fs.mkdirSync(p, { recursive:true });
const write = (rel, content) => { const p=path.join(root, rel); ensure(path.dirname(p)); fs.writeFileSync(p, content); };
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]));
const titleId = (name) => `ag-${name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()}-title`;

function shell({accent=C.cyan, pose='neutral', scale=1, tx=0, ty=0}) {
  const handY = pose==='active' ? 318 : pose==='inspect' ? 300 : 330;
  const leftHandX = pose==='active' ? 138 : 150;
  const rightHandX = pose==='active' ? 374 : 362;
  return `<g transform="translate(${tx} ${ty}) scale(${scale})">
    <ellipse cx="256" cy="455" rx="106" ry="16" fill="${C.midnight}" opacity=".55"/>
    <path d="M182 337 L146 430" stroke="${C.slate}" stroke-width="16" stroke-linecap="round"/>
    <path d="M330 337 L366 430" stroke="${C.slate}" stroke-width="16" stroke-linecap="round"/>
    <path d="M195 270 L147 ${handY}" stroke="${C.white}" stroke-width="18" stroke-linecap="round"/>
    <path d="M317 270 L365 ${handY}" stroke="${C.white}" stroke-width="18" stroke-linecap="round"/>
    <circle cx="${leftHandX}" cy="${handY}" r="15" fill="${accent}"/>
    <circle cx="${rightHandX}" cy="${handY}" r="15" fill="${accent}"/>
    <path d="M188 256 L324 256 L344 356 L256 402 L168 356 Z" fill="${C.midnight}" stroke="${C.white}" stroke-width="7"/>
    <path d="M207 272 L256 314 L305 272 L291 344 L256 366 L221 344 Z" fill="${C.white}" opacity=".9"/>
    <circle cx="256" cy="190" r="98" fill="${C.midnight}" stroke="${C.white}" stroke-width="8"/>
    <circle cx="256" cy="190" r="76" fill="${C.black}" stroke="${accent}" stroke-width="4"/>
    <rect x="224" y="162" width="12" height="52" rx="6" fill="${accent}"/>
    <rect x="276" y="162" width="12" height="52" rx="6" fill="${accent}"/>
    <path d="M160 115 Q256 46 352 115" fill="none" stroke="${accent}" stroke-width="6"/>
    <circle cx="160" cy="115" r="13" fill="${accent}"/><circle cx="256" cy="66" r="15" fill="${accent}"/><circle cx="352" cy="115" r="13" fill="${accent}"/>
  </g>`;
}

function roleProp(id, accent) {
  if (id==='guide') return `<g fill="none" stroke="${accent}" stroke-width="6"><path d="M86 245 Q104 186 144 154"/><circle cx="84" cy="250" r="12" fill="${accent}"/><circle cx="116" cy="196" r="9" fill="${accent}"/><circle cx="146" cy="150" r="12" fill="${accent}"/></g>`;
  if (id==='builder') return `<g stroke="${accent}" stroke-width="6" fill="${C.midnight}"><path d="M354 286 L418 252 L466 284 L404 320 Z"/><path d="M354 286 L354 354 L404 388 L404 320 Z"/><path d="M404 320 L466 284 L466 352 L404 388 Z"/></g>`;
  if (id==='verifier') return `<path d="M382 235 L448 260 L440 342 Q424 388 382 410 Q340 388 324 342 L316 260 Z" fill="${C.midnight}" stroke="${accent}" stroke-width="7"/><path d="M350 323 L374 348 L418 295" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (id==='observer') return `<g fill="none" stroke="${accent}" stroke-width="5"><circle cx="405" cy="310" r="74"/><ellipse cx="405" cy="310" rx="34" ry="74"/><path d="M331 310 H479 M344 274 Q405 300 466 274 M344 346 Q405 320 466 346"/></g>`;
  if (id==='researcher') return `<g fill="${C.midnight}" stroke="${accent}" stroke-width="5"><rect x="351" y="238" width="74" height="92" rx="10"/><rect x="391" y="300" width="74" height="92" rx="10"/><path d="M365 260 H410 M365 280 H402 M405 324 H450 M405 344 H444"/></g>`;
  return `<g fill="${accent}"><circle cx="104" cy="268" r="12"/><circle cx="122" cy="306" r="8"/><circle cx="408" cy="270" r="12"/></g>`;
}

function roleSvg(role) {
  const accent = tokenColor[role.accentToken];
  const id=titleId(`role-${role.id}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="${id}"><title id="${id}">${esc(role.displayName)} — Aftergraph character archetype</title>${shell({accent})}${roleProp(role.id,accent)}</svg>\n`;
}
function avatarSvg(role) {
  const accent=tokenColor[role.accentToken]; const id=titleId(`avatar-${role.id}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-labelledby="${id}"><title id="${id}">${esc(role.displayName)} — Aftergraph avatar</title><circle cx="128" cy="132" r="78" fill="${C.midnight}" stroke="${C.white}" stroke-width="7"/><circle cx="128" cy="132" r="60" fill="${C.black}" stroke="${accent}" stroke-width="4"/><rect x="103" y="110" width="10" height="43" rx="5" fill="${accent}"/><rect x="143" y="110" width="10" height="43" rx="5" fill="${accent}"/><path d="M54 72 Q128 24 202 72" fill="none" stroke="${accent}" stroke-width="5"/><circle cx="54" cy="72" r="11" fill="${accent}"/><circle cx="128" cy="36" r="13" fill="${accent}"/><circle cx="202" cy="72" r="11" fill="${accent}"/></svg>\n`;
}

function stateProp(id, accent) {
  switch(id) {
    case 'thinking': return `<g fill="none" stroke="${accent}" stroke-width="7"><circle cx="408" cy="218" r="13" fill="${accent}"/><circle cx="439" cy="187" r="9" fill="${accent}"/><path d="M390 280 Q414 248 444 265 Q463 278 451 300 Q439 319 419 320 V342"/><circle cx="419" cy="367" r="7" fill="${accent}"/></g>`;
    case 'planning': return `<g fill="${C.midnight}" stroke="${accent}" stroke-width="5"><rect x="350" y="236" width="116" height="116" rx="12"/><path d="M370 320 L397 286 L421 304 L448 266" fill="none"/><circle cx="370" cy="320" r="6" fill="${accent}"/><circle cx="397" cy="286" r="6" fill="${accent}"/><circle cx="421" cy="304" r="6" fill="${accent}"/><circle cx="448" cy="266" r="6" fill="${accent}"/></g>`;
    case 'executing': return roleProp('builder',accent);
    case 'inspecting': return `<g fill="none" stroke="${accent}" stroke-width="8"><circle cx="408" cy="285" r="42"/><path d="M438 316 L468 348" stroke-linecap="round"/><circle cx="408" cy="285" r="12" fill="${accent}" stroke="none"/></g>`;
    case 'waiting': return `<g stroke="${accent}" stroke-width="6" fill="${accent}"><path d="M430 222 V372"/><circle cx="430" cy="222" r="11"/><circle cx="430" cy="297" r="9"/><circle cx="430" cy="372" r="11"/></g>`;
    case 'blocked': return `<g fill="${C.midnight}" stroke="${accent}" stroke-width="7"><path d="M410 230 L474 354 H346 Z"/><path d="M410 270 V318"/><circle cx="410" cy="338" r="5" fill="${accent}" stroke="none"/></g>`;
    case 'approval-required': return `<g fill="${C.midnight}" stroke="${accent}" stroke-width="6"><rect x="351" y="238" width="116" height="132" rx="14"/><circle cx="409" cy="278" r="20"/><path d="M376 337 Q409 307 442 337 V350 H376 Z"/></g>`;
    case 'verifying': return `<g fill="none" stroke="${accent}" stroke-width="7"><path d="M346 270 H454 M356 301 H444 M370 332 H430"/><circle cx="401" cy="301" r="64" opacity=".3"/><path d="M446 347 L470 371" stroke-linecap="round"/></g>`;
    case 'completed': return `<g fill="${C.midnight}" stroke="${accent}" stroke-width="7"><rect x="354" y="252" width="112" height="112" rx="18"/><path d="M379 309 L402 333 L443 283" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    case 'failed': return `<g stroke="${accent}" stroke-width="12" stroke-linecap="round"><path d="M365 266 L451 352 M451 266 L365 352"/></g>`;
    default: return '';
  }
}
function stateSvg(state) {
  const accent=tokenColor[state.signalToken] || C.cyan; const id=titleId(`state-${state.id}`);
  const pose = ['executing'].includes(state.id)?'active':['inspecting','verifying'].includes(state.id)?'inspect':'neutral';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="${id}"><title id="${id}">Aftergraph actor state — ${esc(state.id)}</title>${shell({accent:C.white,pose})}${stateProp(state.id,accent)}</svg>\n`;
}

function toSymbol(svg, symbolId) {
  const viewBox = svg.match(/viewBox=\"([^\"]+)\"/)?.[1];
  const body = svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>')).trim();
  if (!viewBox || !body) throw new Error(`Cannot convert ${symbolId} to symbol`);
  return `<symbol id=\"${symbolId}\" viewBox=\"${viewBox}\">${body}</symbol>`;
}

const symbols = [];
for (const role of roles) {
  symbols.push(toSymbol(roleSvg(role), `ag-role-${role.id}`));
  symbols.push(toSymbol(avatarSvg(role), `ag-avatar-${role.id}`));
}
for (const state of states) symbols.push(toSymbol(stateSvg(state), `ag-state-${state.id}`));

const sprite = `<svg xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\">\n${symbols.join('\n')}\n</svg>\n`;
write('characters/character-sprite.svg', sprite);
console.log(`Generated Aftergraph character sprite with ${symbols.length} symbols.`);

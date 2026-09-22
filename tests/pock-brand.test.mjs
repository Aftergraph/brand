import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pock = JSON.parse(fs.readFileSync('products/pock/manifest.json','utf8'));
const registry = JSON.parse(fs.readFileSync('registry.json','utf8'));

test('POCK remains review-gated and endorsed by Aftergraph', () => {
  assert.equal(pock.parent, 'Aftergraph');
  assert.equal(pock.status, 'proposed-identity-review');
  assert.equal(pock.identity, null);
  assert.equal(pock.candidate_identity.name, 'Orb-O');
  assert.equal(pock.candidate_identity.endorsement, 'POCK by Aftergraph');
  assert.equal(registry.products.pock.status, 'needs-review');
  assert.match(registry.products.pock.blocker, /brand#38/);
});

test('POCK candidate assets stay under candidate root and exist', () => {
  const assets = pock.candidate_identity.assets;
  const flatten = o => Object.values(o).flatMap(v => typeof v === 'string' ? [v] : flatten(v));
  for (const file of flatten(assets)) {
    assert.match(file, /^products\/pock\/candidate\//);
    assert.equal(fs.existsSync(file), true, file);
  }
});

test('POCK endorsed lockups and SVG masters preserve accessibility envelope', () => {
  const files = [
    pock.candidate_identity.assets.symbol,
    pock.candidate_identity.assets.lockup_dark,
    pock.candidate_identity.assets.lockup_light,
    pock.candidate_identity.assets.monochrome,
    pock.candidate_identity.assets.app_icon,
    pock.candidate_identity.assets.favicon,
    ...Object.values(pock.candidate_identity.assets.states)
  ];
  for (const file of files) {
    const svg = fs.readFileSync(file,'utf8');
    assert.match(svg, /<svg\b/);
    assert.match(svg, /viewBox="[^"]+"/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title>/);
  }
  for (const file of [pock.candidate_identity.assets.lockup_dark, pock.candidate_identity.assets.lockup_light, pock.candidate_identity.assets.monochrome]) {
    assert.match(fs.readFileSync(file,'utf8'), /BY AFTERGRAPH/);
  }
});

test('POCK state family is presentation-only and complete', () => {
  const states = Object.keys(pock.candidate_identity.assets.states).sort();
  assert.deepEqual(states, ['error','idle','needs_you','searching','solving','verified','working']);
  const candidateTokens = JSON.parse(fs.readFileSync('products/pock/candidate/tokens.json','utf8'));
  assert.match(candidateTokens.runtime_boundary, /presentation only/i);
  assert.match(candidateTokens.runtime_boundary, /verification evidence/i);
});

test('POCK small-size state silhouettes preserve distinct static grammar', () => {
  const working = fs.readFileSync(pock.candidate_identity.assets.states.working,'utf8');
  const needsYou = fs.readFileSync(pock.candidate_identity.assets.states.needs_you,'utf8');
  const searching = fs.readFileSync(pock.candidate_identity.assets.states.searching,'utf8');
  const solving = fs.readFileSync(pock.candidate_identity.assets.states.solving,'utf8');

  assert.match(working, /stroke-dasharray="330 148"/);
  assert.match(working, /<circle cx="188" cy="70" r="13"/);
  assert.match(needsYou, /<circle cx="128" cy="128" r="24" fill="#F3A83B"/);
  assert.match(searching, /stroke-dasharray="8 18"/);
  assert.ok((solving.match(/<circle/g) || []).length >= 3);
});

test('POCK visual QA contract exists and keeps sub-24px semantics text-backed', () => {
  const qa = fs.readFileSync('products/pock/candidate/evidence/VISUAL-QA.md','utf8');
  assert.match(qa, /Visual QA: PASS with corrections/);
  assert.match(qa, /Below \*\*24 px\*\*/);
  assert.match(qa, /must not be the sole semantic carrier/i);
});

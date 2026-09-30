import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pock = JSON.parse(fs.readFileSync('products/pock/manifest.json','utf8'));
const registry = JSON.parse(fs.readFileSync('registry.json','utf8'));

test('POCK is canonical, active and endorsed by Aftergraph', () => {
  assert.equal(pock.parent, 'Aftergraph');
  assert.equal(pock.class, 'product');
  assert.equal(pock.status, 'active');
  assert.equal(pock.identity, 'identity/lockup-dark.svg');
  assert.equal(pock.identity_system.name, 'Orb-O');
  assert.equal(pock.identity_system.endorsement, 'POCK by Aftergraph');
  assert.equal(registry.products.pock.status, 'active');
  assert.ok(registry.classes.products.includes('pock'));
  assert.ok(!registry.classes.product_needs_review.includes('pock'));
});

test('POCK canonical assets stay under stable product paths and exist', () => {
  const assets = pock.identity_system.assets;
  const flatten = o => Object.values(o).flatMap(v => typeof v === 'string' ? [v] : flatten(v));
  for (const file of flatten(assets)) {
    assert.match(file, /^products\/pock\//);
    assert.doesNotMatch(file, /^products\/pock\/candidate\//);
    assert.equal(fs.existsSync(file), true, file);
  }
});

test('POCK endorsed lockups and SVG masters preserve accessibility envelope', () => {
  const assets=pock.identity_system.assets;
  const files=[assets.symbol,assets.lockup_dark,assets.lockup_light,assets.monochrome,assets.app_icon,assets.favicon,...Object.values(assets.states)];
  for (const file of files) {
    const svg=fs.readFileSync(file,'utf8');
    assert.match(svg, /<svg\b/);
    assert.match(svg, /viewBox="[^"]+"/);
    assert.match(svg, /role="img"/);
    assert.match(svg, /<title>/);
  }
  for (const file of [assets.lockup_dark,assets.lockup_light,assets.monochrome]) assert.match(fs.readFileSync(file,'utf8'), /BY AFTERGRAPH/);
});

test('POCK state family is presentation-only and complete', () => {
  const states=Object.keys(pock.identity_system.assets.states).sort();
  assert.deepEqual(states,['error','idle','needs_you','searching','solving','verified','working']);
  const productTokens=JSON.parse(fs.readFileSync('products/pock/tokens.json','utf8'));
  assert.equal(productTokens.status,'canonical');
  assert.match(productTokens.runtime_boundary,/presentation only/i);
  assert.match(productTokens.runtime_boundary,/verification evidence/i);
});

test('POCK small-size state silhouettes preserve distinct static grammar', () => {
  const assets=pock.identity_system.assets.states;
  const working=fs.readFileSync(assets.working,'utf8');
  const needsYou=fs.readFileSync(assets.needs_you,'utf8');
  const searching=fs.readFileSync(assets.searching,'utf8');
  const solving=fs.readFileSync(assets.solving,'utf8');
  assert.match(working,/stroke-dasharray="330 148"/);
  assert.match(working,/<circle cx="188" cy="70" r="13"/);
  assert.match(needsYou,/<circle cx="128" cy="128" r="24" fill="#F3A83B"/);
  assert.match(searching,/stroke-dasharray="8 18"/);
  assert.ok((solving.match(/<circle/g)||[]).length>=3);
});

test('POCK canonical promotion keeps candidate provenance and passing QA', () => {
  assert.equal(fs.existsSync('products/pock/candidate/identity/symbol.svg'),true);
  const qa=fs.readFileSync('products/pock/showcase/design-qa.md','utf8');
  assert.match(qa,/Final result:\*\* passed|Final result:\s*passed/i);
  const evidence=JSON.parse(fs.readFileSync('products/pock/evidence/canonical-assets.json','utf8'));
  assert.equal(evidence.status,'canonical');
  assert.equal(evidence.promotion_pr,'Aftergraph/brand#38');
  assert.equal(evidence.assets.length,13);
});

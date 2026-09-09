import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

test('canonical validator passes', () => assert.match(execFileSync(process.execPath, ['scripts/validate.mjs'], {encoding:'utf8'}), /validation passed/));
test('asset generator escapes untrusted title text', () => {
  const file='tests/.generated-social.svg';
  execFileSync(process.execPath, ['scripts/assetgen.mjs','--type','github','--title','A < B & C','--output',file]);
  const svg=fs.readFileSync(file,'utf8');
  assert.match(svg,/A &lt; B &amp; C/);
  fs.unlinkSync(file);
});
test('registry blocks unsupported Sentinel release identity', () => {
  const registry=JSON.parse(fs.readFileSync('registry.json','utf8'));
  assert.equal(registry.products.sentinel.status,'needs-review');
  assert.match(registry.products.sentinel.blocker,/brand#19/);
});

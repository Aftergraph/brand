import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const aliases = JSON.parse(fs.readFileSync('characters/governance/product-aliases.json', 'utf8'));
const stepOneToSixFiles = [
  'characters/source/master/base-character.svg',
  'characters/source/master/anchors.json',
  'characters/source/roles/roles.svg',
  'characters/source/states/states.svg',
  'characters/source/icons/icon-mapping.json',
  'characters/contracts/components.d.ts',
  'characters/ci/ci-checks.yml',
];

test('product aliases map only to generic character archetypes', () => {
  assert.deepEqual(aliases.aliases, { Sentinel: 'verifier', Forge: 'builder', Atlas: 'observer' });
});

test('product alias names do not leak into step 1-6 deliverables', () => {
  for (const file of stepOneToSixFiles) {
    const content = fs.readFileSync(file, 'utf8');
    for (const alias of Object.keys(aliases.aliases)) assert.equal(content.includes(alias), false, `${alias} leaked into ${file}`);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const readme = fs.readFileSync('characters/README.md', 'utf8');

test('README deprecates the legacy 23-symbol sprite', () => {
  assert.match(readme, /\*\*Deprecated:\*\* `character-sprite\.svg` is the legacy 23-symbol flattened compatibility sprite/);
});

test('README directs authoring to compositional editable sources', () => {
  for (const path of ['source/master/base-character.svg','source/master/anchors.json','source/roles/roles.svg','source/states/states.svg']) {
    assert.ok(readme.includes(path), path);
  }
  assert.match(readme, /never edit derived exports by hand/i);
});

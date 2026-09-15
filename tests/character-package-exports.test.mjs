import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));

test('package exposes canonical character contracts, source, generated vectors, and governance manifests explicitly',()=>{
  const expected={
    './characters/manifest.json':'./characters/manifest.json',
    './characters/release.json':'./characters/release.json',
    './characters/roles.json':'./characters/roles.json',
    './characters/states.json':'./characters/states.json',
    './characters/accessibility.json':'./characters/accessibility.json',
    './characters/contexts.json':'./characters/contexts.json',
    './characters/themes.json':'./characters/themes.json',
    './characters/source/*':'./characters/source/*',
    './characters/generated/*':'./characters/generated/*'
  };
  for(const [key,value] of Object.entries(expected)) assert.equal(pkg.exports[key],value,key);
  assert.deepEqual(pkg.exports['./characters/contracts'],{types:'./characters/contracts/components.d.ts'});
});

test('npm pack dry run contains editable source and generated SVGs but excludes release raster export directory',()=>{
  const output=execFileSync('npm',['pack','--dry-run','--json'],{cwd:root,encoding:'utf8'});
  const files=JSON.parse(output)[0].files.map((x)=>x.path);
  assert.ok(files.includes('characters/source/master/base-character.svg'));
  assert.ok(files.includes('characters/source/roles/roles.svg'));
  assert.ok(files.includes('characters/source/states/states.svg'));
  assert.ok(files.includes('characters/source/expressions/expressions.svg'));
  assert.ok(files.includes('characters/generated/compositions/entity--idle.svg'));
  assert.ok(files.includes('characters/generated/themes/light/compositions/entity--idle.svg'));
  assert.ok(files.includes('characters/generated/themes/light/sprites/characters.svg'));
  assert.ok(files.includes('characters/contracts/components.d.ts'));
  assert.ok(files.every((x)=>!x.startsWith('exports/characters/')));
});

test('npm package excludes generated authoring preflight evidence while retaining evidence templates and review surface',()=>{
  const output=execFileSync('npm',['pack','--dry-run','--json'],{cwd:root,encoding:'utf8'});
  const files=JSON.parse(output)[0].files.map((x)=>x.path);
  assert.ok(!files.includes('characters/ci/evidence/authoring-preflight.json'));
  assert.ok(files.includes('characters/ci/evidence/illustrator-roundtrip.template.json'));
  assert.ok(files.includes('characters/ci/evidence/rive-authoring.template.json'));
  assert.ok(files.includes('characters/ci/evidence/human-brand-review.template.json'));
  assert.ok(files.includes('characters/review/index.html'));
  assert.ok(files.includes('characters/review/VISUAL-AUDIT.md'));
});

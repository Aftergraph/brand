import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const readJson=(p)=>JSON.parse(read(p));

test('theme contract references Brand OS tokens only and generates complete light variants',()=>{
  const themes=readJson('characters/themes.json');
  assert.deepEqual(Object.keys(themes.themes),['dark','light']);
  execFileSync(process.execPath,['scripts/compose-characters.mjs'],{cwd:root,stdio:'pipe'});
  const roles=readJson('characters/roles.json').roles.map(x=>x.id);
  const states=readJson('characters/states.json').states.map(x=>x.id);
  for(const role of roles){
    assert.ok(fs.existsSync(path.join(root,`characters/generated/themes/light/roles/${role}.svg`)));
    assert.ok(fs.existsSync(path.join(root,`characters/generated/themes/light/avatars/${role}.svg`)));
    for(const state of states) assert.ok(fs.existsSync(path.join(root,`characters/generated/themes/light/compositions/${role}--${state}.svg`)));
  }
  for(const state of states) assert.ok(fs.existsSync(path.join(root,`characters/generated/themes/light/states/${state}.svg`)));
});

test('light role variants remap structural white and accents to canonical light-theme tokens',()=>{
  const tokens=readJson('tokens.json');
  const entity=read('characters/generated/themes/light/roles/entity.svg');
  const guide=read('characters/generated/themes/light/roles/guide.svg');
  const builder=read('characters/generated/themes/light/roles/builder.svg');
  const verifier=read('characters/generated/themes/light/roles/verifier.svg');
  const observer=read('characters/generated/themes/light/roles/observer.svg');
  assert.ok(entity.includes(tokens.semantic.light.text));
  assert.ok(guide.includes(tokens.semantic.light.control));
  assert.ok(builder.includes(tokens.semantic.light.decision));
  assert.ok(verifier.includes(tokens.semantic.light.evidence));
  assert.ok(observer.includes(tokens.semantic.light.system));
  assert.doesNotMatch(entity,/stroke="#F5F7FA"/);
});

test('theme-derived files remain deterministic',()=>{
  execFileSync(process.execPath,['scripts/compose-characters.mjs','--check'],{cwd:root,stdio:'pipe'});
});

test('light entity keeps a canonical light face signal against the dark visor while structural outlines remain dark', () => {
  const tokens = readJson('tokens.json');
  const entity = read('characters/generated/themes/light/roles/entity.svg');
  assert.match(entity, new RegExp(`id="face"[^>]*color="${tokens.colors.evidence_white}"`));
  assert.doesNotMatch(entity, new RegExp(`stroke="${tokens.colors.evidence_white}"`));
});

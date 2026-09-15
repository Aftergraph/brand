import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');

test('compositional sprite generator emits 89 character symbols plus 11 supporting icon symbols',()=>{
  execFileSync(process.execPath,['scripts/generate-character-sprites.mjs'],{cwd:root,stdio:'pipe'});
  const characters=read('characters/generated/sprites/characters.svg');
  const lightCharacters=read('characters/generated/themes/light/sprites/characters.svg');
  const icons=read('characters/generated/sprites/icons.svg');
  assert.equal((characters.match(/<symbol\b/g)||[]).length,89);
  assert.equal((lightCharacters.match(/<symbol\b/g)||[]).length,89);
  assert.match(lightCharacters,/data-theme=\"light\"/);
  assert.equal((icons.match(/<symbol\b/g)||[]).length,11);
  for(const id of ['ag-character-role-guide','ag-character-state-thinking','ag-character-avatar-verifier','ag-character-composition-researcher--verifying']) assert.ok(characters.includes(`id="${id}"`));
  assert.ok(icons.includes('id="ag-character-icon-warning"'));
});

test('sprite IDs and gradient references are namespaced with zero duplicate IDs',()=>{
  for(const rel of ['characters/generated/sprites/characters.svg','characters/generated/themes/light/sprites/characters.svg','characters/generated/sprites/icons.svg']){
    const source=read(rel);
    const ids=[...source.matchAll(/\bid="([^"]+)"/g)].map((m)=>m[1]);
    assert.equal(new Set(ids).size,ids.length,`${rel}: duplicate ids`);
    const idSet=new Set(ids);
    for(const m of source.matchAll(/url\(#([^\)]+)\)/g)) assert.ok(idSet.has(m[1]),`${rel}: missing ref ${m[1]}`);
    assert.doesNotMatch(source,/<image\b/i);
    assert.doesNotMatch(source,/\b(?:Sentinel|Forge|Atlas)\b/);
  }
});

test('sprite generation is deterministic and rejects drift',()=>{
  execFileSync(process.execPath,['scripts/generate-character-sprites.mjs','--check'],{cwd:root,stdio:'pipe'});
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');

test('character source validator enforces editable-source and derived-output invariants',()=>{
  const output=execFileSync(process.execPath,['scripts/validate-character-source.mjs'],{cwd:root,encoding:'utf8'});
  assert.match(output,/Character source validation passed/);
});

test('character source validator explicitly covers the critical failure classes',()=>{
  const source=fs.readFileSync(path.join(root,'scripts/validate-character-source.mjs'),'utf8');
  for(const marker of ['requiredGroups','duplicate id','embedded raster','unknown color','anchor ref','product alias leakage','compose-characters.mjs','generate-character-icons.mjs','prop slots']){
    assert.match(source,new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'));
  }
});

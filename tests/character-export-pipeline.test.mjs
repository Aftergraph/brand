import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root=path.resolve(import.meta.dirname,'..');
const out='exports/characters';

test('release exporter emits SVG, PNG, WebP, and AVIF with hashes for every governed character asset',()=>{
  execFileSync(process.execPath,['scripts/export-character-assets.mjs','--out',out],{cwd:root,stdio:'pipe'});
  const manifest=JSON.parse(fs.readFileSync(path.join(root,out,'manifest.json'),'utf8'));
  assert.equal(manifest.assets.length,189);
  assert.deepEqual(manifest.themes,['dark','light']);
  assert.equal(manifest.themeAssetCounts.dark,89);
  assert.equal(manifest.themeAssetCounts.light,89);
  assert.equal(manifest.themeNeutralAssetCount,11);
  assert.ok(manifest.sprites.darkCharacters);
  assert.ok(manifest.sprites.lightCharacters);
  assert.ok(manifest.sprites.icons);
  for(const asset of manifest.assets){
    assert.deepEqual(Object.keys(asset.files).sort(),['avif','png','svg','webp']);
    for(const entry of Object.values(asset.files)){
      assert.ok(fs.existsSync(path.join(root,out,entry.path)));
      assert.match(entry.sha256,/^[a-f0-9]{64}$/);
      assert.ok(entry.bytes>0);
    }
  }
});

test('release exporter is deterministic for the complete release manifest',()=>{
  const first=fs.readFileSync(path.join(root,out,'manifest.json'),'utf8');
  execFileSync(process.execPath,['scripts/export-character-assets.mjs','--out',out],{cwd:root,stdio:'pipe'});
  const second=fs.readFileSync(path.join(root,out,'manifest.json'),'utf8');
  assert.equal(second,first);
});

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const value = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const outRel = value('--out', 'characters/ci/evidence/authoring-preflight.json');
const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');
const head = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();

function sourceRecord(rel) {
  const abs = path.join(root, rel);
  const data = fs.readFileSync(abs);
  return {path: rel, bytes: data.length, sha256: sha256(data)};
}

const runtimeManifest = JSON.parse(fs.readFileSync(path.join(root, 'characters/motion/rive/runtime-manifest.json'), 'utf8'));

const sources = {
  baseCharacter: sourceRecord('characters/source/master/base-character.svg'),
  anchors: sourceRecord('characters/source/master/anchors.json'),
  roles: sourceRecord('characters/source/roles/roles.svg'),
  states: sourceRecord('characters/source/states/states.svg'),
  expressions: sourceRecord('characters/source/expressions/expressions.svg'),
  rig: sourceRecord('characters/source/rig/rig.json'),
  propSlots: sourceRecord('characters/source/rig/slots.json'),
};
const evidence = {
  $schema: 'aftergraph.character-authoring-preflight.v1',
  generatedAt: new Date().toISOString(),
  candidateCommit: head,
  sources,
  gates: {
    illustrator: {
      status: 'pending-external',
      evidenceFile: 'characters/ci/evidence/illustrator-roundtrip.json',
      source: sources.baseCharacter.path,
      inputSha256: sources.baseCharacter.sha256,
      requirement: 'Open, edit, save, and reopen in Adobe Illustrator with named groups and gradients preserved.'
    },
    rive: {
      status: 'verified-in-repo',
      runtimeManifest: 'characters/motion/rive/runtime-manifest.json',
      runtimeFile: runtimeManifest.artifact.path,
      runtimeSha256: runtimeManifest.artifact.sha256,
      authoringTool: runtimeManifest.riveCliVersion,
      verificationCommand: 'npm run character:rive:qa'
    },
    humanBrandReview: {
      status: 'pending-external',
      evidenceFile: 'characters/ci/evidence/human-brand-review.json',
      reviewSurface: 'characters/review/index.html',
      requirement: 'Review role/state/theme system for silhouette, hierarchy, consistency, semantics, and brand fit.'
    }
  }
};

const out = path.join(root, outRel);
fs.mkdirSync(path.dirname(out), {recursive: true});
fs.writeFileSync(out, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(`Prepared external authoring preflight for ${head}.`);

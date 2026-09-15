import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const out = 'characters/ci/evidence/authoring-preflight.json';

test('authoring preflight binds external gates to exact candidate and source hashes', () => {
  execFileSync(process.execPath, ['scripts/prepare-character-authoring-evidence.mjs', '--out', out], {cwd: root, stdio: 'pipe'});
  const data = JSON.parse(fs.readFileSync(path.join(root, out), 'utf8'));
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  assert.equal(data.candidateCommit, head);
  assert.match(data.sources.baseCharacter.sha256, /^[a-f0-9]{64}$/);
  assert.match(data.sources.roles.sha256, /^[a-f0-9]{64}$/);
  assert.match(data.sources.states.sha256, /^[a-f0-9]{64}$/);
  assert.equal(data.gates.illustrator.status, 'pending-external');
  assert.equal(data.gates.rive.status, 'pending-external');
  assert.equal(data.gates.humanBrandReview.status, 'pending-external');
});

test('authoring preflight includes the governed attachment-slot policy and evidence templates start unapproved', () => {
  execFileSync(process.execPath, ['scripts/prepare-character-authoring-evidence.mjs', '--out', out], {cwd: root, stdio: 'pipe'});
  const data = JSON.parse(fs.readFileSync(path.join(root, out), 'utf8'));
  assert.equal(data.sources.propSlots.path, 'characters/source/rig/slots.json');
  assert.match(data.sources.propSlots.sha256, /^[a-f0-9]{64}$/);
  for (const rel of [
    'characters/ci/evidence/illustrator-roundtrip.template.json',
    'characters/ci/evidence/rive-authoring.template.json'
  ]) {
    const template = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
    assert.equal(template.pass, null, rel);
  }
  const human = JSON.parse(fs.readFileSync(path.join(root, 'characters/ci/evidence/human-brand-review.template.json'), 'utf8'));
  assert.equal(human.decision, 'pending');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const dts = fs.readFileSync('characters/contracts/components.d.ts', 'utf8');

test('component contracts expose the three required prop interfaces', () => {
  for (const name of ['AgentStatusCardProps', 'ApprovalCardProps', 'VerificationPanelProps']) {
    assert.match(dts, new RegExp(`export interface ${name}\\b`));
  }
});

test('actor presence props are data-driven by role state progress and evidence', () => {
  for (const field of ['role: CharacterRole', 'state: CharacterState', 'progress?: ProgressDescriptor', 'evidence?: readonly EvidenceRef[]']) {
    assert.ok(dts.includes(field), field);
  }
});

test('contract does not accept hardcoded character image props', () => {
  assert.doesNotMatch(dts, /imageSrc|imageUrl|pngPath|spriteUrl|hardcodedImage/i);
});

test('verification verdict is separate from actor activity state', () => {
  assert.match(dts, /type VerificationVerdict = 'not-run' \| 'running' \| 'passed' \| 'failed' \| 'indeterminate'/);
  assert.match(dts, /verdict: VerificationVerdict/);
});

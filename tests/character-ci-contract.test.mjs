import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = fs.readFileSync('characters/ci/ci-checks.yml', 'utf8');

test('Illustrator roundtrip has one chosen enforcement mode', () => {
  assert.match(config, /illustrator_roundtrip:\n  mode: manual-logged-checklist/);
  assert.doesNotMatch(config, /mode: scriptable/);
  assert.match(config, /evidence_file: characters\/ci\/evidence\/illustrator-roundtrip\.json/);
});

test('visual regression chooses Puppeteer plus pixelmatch with deterministic bounds', () => {
  assert.match(config, /tool: puppeteer\+pixelmatch/);
  assert.match(config, /width: 512, height: 512, deviceScaleFactor: 1/);
  assert.match(config, /pixelmatch_threshold: 0\.10/);
  assert.match(config, /max_diff_pixels: 24/);
});

test('CI contract includes base, all roles, and all non-idle state deltas', () => {
  assert.equal((config.match(/\n    - id:/g) || []).length, 23);
  for (const state of ['thinking','planning','executing','inspecting','waiting','blocked','approval-required','verifying','completed','failed']) {
    assert.ok(config.includes(`id: state-${state}`));
  }
  for (const id of ['collision-builder-thinking','collision-verifier-verifying','collision-observer-blocked','collision-researcher-approval-required','light-entity-idle','light-builder-thinking']) {
    assert.ok(config.includes(`id: ${id}`), id);
  }
  assert.match(config, /id: light-entity-idle[\s\S]*background: "#F5F7FA"/);
});

test('GitHub CI installs the lockfile and enforces the high-severity dependency audit gate', () => {
  const workflow=fs.readFileSync('.github/workflows/ci.yml','utf8');
  assert.match(workflow,/run: npm ci/);
  assert.match(workflow,/run: npm run audit:high/);
});

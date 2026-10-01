import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const review = path.join(root, 'characters/review/index.html');

function generate() {
  execFileSync(process.execPath, ['scripts/generate-character-review.mjs'], {cwd: root});
  return fs.readFileSync(review, 'utf8');
}

test('review site exposes reviewer-first overview, focus stage, filters and release gates', () => {
  const html = generate();
  assert.match(html, /data-review-surface="v2"/);
  assert.match(html, /id="focus-preview"/);
  assert.match(html, /id="focus-role"/);
  assert.match(html, /id="focus-state"/);
  assert.match(html, /id="result-count"[^>]*aria-live="polite"/);
  assert.match(html, /class="gate-grid"/);
  assert.match(html, /Illustrator roundtrip/);
  assert.match(html, /Human brand review/);
  assert.match(html, /Characters are a view\. Evidence is the truth\./);
});
test('review site keeps the complete governed inventory and interactive matrix hooks', () => {
  const html = generate();
  assert.equal((html.match(/class="composition-card"/g) ?? []).length, 132);
  assert.equal((html.match(/class="avatar-card"/g) ?? []).length, 12);
  assert.equal((html.match(/class="icon-card"/g) ?? []).length, 11);
  assert.match(html, /data-role-verbs=/);
  assert.match(html, /data-state-meaning=/);
  assert.match(html, /history\.replaceState/);
  assert.match(html, /addEventListener\('click'/);
  assert.doesNotMatch(html, /loading="lazy"/);
});

test('review site has responsive and reduced-motion safeguards', () => {
  const html = generate();
  assert.match(html, /@media \(max-width:900px\)/);
  assert.match(html, /@media \(prefers-reduced-motion:reduce\)/);
  assert.match(html, /:focus-visible/);
  assert.match(html, /aria-label="Character review filters"/);
  assert.match(html, /role="status"/);
});

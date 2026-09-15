import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const readJson=(p)=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));

test('release contract declares the complete governed logical asset surface',()=>{
  const release=readJson('characters/release.json');
  assert.deepEqual(release.themes,['dark','light']);
  assert.deepEqual(release.formats,['svg','png','webp','avif']);
  assert.equal(release.counts.themeSpecificPerTheme,89);
  assert.equal(release.counts.themeNeutral,11);
  assert.equal(release.counts.logicalAssets,189);
  assert.equal(release.counts.formatFiles,756);
  assert.equal(release.sourceOfTruth,'characters/source');
  assert.equal(release.generatedManifest,'characters/generated/manifest.json');
  assert.equal(release.exporter,'scripts/export-character-assets.mjs');
});

test('release contract keeps external authoring gates truthful',()=>{
  const release=readJson('characters/release.json');
  assert.equal(release.gates.illustratorRoundtrip,'pending');
  assert.equal(release.gates.riveRuntimeBinary,'not-authored');
  assert.equal(release.gates.automatedVerification,'required');
  assert.equal(release.truthBoundary,'Characters are a view. Evidence is the truth.');
});

test('release contract exposes the human review surface and external evidence workflow',()=>{
  const release=readJson('characters/release.json');
  assert.equal(release.review.surface,'characters/review/index.html');
  assert.equal(release.review.generator,'scripts/generate-character-review.mjs');
  assert.equal(release.externalEvidence.preflightCommand,'npm run character:authoring:preflight');
  assert.equal(release.externalEvidence.illustratorTemplate,'characters/ci/evidence/illustrator-roundtrip.template.json');
  assert.equal(release.externalEvidence.riveTemplate,'characters/ci/evidence/rive-authoring.template.json');
  assert.equal(release.externalEvidence.humanBrandReviewTemplate,'characters/ci/evidence/human-brand-review.template.json');
});

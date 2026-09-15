#!/usr/bin/env node
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateReadiness} from './verify-character-production-readiness.mjs';

const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function promoteCharacterRelease({root = process.cwd(), candidateCommit}) {
  const report = evaluateReadiness({root, candidateCommit});
  if (!report.automated.pass) throw new Error('Automated candidate verification is not green.');
  for (const gate of ['illustratorRoundtrip', 'humanBrandReview']) {
    if (!report.external.verified.includes(gate)) throw new Error(`External gate is not verified: ${gate}`);
  }

  const releasePath = path.join(root, 'characters/release.json');
  const release = readJson(releasePath);
  const prePromotionSha256 = sha256(releasePath);
  release.status = 'release';
  release.gates.illustratorRoundtrip = 'verified';
  release.gates.humanBrandReview = 'verified';
  fs.writeFileSync(releasePath, `${JSON.stringify(release, null, 2)}\n`);

  const evidence = {
    illustratorRoundtrip: 'characters/ci/evidence/illustrator-roundtrip.json',
    humanBrandReview: 'characters/ci/evidence/human-brand-review.json'
  };
  const runtime = readJson(path.join(root, 'characters/motion/rive/runtime-manifest.json'));
  const attestation = {
    $schema: 'aftergraph.character-production-attestation.v1',
    candidateCommit,
    promotedAt: new Date().toISOString(),
    truthBoundary: release.truthBoundary,
    release: {
      path: 'characters/release.json',
      prePromotionSha256,
      promotedSha256: sha256(releasePath),
      status: release.status
    },
    evidence: Object.fromEntries(Object.entries(evidence).map(([id, rel]) => [id, {path: rel, sha256: sha256(path.join(root, rel))}])),
    riveRuntime: {
      path: runtime.artifact.path,
      sha256: runtime.artifact.sha256
    }
  };
  const attestationPath = path.join(root, 'characters/production-attestation.json');
  fs.writeFileSync(attestationPath, `${JSON.stringify(attestation, null, 2)}\n`);
  return attestation;
}

function main() {
  const root = process.cwd();
  const args = process.argv.slice(2);
  const i = args.indexOf('--candidate');
  const candidateCommit = i >= 0
    ? args[i + 1]
    : execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  if (!candidateCommit) throw new Error('Missing candidate commit.');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
  if (head !== candidateCommit) throw new Error(`Candidate ${candidateCommit} does not match checked out HEAD ${head}.`);
  const attestation = promoteCharacterRelease({root, candidateCommit});
  console.log(`Promoted character release candidate ${candidateCommit}.`);
  console.log(`Attestation: characters/production-attestation.json (${attestation.release.promotedSha256})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

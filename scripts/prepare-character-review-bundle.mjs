#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const out = path.resolve(root, value('--out', 'dist/character-review-bundle'));
const head = execFileSync('git', ['rev-parse', 'HEAD'], {cwd: root, encoding: 'utf8'}).trim();
const sha256 = (data) => crypto.createHash('sha256').update(data).digest('hex');

function copy(rel, destRel) {
  const source = path.join(root, rel);
  const dest = path.join(out, destRel);
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.copyFileSync(source, dest);
  return {path: destRel, bytes: fs.statSync(dest).size, sha256: sha256(fs.readFileSync(dest))};
}
fs.rmSync(out, {recursive: true, force: true});
fs.mkdirSync(out, {recursive: true});
execFileSync(process.execPath, [path.join(root, 'scripts/prepare-character-authoring-evidence.mjs')], {
  cwd: root,
  stdio: 'ignore'
});

const preflightPath = path.join(root, 'characters/ci/evidence/authoring-preflight.json');
const preflight = JSON.parse(fs.readFileSync(preflightPath, 'utf8'));
if (preflight.candidateCommit !== head) throw new Error('authoring preflight is not bound to exact HEAD');

const files = [
  copy('characters/source/master/base-character.svg', 'source/base-character.svg'),
  copy('characters/review/index.html', 'review/index.html'),
  copy('characters/review/VISUAL-AUDIT.md', 'review/VISUAL-AUDIT.md'),
  copy('characters/ci/evidence/authoring-preflight.json', 'evidence/authoring-preflight.json'),
  copy('characters/ci/evidence/illustrator-roundtrip.template.json', 'evidence/illustrator-roundtrip.json'),
  copy('characters/ci/evidence/human-brand-review.template.json', 'evidence/human-brand-review.json'),
  copy('characters/motion/rive/runtime-manifest.json', 'runtime/runtime-manifest.json')
];
for (const rel of ['evidence/illustrator-roundtrip.json', 'evidence/human-brand-review.json']) {
  const p = path.join(out, rel);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.candidateCommit = head;
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`);
}

const manifest = {
  $schema: 'aftergraph.character-review-bundle.v1',
  candidateCommit: head,
  generatedAt: new Date().toISOString(),
  gates: {
    illustrator: 'pending-external',
    humanBrandReview: 'pending-external',
    riveRuntime: 'verified-in-repo'
  },
  truthBoundary: 'Characters are a view. Evidence is the truth.',
  files
};
fs.writeFileSync(path.join(out, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const readme = `# Aftergraph Character review bundle\n\nCandidate: \`${head}\`\n\n1. Illustrator: open \`source/base-character.svg\`, complete the roundtrip checklist, and fill \`evidence/illustrator-roundtrip.json\`.\n2. Brand review: open \`review/index.html\`, use \`review/VISUAL-AUDIT.md\` as machine-assisted context only, and fill \`evidence/human-brand-review.json\`.\n3. Do not mark either gate complete unless it was actually performed against this exact candidate.\n\nThe Rive runtime evidence is included under \`runtime/\`.\n\n**Characters are a view. Evidence is the truth.**\n`;
fs.writeFileSync(path.join(out, 'README.md'), readme);
console.log(`Prepared review bundle for ${head} at ${path.relative(root, out)}.`);

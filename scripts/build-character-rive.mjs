#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const project = path.join(root, 'characters/motion/rive');
const rel = (p) => path.relative(root, p).replaceAll(path.sep, '/');
const sha256File = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const candidates = [process.env.RIVE_CLI, 'rive', path.join(os.homedir(), '.rive/bin/rive')].filter(Boolean);
let rive = null;
for (const candidate of candidates) {
  try { execFileSync(candidate, ['--version'], {stdio:'pipe'}); rive = candidate; break; } catch {}
}
if (!rive) throw new Error('Rive CLI is required. Install the official Rive CLI before building the runtime asset.');

execFileSync(process.execPath, ['scripts/generate-character-rive.mjs', '--check'], {cwd:root, stdio:'inherit'});
const version = execFileSync(rive, ['--version'], {cwd:root, encoding:'utf8'}).trim();
const output = execFileSync(rive, [project, '--once', '--format=json'], {cwd:root, encoding:'utf8'}).trim();
const report = JSON.parse(output);
if (!report.success || !report.data?.riv) throw new Error(`Rive build failed: ${output}`);

const artifact = path.resolve(root, report.data.riv);
if (!fs.existsSync(artifact) || fs.statSync(artifact).size < 1024) throw new Error('Rive runtime artifact is missing or unexpectedly small.');
const sourceManifest = path.join(project, 'source-manifest.json');
const scene = path.join(project, 'scene.rml');
const script = path.join(project, 'actor-presence.luau');
const runtimeManifest = {
  $schema:'aftergraph.character-rive-runtime.v1',
  version:'1.0.0',
  riveCliVersion:version,
  buildCommand:'npm run character:rive:build',
  artifact:{path:rel(artifact),bytes:fs.statSync(artifact).size,sha256:sha256File(artifact)},
  sources:{
    sourceManifest:{path:rel(sourceManifest),sha256:sha256File(sourceManifest)},
    scene:{path:rel(scene),sha256:sha256File(scene)},
    script:{path:rel(script),sha256:sha256File(script)},
  },
};
fs.writeFileSync(path.join(project, 'runtime-manifest.json'), `${JSON.stringify(runtimeManifest, null, 2)}\n`);
console.log(`Built ${runtimeManifest.artifact.path} (${runtimeManifest.artifact.bytes} bytes, sha256 ${runtimeManifest.artifact.sha256}).`);

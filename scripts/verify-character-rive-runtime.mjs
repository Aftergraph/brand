#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const project = path.join(root, 'characters/motion/rive');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const sha256File = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const candidates = [process.env.RIVE_CLI, 'rive', path.join(os.homedir(), '.rive/bin/rive')].filter(Boolean);
let rive = null;
for (const candidate of candidates) {
  try { execFileSync(candidate, ['--version'], {stdio:'pipe'}); rive = candidate; break; } catch {}
}
if (!rive) throw new Error('Rive CLI is required for runtime QA.');

execFileSync(process.execPath, ['scripts/build-character-rive.mjs'], {cwd:root, stdio:'inherit', env:{...process.env,RIVE_CLI:rive}});
const canonicalStates = readJson('characters/states.json').states.map((x) => x.id);
const canonicalRoles = readJson('characters/roles.json').roles.map((x) => x.id);
const cases = [
  ['entity','idle','none'], ['researcher','thinking','informational'], ['guide','planning','informational'],
  ['builder','executing','informational'], ['observer','inspecting','informational'], ['entity','waiting','none'],
  ['observer','blocked','required'], ['guide','approval-required','required'], ['verifier','verifying','informational'],
  ['builder','completed','none'], ['entity','failed','critical'],
];
if (JSON.stringify(cases.map((x) => x[1])) !== JSON.stringify(canonicalStates)) throw new Error('Runtime QA cases must exercise every canonical state in order.');
for (const role of canonicalRoles) if (!cases.some((x) => x[0] === role)) throw new Error(`Runtime QA is missing role ${role}.`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'aftergraph-rive-runtime-'));
const hashes = new Set();
try {
  for (const [role,state,attention] of cases) {
    const stem = `${role}--${state}`;
    const png = path.join(tmp, `${stem}.png`);
    const dump = path.join(tmp, `${stem}.json`);
    execFileSync(rive, [project, `--screenshot=${png}`, `--data=role=${role}`, `--data=state=${state}`, `--data=attention=${attention}`, '--data=reducedMotion=true', `--data-dump=${dump}`, '--quiet'], {cwd:root, stdio:'pipe'});
    if (!fs.existsSync(png) || fs.statSync(png).size < 4096) throw new Error(`${stem} did not produce a valid headless render.`);
    const vm = JSON.parse(fs.readFileSync(dump, 'utf8')).viewModel;
    const values = Object.fromEntries(vm.properties.map((p) => [p.name,p.value]));
    if (values.role !== role || values.state !== state || values.attention !== attention || values.reducedMotion !== true) throw new Error(`${stem} data binding did not round-trip.`);
    hashes.add(sha256File(png));
  }
  if (hashes.size !== cases.length) throw new Error(`Expected ${cases.length} distinct runtime renders, got ${hashes.size}.`);
} finally {
  fs.rmSync(tmp, {recursive:true, force:true});
}
console.log(`Rive runtime QA passed: ${cases.length} state renders, ${canonicalRoles.length} roles covered, data binding round-tripped.`);

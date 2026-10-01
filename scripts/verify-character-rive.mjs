#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const project = path.join(root, 'characters/motion/rive');
const candidates = [process.env.RIVE_CLI, 'rive', path.join(os.homedir(), '.rive/bin/rive')].filter(Boolean);
let rive = null;
for (const candidate of candidates) {
  try { execFileSync(candidate, ['--version'], {stdio:'pipe'}); rive = candidate; break; } catch {}
}
if (!rive) throw new Error('Rive CLI is required. Install from https://releases.rive.app/cli/install.sh');
execFileSync(process.execPath, ['scripts/generate-character-rive.mjs', '--check'], {cwd:root, stdio:'inherit'});
execFileSync(rive, [project, '--verify', '--format=json'], {cwd:root, stdio:'inherit'});
const inspect = JSON.parse(execFileSync(rive, ['inspect', project, '--summary'], {cwd:root, encoding:'utf8'}));
if (inspect.problems?.length) throw new Error(`Rive resolved scene reported ${inspect.problems.length} problem${inspect.problems.length === 1 ? '' : 's'}.`);
const problems = path.join(project, 'build/problems.log');
if (fs.existsSync(problems)) {
  const report = fs.readFileSync(problems, 'utf8');
  if (/(?:^|\|)\s*[1-9]\d*\s+(?:errors?|warnings?)\b|^\s*(?:ERROR|WARNING)\b/im.test(report)) {
    throw new Error(`Rive CLI reported problems in ${path.relative(root, problems)}`);
  }
}
console.log('Rive CLI source verification passed.');

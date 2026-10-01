import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync, execFileSync} from "node:child_process";

const root = process.cwd();
const script = path.join(root, "scripts/prepare-character-review-bundle.mjs");

test("review bundle is exact-HEAD, self-contained, and preserves pending external gates", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ag-review-bundle-"));
  const out = path.join(tmp, "bundle");
  const run = spawnSync(process.execPath, [script, "--out", out], {cwd: root, encoding: "utf8"});
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const manifest = JSON.parse(fs.readFileSync(path.join(out, "manifest.json"), "utf8"));
  assert.equal(manifest.candidateCommit, execFileSync("git", ["rev-parse", "HEAD"], {cwd: root, encoding: "utf8"}).trim());
  assert.equal(manifest.gates.illustrator, "pending-external");
  assert.equal(manifest.gates.humanBrandReview, "pending-external");
  for (const rel of [
    "source/base-character.svg",
    "review/index.html",
    "evidence/illustrator-roundtrip.json",
    "evidence/human-brand-review.json",
    "evidence/authoring-preflight.json",
    "README.md"
  ]) assert.ok(fs.existsSync(path.join(out, rel)), `missing ${rel}`);
  const illustrator = JSON.parse(fs.readFileSync(path.join(out, "evidence/illustrator-roundtrip.json"), "utf8"));
  const human = JSON.parse(fs.readFileSync(path.join(out, "evidence/human-brand-review.json"), "utf8"));
  assert.equal(illustrator.candidateCommit, manifest.candidateCommit);
  assert.equal(human.candidateCommit, manifest.candidateCommit);
  assert.equal(illustrator.pass, null);
  assert.equal(human.decision, "pending");
});

test("manual review-bundle workflow uploads the exact-head handoff without publishing", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/character-review-bundle.yml"), "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /characters\/\*\*/);
  assert.match(workflow, /npm run character:review:bundle/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/);
  assert.match(workflow, /aftergraph-character-review-/);
  assert.ok(workflow.includes('CANDIDATE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}'));
  assert.ok(workflow.includes('ref: ${{ env.CANDIDATE_SHA }}'));
  assert.ok(workflow.includes('name: aftergraph-character-review-${{ env.CANDIDATE_SHA }}'));
  assert.doesNotMatch(workflow, /npm publish|merge_pull_request|gh pr merge|git push/);
});

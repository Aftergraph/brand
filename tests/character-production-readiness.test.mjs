import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync, spawnSync} from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const cli = path.join(root, "scripts/verify-character-production-readiness.mjs");

function run(args = []) {
  return spawnSync(process.execPath, [cli, ...args], {cwd: root, encoding: "utf8"});
}

test("candidate readiness proves automated gates while preserving external blockers", () => {
  const result = run(["--mode", "candidate", "--json"]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(result.stdout);
  assert.equal(report.verdict, "READY_FOR_EXTERNAL_GATES");
  assert.equal(report.automated.pass, true);
  assert.deepEqual(report.external.pending.sort(), ["humanBrandReview", "illustratorRoundtrip"]);
});

test("production readiness fails closed while external evidence and release promotion are incomplete", () => {
  const result = run(["--mode", "production", "--json"]);
  assert.notEqual(result.status, 0, "production verification must fail until manual gates are proven");
  const report = JSON.parse(result.stdout);
  assert.equal(report.verdict, "BLOCKED_EXTERNAL_GATES");
  assert.ok(report.blockers.some((x) => x.includes("release.status")));
  assert.ok(report.blockers.some((x) => x.includes("illustrator")));
  assert.ok(report.blockers.some((x) => x.includes("human brand")));
});

test("release workflow is manual, fail-closed, and packages only after production verification", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/character-release.yml"), "utf8");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /character:production:verify/);
  assert.match(workflow, /npm run character:rive:qa/);
  assert.match(workflow, /npm run character:export/);
  assert.match(workflow, /exports\/characters/);
  assert.match(workflow, /npm pack/);
  assert.match(workflow, /actions\/upload-artifact@/);
});


test("pull-request CI verifies candidate release readiness", () => {
  const workflow = fs.readFileSync(path.join(root, ".github/workflows/ci.yml"), "utf8");
  assert.match(workflow, /npm run character:candidate:verify/);
});


test("completed external evidence is bound to the exact candidate", async () => {
  const {createHash}=await import("node:crypto");
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"aftergraph-character-ready-"));
  const copy=(rel)=>{const dst=path.join(tmp,rel);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,rel),dst);};
  for(const rel of [
    "characters/release.json","characters/generated/manifest.json",
    "characters/motion/rive/runtime-manifest.json","characters/motion/rive/source-manifest.json",
    "characters/motion/rive/scene.rml","characters/motion/rive/actor-presence.luau",
    "characters/motion/rive/build/aftergraph_actor_presence.riv",
    "characters/source/master/base-character.svg"
  ]) copy(rel);
  const releasePath=path.join(tmp,"characters/release.json");
  const release=JSON.parse(fs.readFileSync(releasePath,"utf8"));
  release.status="release";
  release.gates.illustratorRoundtrip="verified";
  release.gates.humanBrandReview="verified";
  fs.writeFileSync(releasePath,JSON.stringify(release,null,2)+"\n");
  const candidate="fixture-candidate";
  const base=path.join(tmp,"characters/source/master/base-character.svg");
  const inputSha=createHash("sha256").update(fs.readFileSync(base)).digest("hex");
  const evidenceDir=path.join(tmp,"characters/ci/evidence");
  fs.mkdirSync(evidenceDir,{recursive:true});
  fs.writeFileSync(path.join(evidenceDir,"illustrator-roundtrip.json"),JSON.stringify({
    candidateCommit:candidate,inputSha256:inputSha,pass:true,
    openedWithoutConversionWarnings:true,artboard:{width:512,height:512,verified:true},
    requiredGroupsEditable:true,gradientsEditable:{"metal-highlight":true,"visor-glow":true},
    independentMoveUndoVerified:true,savedAsSvg11:true,reopenedSuccessfully:true,
    requiredGroupsPreservedAfterReopen:true,gradientsPreservedAfterReopen:true,
    outputSha256:"a".repeat(64)
  }));
  fs.writeFileSync(path.join(evidenceDir,"human-brand-review.json"),JSON.stringify({
    candidateCommit:candidate,decision:"approved",criteria:{
      silhouetteConsistency:true,roleDifferentiation:true,stateLegibility:true,
      propCollisionFree:true,darkTheme:true,lightTheme:true,smallSizeReadability:true,
      brandFit:true,truthBoundary:true
    }
  }));
  const mod=await import(`../scripts/verify-character-production-readiness.mjs?fixture=${Date.now()}`);
  const report=mod.evaluateReadiness({root:tmp,candidateCommit:candidate});
  assert.equal(report.automated.pass,true);
  assert.deepEqual(report.external.invalid,[]);
  assert.deepEqual(report.external.pending,[]);
  assert.deepEqual(report.external.verified.sort(),["humanBrandReview","illustratorRoundtrip"]);
  fs.rmSync(tmp,{recursive:true,force:true});
});

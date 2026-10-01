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


test("production promotion converts a verified candidate into a derived release with provenance", async () => {
  const {createHash}=await import("node:crypto");
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"aftergraph-character-promote-"));
  const copy=(rel)=>{const dst=path.join(tmp,rel);fs.mkdirSync(path.dirname(dst),{recursive:true});fs.copyFileSync(path.join(root,rel),dst);};
  for(const rel of [
    "characters/release.json","characters/generated/manifest.json",
    "characters/motion/rive/runtime-manifest.json","characters/motion/rive/source-manifest.json",
    "characters/motion/rive/scene.rml","characters/motion/rive/actor-presence.luau",
    "characters/motion/rive/build/aftergraph_actor_presence.riv",
    "characters/source/master/base-character.svg"
  ]) copy(rel);
  const candidate="approved-candidate";
  const base=path.join(tmp,"characters/source/master/base-character.svg");
  const inputSha=createHash("sha256").update(fs.readFileSync(base)).digest("hex");
  const evidenceDir=path.join(tmp,"characters/ci/evidence"); fs.mkdirSync(evidenceDir,{recursive:true});
  fs.writeFileSync(path.join(evidenceDir,"illustrator-roundtrip.json"),JSON.stringify({candidateCommit:candidate,inputSha256:inputSha,pass:true,openedWithoutConversionWarnings:true,artboard:{width:512,height:512,verified:true},requiredGroupsEditable:true,gradientsEditable:{"metal-highlight":true,"visor-glow":true},independentMoveUndoVerified:true,savedAsSvg11:true,reopenedSuccessfully:true,requiredGroupsPreservedAfterReopen:true,gradientsPreservedAfterReopen:true,outputSha256:"b".repeat(64)}));
  fs.writeFileSync(path.join(evidenceDir,"human-brand-review.json"),JSON.stringify({candidateCommit:candidate,decision:"approved",criteria:{silhouetteConsistency:true,roleDifferentiation:true,stateLegibility:true,propCollisionFree:true,darkTheme:true,lightTheme:true,smallSizeReadability:true,brandFit:true,truthBoundary:true}}));
  const mod=await import(`../scripts/promote-character-release.mjs?fixture=${Date.now()}`);
  const attestation=mod.promoteCharacterRelease({root:tmp,candidateCommit:candidate});
  const release=JSON.parse(fs.readFileSync(path.join(tmp,"characters/release.json"),"utf8"));
  assert.equal(release.status,"release");
  assert.equal(release.gates.illustratorRoundtrip,"verified");
  assert.equal(release.gates.humanBrandReview,"verified");
  assert.equal(attestation.candidateCommit,candidate);
  assert.match(attestation.evidence.illustratorRoundtrip.sha256,/^[a-f0-9]{64}$/);
  assert.match(attestation.evidence.humanBrandReview.sha256,/^[a-f0-9]{64}$/);
  const verifier=await import(`../scripts/verify-character-production-readiness.mjs?attestation=${Date.now()}`);
  const promoted=verifier.evaluateReadiness({root:tmp,candidateCommit:candidate});
  assert.equal(promoted.attestation.valid,true,JSON.stringify(promoted.attestation));
  const humanPath=path.join(evidenceDir,"human-brand-review.json");
  const human=JSON.parse(fs.readFileSync(humanPath,"utf8")); human.decision="rejected"; fs.writeFileSync(humanPath,JSON.stringify(human));
  const tampered=verifier.evaluateReadiness({root:tmp,candidateCommit:candidate});
  assert.equal(tampered.attestation.valid,false);
  fs.rmSync(tmp,{recursive:true,force:true});
});

test("package exposes an explicit production promotion command", () => {
  const pkg=JSON.parse(fs.readFileSync(path.join(root,"package.json"),"utf8"));
  assert.equal(pkg.scripts["character:release:promote"],"node scripts/promote-character-release.mjs");
});

test("production workflow accepts exact-candidate external evidence inputs before packaging", () => {
  const workflow=fs.readFileSync(path.join(root,".github/workflows/character-release.yml"),"utf8");
  assert.match(workflow,/candidate_sha:/);
  assert.match(workflow,/illustrator_evidence_b64:/);
  assert.match(workflow,/human_brand_review_b64:/);
  assert.match(workflow,/confirm_release:/);
  assert.match(workflow,/base64 --decode/);
  assert.match(workflow,/npm run character:release:promote/);
  assert.match(workflow,/ref: \$\{\{ inputs\.candidate_sha \}\}/);
  assert.match(workflow,/production-attestation\.json/);
});

test("production documentation explains external evidence promotion without mutating the reviewed candidate", () => {
  const readme=fs.readFileSync(path.join(root,"characters/README.md"),"utf8");
  assert.match(readme,/candidate_sha/);
  assert.match(readme,/production-attestation\.json/);
  assert.match(readme,/external evidence/i);
  assert.match(readme,/does not publish or merge automatically/i);
});

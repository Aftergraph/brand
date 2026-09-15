import crypto from "node:crypto";
import {execFileSync} from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const TRUTH = "Characters are a view. Evidence is the truth.";
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const exists = (file) => fs.existsSync(file);

function booleanChecklist(obj, keys) {
  return keys.every((key) => obj?.[key] === true);
}

export function evaluateReadiness({root = process.cwd(), candidateCommit}) {
  const release = readJson(path.join(root, "characters/release.json"));
  const generated = readJson(path.join(root, release.generatedManifest));
  const runtime = readJson(path.join(root, "characters/motion/rive/runtime-manifest.json"));
  const automatedChecks = [];
  const check = (id, pass, detail) => automatedChecks.push({id, pass:Boolean(pass), detail});

  check("truth-boundary", release.truthBoundary === TRUTH, release.truthBoundary);
  check("source-of-truth", release.sourceOfTruth === "characters/source" && generated.sourceOfTruth === release.sourceOfTruth, generated.sourceOfTruth);
  check("role-count", generated.roles?.length === release.counts.roles, `${generated.roles?.length}/${release.counts.roles}`);
  check("state-count", generated.states?.length === release.counts.states, `${generated.states?.length}/${release.counts.states}`);
  check("composition-count", generated.compositions?.length === release.counts.compositionsPerTheme, `${generated.compositions?.length}/${release.counts.compositionsPerTheme}`);
  check("automated-gate-contract", release.gates.automatedVerification === "required", release.gates.automatedVerification);
  check("rive-gate-contract", release.gates.riveRuntimeBinary === "verified", release.gates.riveRuntimeBinary);

  const artifact = path.join(root, runtime.artifact.path);
  check("rive-artifact-exists", exists(artifact), runtime.artifact.path);
  if (exists(artifact)) {
    check("rive-artifact-bytes", fs.statSync(artifact).size === runtime.artifact.bytes, `${fs.statSync(artifact).size}/${runtime.artifact.bytes}`);
    check("rive-artifact-sha256", sha256(artifact) === runtime.artifact.sha256, runtime.artifact.sha256);
  }
  for (const [name, item] of Object.entries(runtime.sources ?? {})) {
    const file = path.join(root, item.path);
    check(`rive-source-${name}`, exists(file) && sha256(file) === item.sha256, item.path);
  }

  const external = {pending:[], verified:[], invalid:[]};
  const base = path.join(root, "characters/source/master/base-character.svg");
  const illustratorPath = path.join(root, "characters/ci/evidence/illustrator-roundtrip.json");
  if (!exists(illustratorPath)) {
    external.pending.push("illustratorRoundtrip");
  } else {
    const ev = readJson(illustratorPath);
    const pass = ev.pass === true && ev.candidateCommit === candidateCommit && ev.inputSha256 === sha256(base)
      && ev.openedWithoutConversionWarnings === true && ev.artboard?.width === 512 && ev.artboard?.height === 512 && ev.artboard?.verified === true
      && ev.requiredGroupsEditable === true && ev.gradientsEditable?.["metal-highlight"] === true && ev.gradientsEditable?.["visor-glow"] === true
      && ev.independentMoveUndoVerified === true && ev.savedAsSvg11 === true && ev.reopenedSuccessfully === true
      && ev.requiredGroupsPreservedAfterReopen === true && ev.gradientsPreservedAfterReopen === true && /^[a-f0-9]{64}$/.test(ev.outputSha256 ?? "");
    (pass ? external.verified : external.invalid).push("illustratorRoundtrip");
  }

  const humanPath = path.join(root, "characters/ci/evidence/human-brand-review.json");
  if (!exists(humanPath)) {
    external.pending.push("humanBrandReview");
  } else {
    const ev = readJson(humanPath);
    const criteria = Object.values(ev.criteria ?? {});
    const pass = ev.candidateCommit === candidateCommit && ev.decision === "approved" && criteria.length > 0 && criteria.every((v) => v === true);
    (pass ? external.verified : external.invalid).push("humanBrandReview");
  }

  return {candidateCommit, release, automated:{pass:automatedChecks.every((x) => x.pass), checks:automatedChecks}, external};
}

function parseArgs(argv) {
  const out = {mode:"candidate", json:false, report:null};
  for (let i=0;i<argv.length;i++) {
    if (argv[i] === "--mode") out.mode = argv[++i];
    else if (argv[i] === "--json") out.json = true;
    else if (argv[i] === "--report") out.report = argv[++i];
    else throw new Error(`Unknown argument: ${argv[i]}`);
  }
  if (!["candidate","production"].includes(out.mode)) throw new Error(`Invalid mode: ${out.mode}`);
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const candidateCommit = execFileSync("git", ["rev-parse", "HEAD"], {cwd:root, encoding:"utf8"}).trim();
  const report = evaluateReadiness({root, candidateCommit});
  const blockers = [];
  if (!report.automated.pass) blockers.push(...report.automated.checks.filter((x) => !x.pass).map((x) => `automated:${x.id}`));
  if (args.mode === "production") {
    if (report.release.status !== "release") blockers.push(`release.status must be release (got ${report.release.status})`);
    if (report.release.gates.illustratorRoundtrip !== "verified") blockers.push("illustrator release gate is not verified");
    if (report.release.gates.humanBrandReview !== "verified") blockers.push("human brand release gate is not verified");
    if (!report.external.verified.includes("illustratorRoundtrip")) blockers.push("illustrator evidence missing or invalid for exact HEAD");
    if (!report.external.verified.includes("humanBrandReview")) blockers.push("human brand evidence missing or invalid for exact HEAD");
  }
  const verdict = blockers.length ? (args.mode === "production" ? "BLOCKED_EXTERNAL_GATES" : "NOT_READY") : (args.mode === "production" ? "PRODUCTION_READY" : "READY_FOR_EXTERNAL_GATES");
  const final = {...report, mode:args.mode, blockers, verdict};
  if (args.report) {
    fs.mkdirSync(path.dirname(path.resolve(root,args.report)), {recursive:true});
    fs.writeFileSync(path.resolve(root,args.report), JSON.stringify(final,null,2)+"\n");
  }
  if (args.json) process.stdout.write(JSON.stringify(final)+"\n");
  else {
    console.log(`Character release verdict: ${verdict}`);
    console.log(`Automated gates: ${report.automated.pass ? "PASS" : "FAIL"}`);
    console.log(`External verified: ${report.external.verified.join(", ") || "none"}`);
    console.log(`External pending: ${report.external.pending.join(", ") || "none"}`);
    if (blockers.length) blockers.forEach((x) => console.log(`BLOCKER: ${x}`));
  }
  if (blockers.length) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

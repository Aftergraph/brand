#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {compositionMapLua} from './lib/svg-to-rive-luau.mjs';

const root = path.resolve(import.meta.dirname, '..');
const outRoot = path.join(root, 'characters/motion/rive');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const roles = readJson('characters/roles.json').roles.map((role) => role.id);
const states = readJson('characters/states.json').states.map((state) => state.id);
const motion = readJson('characters/motion/motion.json');
const attention = ['none', 'informational', 'required', 'critical'];
const motionPeriods = Object.fromEntries(states.map((state) => {
  const normal = motion.states[state]?.normal || {};
  const ms = normal.periodMs ?? normal.durationMs ?? 1000;
  return [state, ms / 1000];
}));
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function enumXml(name, enumId, startId, values) {
  return `<DataEnumCustom name="${esc(name)}" id="0:${enumId}">\n${values.map((value, i) => `    <DataEnumValue key="${esc(value)}" value="${esc(value)}" id="0:${startId + i}"/>`).join('\n')}\n</DataEnumCustom>`;
}

const roleIds = roles.map((_, i) => 101 + i);
const stateIds = states.map((_, i) => 201 + i);
const attentionIds = attention.map((_, i) => 301 + i);
const scene = `<Rive version="1" kind="fragment">
  <Artboard defaultStateMachineId="0:7" viewModelId="0:400" clip="true" width="512" height="512" styleId="0:5" name="ActorPresence" id="0:2">
    <LayoutComponentStyle name="Artboard Style" id="0:5"/>
    <LayoutComponent width="512" height="512" styleId="0:11" name="Root Layout" id="0:10">
      <LayoutComponentStyle layoutWidthScaleType="1" layoutHeightScaleType="1" widthUnitsValue="3" heightUnitsValue="3" name="Layout Style" id="0:11"/>
      <ScriptedLayout scriptAssetId="0:80" name="Actor Presence Renderer" id="0:12"/>
    </LayoutComponent>
    <StateMachine name="ActorPresence" id="0:7">
      <StateMachineLayer name="Projection" id="0:8"><AnyState x="200" y="-120"/><ExitState x="400" y="-120"/><EntryState x="0" y="0"/></StateMachineLayer>
    </StateMachine>
  </Artboard>

  ${enumXml('Role', 100, 101, roles)}
  ${enumXml('State', 200, 201, states)}
  ${enumXml('Attention', 300, 301, attention)}

  <ViewModel defaultInstanceId="0:410" name="ActorPresence" id="0:400">
    <ViewModelPropertyEnumCustom enumId="0:100" name="role" id="0:401"/>
    <ViewModelPropertyEnumCustom enumId="0:200" name="state" id="0:402"/>
    <ViewModelPropertyEnumCustom enumId="0:300" name="attention" id="0:403"/>
    <ViewModelPropertyBoolean name="reducedMotion" id="0:404"/>
    <ViewModelInstance exports="true" name="Default" id="0:410">
      <ViewModelInstanceEnum propertyValue="0:${roleIds[0]}" viewModelPropertyId="0:401"/>
      <ViewModelInstanceEnum propertyValue="0:${stateIds[0]}" viewModelPropertyId="0:402"/>
      <ViewModelInstanceEnum propertyValue="0:${attentionIds[0]}" viewModelPropertyId="0:403"/>
      <ViewModelInstanceBoolean propertyValue="false" viewModelPropertyId="0:404"/>
    </ViewModelInstance>
  </ViewModel>
  <ScriptAsset file="actor-presence.luau" name="actor-presence" id="0:80"/>
</Rive>
`;
const compositionEntries = roles.flatMap((role) => states.map((state) => ({
  key:`${role}:${state}`,
  path:`characters/generated/compositions/${role}--${state}.svg`,
  svg:read(`characters/generated/compositions/${role}--${state}.svg`),
})));
const projectedCompositions = compositionMapLua(compositionEntries);
const motionPeriodsLua = Object.entries(motionPeriods).map(([state, seconds]) => `  [\"${state}\"] = ${seconds},`).join('\n');
const luau = `-- GENERATED: Aftergraph Actor Presence Rive CLI source.
-- Canonical vectors are projected from characters/generated/compositions.
-- Characters are a view. Evidence is the truth.
${projectedCompositions}

local MOTION_PERIODS: {[string]: number} = {
${motionPeriodsLua}
}

local function motionIntensity(attention: string): number
  if attention == 'critical' then return 1.35 end
  if attention == 'required' then return 1.18 end
  if attention == 'informational' then return 1.0 end
  return 0.82
end

function motionTransform(state: string, elapsed: number, attention: string): Mat2D
  local period = MOTION_PERIODS[state] or 2.0
  local phase = (elapsed / period) * math.pi * 2
  local dx = 0.0
  local dy = 0.0
  local rotation = 0.0
  local scale = 1.0
  local intensity = motionIntensity(attention)

  if state == 'idle' then
    dy = math.sin(phase) * 1.2
    scale = 1.0 + math.sin(phase) * 0.003
  elseif state == 'thinking' then
    dy = math.sin(phase) * 1.6
    rotation = math.sin(phase) * 0.007
  elseif state == 'planning' then
    scale = 1.0 + math.sin(phase) * 0.004
  elseif state == 'executing' then
    dx = math.sin(phase) * 1.8
    scale = 1.0 + math.max(0, math.sin(phase)) * 0.004
  elseif state == 'inspecting' then
    rotation = math.sin(phase) * 0.009
  elseif state == 'waiting' then
    dy = math.sin(phase) * 0.8
  elseif state == 'blocked' then
    dx = math.sin(phase) * 0.7
  elseif state == 'approval-required' then
    scale = 1.0 + math.max(0, math.sin(phase)) * 0.006
  elseif state == 'verifying' then
    rotation = math.sin(phase) * 0.006
    dy = math.sin(phase * 2) * 0.7
  elseif state == 'completed' then
    local t = math.min(elapsed / period, 1.0)
    scale = 0.985 + 0.015 * t
  elseif state == 'failed' then
    local t = math.min(elapsed / period, 1.0)
    dy = 2.0 * t
  end

  dx *= intensity
  dy *= intensity
  rotation *= intensity
  scale = 1.0 + (scale - 1.0) * intensity
  return Mat2D.withTranslation(dx, dy)
    * Mat2D.withTranslation(256, 256)
    * Mat2D.withRotation(rotation)
    * Mat2D.withScale(scale, scale)
    * Mat2D.withTranslation(-256, -256)
end

type ActorPresence = {
  size: Vector, role: PropertyEnum?, state: PropertyEnum?, attention: PropertyEnum?,
  reducedMotion: Property<boolean>?, elapsed: number, lastProjectionKey: string?,
}

function init(self: ActorPresence, context: Context): boolean
  local vm = context:viewModel()
  if vm ~= nil then
    self.role = vm:getEnum('role')
    self.state = vm:getEnum('state')
    self.attention = vm:getEnum('attention')
    self.reducedMotion = vm:getBoolean('reducedMotion')
  end
  return true
end

function resize(self: ActorPresence, size: Vector) self.size = size end

function advance(self: ActorPresence, seconds: number): boolean
  local role = if self.role ~= nil then self.role.value else 'entity'
  local state = if self.state ~= nil then self.state.value else 'idle'
  local attention = if self.attention ~= nil then self.attention.value else 'none'
  local reduced = self.reducedMotion ~= nil and self.reducedMotion.value
  local projectionKey = role .. ':' .. state .. ':' .. attention .. ':' .. (if reduced then 'reduced' else 'active')
  local changed = projectionKey ~= self.lastProjectionKey
  self.lastProjectionKey = projectionKey
  if not reduced then self.elapsed += seconds end
  return changed or not reduced
end

function draw(self: ActorPresence, renderer: Renderer)
  local role = if self.role ~= nil then self.role.value else 'entity'
  local state = if self.state ~= nil then self.state.value else 'idle'
  local attention = if self.attention ~= nil then self.attention.value else 'none'
  local reduced = self.reducedMotion ~= nil and self.reducedMotion.value
  local sx = self.size.x / 512
  local sy = self.size.y / 512
  renderer:save()
  renderer:transform(Mat2D.withScale(sx, sy))
  if not reduced then
    renderer:transform(motionTransform(state, self.elapsed, attention))
  end
  local projected = drawProjection(renderer, role, state)
  if not projected then
    drawComposition1(renderer)
  end
  renderer:restore()
end

return function(context: Context): Layout<ActorPresence>
  return { size=Vector.xy(512,512), role=nil, state=nil, attention=nil, reducedMotion=nil, elapsed=0, lastProjectionKey=nil, init=init, resize=resize, advance=advance, draw=draw }
end
`;
const yaml = `name: aftergraph_actor_presence\nmain: ActorPresence\nlogs:\n  file: build/rive.log\n  problems: build/problems.log\n`;
const sourceFiles = [
  'characters/source/master/base-character.svg',
  'characters/source/master/anchors.json',
  'characters/source/roles/roles.svg',
  'characters/source/states/states.svg',
  'characters/source/expressions/expressions.svg',
  'characters/source/expressions/expressions.json',
  'characters/source/rig/rig.json',
  'characters/source/rig/slots.json',
];
const sourceManifest = { $schema:'aftergraph.character-rive-cli-source.v1', version:'1.0.0', sourceOfTruth:'characters/source', sources:sourceFiles.map((rel)=>({path:rel,sha256:sha256(read(rel))})), projectionInputs:compositionEntries.map((entry)=>({path:entry.path,sha256:sha256(entry.svg)})) };
const outputs = new Map([
  ['characters/motion/rive/rive.yaml', yaml],
  ['characters/motion/rive/scene.rml', scene],
  ['characters/motion/rive/actor-presence.luau', luau],
  ['characters/motion/rive/source-manifest.json', `${JSON.stringify(sourceManifest, null, 2)}\n`],
]);
const check = process.argv.includes('--check');
const drift = [];
for (const [rel, content] of outputs) {
  const target = path.join(root, rel);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) drift.push(rel);
  } else {
    fs.mkdirSync(path.dirname(target), {recursive:true});
    fs.writeFileSync(target, content);
  }
}
if (check && drift.length) {
  console.error(`Generated Rive CLI source drifted (${drift.length}):`);
  for (const rel of drift) console.error(`- ${rel}`);
  process.exit(1);
}
console.log(`${check ? 'Verified' : 'Generated'} Aftergraph Rive CLI source project (${outputs.size} files).`);

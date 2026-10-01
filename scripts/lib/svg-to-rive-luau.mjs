const ID = [1, 0, 0, 1, 0, 0];

const num = (value, fallback = 0) => value == null ? fallback : Number(String(value).replace('%', ''));
const clamp01 = (value) => Math.max(0, Math.min(1, value));

export function parseAttrs(source = '') {
  return Object.fromEntries([...source.matchAll(/([:\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}

function mul(a, b) {
  return [
    a[0]*b[0] + a[2]*b[1], a[1]*b[0] + a[3]*b[1],
    a[0]*b[2] + a[2]*b[3], a[1]*b[2] + a[3]*b[3],
    a[0]*b[4] + a[2]*b[5] + a[4], a[1]*b[4] + a[3]*b[5] + a[5],
  ];
}

function translation(x, y) { return [1, 0, 0, 1, x, y]; }
function rotation(degrees, cx = 0, cy = 0) {
  const r = degrees * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  return mul(mul(translation(cx, cy), [c, s, -s, c, 0, 0]), translation(-cx, -cy));
}
function parseTransform(value) {
  if (!value) return ID;
  let result = ID;
  for (const match of value.matchAll(/(translate|rotate)\(([^)]+)\)/g)) {
    const values = match[2].trim().split(/[ ,]+/).filter(Boolean).map(Number);
    const local = match[1] === 'translate'
      ? translation(values[0] || 0, values[1] || 0)
      : rotation(values[0] || 0, values[1] || 0, values[2] || 0);
    result = mul(result, local);
  }
  return result;
}

const styleKeys = ['fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','fill-opacity','stroke-opacity','color'];
const defaultStyle = {fill:'#000000', stroke:'none', opacity:1, 'fill-opacity':1, 'stroke-opacity':1, color:'#000000'};

function inheritStyle(parent, attrs) {
  const next = {...parent};
  for (const key of styleKeys) if (attrs[key] != null) next[key] = attrs[key];
  if (attrs.opacity != null) next.opacity = Number(parent.opacity ?? 1) * Number(attrs.opacity);
  return next;
}

function resolvedPaint(value, style) {
  if (!value || value === 'none') return null;
  return value === 'currentColor' ? style.color : value;
}
const pathParams = {M:2,L:2,H:1,V:1,C:6,Q:4,A:7,Z:0};

export function parsePathData(d) {
  const tokens = String(d).match(/[A-Za-z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g) || [];
  const out = [];
  let i = 0, command = null;
  while (i < tokens.length) {
    if (/^[A-Za-z]$/.test(tokens[i])) command = tokens[i++];
    if (!command || !(command in pathParams)) throw new Error(`Unsupported SVG path command in: ${d}`);
    if (command === command.toLowerCase()) throw new Error(`Relative SVG path command is not supported: ${command}`);
    if (command === 'Z') { out.push({cmd:'Z', values:[]}); command = null; continue; }
    const count = pathParams[command];
    if (i + count > tokens.length) throw new Error(`Incomplete ${command} command in: ${d}`);
    const values = tokens.slice(i, i + count).map(Number); i += count;
    out.push({cmd:command, values});
    if (command === 'M') command = 'L';
  }
  return out;
}

function vectorAngle(ux, uy, vx, vy) {
  const dot = ux*vx + uy*vy;
  const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  const angle = Math.acos(Math.max(-1, Math.min(1, dot / (len || 1))));
  return (ux*vy - uy*vx < 0 ? -1 : 1) * angle;
}
function arcToCubics(x1, y1, rx0, ry0, rotationDeg, largeArcFlag, sweepFlag, x2, y2) {
  let rx = Math.abs(rx0), ry = Math.abs(ry0);
  if (!rx || !ry || (x1 === x2 && y1 === y2)) return [];
  const phi = rotationDeg * Math.PI / 180, cp = Math.cos(phi), sp = Math.sin(phi);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cp*dx + sp*dy, y1p = -sp*dx + cp*dy;
  const lambda = x1p*x1p/(rx*rx) + y1p*y1p/(ry*ry);
  if (lambda > 1) { const scale = Math.sqrt(lambda); rx *= scale; ry *= scale; }
  const rx2 = rx*rx, ry2 = ry*ry, x1p2 = x1p*x1p, y1p2 = y1p*y1p;
  const den = rx2*y1p2 + ry2*x1p2;
  const sign = Number(largeArcFlag) === Number(sweepFlag) ? -1 : 1;
  const coef = sign * Math.sqrt(Math.max(0, (rx2*ry2 - den) / (den || 1)));
  const cxp = coef * (rx * y1p / ry), cyp = coef * (-ry * x1p / rx);
  const cx = cp*cxp - sp*cyp + (x1+x2)/2;
  const cy = sp*cxp + cp*cyp + (y1+y2)/2;
  const ux = (x1p-cxp)/rx, uy = (y1p-cyp)/ry;
  const vx = (-x1p-cxp)/rx, vy = (-y1p-cyp)/ry;
  let start = vectorAngle(1, 0, ux, uy), delta = vectorAngle(ux, uy, vx, vy);
  if (!Number(sweepFlag) && delta > 0) delta -= Math.PI * 2;
  if (Number(sweepFlag) && delta < 0) delta += Math.PI * 2;
  const count = Math.max(1, Math.ceil(Math.abs(delta) / (Math.PI / 2)));
  const step = delta / count, curves = [];
  const map = (u, v) => [cx + rx*cp*u - ry*sp*v, cy + rx*sp*u + ry*cp*v];
  for (let index = 0; index < count; index++) {
    const a0 = start + step*index, a1 = a0 + step;
    const alpha = 4 / 3 * Math.tan((a1-a0) / 4);
    const p0 = [Math.cos(a0), Math.sin(a0)], p1 = [Math.cos(a1), Math.sin(a1)];
    const c1 = [p0[0] - alpha*p0[1], p0[1] + alpha*p0[0]];
    const c2 = [p1[0] + alpha*p1[1], p1[1] - alpha*p1[0]];
    const mc1 = map(...c1), mc2 = map(...c2), mp1 = map(...p1);
    curves.push({cmd:'C', values:[...mc1, ...mc2, ...mp1]});
  }
  return curves;
}

function normalizePath(commands) {
  const out = [];
  let x = 0, y = 0, startX = 0, startY = 0;
  for (const {cmd, values:v} of commands) {
    if (cmd === 'M') { [x,y]=v; [startX,startY]=v; out.push({cmd,values:v}); }
    else if (cmd === 'L') { [x,y]=v; out.push({cmd,values:v}); }
    else if (cmd === 'H') { x=v[0]; out.push({cmd:'L',values:[x,y]}); }
    else if (cmd === 'V') { y=v[0]; out.push({cmd:'L',values:[x,y]}); }
    else if (cmd === 'C') { x=v[4]; y=v[5]; out.push({cmd,values:v}); }
    else if (cmd === 'Q') { x=v[2]; y=v[3]; out.push({cmd,values:v}); }
    else if (cmd === 'A') {
      const curves = arcToCubics(x,y,v[0],v[1],v[2],v[3],v[4],v[5],v[6]);
      if (!curves.length) out.push({cmd:'L',values:[v[5],v[6]]}); else out.push(...curves);
      x=v[5]; y=v[6];
    } else if (cmd === 'Z') { out.push({cmd:'Z',values:[]}); x=startX; y=startY; }
  }
  return out;
}

function parseGradientDefinitions(svg) {
  const gradients = {};
  for (const match of svg.matchAll(/<(linearGradient|radialGradient)\s+([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const attrs = parseAttrs(match[2]);
    const stops = [...match[3].matchAll(/<stop\s+([^>]*)\/>/g)].map((stop) => {
      const a = parseAttrs(stop[1]);
      const rawOffset = a.offset || '0';
      const position = rawOffset.endsWith('%') ? num(rawOffset)/100 : num(rawOffset);
      return {position, color:a['stop-color'] || '#000000', opacity:num(a['stop-opacity'], 1)};
    });
    gradients[attrs.id] = {type:match[1] === 'linearGradient' ? 'linear' : 'radial', attrs, stops};
  }
  return gradients;
}
function bboxFor(op) {
  if (op.kind === 'circle') return {x:op.cx-op.r,y:op.cy-op.r,w:op.r*2,h:op.r*2};
  if (op.kind === 'ellipse') return {x:op.cx-op.rx,y:op.cy-op.ry,w:op.rx*2,h:op.ry*2};
  if (op.kind === 'rect') return {x:op.x,y:op.y,w:op.width,h:op.height};
  const points = [];
  for (const command of op.commands || []) {
    const v = command.values;
    for (let i=0;i+1<v.length;i+=2) points.push([v[i],v[i+1]]);
  }
  if (!points.length) return {x:0,y:0,w:1,h:1};
  const xs=points.map((p)=>p[0]), ys=points.map((p)=>p[1]);
  const minX=Math.min(...xs), maxX=Math.max(...xs), minY=Math.min(...ys), maxY=Math.max(...ys);
  return {x:minX,y:minY,w:Math.max(1,maxX-minX),h:Math.max(1,maxY-minY)};
}

function gradientSpec(raw, gradients, bbox, opacity) {
  const match = String(raw).match(/^url\(#([^)]+)\)$/);
  if (!match) return null;
  const gradient = gradients[match[1]];
  if (!gradient) throw new Error(`Missing SVG gradient ${match[1]}`);
  return {kind:'gradient', type:gradient.type, bbox, opacity, attrs:gradient.attrs, stops:gradient.stops};
}

function paintSpec(raw, gradients, bbox, opacity) {
  if (!raw || raw === 'none') return null;
  const gradient = gradientSpec(raw, gradients, bbox, opacity);
  return gradient || {kind:'solid', color:raw, opacity};
}
function shapeOperation(tag, attrs, context, gradients) {
  let op;
  if (tag === 'path') op = {kind:'path', commands:normalizePath(parsePathData(attrs.d || ''))};
  else if (tag === 'circle') op = {kind:'circle', cx:num(attrs.cx), cy:num(attrs.cy), r:num(attrs.r)};
  else if (tag === 'ellipse') op = {kind:'ellipse', cx:num(attrs.cx), cy:num(attrs.cy), rx:num(attrs.rx), ry:num(attrs.ry)};
  else if (tag === 'rect') op = {kind:'rect', x:num(attrs.x), y:num(attrs.y), width:num(attrs.width), height:num(attrs.height), rx:num(attrs.rx), ry:num(attrs.ry ?? attrs.rx)};
  else return null;
  const style = inheritStyle(context.style, attrs);
  const fillRaw = resolvedPaint(style.fill, style);
  const strokeRaw = resolvedPaint(style.stroke, style);
  const bbox = bboxFor(op);
  const baseOpacity = Number(style.opacity ?? 1);
  op.fill = paintSpec(fillRaw, gradients, bbox, clamp01(baseOpacity * Number(style['fill-opacity'] ?? 1)));
  op.stroke = paintSpec(strokeRaw, gradients, bbox, clamp01(baseOpacity * Number(style['stroke-opacity'] ?? 1)));
  op.strokeWidth = num(style['stroke-width'], 1);
  op.cap = style['stroke-linecap'] || 'butt';
  op.join = style['stroke-linejoin'] || 'miter';
  op.matrix = context.matrix;
  return op;
}

export function svgToOperations(svg) {
  const gradients = parseGradientDefinitions(svg);
  const operations = [];
  const stack = [{matrix:ID, style:defaultStyle}];
  let defsDepth = 0;
  for (const token of svg.match(/<[^>]+>/g) || []) {
    if (/^<defs\b/.test(token)) { defsDepth++; continue; }
    if (/^<\/defs/.test(token)) { defsDepth=Math.max(0,defsDepth-1); continue; }
    if (defsDepth) continue;
    const close = token.match(/^<\/([\w:-]+)/);
    if (close) { if (close[1] === 'g') stack.pop(); continue; }
    const open = token.match(/^<([\w:-]+)\b([^>]*)>/);
    if (!open) continue;
    const tag = open[1], attrs = parseAttrs(open[2]);
    const parent = stack[stack.length-1];
    if (tag === 'g') {
      stack.push({matrix:mul(parent.matrix, parseTransform(attrs.transform)), style:inheritStyle(parent.style, attrs)});
      if (/\/>$/.test(token)) stack.pop();
      continue;
    }
    if (['path','circle','ellipse','rect'].includes(tag)) {
      const op = shapeOperation(tag, attrs, parent, gradients);
      if (op) operations.push(op);
    }
  }
  return operations;
}

function luaNumber(value) {
  if (!Number.isFinite(value)) throw new Error(`Non-finite number in Rive projection: ${value}`);
  const rounded = Math.abs(value) < 1e-10 ? 0 : Number(value.toFixed(5));
  return String(rounded);
}
function ellipseCommands(cx, cy, rx, ry) {
  const k = 0.5522847498;
  return [
    {cmd:'M',values:[cx+rx,cy]},
    {cmd:'C',values:[cx+rx,cy+k*ry,cx+k*rx,cy+ry,cx,cy+ry]},
    {cmd:'C',values:[cx-k*rx,cy+ry,cx-rx,cy+k*ry,cx-rx,cy]},
    {cmd:'C',values:[cx-rx,cy-k*ry,cx-k*rx,cy-ry,cx,cy-ry]},
    {cmd:'C',values:[cx+k*rx,cy-ry,cx+rx,cy-k*ry,cx+rx,cy]},
    {cmd:'Z',values:[]},
  ];
}

function rectCommands(op) {
  const x=op.x,y=op.y,w=op.width,h=op.height,rx=Math.min(Math.max(0,op.rx||0),w/2),ry=Math.min(Math.max(0,op.ry||op.rx||0),h/2);
  if (!rx && !ry) return [{cmd:'M',values:[x,y]},{cmd:'L',values:[x+w,y]},{cmd:'L',values:[x+w,y+h]},{cmd:'L',values:[x,y+h]},{cmd:'Z',values:[]}];
  const k=0.5522847498, rrx=rx||ry, rry=ry||rx;
  return [
    {cmd:'M',values:[x+rrx,y]},{cmd:'L',values:[x+w-rrx,y]},
    {cmd:'C',values:[x+w-rrx+k*rrx,y,x+w,y+rry-k*rry,x+w,y+rry]},
    {cmd:'L',values:[x+w,y+h-rry]},{cmd:'C',values:[x+w,y+h-rry+k*rry,x+w-rrx+k*rrx,y+h,x+w-rrx,y+h]},
    {cmd:'L',values:[x+rrx,y+h]},{cmd:'C',values:[x+rrx-k*rrx,y+h,x,y+h-rry+k*rry,x,y+h-rry]},
    {cmd:'L',values:[x,y+rry]},{cmd:'C',values:[x,y+rry-k*rry,x+rrx-k*rrx,y,x+rrx,y]},{cmd:'Z',values:[]},
  ];
}
function commandsFor(op) {
  if (op.kind === 'path') return op.commands;
  if (op.kind === 'circle') return ellipseCommands(op.cx,op.cy,op.r,op.r);
  if (op.kind === 'ellipse') return ellipseCommands(op.cx,op.cy,op.rx,op.ry);
  if (op.kind === 'rect') return rectCommands(op);
  throw new Error(`Unsupported projected SVG operation: ${op.kind}`);
}

function colorLua(hex, opacity = 1) {
  const match = String(hex).match(/^#([0-9a-f]{6})$/i);
  if (!match) throw new Error(`Unsupported SVG color in Rive projection: ${hex}`);
  const rgb = Number.parseInt(match[1],16);
  const r=(rgb>>16)&255,g=(rgb>>8)&255,b=rgb&255,a=Math.round(clamp01(opacity)*255);
  return `Color.rgba(${r},${g},${b},${a})`;
}

function gradientPoint(value, start, size, fallback) {
  if (value == null) return start + fallback*size;
  const text=String(value);
  if (text.endsWith('%')) return start + num(text)/100*size;
  const n=num(text);
  return start + n*size;
}

function paintLua(spec, style, strokeWidth, cap, join) {
  if (!spec) return null;
  const fields = [`style='${style}'`];
  if (style === 'stroke') fields.push(`thickness=${luaNumber(strokeWidth)}`,`cap='${cap}'`,`join='${join}'`);
  if (spec.kind === 'solid') fields.push(`color=${colorLua(spec.color,spec.opacity)}`);
  else {
    const b=spec.bbox,a=spec.attrs,stops=spec.stops.map((stop)=>`{position=${luaNumber(stop.position)},color=${colorLua(stop.color,spec.opacity*stop.opacity)}}`).join(',');
    if (spec.type === 'linear') {
      const x1=gradientPoint(a.x1,b.x,b.w,0),y1=gradientPoint(a.y1,b.y,b.h,0),x2=gradientPoint(a.x2,b.x,b.w,1),y2=gradientPoint(a.y2,b.y,b.h,0);
      fields.push(`gradient=Gradient.linear(Vector.xy(${luaNumber(x1)},${luaNumber(y1)}),Vector.xy(${luaNumber(x2)},${luaNumber(y2)}),{${stops}})`);
    } else {
      const cx=gradientPoint(a.cx,b.x,b.w,0.5),cy=gradientPoint(a.cy,b.y,b.h,0.5);
      const rawR=a.r == null ? '50%' : String(a.r);
      const radius=rawR.endsWith('%') ? num(rawR)/100*Math.max(b.w,b.h) : num(rawR)*Math.max(b.w,b.h);
      fields.push(`gradient=Gradient.radial(Vector.xy(${luaNumber(cx)},${luaNumber(cy)}),${luaNumber(radius)},{${stops}})`);
    }
  }
  return `Paint.with({${fields.join(',')}})`;
}

function pathLua(commands) {
  const lines=['local p=Path.new()'];
  for (const command of commands) {
    const v=command.values.map(luaNumber);
    if(command.cmd==='M') lines.push(`p:moveTo(Vector.xy(${v[0]},${v[1]}))`);
    else if(command.cmd==='L') lines.push(`p:lineTo(Vector.xy(${v[0]},${v[1]}))`);
    else if(command.cmd==='Q') lines.push(`p:quadTo(Vector.xy(${v[0]},${v[1]}),Vector.xy(${v[2]},${v[3]}))`);
    else if(command.cmd==='C') lines.push(`p:cubicTo(Vector.xy(${v[0]},${v[1]}),Vector.xy(${v[2]},${v[3]}),Vector.xy(${v[4]},${v[5]}))`);
    else if(command.cmd==='Z') lines.push('p:close()');
  }
  return lines;
}
function operationLua(op) {
  const lines=['do', ...pathLua(commandsFor(op)).map((line)=>`  ${line}`)];
  const transformed = op.matrix.some((value,index)=>Math.abs(value-ID[index])>1e-8);
  if (transformed) {
    lines.push('  renderer:save()');
    lines.push(`  renderer:transform(Mat2D.values(${op.matrix.map(luaNumber).join(',')}))`);
  }
  const fill=paintLua(op.fill,'fill',op.strokeWidth,op.cap,op.join);
  const stroke=paintLua(op.stroke,'stroke',op.strokeWidth,op.cap,op.join);
  if(fill) lines.push(`  renderer:drawPath(p,${fill})`);
  if(stroke) lines.push(`  renderer:drawPath(p,${stroke})`);
  if(transformed) lines.push('  renderer:restore()');
  lines.push('end');
  return lines.join('\n');
}

export function compositionFunctionLua(key, svg, index) {
  const operations=svgToOperations(svg);
  const name=`drawComposition${index}`;
  const body=operations.map(operationLua).map((block)=>block.split('\n').map((line)=>`  ${line}`).join('\n')).join('\n');
  return {name,key,operations:operations.length,source:`local function ${name}(renderer: Renderer)\n${body}\nend`};
}

export function compositionMapLua(entries) {
  const functions=[];
  const dispatch=[];
  entries.forEach(({key,svg},index)=>{
    const item=compositionFunctionLua(key,svg,index+1);
    const [role,state]=key.split(':');
    functions.push(item.source);
    dispatch.push(`  if role == '${role}' and state == '${state}' then ${item.name}(renderer); return true end`);
  });
  return `${functions.join('\n\n')}\n\nlocal function drawProjection(renderer: Renderer, role: string, state: string): boolean\n${dispatch.join('\n')}\n  return false\nend`;
}

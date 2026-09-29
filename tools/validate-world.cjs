// World validator. Run after editing content:  node tools/validate-world.cjs
//  1. Structure: overlapping rooms, texture size limits, dangling openings on room edges,
//     unknown entity types, missing cutscenes/speakers.
//  2. Reachability: simulates the player's real jump physics (same constants and collision as
//     the game) from the start point, for each ability stage, and reports which rooms and
//     pickups can be reached (water floats, tides rise and fall, claws cling to walls).
//     Catches jumps that are 1px too high before a player does. STAGE='+ dash' / TRACE=room:id to debug.
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const C = (p) => JSON.parse(fs.readFileSync(path.join(root, 'content', p), 'utf8'));

const T = 16;
const PH = { G: 1150, JUMP: 345, JUMP2: 305, RUN: 108, MAXFALL: 430, DASH: 330, DASHT: 0.22 };
const STEP = 1 / 120;
const DEFAULT_LEGEND = { P: 'spawn', S: 'shrine', c: 'mite', w: 'sockwisp', s: 'snail', t: 'toad', g: 'jar', o: 'coin', B: 'warden', G: 'gate' };
const KNOWN_TYPES = new Set(['windup', 'jackbox', 'tinfish', 'doll', 'musicbox', 'wheel', 'queen', 'spawn', 'shrine', 'mite', 'sockwisp', 'snail', 'toad', 'jar', 'coin', 'warden', 'gate', 'pickup', 'npc', 'decal', 'trigger']);

const world = C('world.json');
const speakers = C('speakers.json');
const areas = world.areas.map((a) => C(`areas/${a}.json`));
const cutscenes = new Map();
for (const f of world.cutscenes) for (const c of C(`cutscenes/${f}.json`)) cutscenes.set(c.id, c);

let problems = 0, warnings = 0;
const err = (m) => { problems++; console.log('  ✗ ' + m); };
const warn = (m) => { warnings++; console.log('  ! ' + m); };

// ---------------------------------------------------------------- build rooms
const rooms = [];
for (const area of areas) for (const r of area.rooms) {
  const legend = { ...Object.fromEntries(Object.entries(DEFAULT_LEGEND).map(([k, v]) => [k, { type: v }])), ...(area.legend || {}), ...(r.legend || {}) };
  const w = Math.max(...r.rows.map((x) => x.length)), h = r.rows.length;
  const grid = [], ents = [];
  r.rows.forEach((row, y) => {
    const line = [];
    for (let x = 0; x < w; x++) {
      const ch = row[x] ?? '#';
      if ('#=^.X'.includes(ch)) line.push(ch);
      else if (legend[ch]) { ents.push({ ...legend[ch], x, y, id: legend[ch].id ?? `${r.id}:${x},${y}` }); line.push('.'); }
      else { err(`${r.id}: unknown tile char '${ch}' at ${x},${y}`); line.push('.'); }
    }
    grid.push(line);
  });
  for (const e of r.entities || []) ents.push({ ...e });
  rooms.push({ ...r, area: area.id, grid, ents, w, h });
}
const byId = new Map(rooms.map((r) => [r.id, r]));
for (const r of rooms) r.goal = r.ents.filter((en) => ['pickup', 'trigger', 'npc', 'shrine', 'jar', 'coin'].includes(en.type));

console.log('Structure');
for (const r of rooms) {
  if (r.w > 64 || r.h > 64) err(`${r.id}: ${r.w}x${r.h} tiles exceeds 64 (room texture would pass 4096px)`);
  for (const q of rooms) if (q !== r && r.x < q.x + q.w && r.x + r.w > q.x && r.y < q.y + q.h && r.y + r.h > q.y && r.id < q.id) err(`rooms overlap: ${r.id} and ${q.id}`);
  for (const e of r.ents) {
    if (!KNOWN_TYPES.has(e.type)) err(`${r.id}: unknown entity type '${e.type}'`);
    for (const k of ['cutscene', 'read']) if (e[k] && !cutscenes.has(e[k])) err(`${r.id}: ${e.type} references missing cutscene '${e[k]}'`);
    for (const t of e.talk || []) if (!cutscenes.has(t.cutscene)) err(`${r.id}: npc talk references missing cutscene '${t.cutscene}'`);
    if (e.speaker && !speakers[e.speaker]) err(`${r.id}: unknown speaker '${e.speaker}'`);
  }
  if (r.onEnter && !cutscenes.has(r.onEnter)) err(`${r.id}: onEnter references missing cutscene '${r.onEnter}'`);
}
for (const [id, c] of cutscenes) {
  const walk = (steps) => steps.forEach((s) => {
    if (s.do === 'say' && !speakers[s.who] && s.who !== 'player') err(`cutscene ${id}: unknown speaker '${s.who}'`);
    if (s.do === 'run' && !cutscenes.has(s.id)) err(`cutscene ${id}: runs missing cutscene '${s.id}'`);
    if (s.do === 'if') { walk(s.then || []); walk(s.else || []); }
  });
  walk(c.steps);
}

// world tile lookup (gates treated as open; cracked walls breakable → open once 'needle')
// Flat lookup tables over the world's bounding box (the search calls these millions of times).
const BX0 = Math.min(...rooms.map((r) => r.x)), BY0 = Math.min(...rooms.map((r) => r.y));
const BW = Math.max(...rooms.map((r) => r.x + r.w)) - BX0, BH = Math.max(...rooms.map((r) => r.y + r.h)) - BY0;
const TILE = new Array(BW * BH).fill(null), ROOMI = new Int16Array(BW * BH).fill(-1);
rooms.forEach((r, i) => { for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { const j = (r.y + y - BY0) * BW + (r.x + x - BX0); if (ROOMI[j] < 0) { ROOMI[j] = i; TILE[j] = r.grid[y][x]; } } });
function tileAt(tx, ty, opts) {
  const x = tx - BX0, y = ty - BY0;
  if (x < 0 || y < 0 || x >= BW || y >= BH) return null; // outside every room
  const ch = TILE[y * BW + x];
  return ch === 'X' ? (opts.needle ? '.' : '#') : ch;
}
function roomIndexAt(tx, ty) { const x = tx - BX0, y = ty - BY0; return x < 0 || y < 0 || x >= BW || y >= BH ? -1 : ROOMI[y * BW + x]; }
const solid = (ch) => ch === '#' || ch === null;
// dangling openings: an open edge tile that leads into no room
for (const r of rooms) {
  const edge = [];
  for (let x = 0; x < r.w; x++) { edge.push([x, 0, 0, -1]); edge.push([x, r.h - 1, 0, 1]); }
  for (let y = 0; y < r.h; y++) { edge.push([0, y, -1, 0]); edge.push([r.w - 1, y, 1, 0]); }
  const bad = new Set();
  for (const [x, y, dx, dy] of edge) {
    if (r.grid[y][x] === '#') continue;
    const nt = tileAt(r.x + x + dx, r.y + y + dy, { needle: true });
    if (nt === null) bad.add(dx ? `${dx < 0 ? 'left' : 'right'} edge row ${y}` : `${dy < 0 ? 'top' : 'bottom'} edge col ${x}`);
  }
  if (bad.size) warn(`${r.id}: opening(s) lead nowhere: ${[...bad].slice(0, 4).join(', ')}${bad.size > 4 ? ` (+${bad.size - 4})` : ''}`);
}

// ---------------------------------------------------------------- physics (mirrors src/world/world.ts)
function move(e, dt, opts) {
  const at = (tx, ty) => tileAt(tx, ty, opts);
  e.hitX = false;
  if (e.vx) {
    e.x += e.vx * dt;
    const y0 = Math.floor(e.y / T), y1 = Math.floor((e.y + e.h - 0.01) / T);
    if (e.vx > 0) { const tx = Math.floor((e.x + e.w) / T); for (let ty = y0; ty <= y1; ty++) if (solid(at(tx, ty))) { e.x = tx * T - e.w; e.hitX = true; break; } }
    else { const tx = Math.floor(e.x / T); for (let ty = y0; ty <= y1; ty++) if (solid(at(tx, ty))) { e.x = (tx + 1) * T; e.hitX = true; break; } }
  }
  const prevBottom = e.y + e.h;
  e.y += e.vy * dt;
  e.onGround = false;
  const x0 = Math.floor(e.x / T), x1 = Math.floor((e.x + e.w - 0.01) / T);
  if (e.vy > 0) {
    const ty = Math.floor((e.y + e.h) / T);
    for (let tx = x0; tx <= x1; tx++) { const ch = at(tx, ty); if (solid(ch) || (ch === '=' && prevBottom <= ty * T + 0.5 && !(e.drop > 0))) { e.y = ty * T - e.h; e.vy = 0; e.onGround = true; break; } }
  } else if (e.vy < 0) {
    const ty = Math.floor(e.y / T);
    for (let tx = x0; tx <= x1; tx++) if (solid(at(tx, ty))) { e.y = (ty + 1) * T; e.vy = 0; break; }
  }
}
function thorns(e, opts) {
  for (let tx = Math.floor((e.x + 3) / T); tx <= Math.floor((e.x + e.w - 3.01) / T); tx++)
    for (let ty = Math.floor((e.y + 4) / T); ty <= Math.floor((e.y + e.h - 0.01) / T); ty++)
      if (tileAt(tx, ty, opts) === '^' && e.y + e.h > ty * T + 7) return true;
  return false;
}

// ---------------------------------------------------------------- water (mirrors WaterVol in world.ts)
// Tidal pools are sampled at low / middle / high; `k` picks the sample (0 = low).
const pools = [];
for (const r of rooms) for (const wd of r.water || []) {
  const x0 = (r.x + (wd.x ?? 0)) * T, x1 = (r.x + (wd.x ?? 0) + (wd.w ?? r.w - (wd.x ?? 0))) * T;
  const surf = (row) => (r.y + row) * T + 4;
  const tidal = wd.low !== undefined && wd.high !== undefined;
  const levels = tidal ? [surf(wd.low), (surf(wd.low) + surf(wd.high)) / 2, surf(wd.high)] : [surf(wd.level)];
  pools.push({ room: r, x0, x1, top: r.y * T, bottom: (r.y + r.h) * T, levels, tidal });
}
const roomTidal = new Set(pools.filter((p) => p.tidal).map((p) => p.room.id));
const poolAt = (cx, y) => pools.find((p) => cx >= p.x0 && cx < p.x1 && y >= p.top && y < p.bottom) || null;
const surfOf = (p, k) => p.levels[Math.min(k, p.levels.length - 1)];
const roomOf = (x, y) => { const i = roomIndexAt(Math.floor(x / T), Math.floor(y / T)); return i < 0 ? null : rooms[i]; };

// Player floats with feet 6 below the surface (player.ts). Returns the float y, or null.
function inWater(e, k) {
  const cx = e.x + e.w / 2, feet = e.y + e.h;
  const p = poolAt(cx, feet); if (!p) return null;
  const s = surfOf(p, k);
  return feet >= s ? s + 6 - e.h : null;
}
function touching(e, dir, opts) {
  const tx = dir > 0 ? Math.floor((e.x + e.w) / T) : Math.floor((e.x - 1) / T);
  for (let ty = Math.floor((e.y + 3) / T); ty <= Math.floor((e.y + e.h - 3.01) / T); ty++) if (solid(tileAt(tx, ty, opts))) return true;
  return false;
}

// One maneuver from a node: dir1 until tSwitch, then dir2; optional second jump / dash at tSwitch.
// A maneuver ends on landing (ground), on reaching water (float), or on grabbing a wall (cling).
function simulate(start, m, opts, visit) {
  const k = start.k ?? 0;
  const e = { x: start.x, y: start.y, w: 10, h: 14, vx: 0, vy: 0, onGround: !start.cling && !start.float, drop: 0 };
  let t = 0, dashT = 0, used2 = false, usedDash = false, lock = 0, released = false;
  if (m.drop) {
    if (start.cling || start.float) return null;
    const ty = Math.floor((e.y + e.h + 1) / T), a = tileAt(Math.floor(e.x / T), ty, opts), b = tileAt(Math.floor((e.x + e.w - 0.01) / T), ty, opts);
    if (!(a === '=' || b === '=') || solid(a) || solid(b)) return null;
    e.drop = 0.22; e.y += 1;
  } else if (m.wall) { e.vy = -PH.JUMP * 0.95; lock = 0.15; }
  else if (m.jump) e.vy = -PH.JUMP;
  const holdJump = m.hold ?? 0.35;
  const slide = m.slide ? start.cling : 0;
  while (t < 3) {
    t += STEP;
    const dir = slide || (t < m.tSwitch ? m.d1 : m.d2);
    if (!used2 && m.wings && t >= m.tSwitch && !e.onGround) { e.vy = -PH.JUMP2; used2 = true; }
    if (!usedDash && m.dash && t >= m.tSwitch && !e.onGround) { dashT = PH.DASHT; usedDash = true; e.vy = 0; }
    if (dashT > 0) { dashT -= STEP; e.vx = (m.d2 || m.d1 || 1) * PH.DASH; e.vy = 0; }
    else if (lock > 0) { lock -= STEP; e.vx = m.wall * PH.RUN * 1.25; }
    else e.vx = dir * PH.RUN;
    if ((m.jump || m.wall) && t > holdJump && !released && e.vy < -60 && !used2) { e.vy *= 0.45; released = true; }
    if (dashT <= 0) e.vy = Math.min(PH.MAXFALL, e.vy + PH.G * STEP);
    if (slide && touching(e, slide, opts)) e.vy = Math.min(e.vy, 55);
    e.drop = Math.max(0, e.drop - STEP);
    move(e, STEP, opts);
    if (thorns(e, opts)) return null;
    visit(e);
    if (e.onGround && t > 0.02) return { x: e.x, y: e.y, k };
    if (e.vy >= 0 && t > 0.05) { const fy = inWater(e, k); if (fy !== null) return { x: e.x, y: fy, k, float: true }; }
    if (opts.claws && !slide && dir && lock <= 0 && dashT <= 0 && e.vy > -80 && t > 0.04 && touching(e, dir, opts) && inWater(e, k) === null) return { x: e.x, y: e.y, k, cling: dir };
    if (e.y > 5000) return null;
  }
  return null;
}

function reach(opts, traceTarget) {
  const start = byId.get(world.start.room);
  const sp = start.ents.find((en) => en.type === 'spawn');
  const s0 = { x: (start.x + sp.x) * T + 3, y: (start.y + sp.y) * T + 2 };
  const settle = simulate(s0, { d1: 0, d2: 0, tSwitch: 0 }, opts, () => {}) || s0;
  const key = (p) => p.cling ? `c${Math.round(p.x / 4)},${Math.round(p.y / 6)},${p.k ?? 0},${p.cling}` : `${Math.round(p.x / 4)},${Math.round(p.y / 2)},${p.k ?? 0},${p.float ? 'f' : ''}${p.cling ?? ''}`;
  const seen = new Set([key(settle)]);
  const queue = [settle];
  const parent = new Map();
  let cur = null, traced = false;
  const touched = new Set();
  const push = (n, from, m) => { const kk = key(n); if (seen.has(kk)) return; seen.add(kk); parent.set(n, { p: from, m }); queue.push(n); };
  const visit = (e) => {
    const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
    const r = roomOf(cx, cy); if (!r) return;
    if (traceTarget === 'room:' + r.id && !traced && cur) { traced = true; let c = cur; const chain = []; while (c) { const rr = roomOf(c.x, c.y); chain.push(`${rr ? rr.id : '?'}(${(c.x / T - (rr ? rr.x : 0)).toFixed(1)},${(c.y / T - (rr ? rr.y : 0)).toFixed(1)})${c.float ? ' float' : ''}${c.cling ? ' cling' : ''} via ${JSON.stringify(parent.get(c)?.m || null)}`); c = parent.get(c)?.p; } console.log('    trace:\n      ' + chain.join('\n      ')); }
    touched.add('room:' + r.id);
    for (const en of r.goal) {
      const ex = (r.x + en.x) * T, ey = (r.y + en.y) * T, ew = (en.w ?? 1) * T, eh = (en.h ?? 1) * T;
      const top = en.type === 'trigger' ? ey + T - eh : ey - 8;
      if (e.x < ex + ew + 6 && e.x + e.w > ex - 6 && e.y < top + eh + 8 && e.y + e.h > top) touched.add(`${en.type}:${en.id ?? r.id + ':' + en.x + ',' + en.y}`);
    }
  };
  const base = [];
  for (const d1 of [-1, 0, 1]) for (const d2 of [-1, 0, 1]) for (const ts of [0.08, 0.22, 0.34]) {
    base.push({ jump: true, d1, d2, tSwitch: ts });
    base.push({ jump: true, d1, d2, tSwitch: ts, hold: 0.12 });
    if (opts.wings) base.push({ jump: true, d1, d2, tSwitch: ts, wings: true });
    if (opts.dash) base.push({ jump: true, d1, d2: d2 || d1 || 1, tSwitch: ts, dash: true });
  }
  const ground = [...base];
  for (const d of [-1, 1]) { ground.push({ d1: d, d2: d, tSwitch: 9 }); ground.push({ d1: d, d2: -d, tSwitch: 0.25 }); ground.push({ drop: true, d1: d, d2: d, tSwitch: 9 }); }
  ground.push({ drop: true, d1: 0, d2: 0, tSwitch: 9 });
  const wallMs = (away) => {
    const out = [];
    for (const d1 of [-1, 0, 1]) for (const d2 of [-1, 0, 1]) for (const ts of [0.2, 0.34]) {
      out.push({ wall: away, d1, d2, tSwitch: ts });
      out.push({ wall: away, d1, d2, tSwitch: ts, hold: 0.14 });
      if (opts.wings) out.push({ wall: away, d1, d2, tSwitch: ts, wings: true });
      if (opts.dash) out.push({ wall: away, d1, d2: d2 || away, tSwitch: ts, dash: true });
    }
    out.push({ slide: true, d1: 0, d2: 0, tSwitch: 9 });
    out.push({ d1: 0, d2: 0, tSwitch: 9 }); out.push({ d1: away, d2: away, tSwitch: 9 });
    if (opts.wings) out.push({ jump: true, d1: away, d2: away, tSwitch: 0.02, wings: true, hold: 0 });
    if (opts.dash) out.push({ d1: away, d2: away, tSwitch: 0.02, dash: true });
    return out;
  };
  const clingMs = { '-1': wallMs(1), '1': wallMs(-1) };
  const run = (p, n, m) => { const end = simulate(p, { ...m }, opts, visit); if (end) push(end, p, m); };
  let steps = 0;
  while (queue.length && steps < 150000) {
    const p = queue.shift(); steps++; cur = p;
    visit({ x: p.x, y: p.y, w: 10, h: 14 });
    // waiting in a tidal room changes the water level
    const r = roomOf(p.x + 5, p.y + 7);
    if (r && roomTidal.has(r.id)) for (const k of [0, 1, 2]) if (k !== (p.k ?? 0)) {
      if (p.float) { const pl = poolAt(p.x + 5, p.y + 14); if (pl) { const y = surfOf(pl, k) + 6 - 14; const e = { x: p.x, y, w: 10, h: 14, vx: 0, vy: 0 }; move(e, STEP, opts); if (Math.abs(e.y - y) < 1) push({ x: p.x, y, k, float: true }, p, 'tide'); } }
      else if (!p.cling) push({ ...p, k }, p, 'wait');
    }
    if (p.cling) { for (const m of clingMs[p.cling]) run(p, null, m); continue; }
    // walking (or paddling) in both directions
    for (const d of [-1, 1]) {
      const e = { x: p.x, y: p.y, w: 10, h: 14, vx: d * PH.RUN * (p.float ? 0.5 : 1), vy: 0, onGround: true };
      for (let i = 0; i < 400; i++) {
        if (p.float) { e.x += e.vx * STEP; const tx = Math.floor((d > 0 ? e.x + e.w : e.x) / T); let hit = false; for (let ty = Math.floor(e.y / T); ty <= Math.floor((e.y + e.h - 0.01) / T); ty++) if (solid(tileAt(tx, ty, opts))) hit = true; if (hit || inWater({ ...e, y: e.y + 2 }, p.k ?? 0) === null) break; }
        else { e.vy = Math.min(PH.MAXFALL, e.vy + PH.G * STEP); move(e, STEP, opts); }
        if (thorns(e, opts)) break;
        visit(e);
        if (!p.float && (!e.onGround || e.hitX)) break;
        if (i % 12 === 0) push({ x: e.x, y: e.y, k: p.k ?? 0, float: p.float }, p, (p.float ? 'paddle' : 'walk') + d);
      }
      if (!p.float && !e.onGround) { const end = simulate({ x: e.x, y: e.y, k: p.k, cling: 0, float: false }, { d1: d, d2: d, tSwitch: 9 }, opts, visit); if (end) push(end, p, 'walk-off' + d); }
    }
    for (const m of p.float ? base : ground) run(p, null, m);
  }
  if (steps >= 150000) console.log('    (search capped)');
  return touched;
}

console.log('\nReachability (simulated with game physics, water and tides)');
const stages = [
  { name: 'start', opts: { needle: true } },
  { name: '+ dash', opts: { needle: true, dash: true } },
  { name: '+ dash + wings', opts: { needle: true, dash: true, wings: true } },
  { name: '+ dash + wings + claws', opts: { needle: true, dash: true, wings: true, claws: true } },
];
let prev = new Set();
const all = new Set();
for (const r of rooms) { all.add('room:' + r.id); for (const e of r.ents) if (['pickup', 'trigger'].includes(e.type)) all.add(`${e.type}:${e.id ?? r.id + ':' + e.x + ',' + e.y}`); }
const only = process.env.STAGE ? stages.filter((s) => s.name === process.env.STAGE) : stages;
let last;
for (const st of only) {
  const t0 = Date.now();
  const got = reach(st.opts, process.env.TRACE);
  const fresh = [...got].filter((k) => !prev.has(k) && all.has(k));
  console.log(`  [${st.name}] ${fresh.length ? 'unlocks: ' + fresh.join(', ') : 'nothing new'}  (${Date.now() - t0}ms)`);
  prev = got; last = got;
}
const missing = [...all].filter((k) => !last.has(k));
if (missing.length) missing.forEach((m) => err(`unreachable with every ability: ${m}`));
else console.log('  ✓ every room, pickup and trigger is reachable');

console.log(`\n${problems} problem(s), ${warnings} warning(s)`);
process.exit(problems ? 1 : 0);

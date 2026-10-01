// Paints a room's tiles into one texture using the area's tileset PNGs:
// lumpy rock silhouettes filled with a painted rock texture, darker toward the
// inside, with grassy lips, drips, planks, thorns and seeded decoration.
import { ART, T } from '../core/config';
import { seeded } from '../core/util';
import { Room, tileAt, isSolid } from '../world/world';

const TP = T * ART; // tile size in texture px (64)
const MAX_CACHE = 5;
const cacheOrder: string[] = [];

export interface RoomArtResult { key: string; lights: { x: number; y: number; r: number; color: number; a: number }[] }

export function roomTexture(scene: any, r: Room): RoomArtResult {
  const key = `room_${r.id}`;
  const lightsKey = `${key}_lights`;
  if (scene.textures.exists(key)) {
    const i = cacheOrder.indexOf(key); if (i >= 0) cacheOrder.splice(i, 1); cacheOrder.push(key);
    return { key, lights: scene.registry.get(lightsKey) || [] };
  }
  const ts = r.area.tileset;
  const img = (k: string) => (scene.textures.exists(k) ? scene.textures.get(k).getSourceImage() : null);
  const W = r.w * TP, H = r.h * TP;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d')!;
  const R = seeded(`room-${r.id}`);
  const wt = (lx: number, ly: number) => tileAt(r.x + lx, r.y + ly);
  const solidAt = (lx: number, ly: number) => { const ch = wt(lx, ly); return ch === '#'; };
  const lights: RoomArtResult['lights'] = [];

  // ---- 1. rock silhouette mask ----
  const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
  const m = mask.getContext('2d')!;
  m.fillStyle = '#fff';
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    if (r.grid[y][x] !== '#') continue;
    const px = x * TP, py = y * TP;
    const up = solidAt(x, y - 1), dn = solidAt(x, y + 1), lf = solidAt(x - 1, y), rt = solidAt(x + 1, y);
    const inset = 3;
    m.fillRect(px + (lf ? 0 : inset), py + (up ? 0 : inset), TP - (lf ? 0 : inset) - (rt ? 0 : inset), TP - (up ? 0 : inset) - (dn ? 0 : inset));
    // lumps along exposed edges
    const lump = (cx: number, cy: number) => { m.beginPath(); m.arc(cx, cy, 10 + R() * 12, 0, Math.PI * 2); m.fill(); };
    if (!up) for (let i = 0; i < 2; i++) lump(px + 10 + R() * (TP - 20), py + 16 + R() * 6);
    if (!dn) for (let i = 0; i < 2; i++) lump(px + 10 + R() * (TP - 20), py + TP - 18 - R() * 4);
    if (!lf) for (let i = 0; i < 2; i++) lump(px + 16 + R() * 4, py + 10 + R() * (TP - 20));
    if (!rt) for (let i = 0; i < 2; i++) lump(px + TP - 18 - R() * 4, py + 10 + R() * (TP - 20));
    if (r.area.decor?.organic) { // bulge past the tile edge a little, so walls and ceilings read as rock, not boxes
      const bump = (cx: number, cy: number, rad: number) => { m.beginPath(); m.ellipse(cx, cy, rad, rad * 0.8, R() * 3, 0, Math.PI * 2); m.fill(); };
      if (!lf && up && dn) for (let i = 0; i < 2; i++) bump(px + 2, py + 8 + R() * (TP - 16), 4 + R() * 6);
      if (!rt && up && dn) for (let i = 0; i < 2; i++) bump(px + TP - 2, py + 8 + R() * (TP - 16), 4 + R() * 6);
      if (!dn && lf && rt) for (let i = 0; i < 2; i++) bump(px + 8 + R() * (TP - 16), py + TP - 3, 5 + R() * 6);
    }
  }
  // ---- 2. fill with rock texture ----
  c.drawImage(mask, 0, 0);
  c.globalCompositeOperation = 'source-in';
  const rock = img(`${ts}_rock`);
  if (rock) { c.fillStyle = c.createPattern(rock, 'repeat')!; c.fillRect(0, 0, W, H); } else { c.fillStyle = '#1d1a26'; c.fillRect(0, 0, W, H); }
  const organic = !!r.area.decor?.organic;
  // ---- 2b. stones set in the rock face, and the odd lost thing fossilised in it (organic tilesets) ----
  if (organic) {
    c.globalCompositeOperation = 'source-atop';
    const S = seeded(`stones-${r.id}`);
    for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      if (r.grid[y][x] !== '#') continue;
      const exposed = !solidAt(x, y - 1) || !solidAt(x, y + 1) || !solidAt(x - 1, y) || !solidAt(x + 1, y);
      const near = exposed || !solidAt(x - 1, y - 1) || !solidAt(x + 1, y + 1) || !solidAt(x + 1, y - 1) || !solidAt(x - 1, y + 1);
      if (!near) continue;
      for (let k = 0; k < 2; k++) {
        if (S() > 0.32) continue;
        const sx = x * TP + 8 + S() * (TP - 16), sy = y * TP + 8 + S() * (TP - 16), rx = 5 + S() * 11, ry = 3 + S() * 7, rot = (S() - 0.5) * 0.8;
        c.fillStyle = `rgba(${44 + S() * 20},${40 + S() * 16},${58 + S() * 20},0.95)`; c.beginPath(); c.ellipse(sx, sy, rx, ry, rot, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(4,3,8,0.7)'; c.lineWidth = 1.5; c.stroke();
        c.strokeStyle = 'rgba(190,180,230,0.22)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(sx, sy, rx - 1.5, ry - 1.5, rot, Math.PI * 1.05, Math.PI * 1.7); c.stroke();
      }
      if (exposed && S() < 0.03) { // a fossil: button, key or spoon pressed into the stone
        const fx = x * TP + 16 + S() * 32, fy = y * TP + 16 + S() * 32, kind = S();
        c.strokeStyle = 'rgba(190,180,230,0.16)'; c.fillStyle = 'rgba(10,8,16,0.35)'; c.lineWidth = 1.4;
        if (kind < 0.45) { c.beginPath(); c.arc(fx, fy, 7, 0, Math.PI * 2); c.stroke(); for (const [a, b] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { c.beginPath(); c.arc(fx + a, fy + b, 1.1, 0, Math.PI * 2); c.fill(); } }
        else if (kind < 0.8) { c.beginPath(); c.arc(fx - 6, fy, 3.5, 0, Math.PI * 2); c.moveTo(fx - 2.5, fy); c.lineTo(fx + 9, fy); c.lineTo(fx + 9, fy + 3); c.moveTo(fx + 5, fy); c.lineTo(fx + 5, fy + 3); c.stroke(); }
        else { c.beginPath(); c.ellipse(fx - 5, fy, 4, 2.6, 0, 0, Math.PI * 2); c.moveTo(fx - 1, fy); c.lineTo(fx + 10, fy + 1); c.stroke(); }
      }
    }
    c.globalCompositeOperation = 'source-over';
  }
  // ---- 3. deeper rock gets darker (distance field → blurred overlay) ----
  const dist: number[][] = r.grid.map((row) => row.map((ch) => (ch === '#' ? 99 : 0)));
  for (let pass = 0; pass < 4; pass++) for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    if (dist[y][x] === 0) continue;
    const nb = (xx: number, yy: number) => (xx < 0 || yy < 0 || xx >= r.w || yy >= r.h ? (solidAt(xx, yy) ? 99 : 0) : dist[yy][xx]);
    dist[y][x] = Math.min(dist[y][x], nb(x - 1, y) + 1, nb(x + 1, y) + 1, nb(x, y - 1) + 1, nb(x, y + 1) + 1);
  }
  const dark = document.createElement('canvas'); dark.width = W; dark.height = H;
  const d = dark.getContext('2d')!;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const v = dist[y][x]; if (!v) continue;
    d.fillStyle = `rgba(4,3,8,${[0, 0.15, 0.62, 0.86, 0.95][Math.min(4, v)]})`;
    d.fillRect(x * TP - 16, y * TP - 16, TP + 32, TP + 32);
  }
  c.globalCompositeOperation = 'source-atop';
  c.filter = 'blur(18px)'; c.drawImage(dark, 0, 0); c.filter = 'none';
  c.globalCompositeOperation = 'source-over';

  // ---- 4. edges ----
  const top = [img(`${ts}_top`), img(`${ts}_top2`)].filter(Boolean);
  const bottom = img(`${ts}_bottom`), side = img(`${ts}_side`);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    if (r.grid[y][x] !== '#') continue;
    const px = x * TP, py = y * TP;
    if (side && !solidAt(x - 1, y)) c.drawImage(side, px + 2, py, 24, TP);
    if (side && !solidAt(x + 1, y)) { c.save(); c.translate(px + TP - 2, py); c.scale(-1, 1); c.drawImage(side, 0, 0, 24, TP); c.restore(); }
    if (!solidAt(x, y + 1) && wt(x, y + 1) !== 'X') { if (organic) stalactites(c, px, py + TP, R); else if (bottom) c.drawImage(bottom, px, py + TP - 10); }
  }
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    if (r.grid[y][x] !== '#') continue;
    if (!solidAt(x, y - 1) && wt(x, y - 1) !== 'X') {
      if (organic) lip(c, x * TP, y * TP, R, !solidAt(x - 1, y - 1) && !solidAt(x - 1, y), !solidAt(x + 1, y));
      else if (top.length) c.drawImage(top[Math.floor(R() * top.length)], x * TP, y * TP - 6);
    }
  }
  // ---- 5. platforms & thorns ----
  const plank = img(`${ts}_plank`), thorns = img(`${ts}_thorns`);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const ch = r.grid[y][x];
    if (ch === '=' && plank) c.drawImage(plank, x * TP, y * TP - 2);
    if (ch === '^' && thorns) { c.save(); if (R() < 0.5) { c.translate(x * TP + TP, 0); c.scale(-1, 1); c.drawImage(thorns, 0, y * TP + TP - 44 + 2); } else c.drawImage(thorns, x * TP, y * TP + TP - 44 + 2); c.restore(); }
  }
  // ---- 6. seeded decoration ----
  const amount = (r.decor ?? 1) * (r.area.decor?.density ?? 1);
  if (amount > 0) {
    const dec = r.area.decor ?? {};
    const floorDecor = (dec.floor ?? ['deco_mushroom', 'deco_bones', 'deco_teacup', 'deco_key']).map((k) => [k, img(k)] as const).filter(([, i]) => i);
    const ceilKeys = (dec.ceil ?? ['deco_roots']).filter((k) => img(k));
    const glowOf = (k: string) => dec.glow?.[k] ?? (k === 'deco_mushroom' ? [0xa0e0ff, 30] : null);
    let lastFloorX = -99;
    for (let y = 1; y < r.h; y++) for (let x = 0; x < r.w; x++) {
      const floor = r.grid[y][x] === '#' && r.grid[y - 1][x] === '.';
      const ceil = r.grid[y - 1][x] === '#' && r.grid[y][x] === '.';
      if (floor && R() < 0.1 * amount && floorDecor.length && Math.abs(x - lastFloorX) > 1) {
        lastFloorX = x;
        // the first prop in the list is the common one; the rest are the odd lost thing
        const [k, im] = floorDecor[R() < 0.5 ? 0 : Math.floor(R() * floorDecor.length)];
        const flip = R() < 0.5;
        const dx = x * TP + R() * (TP - im!.width), dy = y * TP - im!.height + 3;
        // contact shadow
        c.fillStyle = 'rgba(2,1,6,0.45)'; c.beginPath(); c.ellipse(dx + im!.width / 2, y * TP + 1, im!.width * 0.45, 3, 0, 0, Math.PI * 2); c.fill();
        c.save(); if (flip) { c.translate(dx + im!.width, dy); c.scale(-1, 1); c.drawImage(im!, 0, 0); } else c.drawImage(im!, dx, dy); c.restore();
        const gl = glowOf(k);
        if (gl) lights.push({ x: (dx + im!.width / 2) / ART, y: (dy + im!.height * 0.45) / ART, r: gl[1], color: gl[0], a: 0.5 });
      }
      if (ceil && ceilKeys.length && R() < 0.14 * amount) { const ck = img(ceilKeys[Math.floor(R() * ceilKeys.length)])!; const sc = 0.5 + R() * 0.6; c.drawImage(ck, x * TP + R() * 20, y * TP - 6, ck.width * sc, ck.height * sc); }
    }
  }

  scene.textures.addCanvas(key, cv);
  scene.registry.set(lightsKey, lights);
  cacheOrder.push(key);
  while (cacheOrder.length > MAX_CACHE) {
    const old = cacheOrder.shift()!;
    if (scene.textures.exists(old)) scene.textures.remove(old);
  }
  return { key, lights };
}


// ---------------------------------------------------------------- organic edges (the Hollows)
const GRASS = ['#5f8682', '#7aa49e', '#9cc4bc', '#c4e0d6', '#4a6a6c'];
/** The lit lip of a floor tile: an ashen crust, then grass of every length, a pebble now and then. */
function lip(c: CanvasRenderingContext2D, px: number, py: number, R: () => number, openL: boolean, openR: boolean) {
  const W = TP;
  // crust: a wavy pale band that fades into the rock
  const g = c.createLinearGradient(0, py - 2, 0, py + 18); g.addColorStop(0, 'rgba(150,144,170,0.95)'); g.addColorStop(0.25, 'rgba(84,78,104,0.7)'); g.addColorStop(1, 'rgba(23,20,31,0)');
  c.fillStyle = g; c.beginPath(); c.moveTo(px, py + 18);
  for (let x = 0; x <= W; x += 8) c.lineTo(px + x, py - 1 + Math.sin((px + x) * 0.11) * 1.2 + R() * 1.2);
  c.lineTo(px + W, py + 18); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(200,194,222,0.85)'; c.lineWidth = 1.6; c.beginPath();
  for (let x = 0; x <= W; x += 4) { const yy = py - 1 + Math.sin((px + x) * 0.11) * 1.2; if (x === 0) c.moveTo(px + x, yy); else c.lineTo(px + x, yy); }
  c.stroke();
  // grass in clumps: back blades dark, front blades pale; taller at clump centres
  const clumps = 1 + Math.floor(R() * 3);
  for (let k = 0; k < clumps; k++) {
    const cx = px + (openL && k === 0 ? 4 : 6) + R() * (W - 12), n = 4 + Math.floor(R() * 8), tall = 6 + R() * 14;
    for (let i = 0; i < n; i++) {
      const x = cx + (R() - 0.5) * 16, h = tall * (0.35 + R() * 0.75) * (1 - Math.abs(x - cx) / 14), lean = (R() - 0.5) * 7 + (x - cx) * 0.25, w = 0.8 + R() * 0.9;
      if (h < 1.5) continue;
      c.fillStyle = GRASS[Math.min(GRASS.length - 1, Math.floor(R() * GRASS.length * (i / n + 0.3)))];
      c.beginPath(); c.moveTo(x - w, py); c.quadraticCurveTo(x + lean * 0.3, py - h * 0.6, x + lean, py - h); c.quadraticCurveTo(x + lean * 0.4 + w * 0.4, py - h * 0.5, x + w, py); c.closePath(); c.fill();
    }
  }
  // sparse single blades between clumps
  for (let i = 0; i < 6; i++) { const x = px + R() * W, h = 2 + R() * 5; c.strokeStyle = GRASS[Math.floor(R() * 3)]; c.lineWidth = 1; c.beginPath(); c.moveTo(x, py); c.lineTo(x + (R() - 0.5) * 3, py - h); c.stroke(); }
  // a pebble or two sitting on the edge
  if (R() < 0.35) { const x = px + 6 + R() * (W - 12), rx = 2.5 + R() * 3; c.fillStyle = '#3a3548'; c.beginPath(); c.ellipse(x, py - rx * 0.5 + 0.5, rx, rx * 0.6, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(6,5,10,0.8)'; c.lineWidth = 1; c.stroke(); c.fillStyle = 'rgba(210,204,235,0.5)'; c.beginPath(); c.ellipse(x - rx * 0.3, py - rx * 0.75, rx * 0.4, rx * 0.2, 0, 0, Math.PI * 2); c.fill(); }
  // a pale bell flower, rarely
  if (R() < 0.08) { const x = px + 10 + R() * (W - 20), h = 10 + R() * 6; c.strokeStyle = '#7aa49e'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, py); c.quadraticCurveTo(x + 3, py - h, x + 5, py - h + 2); c.stroke(); c.fillStyle = '#d8e8ff'; c.beginPath(); c.ellipse(x + 5, py - h + 4, 2, 2.6, 0.3, 0, Math.PI * 2); c.fill(); }
  // rounded shoulders where the floor ends
  if (openR) { c.fillStyle = 'rgba(150,144,170,0.5)'; c.beginPath(); c.arc(px + W - 3, py + 3, 4, Math.PI, Math.PI * 1.6); c.fill(); }
}
/** Drips of rock hanging from a ceiling edge, with a cold rim of light and the odd water bead. */
function stalactites(c: CanvasRenderingContext2D, px: number, by: number, R: () => number) {
  const g = c.createLinearGradient(0, by - 12, 0, by); g.addColorStop(0, 'rgba(10,8,14,0)'); g.addColorStop(1, '#0c0a12');
  c.fillStyle = g; c.fillRect(px, by - 12, TP, 12);
  const n = R() < 0.25 ? 0 : 1 + Math.floor(R() * 3);
  for (let i = 0; i < n; i++) {
    const x = px + 6 + R() * (TP - 12), len = 6 + R() * (R() < 0.2 ? 34 : 14), w = 3 + R() * 6, bend = (R() - 0.5) * 4;
    c.fillStyle = '#0c0a12'; c.beginPath(); c.moveTo(x - w, by - 2); c.quadraticCurveTo(x - w * 0.4 + bend, by + len * 0.6, x + bend, by + len); c.quadraticCurveTo(x + w * 0.4 + bend, by + len * 0.5, x + w, by - 2); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(150,140,200,0.28)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - w * 0.7, by); c.quadraticCurveTo(x - w * 0.35 + bend, by + len * 0.55, x + bend - 0.5, by + len - 1); c.stroke();
    if (R() < 0.3) { c.fillStyle = 'rgba(190,230,255,0.75)'; c.beginPath(); c.ellipse(x + bend, by + len + 2, 1.3, 1.8, 0, 0, Math.PI * 2); c.fill(); }
  }
  // a hanging root hair now and then
  if (R() < 0.18) { const x = px + R() * TP; let yy = by, xx = x; c.strokeStyle = '#120f1a'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x, by); for (let k = 0; k < 6; k++) { yy += 6 + R() * 6; xx += (R() - 0.5) * 5; c.lineTo(xx, yy); } c.stroke(); }
}

export function isSolidTile(ch: string) { return isSolid(ch); }

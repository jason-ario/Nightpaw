/* Nightpaw storybook pages (prologue) and title-screen layers, painted in the same
 * language as the gameplay art: inky shapes with soft rim light from the upper left,
 * speckled paint texture, cool violet shadows, pale shafts of light, fog and dust,
 * and warm accents (candles, eyes, the red scarf).
 * Loaded after painter.js; uses its helpers through window.__P and reuses the
 * gameplay parts (np_head, np_ear, np_eye, moth_wing...) so characters match.
 */
(function () {
  'use strict';
  const { rng, lerp, hexA, mix, ell, poly, blobPath, glow, paint, strokes, A, assets, C } = window.__P;
  const { INK, FUR, FUR_L, RIM, EYE, CANDLE, SCARF, SCARF_L, SCARF_D, PALE } = C;
  const W = 1280, H = 720;
  // opaque pages are saved as JPEG (see renderAll)
  const AJ = (key, w, h, draw) => { A(key, w, h, draw); assets[assets.length - 1].jpeg = true; };
  const MOON = '#dfe4ff', MOON_D = '#8f96c8', NIGHT = '#0b0a14', VIOLET = '#241f36';

  // ---------------------------------------------------------------- parts
  // Render a painter asset at any scale (blur radii scaled like renderAll) and draw it.
  const cache = {};
  const filterProto = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'filter');
  function partCanvas(key, scale) {
    const id = `${key}@${scale.toFixed(3)}`;
    if (cache[id]) return cache[id];
    const a = assets.find((x) => x.key === key);
    if (!a) throw new Error(`no part ${key}`);
    const cv = document.createElement('canvas');
    cv.width = Math.ceil(a.w * scale); cv.height = Math.ceil(a.h * scale);
    const c = cv.getContext('2d');
    Object.defineProperty(c, 'filter', {
      get() { return filterProto.get.call(c); },
      set(v) { filterProto.set.call(c, String(v).replace(/blur\(([\d.]+)px\)/g, (m, n) => `blur(${n * scale}px)`)); },
    });
    c.scale(scale, scale);
    a.draw(c);
    return (cache[id] = { cv, w: a.w, h: a.h });
  }
  function part(c, key, x, y, scale, o = {}) {
    const { ox = 0.5, oy = 0.5, rot = 0, sx = 1, sy = 1, alpha = 1, flip = false, filter = 'none' } = o;
    const p = partCanvas(key, scale * Math.max(Math.abs(sx), Math.abs(sy), 1));
    c.save(); c.translate(x, y); c.rotate(rot); c.scale((flip ? -1 : 1) * sx, sy);
    c.globalAlpha *= alpha; c.filter = filter;
    const w = p.w * scale, h = p.h * scale;
    c.drawImage(p.cv, -ox * w, -oy * h, w, h);
    c.restore();
  }

  // ---------------------------------------------------------------- atmosphere
  function vgrad(c, stops, x0 = 0, y0 = 0, x1 = W, y1 = H) {
    const g = c.createLinearGradient(0, y0, 0, y1);
    stops.forEach(([t, col]) => g.addColorStop(t, col));
    c.fillStyle = g; c.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  // soft painted mass: a blurred blob, for distance and atmosphere
  function mass(c, pts, col, blur = 6) {
    c.save(); c.filter = `blur(${blur}px)`; c.fillStyle = col; blobPath(c, pts); c.fill(); c.restore();
  }
  // a shaft of light, fading along its length
  function shaft(c, top, bottom, col, a = 0.14, blur = 10) {
    c.save(); c.globalCompositeOperation = 'screen'; c.filter = `blur(${blur}px)`;
    const [tx0, ty, tx1] = top, [bx0, by, bx1] = bottom;
    const g = c.createLinearGradient((tx0 + tx1) / 2, ty, (bx0 + bx1) / 2, by);
    g.addColorStop(0, hexA(col, a)); g.addColorStop(0.7, hexA(col, a * 0.35)); g.addColorStop(1, hexA(col, 0));
    c.fillStyle = g; poly(c, [[tx0, ty], [tx1, ty], [bx1, by], [bx0, by]]); c.fill();
    c.restore();
  }
  function fogBand(c, y, h, col, a, seed, n = 26, x0 = -100, x1 = W + 100) {
    const r = rng(seed);
    c.save(); c.filter = 'blur(18px)';
    for (let i = 0; i < n; i++) { c.fillStyle = hexA(col, a * (0.4 + r() * 0.6)); ell(c, lerp(x0, x1, r()), y + (r() - 0.5) * h, 80 + r() * 160, h * (0.25 + r() * 0.3)); c.fill(); }
    c.restore();
  }
  function motes(c, n, [x0, y0, x1, y1], col, seed, size = 1) {
    const r = rng(seed);
    c.save(); c.globalCompositeOperation = 'screen';
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), s = (0.6 + r() * 1.8) * size, a = 0.15 + r() * 0.5;
      if (r() < 0.2) { c.filter = 'blur(2px)'; glow(c, x, y, s * 6, col, a * 0.5); c.filter = 'none'; }
      else { glow(c, x, y, s * 2.4, col, a); }
    }
    c.restore();
  }
  function rainHaze(c, seed, a = 0.16, [x0, y0, x1, y1] = [0, 0, W, H], n = 700, len = 26) {
    const r = rng(seed);
    c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
    c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = lerp(x0 - 40, x1 + 40, r()), y = lerp(y0 - 40, y1, r()), l = len * (0.5 + r());
      c.strokeStyle = `rgba(190,200,240,${a * (0.3 + r() * 0.7)})`; c.lineWidth = 0.6 + r() * 0.9;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - l * 0.28, y + l); c.stroke();
    }
    c.restore();
  }
  // Painterly brush texture over a shape: many short strokes along a direction.
  function brush(c, pathFn, [x0, y0, x1, y1], cols, seed, n = 400, len = 18, ang = -1.2, width = 3) {
    const r = rng(seed);
    c.save(); pathFn(c); c.clip(); c.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), l = len * (0.4 + r()), a = ang + (r() - 0.5) * 0.5;
      c.strokeStyle = cols[Math.floor(r() * cols.length)]; c.lineWidth = width * (0.5 + r());
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
    c.restore();
  }
  // Final pass shared by every page: colour grade, vignette and film grain.
  function finish(c, { vig = 0.75, grain = 0.06, tint = null, tintA = 0.12, seed = 'g' } = {}) {
    if (tint) { c.save(); c.globalCompositeOperation = 'soft-light'; c.fillStyle = hexA(tint, tintA); c.fillRect(0, 0, W, H); c.restore(); }
    const g = c.createRadialGradient(W / 2, H * 0.48, H * 0.3, W / 2, H * 0.5, W * 0.72);
    g.addColorStop(0, 'rgba(4,3,8,0)'); g.addColorStop(1, `rgba(4,3,8,${vig})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const img = c.getImageData(0, 0, W, H), d = img.data, r = rng(seed);
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * 255 * grain;
      d[i] = Math.max(0, Math.min(255, d[i] + n)); d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n)); d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 1.1));
    }
    c.putImageData(img, 0, 0);
  }
  // Tapered stroke painted like a limb (tails, scarf ends, ropes, roots).
  function taper(c, pts, w0, w1, o) {
    // sample a Catmull-Rom curve through pts
    const S = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let t = 0; t < 1; t += 0.1) {
        const t2 = t * t, t3 = t2 * t;
        S.push([0, 1].map((k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)));
      }
    }
    S.push(pts[pts.length - 1]);
    const L = [], R = [];
    S.forEach((p, i) => {
      const q = S[Math.min(S.length - 1, i + 1)], b = S[Math.max(0, i - 1)];
      let dx = q[0] - b[0], dy = q[1] - b[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const w = lerp(w0, w1, i / (S.length - 1)) / 2;
      L.push([p[0] - dy * w, p[1] + dx * w]); R.push([p[0] + dy * w, p[1] - dx * w]);
    });
    const outline = [...L, ...R.reverse()];
    const xs = outline.map((p) => p[0]), ys = outline.map((p) => p[1]);
    const path = (q) => poly(q, outline);
    paint(c, path, { bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], ...o });
    return path;
  }

  // ---------------------------------------------------------------- characters
  // Nightpaw on four legs (storybook). Gameplay head, ears and eyes; the same red
  // knit scarf, here wrapped round his neck with one end hanging.
  // pose: 'sit' (3/4 view, facing right) | 'back' (from behind) | 'loaf'
  // eyes: 'open' | 'half' | 'closed'; ears: 0 = up, 1 = flat back
  function storyCat(c, x, y, s, { pose = 'sit', eyes = 'open', ears = 0, flip = false, look = 0, scarfWind = 0, rimCol = RIM, seed = 'sc' } = {}) {
    c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
    const fur = { base: FUR, light: FUR_L, dark: INK, rim: rimCol, rimW: 2.4, tex: 0.05 };
    const back = pose === 'back';
    // --- tail, curled round the feet (sit) or rising (back)
    if (back) taper(c, [[10, -4], [34, -8], [48, -26], [48, -52], [40, -70], [30, -74]], 15, 8, { ...fur, rim: mix(rimCol, FUR, 0.45), rimW: 1.4, seed: seed + 't' });
    else if (pose === 'loaf') taper(c, [[-34, -8], [-50, -6], [-54, 4], [-30, 6], [0, 6], [20, 4]], 12, 6, { ...fur, seed: seed + 't' });
    else taper(c, [[-26, -8], [-44, -6], [-46, 3], [-20, 7], [14, 6], [34, 2]], 13, 6, { ...fur, seed: seed + 't' });
    // --- body
    if (pose === 'loaf') {
      const bp = (q) => blobPath(q, [[-40, 2], [-46, -18], [-30, -40], [0, -46], [26, -38], [36, -16], [32, 2]]);
      paint(c, bp, { ...fur, bbox: [-46, -46, 36, 2], seed: seed + 'b' });
    } else if (back) {
      const bp = (q) => blobPath(q, [[-30, 0], [-36, -22], [-28, -50], [-12, -64], [12, -64], [28, -50], [36, -22], [30, 0]]);
      paint(c, bp, { ...fur, bbox: [-36, -64, 36, 0], seed: seed + 'b' });
      // shoulder blades / spine hint
      c.save(); bp(c); c.clip(); c.strokeStyle = 'rgba(120,112,170,0.18)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(0, -60); c.quadraticCurveTo(2, -30, 0, -4); c.stroke(); c.restore();
    } else {
      const bp = (q) => blobPath(q, [[-34, 0], [-40, -22], [-32, -48], [-14, -62], [6, -62], [20, -50], [24, -26], [26, 0]]);
      paint(c, bp, { ...fur, bbox: [-40, -62, 26, 0], seed: seed + 'b' });
      // haunch
      const hp = (q) => blobPath(q, [[-38, -2], [-40, -22], [-26, -34], [-10, -26], [-8, -4]]);
      paint(c, hp, { base: '#1b1724', light: FUR_L, rim: rimCol, rimW: 1.6, bbox: [-40, -34, -8, -2], seed: seed + 'h', tex: 0.04 });
      // front legs (far one darker)
      const leg = (lx, dark) => {
        const lp = (q) => blobPath(q, [[lx - 4, -40], [lx + 4, -40], [lx + 5, -8], [lx + 8, -1], [lx + 1, 1.5], [lx - 5, 0], [lx - 4, -8]]);
        paint(c, lp, { base: dark ? '#0f0d15' : FUR, light: dark ? '#231f30' : FUR_L, rim: dark ? '#4a4466' : rimCol, rimW: 1.6, bbox: [lx - 6, -40, lx + 9, 2], seed: seed + 'l' + lx, tex: 0.03 });
      };
      leg(8, true); leg(18, false);
    }
    // --- head
    const hx = back ? 0 : 12 + look * 2, hy = back ? -70 : -66;
    c.save(); c.translate(hx, hy);
    // ears first (behind the head), rotated back by `ears`
    const eb = back ? -0.34 : -0.3, ef = back ? 0.34 : 0.28;
    const ear = (ex, ey, rot, sd) => {
      if (!back) { part(c, 'np_ear', ex, ey, 1, { ox: 0.5, oy: 0.95, rot }); return; }
      c.save(); c.translate(ex, ey); c.rotate(rot); c.translate(-9, -26.6);
      const pth = (q) => blobPath(q, [[2, 27], [5, 9], [9, 0.5], [14, 10], [16, 27], [9, 25]]);
      paint(c, pth, { base: FUR, light: FUR_L, rim: rimCol, rimW: 1.8, bbox: [0, 0, 18, 28], seed: seed + sd, tex: 0.03 });
      c.restore();
    };
    ear(-13, -20, eb - ears * 0.9, 'e1');
    part(c, 'np_head', 0, 0, 1, { ox: 0.5, oy: 0.6 });
    ear(13, -21, ef + ears * 0.9, 'e2');
    if (!back) {
      const sy = eyes === 'closed' ? 0.12 : eyes === 'half' ? 0.5 : 1;
      if (eyes === 'closed') {
        c.strokeStyle = 'rgba(200,190,230,0.55)'; c.lineWidth = 1.4; c.lineCap = 'round';
        for (const [ex, w] of [[-5 + look * 2, 5], [11 + look * 2, 6]]) { c.beginPath(); c.moveTo(ex - w, -6); c.quadraticCurveTo(ex, -3, ex + w, -6); c.stroke(); }
      } else {
        part(c, 'np_eye', -5 + look * 2, -6, 1, { sx: 0.86, sy: 0.9 * sy });
        part(c, 'np_eye', 12 + look * 2, -6, 1, { sy });
      }
      // nose, mouth, whiskers (no mask: the scarf is round his neck up here)
      c.fillStyle = '#3a2438'; blobPath(c, [[5 + look * 2, 3], [9 + look * 2, 3], [7 + look * 2, 5.5]]); c.fill();
      c.strokeStyle = 'rgba(20,12,24,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(7 + look * 2, 5.5); c.quadraticCurveTo(5, 8, 3, 7); c.moveTo(7 + look * 2, 5.5); c.quadraticCurveTo(9, 8, 11, 7); c.stroke();
      c.strokeStyle = 'rgba(235,230,255,0.6)'; c.lineWidth = 0.9;
      for (const [a, b] of [[2, -1], [5, 5], [8, 10]]) {
        c.beginPath(); c.moveTo(-8, a + 2); c.quadraticCurveTo(-18, a, -27, b); c.stroke();
        c.beginPath(); c.moveTo(20, a + 2); c.quadraticCurveTo(30, a, 39, b); c.stroke();
      }
    }
    c.restore();
    // --- scarf: a knit band round the neck, one end hanging (or streaming in the wind)
    const ny = back ? -60 : -56, nx = back ? 0 : 6;
    const band = (q) => blobPath(q, [[nx - 22, ny - 4], [nx - 6, ny - 9], [nx + 12, ny - 8], [nx + 23, ny - 2], [nx + 20, ny + 7], [nx + 2, ny + 9], [nx - 18, ny + 6]]);
    const sc = { base: SCARF, light: SCARF_L, dark: SCARF_D, rim: '#ff9aa4', rimW: 1.6, tex: 0.05 };
    const endPts = back
      ? [[nx - 4, ny + 2], [nx - 6 - scarfWind * 20, ny + 18], [nx - 2 - scarfWind * 40, ny + 34 - scarfWind * 18]]
      : [[nx - 12, ny + 4], [nx - 16 - scarfWind * 22, ny + 20 - scarfWind * 6], [nx - 12 - scarfWind * 46, ny + 38 - scarfWind * 26]];
    const ep = taper(c, endPts, 12, 9, { ...sc, seed: seed + 'se' });
    c.save(); ep(c); c.clip(); c.strokeStyle = 'rgba(60,0,12,0.45)'; c.lineWidth = 1.2;
    for (let i = 1; i < 6; i++) { const p = endPts[0], q = endPts[endPts.length - 1], t = i / 6; c.beginPath(); c.moveTo(lerp(p[0], q[0], t) - 7, lerp(p[1], q[1], t)); c.lineTo(lerp(p[0], q[0], t) + 7, lerp(p[1], q[1], t) + 1); c.stroke(); }
    c.restore();
    // fringe
    const tip = endPts[endPts.length - 1];
    c.strokeStyle = SCARF_D; c.lineWidth = 1.4; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(tip[0] + i * 1.6, tip[1] + 3); c.lineTo(tip[0] + i * 2 - scarfWind * 3, tip[1] + 8); c.stroke(); }
    paint(c, band, { ...sc, bbox: [nx - 22, ny - 9, nx + 23, ny + 9], seed: seed + 'sb' });
    c.save(); band(c); c.clip(); c.strokeStyle = 'rgba(60,0,12,0.5)'; c.lineWidth = 1.2;
    for (let xx = nx - 20; xx < nx + 24; xx += 5.5) { c.beginPath(); c.moveTo(xx, ny - 9); c.quadraticCurveTo(xx + 2, ny, xx - 1, ny + 9); c.stroke(); }
    c.restore();
    c.restore();
  }

  // Mira asleep: face on the pillow, hair spilling, a red ribbon.
  function miraAsleep(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    // hair behind (spread on the pillow)
    const hair = (q) => blobPath(q, [[-44, 6], [-40, -22], [-20, -40], [10, -42], [34, -30], [44, -8], [40, 14], [16, 8], [-10, 18]]);
    paint(c, hair, { base: '#2c1a16', light: '#6a4232', dark: '#0e0706', rim: '#a07a86', rimW: 2, bbox: [-44, -42, 44, 18], seed: 'mhair', tex: 0.05 });
    brush(c, hair, [-44, -42, 44, 18], ['rgba(120,80,60,0.35)', 'rgba(10,5,5,0.35)'], 'mhb', 160, 16, -0.4, 1.4);
    // face
    const face = (q) => blobPath(q, [[-22, -8], [-18, -24], [0, -30], [18, -24], [24, -6], [16, 12], [0, 18], [-16, 12]]);
    paint(c, face, { base: '#e2bda6', light: '#fff0de', dark: '#8a5a60', rim: '#ffe0b8', rimW: 1.6, lx: -0.9, ly: -0.4, bbox: [-22, -30, 24, 18], seed: 'mface', tex: 0.03 });
    // fringe over the forehead
    const fr = (q) => blobPath(q, [[-24, -10], [-20, -30], [0, -38], [22, -30], [26, -12], [14, -20], [2, -16], [-10, -20]]);
    paint(c, fr, { base: '#2c1a16', light: '#6a4232', dark: '#0e0706', rim: '#a07a86', rimW: 1.4, bbox: [-26, -38, 26, -10], seed: 'mfr', tex: 0.05 });
    // closed eyes, cheeks, a small mouth
    c.strokeStyle = '#4a2a28'; c.lineWidth = 1.6; c.lineCap = 'round';
    for (const ex of [-9, 9]) { c.beginPath(); c.arc(ex, -4, 4.5, 0.25, Math.PI - 0.25); c.stroke(); }
    c.fillStyle = 'rgba(240,120,120,0.35)'; ell(c, -12, 5, 5, 3); c.fill(); ell(c, 13, 5, 5, 3); c.fill();
    c.strokeStyle = 'rgba(110,50,50,0.7)'; c.lineWidth = 1.2; c.beginPath(); c.arc(1, 9, 2.5, 0.3, Math.PI - 0.3); c.stroke();
    // ribbon
    const rb = (q) => blobPath(q, [[-30, -26], [-40, -36], [-40, -20], [-30, -24], [-20, -34], [-18, -18]]);
    paint(c, rb, { base: SCARF, light: SCARF_L, dark: SCARF_D, rim: '#ff9aa4', rimW: 1.2, bbox: [-40, -36, -18, -18], seed: 'mrib', tex: 0.03 });
    c.restore();
  }

  // The pale moth, seen from above, spread flat against the glass.
  function paleMoth(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    glow(c, 0, 0, 150, PALE, 0.42);
    const wingCol = { base: '#d8cfbf', light: '#fffaf0', dark: '#8a7c6c', rim: '#ffffff', rimW: 1.6, tex: 0.14 };
    for (const d of [-1, 1]) {
      c.save(); c.scale(d, 1);
      // hind wing
      const hw = (q) => blobPath(q, [[3, 2], [26, 6], [48, 18], [50, 36], [34, 48], [14, 40], [4, 18]]);
      paint(c, hw, { ...wingCol, base: '#cfc4b2', bbox: [2, 2, 52, 48], seed: 'hw' + d });
      c.save(); hw(c); c.clip();
      c.strokeStyle = 'rgba(110,90,80,0.35)'; c.lineWidth = 0.8; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(4, 8); c.quadraticCurveTo(20 + k * 5, 14 + k * 4, 30 + k * 4, 28 + k * 5); c.stroke(); }
      c.fillStyle = 'rgba(120,90,80,0.25)'; blobPath(c, [[20, 44], [40, 42], [50, 30], [52, 40], [36, 50]]); c.fill();
      c.fillStyle = 'rgba(80,60,55,0.75)'; ell(c, 30, 28, 7, 7); c.fill(); c.fillStyle = 'rgba(255,190,110,0.9)'; ell(c, 30, 28, 4.5, 4.5); c.fill(); c.fillStyle = '#231a1c'; ell(c, 30, 28, 2, 2); c.fill();
      c.restore();
      // fore wing
      const fw = (q) => blobPath(q, [[3, -4], [18, -24], [48, -40], [72, -40], [76, -26], [60, -8], [34, 4], [8, 4]]);
      paint(c, fw, { ...wingCol, bbox: [3, -42, 76, 4], seed: 'fw' + d });
      c.save(); fw(c); c.clip();
      c.strokeStyle = 'rgba(110,90,80,0.35)'; c.lineWidth = 0.8; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(5, 0); c.quadraticCurveTo(26 + k * 4, -12 - k * 2, 44 + k * 5, -38 + k * 5); c.stroke(); }
      c.strokeStyle = 'rgba(120,95,85,0.4)'; c.lineWidth = 3; c.beginPath(); c.moveTo(22, -26); c.quadraticCurveTo(46, -22, 66, -34); c.stroke();
      c.fillStyle = 'rgba(80,60,55,0.75)'; ell(c, 44, -20, 8, 8); c.fill(); c.fillStyle = 'rgba(255,207,122,0.95)'; ell(c, 44, -20, 5, 5); c.fill(); c.fillStyle = '#231a1c'; ell(c, 44, -20, 2.4, 2.4); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, 42.5, -21.5, 1, 1); c.fill();
      c.restore();
      // feathery antenna
      c.strokeStyle = '#9a8c78'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(2, -16); c.quadraticCurveTo(8, -34, 20, -44); c.stroke();
      c.lineWidth = 0.6; for (let t = 0.15; t < 1; t += 0.07) { const ax = lerp(2, 20, t), ay = lerp(-16, -44, t) + Math.sin(t * 3) * 2; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax + 4, ay + 1.5); c.moveTo(ax, ay); c.lineTo(ax - 1.5, ay - 3.5); c.stroke(); }
      c.restore();
    }
    // body: fuzzy thorax, segmented abdomen, a small head with dark eyes
    paint(c, (q) => blobPath(q, [[0, 8], [5, 14], [6, 30], [3, 42], [0, 46], [-3, 42], [-6, 30], [-5, 14]]), { base: '#cbbfa8', light: '#fff6e6', dark: '#6a5e50', rim: '#ffffff', rimW: 1.2, bbox: [-6, 8, 6, 46], seed: 'abd', tex: 0.1 });
    c.strokeStyle = 'rgba(110,95,80,0.5)'; c.lineWidth = 1; for (let yy = 16; yy < 44; yy += 4.5) { c.beginPath(); c.moveTo(-5, yy); c.quadraticCurveTo(0, yy + 2, 5, yy); c.stroke(); }
    paint(c, (q) => ell(q, 0, 0, 7.5, 11), { base: '#e8dfcc', light: '#ffffff', dark: '#8a7c6c', rim: '#ffffff', rimW: 1.2, bbox: [-8, -11, 8, 11], seed: 'thx', tex: 0.12 });
    c.fillStyle = '#fff8ea'; strokes(c, 26, 'fz', (r) => { ell(c, (r() - 0.5) * 14, -8 + r() * 12, 1.8, 1.4); c.fill(); });
    paint(c, (q) => ell(q, 0, -13, 5, 4.5), { base: '#d8ccb6', light: '#ffffff', bbox: [-5, -18, 5, -8], seed: 'mhd', tex: 0.08 });
    c.fillStyle = '#1a1418'; ell(c, -3.4, -13.5, 2.2, 2.4); c.fill(); ell(c, 3.4, -13.5, 2.2, 2.4); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; ell(c, -4, -14.4, 0.6, 0.6); c.fill(); ell(c, 2.8, -14.4, 0.6, 0.6); c.fill();
    c.restore();
  }

  // A wooden bed seen from the side: headboard at the left, footboard at the right.
  function bed(c, x0, x1, top, floor, wood, seed) {
    const W0 = { base: wood, light: mix(wood, '#e0a080', 0.3), dark: '#060304', rim: '#c89080', rimW: 1.6, tex: 0.05 };
    // headboard: two posts with knobs and an arched panel
    const hb = (q) => blobPath(q, [[x0 - 8, floor], [x0 - 8, top - 70], [x0 + 20, top - 104], [x0 + 60, top - 100], [x0 + 70, top - 60], [x0 + 70, floor]]);
    paint(c, hb, { ...W0, bbox: [x0 - 8, top - 104, x0 + 70, floor], seed: seed + 'hb' });
    c.save(); hb(c); c.clip(); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 3;
    for (let xx = x0 + 6; xx < x0 + 64; xx += 12) { c.beginPath(); c.moveTo(xx, top - 84); c.lineTo(xx, top + 10); c.stroke(); } c.restore();
    for (const px of [x0 - 10, x0 + 70]) {
      paint(c, (q) => { q.beginPath(); q.rect(px - 7, top - 110, 14, floor - top + 110); }, { ...W0, bbox: [px - 7, top - 110, px + 7, floor], seed: seed + 'p' + px });
      paint(c, (q) => ell(q, px, top - 116, 11, 10), { ...W0, bbox: [px - 11, top - 126, px + 11, top - 106], seed: seed + 'k' + px });
    }
    // side rail and legs
    paint(c, (q) => { q.beginPath(); q.rect(x0 + 60, top + 44, x1 - x0 - 50, 40); }, { ...W0, bbox: [x0 + 60, top + 44, x1 + 10, top + 84], seed: seed + 'rail' });
    paint(c, (q) => { q.beginPath(); q.rect(x1 - 4, top - 10, 16, floor - top + 10); }, { ...W0, bbox: [x1 - 4, top - 10, x1 + 12, floor], seed: seed + 'fb' });
    paint(c, (q) => ell(q, x1 + 4, top - 16, 10, 9), { ...W0, bbox: [x1 - 6, top - 25, x1 + 14, top - 7], seed: seed + 'fk' });
    // shadow under the bed
    c.save(); c.filter = 'blur(10px)'; c.fillStyle = 'rgba(0,0,0,0.55)'; ell(c, (x0 + x1) / 2, floor + 4, (x1 - x0) / 2 + 30, 14); c.fill(); c.restore();
  }

  // Curtain hanging from a rod, gathered in folds; `wind` bends the hem into the room.
  function curtain(c, x0, x1, top, bottom, col, seed, wind = 0, lightCol = '#ffffff') {
    const w = x1 - x0, folds = Math.max(3, Math.round(w / 18));
    const hem = [], r = rng(seed);
    for (let i = 0; i <= folds; i++) { const t = i / folds; hem.push([x0 + t * w - wind * 90 * Math.pow(t, 0.5), bottom - wind * 40 * t + Math.sin(i * 1.9) * 5]); }
    const pts = [[x0, top], [x1, top], [x1 - wind * 30, (top + bottom) / 2], ...hem.slice().reverse(), [x0 - wind * 10, (top + bottom) / 2]];
    const path = (q) => blobPath(q, pts);
    paint(c, path, { base: col, light: mix(col, lightCol, 0.4), dark: '#050206', rim: mix(col, lightCol, 0.6), rimW: 1.6, bbox: [x0 - wind * 100, top, x1, bottom], seed, tex: 0.05 });
    c.save(); path(c); c.clip();
    for (let i = 0; i < folds; i++) {
      const t = (i + 0.5) / folds, fx = x0 + t * w, hx = hem[i][0] + (hem[i + 1][0] - hem[i][0]) / 2;
      const g = c.createLinearGradient(fx - 9, 0, fx + 9, 0);
      g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(0.45, hexA(lightCol, 0.12)); g.addColorStop(1, 'rgba(0,0,0,0.3)');
      c.fillStyle = g; poly(c, [[fx - 9, top], [fx + 9, top], [hx + 9, bottom], [hx - 9, bottom]]); c.fill();
    }
    c.restore();
    paint(c, (q) => { q.beginPath(); q.rect(x0 - 20, top - 8, w + 40, 8); }, { base: '#2a1c16', light: '#6a4a3a', rim: '#c09080', rimW: 1.2, bbox: [x0 - 20, top - 8, x1 + 20, top], seed: seed + 'rod', tex: 0.04 });
  }

  // Looking straight down a round stone shaft: courses of blocks shrinking toward the dark.
  function wellShaft(c, cx, cy, R, courses, seed) {
    const r = rng(seed);
    const ring = (i) => { const z = i * 0.34; const k = 1 / (1 + z); return { rx: R * k, ry: R * 0.64 * k, y: cy - 60 * (1 - k) }; };
    for (let i = 0; i < courses; i++) {
      const a = ring(i), b = ring(i + 1), depth = i / courses;
      const n = Math.max(10, Math.round(26 * (a.rx / R)) + 8);
      let ang = r() * 0.3;
      for (let k = 0; k < n; k++) {
        const a0 = ang, a1 = ang + (Math.PI * 2 / n) * (0.8 + r() * 0.4); ang = a1;
        const g = 0.012;
        const pts = [];
        for (let t = 0; t <= 4; t++) { const aa = lerp(a0 + g, a1 - g, t / 4); pts.push([cx + Math.cos(aa) * a.rx, a.y + Math.sin(aa) * a.ry]); }
        for (let t = 4; t >= 0; t--) { const aa = lerp(a0 + g, a1 - g, t / 4); pts.push([cx + Math.cos(aa) * (b.rx + (a.rx - b.rx) * 0.06), b.y + Math.sin(aa) * (b.ry + (a.ry - b.ry) * 0.06)]); }
        const mid = (a0 + a1) / 2;
        // the far wall (top of the ellipse) faces us and catches the moon; near wall is in shadow
        const lit = 0.5 - Math.sin(mid) * 0.5;
        const base = mix(mix('#3a3654', '#15131e', 1 - lit), '#040306', Math.min(1, depth * 1.15));
        const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
        paint(c, (q) => poly(q, pts), { base, light: mix(base, '#8a84b8', 0.35 * (1 - depth)), dark: '#030205', rim: depth < 0.7 ? mix('#7c76a8', '#1a1826', depth) : null, rimW: 1.4, bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], seed: seed + i + '_' + k, tex: 0.08 * (1 - depth) });
        if (r() < 0.12 * (1 - depth)) { c.fillStyle = hexA('#3a5a3a', 0.35); ell(c, lerp(pts[1][0], pts[7][0], 0.5), lerp(pts[1][1], pts[7][1], 0.5), 6 + r() * 8, 3 + r() * 4); c.fill(); }
      }
    }
    const last = ring(courses);
    c.fillStyle = '#000'; ell(c, cx, last.y, last.rx, last.ry); c.fill();
    return last;
  }

  // Candle with flame and glow.
  function candle(c, x, y, s, lit = true) {
    part(c, 'candle', x, y, s, { ox: 0.5, oy: 1 });
    if (lit) { glow(c, x, y - 36 * s, 150 * s, CANDLE, 0.3); part(c, 'flame', x, y - 30 * s, s, { ox: 0.5, oy: 0.85 }); }
  }
  // Wooden planks / floorboards with painted grain.
  function boards(c, x0, y0, x1, y1, col, seed, horizontal = true, gap = 34) {
    c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip();
    c.fillStyle = col; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    const r = rng(seed);
    brush(c, (q) => { q.beginPath(); q.rect(x0, y0, x1 - x0, y1 - y0); }, [x0, y0, x1, y1], ['rgba(255,230,210,0.05)', 'rgba(0,0,0,0.22)', 'rgba(120,80,90,0.08)'], seed + 'b', 500, 60, horizontal ? 0 : Math.PI / 2, 2);
    c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 2;
    if (horizontal) for (let y = y0; y < y1; y += gap * (0.8 + r() * 0.4)) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
    else for (let x = x0; x < x1; x += gap * (0.8 + r() * 0.4)) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); }
    c.restore();
  }
  // Stone blocks with rim light (well walls).
  function stones(c, pathFn, [x0, y0, x1, y1], seed, base = '#2a2638', rowH = 26) {
    c.save(); pathFn(c); c.clip();
    c.fillStyle = '#0c0a12'; c.fillRect(x0, y0, x1 - x0, y1 - y0);
    const r = rng(seed);
    for (let y = y0; y < y1; y += rowH) {
      let x = x0 - r() * 40;
      while (x < x1) {
        const w = rowH * (1.4 + r() * 1.4);
        const p = (q) => blobPath(q, [[x + 2, y + 3], [x + w * 0.5, y + 1 + r() * 2], [x + w - 2, y + 3], [x + w - 1, y + rowH - 3], [x + w * 0.5, y + rowH - 1], [x + 1, y + rowH - 3]]);
        paint(c, p, { base: mix(base, '#0c0a12', r() * 0.5), light: '#5a5478', dark: '#050408', rim: '#7c76a8', rimW: 1.4, bbox: [x, y, x + w, y + rowH], seed: seed + x + y, tex: 0.08 });
        x += w + 2;
      }
    }
    c.restore();
  }
  function grassTufts(c, x0, x1, y, col, seed, n = 120, h = 16, lw = 1.6) {
    const r = rng(seed); c.strokeStyle = col; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const x = lerp(x0, x1, r()), hh = h * (0.4 + r()); c.lineWidth = lw * (0.6 + r() * 0.8); c.beginPath(); c.moveTo(x, y + r() * 4); c.quadraticCurveTo(x + (r() - 0.5) * 6, y - hh * 0.6, x + (r() - 0.5) * 12, y - hh); c.stroke(); }
  }
  // Rooftops for the town: a row of crooked houses at one depth.
  function houses(c, seed, baseY, col, rimA, winChance, scale = 1, x0 = -60, x1 = W + 60, lit = CANDLE) {
    const r = rng(seed);
    let x = x0;
    while (x < x1) {
      const w = (70 + r() * 90) * scale, h = (80 + r() * 120) * scale, roof = (40 + r() * 50) * scale, lean = (r() - 0.5) * 10 * scale;
      const kind = r();
      const pts = kind < 0.55 ? [[x, H], [x, baseY - h], [x + w / 2 + lean, baseY - h - roof], [x + w, baseY - h], [x + w, H]]
        : kind < 0.8 ? [[x, H], [x, baseY - h], [x + w * 0.3, baseY - h - roof * 0.5], [x + w * 0.7 + lean, baseY - h - roof * 0.5], [x + w, baseY - h], [x + w, H]]
        : [[x, H], [x, baseY - h - roof * 0.2], [x + w * 0.2 + lean, baseY - h - roof * 1.3], [x + w * 0.4, baseY - h - roof * 0.2], [x + w, baseY - h - roof * 0.2], [x + w, H]];
      const p = (q) => poly(q, pts);
      paint(c, p, { base: col, light: mix(col, '#8d86b8', 0.18), rim: '#8d86b8', rimW: 1.5 * scale, bbox: [x, baseY - h - roof, x + w, H], seed: seed + x, tex: 0.05 });
      if (r() < 0.55) { const cx = x + w * (0.2 + r() * 0.5); c.fillStyle = col; c.fillRect(cx, baseY - h - roof * 0.9, 10 * scale, roof * 0.7); }
      for (let k = 0; k < 4; k++) {
        if (r() > winChance) continue;
        const wx = x + 10 * scale + r() * (w - 30 * scale), wy = baseY - h + 16 * scale + r() * (h - 40 * scale), ww = 12 * scale, wh = 16 * scale;
        glow(c, wx + ww / 2, wy + wh / 2, 34 * scale, lit, 0.22);
        c.fillStyle = mix(lit, '#ffffff', 0.25); c.fillRect(wx, wy, ww, wh);
        c.fillStyle = col; c.fillRect(wx + ww / 2 - 1, wy, 2 * scale, wh); c.fillRect(wx, wy + wh / 2 - 1, ww, 2 * scale);
      }
      x += w + (6 + r() * 26) * scale;
    }
  }
  function moon(c, x, y, R, veil = 0.25) {
    glow(c, x, y, R * 5, MOON, 0.18); glow(c, x, y, R * 2.2, MOON, 0.35);
    paint(c, (q) => ell(q, x, y, R, R), { base: '#d8dcf6', light: '#ffffff', dark: MOON_D, bbox: [x - R, y - R, x + R, y + R], seed: 'moon', tex: 0.05 });
    c.fillStyle = 'rgba(150,156,200,0.3)'; ell(c, x - R * 0.3, y - R * 0.2, R * 0.22, R * 0.17); c.fill(); ell(c, x + R * 0.28, y + R * 0.3, R * 0.15, R * 0.12); c.fill();
    if (veil) mass(c, [[x - R * 3, y + R * 0.2], [x - R, y - R * 0.3], [x + R * 2, y + R * 0.1], [x + R * 3.2, y + R * 0.6], [x, y + R * 0.9]], `rgba(30,30,56,${veil})`, 10);
  }
  function clouds(c, seed, y, col, a, n = 10, lit = null) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = r() * (W + 200) - 100, w = 120 + r() * 220, yy = y + (r() - 0.5) * 60;
      c.save(); c.filter = 'blur(8px)';
      for (let k = 0; k < 6; k++) { c.fillStyle = hexA(col, a * (0.5 + r() * 0.5)); ell(c, x + (k - 2.5) * w * 0.28, yy - Math.sin((k / 5) * Math.PI) * 26 * (0.6 + r() * 0.6), w * 0.26, 22 + r() * 16); c.fill(); }
      if (lit) { c.globalCompositeOperation = 'screen'; c.fillStyle = hexA(lit, 0.08 + r() * 0.06); ell(c, x, yy - 30, w * 0.7, 10); c.fill(); }
      c.restore();
    }
  }

  // ---------------------------------------------------------------- pages
  // 1. Wickmoor in the rain, the last house on Candle Lane.
  AJ('sb_town', W, H, (c) => {
    vgrad(c, [[0, '#070812'], [0.55, '#1a1b30'], [1, '#2a2840']]);
    moon(c, 1010, 120, 38, 0.35);
    clouds(c, 'tc', 230, '#2a2946', 0.55, 7, MOON);
    clouds(c, 'tc2', 60, '#1c1c34', 0.5, 5);
    shaft(c, [960, 0, 1060], [700, H, 1100], MOON, 0.1, 16);
    fogBand(c, 400, 120, '#6a6a9a', 0.12, 'tf1');
    houses(c, 'h1', 430, '#1d1d33', 0.12, 0.35, 0.7);
    fogBand(c, 470, 110, '#5a5a8a', 0.14, 'tf2');
    houses(c, 'h2', 520, '#131326', 0.1, 0.3, 0.9);
    fogBand(c, 560, 90, '#4a4a78', 0.12, 'tf3');
    // Mira's house, the last on the lane: tall, crooked, one warm upstairs window
    const hx = 760, hy = 250;
    const house = (q) => poly(q, [[hx, H], [hx - 6, hy + 90], [hx + 130, hy - 30], [hx + 280, hy + 80], [hx + 282, H]]);
    paint(c, house, { base: '#0d0c18', light: '#26243e', dark: '#040308', rim: '#8d86b8', rimW: 2, bbox: [hx - 6, hy - 30, hx + 282, H], seed: 'mh', tex: 0.05 });
    brush(c, house, [hx, hy - 30, hx + 282, H], ['rgba(140,130,190,0.06)', 'rgba(0,0,0,0.25)'], 'mhb', 300, 30, Math.PI / 2, 3);
    c.fillStyle = '#0d0c18'; c.fillRect(hx + 200, hy - 30, 22, 80); // chimney
    // the window: warm light, the curtain, Nightpaw's small silhouette on the sill
    const wx = hx + 105, wy = hy + 110;
    glow(c, wx + 28, wy + 38, 180, CANDLE, 0.4);
    paint(c, (q) => { q.beginPath(); q.rect(wx, wy, 56, 76); }, { base: '#ffcf7a', light: '#fff4d0', dark: '#c07a30', bbox: [wx, wy, wx + 56, wy + 76], seed: 'win', tex: 0.04 });
    c.fillStyle = 'rgba(150,60,70,0.55)'; blobPath(c, [[wx, wy], [wx + 20, wy], [wx + 12, wy + 50], [wx, wy + 76]]); c.fill();
    c.fillStyle = '#0d0c18'; c.fillRect(wx + 26, wy, 4, 76); c.fillRect(wx, wy + 36, 56, 4); c.lineWidth = 5; c.strokeStyle = '#0d0c18'; c.strokeRect(wx, wy, 56, 76);
    c.save(); c.beginPath(); c.rect(wx, wy, 56, 76); c.clip();
    c.fillStyle = '#0a0810'; const cx = wx + 38, cy = wy + 72;
    blobPath(c, [[cx - 8, cy], [cx - 9, cy - 12], [cx - 4, cy - 18], [cx + 4, cy - 18], [cx + 8, cy - 10], [cx + 7, cy]]); c.fill();
    ell(c, cx, cy - 22, 7, 6); c.fill(); poly(c, [[cx - 6, cy - 25], [cx - 5, cy - 33], [cx - 1, cy - 27]]); c.fill(); poly(c, [[cx + 6, cy - 25], [cx + 5, cy - 33], [cx + 1, cy - 27]]); c.fill();
    c.fillStyle = SCARF; c.fillRect(cx - 6, cy - 18, 12, 3);
    c.restore();
    // wet street with reflections of lit windows
    vgrad(c, [[0, '#0e0d1a'], [1, '#07060c']], 0, 610, W, H);
    c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(6px)';
    for (const [x, a] of [[wx + 28, 0.35], [180, 0.12], [420, 0.1], [600, 0.12]]) { const g = c.createLinearGradient(0, 612, 0, H); g.addColorStop(0, hexA(CANDLE, a)); g.addColorStop(1, hexA(CANDLE, 0)); c.fillStyle = g; c.fillRect(x - 10, 612, 20, 108); }
    c.restore();
    // the garden well, front left, and a crooked fence
    const r = rng('fence');
    for (let i = 0; i < 18; i++) { const x = 40 + i * 34, t = 560 + r() * 10; c.fillStyle = '#07060c'; poly(c, [[x, 640], [x, t], [x + 7, t - 8], [x + 14, t], [x + 14, 640]]); c.fill(); }
    c.fillStyle = '#07060c'; c.fillRect(30, 590, 640, 6); c.fillRect(30, 620, 640, 6);
    const well = (q) => blobPath(q, [[250, 662], [252, 600], [300, 592], [360, 592], [408, 600], [410, 662], [330, 672]]);
    paint(c, well, { base: '#15131f', light: '#3a3656', dark: '#050408', rim: '#8d86b8', rimW: 2, bbox: [250, 590, 410, 672], seed: 'tw', tex: 0.07 });
    c.strokeStyle = '#08070d'; c.lineWidth = 9; c.beginPath(); c.moveTo(262, 598); c.lineTo(262, 520); c.lineTo(398, 520); c.lineTo(398, 598); c.stroke();
    poly(c, [[246, 526], [330, 488], [414, 526]]); c.fillStyle = '#08070d'; c.fill();
    grassTufts(c, 0, W, 668, '#06050a', 'tg', 200, 14, 1.8);
    rainHaze(c, 'tr', 0.16);
    finish(c, { vig: 0.75, tint: '#4a5a9a', tintA: 0.1, seed: 'gt' });
  });

  // 2. Mira's bedroom by candlelight. Nightpaw sits at the foot of the bed, not liking the rhyme.
  AJ('sb_bedroom', W, H, (c) => {
    vgrad(c, [[0, '#150f1c'], [1, '#1c131c']], 0, 0, W, 560);
    c.save(); c.globalAlpha = 0.6;
    for (let x = 0; x < W; x += 58) for (let y = 16; y < 470; y += 58) { const ox = (y / 58) % 2 ? 29 : 0; c.fillStyle = 'rgba(160,110,140,0.12)'; blobPath(c, [[x + ox, y - 6], [x + ox + 5, y], [x + ox, y + 6], [x + ox - 5, y]]); c.fill(); }
    c.restore();
    brush(c, (q) => { q.beginPath(); q.rect(0, 0, W, 470); }, [0, 0, W, 470], ['rgba(255,220,200,0.025)', 'rgba(0,0,0,0.08)'], 'wall', 500, 26, -0.3, 6);
    boards(c, 0, 470, W, 560, '#1e1318', 'wain', false, 42);
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 466, W, 6);
    boards(c, 0, 560, W, H, '#150d12', 'floor', true, 30);
    // candle warmth, broad and soft, falling off to the right
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, 292, 400, 620, CANDLE, 0.2); glow(c, 292, 400, 240, CANDLE, 0.16); c.restore();
    // the window, right: rain and moonlight
    const wx = 1020, wy = 110, ww = 180, wh = 250;
    vgrad(c, [[0, '#101a34'], [1, '#1c2848']], wx, wy, wx + ww, wy + wh);
    mass(c, [[wx, wy + 200], [wx + 70, wy + 180], [wx + ww, wy + 196], [wx + ww, wy + wh], [wx, wy + wh]], 'rgba(8,10,20,0.8)', 3);
    rainHaze(c, 'brw', 0.35, [wx, wy, wx + ww, wy + wh], 160, 18);
    c.save(); c.beginPath(); c.rect(wx, wy, ww, wh); c.clip(); glow(c, wx + 130, wy + 50, 80, MOON, 0.4); c.restore();
    c.strokeStyle = '#24161c'; c.lineWidth = 12; c.strokeRect(wx, wy, ww, wh); c.lineWidth = 7; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
    paint(c, (q) => { q.beginPath(); q.rect(wx - 16, wy + wh, ww + 32, 12); }, { base: '#2a1a1e', light: '#5a3a3e', rim: '#a8b8f0', rimW: 1.2, bbox: [wx - 16, wy + wh, wx + ww + 16, wy + wh + 12], seed: 'sill', tex: 0.04 });
    shaft(c, [wx + 10, wy + 30, wx + ww - 10], [760, H, 1060], '#9fb4ff', 0.13, 14);
    curtain(c, wx - 70, wx + 6, wy - 30, wy + 320, '#4a1c2c', 'curL', 0, '#ff9a80');
    curtain(c, wx + ww - 4, wx + ww + 56, wy - 30, wy + 320, '#3a1624', 'curR', 0, '#9fb4ff');
    // a child's drawing pinned up: "MY CAT"
    c.save(); c.translate(610, 170); c.rotate(-0.05);
    paint(c, (q) => { q.beginPath(); q.rect(0, 0, 150, 112); }, { base: '#c8bfae', light: '#fff0d8', dark: '#6a5a4a', bbox: [0, 0, 150, 112], seed: 'paper', tex: 0.05 });
    c.strokeStyle = '#1c1a26'; c.lineWidth = 3; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(44, 92); c.lineTo(44, 56); c.lineTo(50, 38); c.lineTo(58, 54); c.lineTo(84, 54); c.lineTo(92, 38); c.lineTo(98, 56); c.lineTo(98, 92); c.closePath(); c.stroke();
    c.fillStyle = '#e8c040'; ell(c, 60, 68, 4, 4); c.fill(); ell(c, 82, 68, 4, 4); c.fill(); c.fillStyle = SCARF; c.fillRect(48, 78, 46, 6);
    c.fillStyle = '#2a4aa0'; c.font = 'bold 15px "Comic Sans MS", cursive'; c.fillText('MY CAT', 44, 24);
    c.fillStyle = '#9a8870'; ell(c, 75, 6, 3, 3); c.fill();
    c.restore();
    // bedside table + candle
    paint(c, (q) => { q.beginPath(); q.rect(214, 452, 150, 150); }, { base: '#2a181c', light: '#6a3e3a', dark: '#0a0406', rim: '#e0a070', rimW: 1.6, lx: 0.2, ly: -1, bbox: [214, 452, 364, 602], seed: 'tbl', tex: 0.05 });
    paint(c, (q) => { q.beginPath(); q.rect(202, 440, 174, 16); }, { base: '#3a2226', light: '#8a5244', rim: '#ffc890', rimW: 1.4, bbox: [202, 440, 376, 456], seed: 'tbt', tex: 0.04 });
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 2; c.strokeRect(232, 480, 114, 40); ell(c, 289, 500, 4, 4); c.fillStyle = '#c8a060'; c.fill();
    candle(c, 292, 442, 2.1, true);
    // the bed
    bed(c, 440, 1060, 470, 600, '#3a2024', 'bed');
    paint(c, (q) => { q.beginPath(); q.rect(500, 470, 560, 60); }, { base: '#e6e0ec', light: '#ffffff', dark: '#7a7090', bbox: [500, 470, 1060, 530], seed: 'sheet', tex: 0.03 });
    paint(c, (q) => blobPath(q, [[470, 470], [520, 424], [600, 418], [640, 440], [630, 480], [520, 490]]), { base: '#d8d0e4', light: '#fffaf0', dark: '#6a6080', rim: '#ffffff', rimW: 1.4, lx: -0.9, ly: -0.5, bbox: [470, 418, 640, 490], seed: 'pillow', tex: 0.03 });
    miraAsleep(c, 560, 440, 1.3);
    const quilt = (q) => blobPath(q, [[560, 486], [640, 466], [760, 470], [880, 462], [1040, 472], [1072, 520], [1056, 548], [520, 548], [540, 510]]);
    paint(c, quilt, { base: '#3e3052', light: '#a890c8', dark: '#120a1e', rim: '#e8d0c8', rimW: 1.8, lx: -0.9, ly: -0.6, bbox: [520, 462, 1072, 548], seed: 'quilt', tex: 0.06 });
    c.save(); quilt(c); c.clip();
    const pr = rng('patch');
    for (let i = 0; i < 20; i++) { const px = 530 + (i % 10) * 56, py = 468 + Math.floor(i / 10) * 40; c.fillStyle = [hexA('#c8283a', 0.2), hexA('#ffcf7a', 0.1), hexA('#5aa0d0', 0.12), hexA('#1a0e2a', 0.3)][Math.floor(pr() * 4)]; c.fillRect(px, py, 54, 38); }
    c.strokeStyle = 'rgba(255,240,220,0.14)'; c.setLineDash([4, 5]); c.lineWidth = 1.2;
    for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(530 + i * 56, 460); c.lineTo(530 + i * 56, 552); c.stroke(); }
    c.beginPath(); c.moveTo(520, 508); c.lineTo(1072, 508); c.stroke(); c.setLineDash([]);
    c.restore();
    // Nightpaw at the foot of the bed, facing Mira, ears half back
    storyCat(c, 950, 482, 1.3, { pose: 'sit', flip: true, ears: 0.35, eyes: 'open', seed: 'bc' });
    // rug
    const rug = (q) => ell(q, 720, 660, 300, 36);
    paint(c, rug, { base: '#2a1420', light: '#6a3448', dark: '#08030a', bbox: [420, 624, 1020, 696], seed: 'rug', tex: 0.07 });
    c.save(); rug(c); c.clip(); c.strokeStyle = 'rgba(255,200,140,0.12)'; c.lineWidth = 3; ell(c, 720, 660, 270, 28); c.stroke(); ell(c, 720, 660, 220, 20); c.stroke(); c.restore();
    motes(c, 60, [150, 250, 500, 560], CANDLE, 'bm', 0.9);
    motes(c, 40, [780, 300, 1080, 700], '#bcd0ff', 'bm2', 0.8);
    finish(c, { vig: 0.8, tint: '#a06040', tintA: 0.08, seed: 'gb' });
  });

  // 3. Tap. Tap. Tap. The pale moth at the rainy window; Nightpaw watching from the dark.
  AJ('sb_moth', W, H, (c) => {
    vgrad(c, [[0, '#0a1020'], [1, '#141c34']]);
    // the garden beyond the glass, soft in the rain: the well under the tree
    mass(c, [[0, 520], [200, 480], [420, 500], [620, 470], [900, 500], [1280, 470], [1280, 720], [0, 720]], '#0c1022', 8);
    mass(c, [[850, 500], [852, 450], [930, 440], [1010, 450], [1012, 500]], '#080b18', 5);
    mass(c, [[860, 452], [930, 410], [1004, 452]], '#080b18', 5);
    rainHaze(c, 'mr0', 0.2, [0, 0, W, H], 900, 30);
    const r = rng('drops');
    for (let i = 0; i < 260; i++) {
      const x = r() * W, y = r() * H, sz = 1 + r() * 4;
      c.fillStyle = 'rgba(180,200,255,0.12)'; ell(c, x, y, sz, sz * 1.2); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, x - sz * 0.3, y - sz * 0.4, sz * 0.3, sz * 0.3); c.fill();
      if (r() < 0.12) { c.strokeStyle = 'rgba(180,200,255,0.12)'; c.lineWidth = sz; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (r() - 0.5) * 8, y + 30, x + (r() - 0.5) * 6, y + 60 + r() * 60); c.stroke(); }
    }
    paleMoth(c, 400, 330, 2.9);
    motes(c, 30, [260, 180, 560, 480], PALE, 'mm', 1.2);
    const frame = (q) => { q.beginPath(); q.rect(0, 0, W, 54); q.rect(0, 666, W, 54); q.rect(0, 0, 70, H); q.rect(1210, 0, 70, H); q.rect(612, 0, 56, H); };
    paint(c, frame, { base: '#1c1216', light: '#4a3036', dark: '#050204', rim: '#b8a8d8', rimW: 2.2, bbox: [0, 0, W, H], seed: 'wf', tex: 0.06 });
    c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(20px)'; c.fillStyle = 'rgba(160,180,255,0.06)'; poly(c, [[100, 54], [260, 54], [140, 666], [70, 666]]); c.fill(); c.restore();
    // Nightpaw from behind, bottom right, rim-lit by the moth's glow
    storyCat(c, 900, 760, 3.2, { pose: 'back', ears: 0, rimCol: '#cfc8f0', seed: 'mcat' });
    c.save(); c.globalAlpha = 0.3; glow(c, 876, 300, 10, EYE, 0.8); glow(c, 922, 298, 10, EYE, 0.8); c.restore();
    finish(c, { vig: 0.8, tint: '#5070c0', tintA: 0.1, seed: 'gm' });
  });

  // 4. Morning. The bed is empty, the window open, small muddy footprints.
  AJ('sb_empty', W, H, (c) => {
    vgrad(c, [[0, '#34344a'], [1, '#26243a']], 0, 0, W, 560);
    brush(c, (q) => { q.beginPath(); q.rect(0, 0, W, 470); }, [0, 0, W, 470], ['rgba(255,255,255,0.025)', 'rgba(0,0,0,0.07)'], 'ew', 500, 26, -0.3, 6);
    boards(c, 0, 470, W, 560, '#2a2634', 'ewain', false, 42);
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 466, W, 6);
    boards(c, 0, 560, W, H, '#221e2c', 'efloor', true, 30);
    // the open window: a grey dawn, the garden beyond, a sash swung wide
    const wx = 1020, wy = 110, ww = 180, wh = 250;
    vgrad(c, [[0, '#8f98bc'], [0.7, '#c8c2d4'], [1, '#d8cfd0']], wx, wy, wx + ww, wy + wh);
    mass(c, [[wx, wy + 190], [wx + 60, wy + 168], [wx + 140, wy + 184], [wx + ww, wy + 170], [wx + ww, wy + wh], [wx, wy + wh]], 'rgba(50,50,72,0.7)', 3);
    c.strokeStyle = '#2a2230'; c.lineWidth = 12; c.strokeRect(wx, wy, ww, wh);
    c.save(); c.translate(wx + ww, wy); c.transform(0.5, 0.14, 0, 1, 0, 0); c.lineWidth = 8; c.strokeRect(0, 0, ww * 0.9, wh); c.fillStyle = 'rgba(170,180,210,0.18)'; c.fillRect(0, 0, ww * 0.9, wh); c.restore();
    paint(c, (q) => { q.beginPath(); q.rect(wx - 16, wy + wh, ww + 32, 12); }, { base: '#3a3038', light: '#7a6a70', rim: '#ffffff', rimW: 1.2, bbox: [wx - 16, wy + wh, wx + ww + 16, wy + wh + 12], seed: 'esill', tex: 0.04 });
    shaft(c, [wx + 10, wy + 20, wx + ww], [520, H, 1000], '#f0ecff', 0.2, 12);
    curtain(c, wx - 70, wx + 6, wy - 30, wy + 320, '#6a5a70', 'ecurL', 0.45, '#ffffff');
    curtain(c, wx + ww - 4, wx + ww + 56, wy - 30, wy + 320, '#5a4a62', 'ecurR', 0.2, '#ffffff');
    // the snuffed candle, a thread of smoke
    paint(c, (q) => { q.beginPath(); q.rect(214, 452, 150, 150); }, { base: '#2e2830', light: '#5a4e56', dark: '#0a0608', bbox: [214, 452, 364, 602], seed: 'etbl', tex: 0.05 });
    paint(c, (q) => { q.beginPath(); q.rect(202, 440, 174, 16); }, { base: '#3e3440', light: '#7a6a76', rim: '#d8d0ff', rimW: 1.2, bbox: [202, 440, 376, 456], seed: 'etbt', tex: 0.04 });
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 2; c.strokeRect(232, 480, 114, 40);
    part(c, 'candle', 292, 442, 1.6, { ox: 0.5, oy: 1, sy: 0.7 });
    c.save(); c.filter = 'blur(1.5px)'; c.strokeStyle = 'rgba(230,230,245,0.45)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(292, 404); c.bezierCurveTo(272, 360, 318, 330, 296, 280); c.bezierCurveTo(280, 240, 316, 210, 300, 160); c.stroke(); c.restore();
    // the empty bed: quilt thrown back, a dent in the pillow
    bed(c, 440, 1060, 470, 600, '#3a3036', 'ebed');
    paint(c, (q) => { q.beginPath(); q.rect(500, 470, 560, 60); }, { base: '#c8c4d4', light: '#ffffff', dark: '#6a6680', bbox: [500, 470, 1060, 530], seed: 'esheet', tex: 0.03 });
    paint(c, (q) => blobPath(q, [[470, 470], [520, 424], [600, 418], [640, 440], [630, 480], [520, 490]]), { base: '#b8b2c8', light: '#ffffff', dark: '#5a5470', rim: '#ffffff', rimW: 1.4, lx: 0.7, ly: -0.6, bbox: [470, 418, 640, 490], seed: 'epil', tex: 0.03 });
    c.save(); c.filter = 'blur(4px)'; c.fillStyle = 'rgba(60,50,80,0.35)'; ell(c, 560, 452, 36, 14); c.fill(); c.restore();
    const q2 = (q) => blobPath(q, [[760, 500], [860, 470], [980, 460], [1066, 476], [1072, 530], [1056, 548], [740, 548], [720, 520]]);
    paint(c, q2, { base: '#48405e', light: '#b0a4c8', dark: '#140c20', rim: '#f0e8ff', rimW: 1.6, lx: 0.7, ly: -0.7, bbox: [720, 460, 1072, 548], seed: 'equilt', tex: 0.06 });
    // muddy little footprints across the floor to the window, and two on the sill
    const prints = [[480, 700], [540, 684], [610, 690], [680, 672], [760, 676], [840, 656], [920, 660], [990, 636], [1060, 640], [1080, 364], [1140, 362]];
    prints.forEach(([x, y], i) => {
      const sc = i >= 9 ? 0.6 : 1 - i * 0.03;
      c.save(); c.translate(x, y); c.rotate(i >= 9 ? -1.4 : -1.3 + (i % 2) * 0.2); c.scale(sc, sc * (i >= 9 ? 0.6 : 0.8));
      c.fillStyle = 'rgba(58,40,30,0.85)'; ell(c, 0, 0, 13, 7); c.fill(); for (let k = -1; k <= 1; k++) { ell(c, k * 7, -10, 3, 3); c.fill(); }
      c.restore();
    });
    // Nightpaw alone on the floor, ears flat, looking up at the window
    storyCat(c, 660, 672, 1.6, { pose: 'sit', ears: 0.75, eyes: 'open', look: 1, rimCol: '#e8e4ff', seed: 'ecat' });
    motes(c, 110, [520, 120, 1120, 700], '#fff4e0', 'em', 0.9);
    finish(c, { vig: 0.65, tint: '#90a0c0', tintA: 0.1, seed: 'ge' });
  });

  // 5. Looking down into the old well; something glimmers far below. Nightpaw's paws on the rim.
  AJ('sb_well', W, H, (c) => {
    c.fillStyle = '#05050a'; c.fillRect(0, 0, W, H);
    const cx = 640, cy = 330;
    const last = wellShaft(c, cx, cy, 760, 14, 'shaft');
    // moonlight comes over the top-left rim: the right and lower walls sink into shadow
    c.save(); c.globalCompositeOperation = 'multiply';
    const sg = c.createLinearGradient(200, 60, 1100, 700); sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.5, 'rgba(120,115,150,1)'); sg.addColorStop(1, 'rgba(30,28,44,1)');
    c.fillStyle = sg; c.fillRect(0, 0, W, H);
    const rg = c.createRadialGradient(cx, last.y, 40, cx, last.y, 700); rg.addColorStop(0, 'rgba(20,18,30,1)'); rg.addColorStop(0.45, 'rgba(140,136,170,1)'); rg.addColorStop(1, 'rgba(255,255,255,1)');
    c.fillStyle = rg; c.fillRect(0, 0, W, H);
    c.restore();
    // damp streaks and moss down the walls
    const dr = rng('damp');
    c.save(); c.filter = 'blur(3px)';
    for (let i = 0; i < 40; i++) { const a = dr() * Math.PI * 2, rr = 300 + dr() * 400; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.64; c.strokeStyle = dr() < 0.5 ? 'rgba(40,70,50,0.25)' : 'rgba(0,0,0,0.3)'; c.lineWidth = 4 + dr() * 10; c.beginPath(); c.moveTo(x, y); c.lineTo(lerp(x, cx, 0.25), lerp(y, last.y, 0.25)); c.stroke(); }
    c.restore();
    // the glimmer far below: warm, like a candle that shouldn't be there
    c.save(); c.globalCompositeOperation = 'screen';
    glow(c, cx + 6, last.y + 2, 90, CANDLE, 0.4); glow(c, cx + 6, last.y + 2, 16, '#fff4d0', 0.9);
    c.restore();
    shaft(c, [cx - 320, -20, cx + 80], [cx - 40, last.y, cx + 40], MOON, 0.14, 24);
    // roots and the old rope hanging into the dark
    taper(c, [[150, -10], [220, 100], [300, 190], [430, 260], [520, 290]], 20, 4, { base: '#1a1410', light: '#4a3a30', rim: '#8d86b8', rimW: 1.4, seed: 'root1', tex: 0.06 });
    taper(c, [[1150, 40], [1080, 150], [980, 220], [860, 280]], 16, 3, { base: '#1a1410', light: '#4a3a30', rim: '#8d86b8', rimW: 1.4, seed: 'root2', tex: 0.06 });
    taper(c, [[790, -10], [770, 110], [720, 230], [672, last.y - 10]], 5, 2, { base: '#6a5a44', light: '#b09c80', rim: '#d8d0ff', rimW: 1, seed: 'rope', tex: 0.08 });
    motes(c, 60, [300, 60, 980, 540], '#cfd6ff', 'wm', 1);
    fogBand(c, last.y + 30, 80, '#5a5a8a', 0.1, 'wfog', 16, cx - 300, cx + 300);
    // the rim, foreground: a thick lip of stone across the bottom
    const lip = (q) => blobPath(q, [[-60, 660], [320, 628], [640, 620], [960, 628], [1340, 660], [1340, 780], [-60, 780]]);
    paint(c, lip, { base: '#1c1928', light: '#4a4468', dark: '#030206', rim: '#c8c2f0', rimW: 3, lx: 0, ly: -1, bbox: [-60, 620, 1340, 780], seed: 'lip', tex: 0.1 });
    brush(c, lip, [-60, 620, 1340, 780], ['rgba(60,90,60,0.18)', 'rgba(0,0,0,0.3)', 'rgba(160,150,200,0.06)'], 'lipb', 500, 22, 0.1, 5);
    c.save(); lip(c); c.clip(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; for (const x of [180, 420, 700, 950, 1170]) { c.beginPath(); c.moveTo(x, 620); c.lineTo(x + 10, 720); c.stroke(); } c.restore();
    // two black front paws gripping the lip, and the tips of his ears at the bottom edge
    for (const [px, rot] of [[510, -0.22], [780, 0.22]]) {
      c.save(); c.translate(px, 630); c.rotate(rot);
      const leg = (q) => blobPath(q, [[-28, 150], [-26, 40], [-34, 6], [-30, -14], [-14, -24], [0, -26], [14, -24], [30, -14], [34, 6], [26, 40], [28, 150]]);
      c.save(); c.filter = 'blur(6px)'; c.fillStyle = 'rgba(0,0,0,0.5)'; ell(c, 0, -2, 40, 16); c.fill(); c.restore();
      paint(c, leg, { base: '#0e0c14', light: '#221e30', dark: INK, rim: '#6a64a0', rimW: 2, lx: -0.3, ly: -1, bbox: [-34, -26, 34, 150], seed: 'wleg' + px, tex: 0.04 });
      c.strokeStyle = 'rgba(0,0,0,0.8)'; c.lineWidth = 2.6; c.lineCap = 'round'; for (const tx of [-11, 0, 11]) { c.beginPath(); c.moveTo(tx, -24); c.lineTo(tx * 1.1, -10); c.stroke(); }
      c.restore();
    }
    for (const [ex, rot] of [[560, -0.35], [720, 0.35]]) {
      c.save(); c.translate(ex, 760); c.rotate(rot); c.scale(3, 3); c.translate(-9, -26.6);
      paint(c, (q) => blobPath(q, [[2, 27], [5, 9], [9, 0.5], [14, 10], [16, 27], [9, 25]]), { base: FUR, light: FUR_L, rim: '#d8d4ff', rimW: 1.8, bbox: [0, 0, 18, 28], seed: 'wear' + ex, tex: 0.03 });
      c.restore();
    }
    finish(c, { vig: 0.85, tint: '#3a3a7a', tintA: 0.1, seed: 'gw' });
  });

  // Plain page behind title cards ("End of the Hollows").
  // 6. The Fireworks Night (Shade 3): curled up high inside a chimney while the sky bangs overhead.
  AJ('sb_fireworks', W, H, (c) => {
    c.fillStyle = '#07060b'; c.fillRect(0, 0, W, H);
    // the square of night sky at the chimney top, full of colour
    const sx0 = 470, sx1 = 810, sy0 = 0, sy1 = 150;
    vgrad(c, [[0, '#120e2a'], [1, '#2a1f44']], sx0, sy0, sx1, sy1);
    const bursts = [[560, 60, 90, '#ff6a8a'], [720, 40, 70, '#ffd45a'], [650, 120, 60, '#7ae0ff'], [520, 130, 40, '#b890ff']];
    const r = rng('fw');
    c.save(); c.beginPath(); c.rect(sx0, sy0, sx1 - sx0, sy1 - sy0); c.clip();
    for (const [x, y, R, col] of bursts) {
      glow(c, x, y, R * 1.6, col, 0.35);
      c.strokeStyle = col; c.lineCap = 'round';
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + r() * 0.1, l = R * (0.6 + r() * 0.4);
        c.globalAlpha = 0.5 + r() * 0.5; c.lineWidth = 1.5 + r() * 1.5;
        c.beginPath(); c.moveTo(x + Math.cos(a) * l * 0.3, y + Math.sin(a) * l * 0.3); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l + l * 0.1); c.stroke();
        c.fillStyle = '#ffffff'; ell(c, x + Math.cos(a) * l, y + Math.sin(a) * l + l * 0.1, 1.6, 1.6); c.fill();
      }
      c.globalAlpha = 1;
    }
    c.restore();
    // coloured light pouring down the flue
    shaft(c, [sx0 + 20, sy1, sx1 - 20], [300, H, 980], '#ffc0d8', 0.22, 16);
    // the flue walls: brick, converging to the square of sky
    const wallL = (q) => poly(q, [[0, 0], [sx0, 0], [sx0, sy1], [360, H], [0, H]]);
    const wallR = (q) => poly(q, [[W, 0], [sx1, 0], [sx1, sy1], [920, H], [W, H]]);
    stones(c, wallL, [0, 0, sx0 + 10, H], 'fwl', '#3a2a2a', 30);
    stones(c, wallR, [sx1 - 10, 0, W, H], 'fwr', '#3a2a2a', 30);
    // soot, and the coloured flashes on the brick edges
    c.save(); wallL(c); c.clip(); vgrad(c, [[0, 'rgba(0,0,0,0.7)'], [0.5, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0.6)']]); glow(c, 430, 260, 260, '#ff6a8a', 0.18); c.restore();
    c.save(); wallR(c); c.clip(); vgrad(c, [[0, 'rgba(0,0,0,0.7)'], [0.5, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0.6)']]); glow(c, 860, 220, 260, '#ffd45a', 0.16); c.restore();
    // the back of the flue, dark and warm, and the sooty ledge he's curled on
    vgrad(c, [[0, '#1a1418'], [1, '#2a1a16']], 360, sy1, 920, H);
    c.save(); c.beginPath(); c.moveTo(sx0, sy1); c.lineTo(sx1, sy1); c.lineTo(920, H); c.lineTo(360, H); c.closePath(); c.clip();
    stones(c, (q) => { q.beginPath(); q.rect(300, sy1, 700, H); }, [300, sy1, 1000, H], 'fwb', '#241a1a', 22);
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(300, sy1, 700, H);
    shaft(c, [sx0 + 30, sy1, sx1 - 30], [380, H, 900], '#ffd6e8', 0.16, 12);
    c.restore();
    const lp = (q) => poly(q, [[420, 540], [860, 540], [880, 572], [400, 572]]);
    paint(c, lp, { base: '#2a2024', light: '#6a5058', dark: '#08060a', rim: '#ffb0c8', rimW: 1.6, bbox: [400, 540, 880, 572], seed: 'fwledge', tex: 0.08 });
    // an ember glow far below, the fire that's been put out
    glow(c, 640, H + 40, 320, '#ff7a3a', 0.22);
    // Nightpaw curled in a loaf, ears back, eyes half shut, the colours on his fur
    storyCat(c, 650, 542, 2.1, { pose: 'loaf', ears: 0.8, eyes: 'half', look: -0.4, rimCol: '#ffc0d8', seed: 'fwcat' });
    glow(c, 650, 420, 220, '#ff9ab8', 0.1);
    // sparks drifting down the flue
    motes(c, 90, [380, 150, 900, 600], '#ffd9a0', 'fwm', 1.1);
    motes(c, 40, [440, 150, 840, 500], '#ff9ad0', 'fwm2', 0.9);
    finish(c, { vig: 0.7, tint: '#c090b0', tintA: 0.12, seed: 'gfw' });
  });

  AJ('sb_card_bg', W, H, (c) => {
    c.fillStyle = '#07060b'; c.fillRect(0, 0, W, H);
    glow(c, 640, 360, 560, '#2a2440', 0.55);
    fogBand(c, 520, 160, '#6a6a9a', 0.1, 'cf', 30);
    motes(c, 60, [0, 0, W, H], '#cfd6ff', 'cm', 0.8);
    finish(c, { vig: 0.8, seed: 'gc' });
  });

  // ---------------------------------------------------------------- title screen (3 parallax layers)
  // title_sky: sky, moon, clouds · title_far: hills, the house on the hill, trees ·
  // title_near: the well and the garden, with a transparent sky so the layers stack.
  // TitleScene puts the live gameplay Nightpaw puppet on the well's rim (WELL_RIM below).
  AJ('title_sky', W, H, (c) => {
    vgrad(c, [[0, '#05060e'], [0.5, '#12132a'], [1, '#262640']]);
    const r = rng('stars');
    for (let i = 0; i < 160; i++) { const y = Math.pow(r(), 1.6) * 460; glow(c, r() * W, y, 1 + r() * 2.2, '#e6ecff', 0.2 + r() * 0.6); }
    moon(c, 900, 170, 62, 0);
    clouds(c, 'skc', 330, '#2a2a48', 0.7, 7, MOON);
    clouds(c, 'skc2', 60, '#1a1a34', 0.5, 4);
    shaft(c, [860, 180, 960], [700, H, 1180], MOON, 0.08, 20);
  });
  A('title_far', W, H, (c) => {
    // far ridge, soft in the mist
    mass(c, [[-60, 500], [200, 452], [480, 474], [760, 440], [1040, 466], [1340, 446], [1340, 760], [-60, 760]], '#1a1a30', 5);
    fogBand(c, 480, 80, '#7a7aaa', 0.14, 'tfar1');
    // the near hill the house stands on: its crest runs under the house, then rolls down into the garden
    const hill = (q) => blobPath(q, [[-80, 600], [120, 540], [330, 496], [500, 470], [640, 464], [780, 476], [980, 520], [1200, 560], [1360, 590], [1360, 760], [-80, 760]]);
    paint(c, hill, { base: '#12111f', light: '#26243c', dark: '#06050c', rim: '#9a94c8', rimW: 2.4, lx: 0.3, ly: -1, bbox: [-80, 464, 1360, 760], seed: 'thill', tex: 0.05 });
    grassTufts(c, 360, 900, 474, 'rgba(150,146,196,0.35)', 'thg', 90, 10, 1.1);
    // bare trees on the hill
    const tree = (x, y, s, seed) => {
      const r = rng(seed); c.strokeStyle = '#0e0d1c'; c.lineCap = 'round';
      const branch = (bx, by, ang, len, w, d) => {
        const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
        c.lineWidth = w; c.beginPath(); c.moveTo(bx, by); c.quadraticCurveTo((bx + ex) / 2 + (r() - 0.5) * len * 0.3, (by + ey) / 2, ex, ey); c.stroke();
        if (d > 0) for (let k = 0; k < 2 + (r() < 0.4); k++) branch(ex, ey, ang + (r() - 0.5) * 1.1, len * (0.6 + r() * 0.2), w * 0.62, d - 1);
      };
      branch(x, y, -Math.PI / 2 + (r() - 0.5) * 0.2, 70 * s, 9 * s, 5);
    };
    tree(150, 548, 1.1, 'tr1'); tree(1190, 566, 1.2, 'tr2'); tree(1010, 530, 0.7, 'tr3');
    // Mira's house on the hill: one warm window
    const hx = 560, hy = 368;
    const house = (q) => poly(q, [[hx, 470], [hx, hy + 30], [hx + 60, hy - 16], [hx + 120, hy + 30], [hx + 120, 470]]);
    paint(c, house, { base: '#12111f', light: '#2a2844', dark: '#06050c', rim: '#8d86b8', rimW: 1.6, bbox: [hx, hy - 16, hx + 120, 470], seed: 'th', tex: 0.05 });
    c.fillStyle = '#12111f'; c.fillRect(hx + 84, hy - 8, 10, 30);
    glow(c, hx + 60, hy + 62, 80, CANDLE, 0.35);
    paint(c, (q) => { q.beginPath(); q.rect(hx + 48, hy + 46, 24, 32); }, { base: '#ffcf7a', light: '#fff4d0', dark: '#c07a30', bbox: [hx + 48, hy + 46, hx + 72, hy + 78], seed: 'tw', tex: 0.04 });
    c.fillStyle = '#12111f'; c.fillRect(hx + 59, hy + 46, 2, 32); c.fillRect(hx + 48, hy + 61, 24, 2);
    c.fillStyle = '#07060c'; c.fillRect(hx + 18, hy + 78, 16, 24); // door
    c.save(); c.globalCompositeOperation = 'screen'; c.filter = 'blur(2px)';
    c.strokeStyle = 'rgba(150,146,196,0.22)'; c.lineWidth = 7; c.lineCap = 'round';
    c.beginPath(); c.moveTo(hx + 26, hy + 104); c.bezierCurveTo(hx + 10, 520, hx + 120, 540, hx + 260, 600); c.stroke(); c.restore();
    c.strokeStyle = '#0a0914'; c.lineWidth = 2.5;
    for (let i = 0; i < 9; i++) { const fx = hx - 150 + i * 16, fy = 486 + i * -1.5; c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy - 12); c.stroke(); }
    c.beginPath(); c.moveTo(hx - 152, 480); c.lineTo(hx - 20, 468); c.stroke();
    fogBand(c, 560, 70, '#6a6a9a', 0.16, 'tfar2');
  });
  A('title_near', W, H, (c) => {
    // the garden: dark ground, pale grass catching the moon
    const ground = (q) => blobPath(q, [[-60, 600], [300, 580], [640, 590], [1000, 570], [1340, 590], [1340, 760], [-60, 760]]);
    paint(c, ground, { base: '#0b0a14', light: '#1e1c30', dark: '#030206', rim: '#8d86b8', rimW: 2, bbox: [-60, 570, 1340, 760], seed: 'tg', tex: 0.06 });
    grassTufts(c, -20, W + 20, 598, 'rgba(150,146,196,0.45)', 'tg1', 220, 18, 1.4);
    grassTufts(c, -20, W + 20, 604, '#07060c', 'tg2', 300, 26, 2);
    // the well
    const wx = 900, top = 486, bot = 620;
    const body = (q) => blobPath(q, [[wx - 124, bot], [wx - 128, top + 10], [wx, top - 6], [wx + 128, top + 10], [wx + 124, bot], [wx, bot + 16]]);
    stones(c, body, [wx - 130, top - 10, wx + 130, bot + 18], 'tws', '#2a2638', 30);
    c.save(); body(c); c.clip(); const sg = c.createLinearGradient(wx - 130, 0, wx + 130, 0); sg.addColorStop(0, 'rgba(160,160,230,0.12)'); sg.addColorStop(0.5, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.45)'); c.fillStyle = sg; c.fillRect(wx - 130, top - 10, 260, 150); c.restore();
    // the rim and the dark mouth, with the warm glimmer rising out of it
    paint(c, (q) => ell(q, wx, top + 4, 132, 24), { base: '#2e2a40', light: '#6a6490', dark: '#0a0910', rim: '#c8c2f0', rimW: 2.5, bbox: [wx - 132, top - 20, wx + 132, top + 28], seed: 'trim', tex: 0.08 });
    c.fillStyle = '#020104'; ell(c, wx, top + 4, 112, 15); c.fill();
    c.save(); c.globalCompositeOperation = 'screen'; glow(c, wx, top + 2, 150, CANDLE, 0.22); c.restore();
    // posts, beam, winch and the rope
    const post = (px) => paint(c, (q) => blobPath(q, [[px - 7, top + 6], [px - 6, top - 170], [px + 6, top - 172], [px + 7, top + 6]]), { base: '#1c1412', light: '#4a3a32', dark: '#060404', rim: '#a8a0d0', rimW: 1.6, bbox: [px - 8, top - 172, px + 8, top + 6], seed: 'post' + px, tex: 0.06 });
    post(wx - 112); post(wx + 112);
    paint(c, (q) => blobPath(q, [[wx - 134, top - 168], [wx, top - 180], [wx + 134, top - 168], [wx + 134, top - 156], [wx - 134, top - 156]]), { base: '#1c1412', light: '#4a3a32', rim: '#a8a0d0', rimW: 1.6, bbox: [wx - 134, top - 180, wx + 134, top - 156], seed: 'beam', tex: 0.06 });
    poly(c, [[wx - 150, top - 170], [wx, top - 232], [wx + 150, top - 170]]); c.fillStyle = '#0d0a10'; c.fill();
    paint(c, (q) => poly(q, [[wx - 150, top - 170], [wx, top - 232], [wx + 150, top - 170], [wx + 136, top - 164], [wx, top - 220], [wx - 136, top - 164]]), { base: '#1a1418', light: '#40343a', rim: '#b8b0e0', rimW: 1.6, bbox: [wx - 150, top - 232, wx + 150, top - 164], seed: 'roof', tex: 0.06 });
    c.strokeStyle = '#7a6a54'; c.lineWidth = 2; c.beginPath(); c.moveTo(wx - 20, top - 160); c.lineTo(wx - 20, top - 70); c.stroke();
    paint(c, (q) => blobPath(q, [[wx - 34, top - 72], [wx - 6, top - 72], [wx - 8, top - 44], [wx - 32, top - 44]]), { base: '#2a2018', light: '#5a4a38', rim: '#c8c0e8', rimW: 1.2, bbox: [wx - 34, top - 72, wx - 6, top - 44], seed: 'bucket', tex: 0.06 });
    // foreground: dark ferns and a fence post, soft
    c.save(); c.filter = 'blur(3px)';
    for (const [x, s] of [[40, 1.4], [1220, 1.6], [640, 0.9]]) {
      const r = rng('fern' + x); c.strokeStyle = '#030206'; c.lineCap = 'round';
      for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.32; c.lineWidth = 8 * s; c.beginPath(); c.moveTo(x, H); c.quadraticCurveTo(x + Math.cos(a) * 60 * s, H - 80 * s, x + Math.cos(a) * (110 + r() * 40) * s, H + Math.sin(a) * (120 + r() * 40) * s); c.stroke(); }
    }
    c.restore();
  });
  // Where the well's rim is on title_near (screen px), for placing the puppet.
  window.__S = { W, H, AJ, part, vgrad, mass, shaft, fogBand, motes, rainHaze, brush, finish, taper, storyCat, boards, stones, moon, clouds };
  window.__TITLE = { rimX: 900, rimY: 486 };
})();

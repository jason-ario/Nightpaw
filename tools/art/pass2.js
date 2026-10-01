/* Nightpaw art: pass 2 (2.2.0). Loaded last; repaints existing keys in place (same names, and the
 * same sizes wherever a rig depends on them) with more careful painting:
 *   - a dark ink contour on every prop and creature, so silhouettes read on dark backgrounds
 *   - form shading in three tones (light / core shadow / cool bounce light from below) + a rim
 *   - material detail drawn for the size it is shown at (knit, dimpled metal, horn, glass, bark)
 * Also adds new parts: Nightpaw's whiskers (on his face, not the scarf) and an animated claw strip.
 */
(function () {
  'use strict';
  const P = window.__P;
  const { rng, lerp, hexA, mix, ell, poly, blobPath, glow, C } = P;
  const { INK, FUR, FUR_L, RIM, EYE } = C;

  // Replace an existing asset (keeps its place in the list), or add a new one.
  function R(key, w, h, draw, extra = {}) {
    const a = { key, w: Math.ceil(w), h: Math.ceil(h), draw, ...extra };
    const i = P.assets.findIndex((x) => x.key === key);
    if (i >= 0) P.assets[i] = a; else P.assets.push(a);
  }

  // ------------------------------------------------------------------ painting toolkit
  const clipTo = (c, path, fn) => { c.save(); path(c); c.clip(); fn(); c.restore(); };
  /** A sculpted form: base, light from the upper left, core shadow, cool bounce from below,
   *  soft rim, texture callback, ink contour. */
  function form(c, path, [x0, y0, x1, y1], o) {
    const { base, light = mix(base, '#ffffff', 0.35), shadow = mix(base, '#05040a', 0.6), bounce = '#6a6aa8', rim = null, outline = INK, ow = 1.6,
      lx = -0.45, ly = -0.6, tex = null, seed = 'f', spec = 0, bounceA = 0.35 } = o;
    const w = x1 - x0, h = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.max(w, h);
    c.save();
    path(c); c.fillStyle = base; c.fill();
    clipTo(c, path, () => {
      // core shadow: a broad gradient away from the light
      const g = c.createLinearGradient(cx + lx * w * 0.5, cy + ly * h * 0.5, cx - lx * w * 0.55, cy - ly * h * 0.55);
      g.addColorStop(0, hexA(shadow, 0)); g.addColorStop(0.55, hexA(shadow, 0.25)); g.addColorStop(1, hexA(shadow, 0.85));
      c.fillStyle = g; c.fillRect(x0 - 4, y0 - 4, w + 8, h + 8);
      // light
      const lg = c.createRadialGradient(cx + lx * w * 0.32, cy + ly * h * 0.32, 0, cx + lx * w * 0.32, cy + ly * h * 0.32, R * 0.7);
      lg.addColorStop(0, hexA(light, 0.75)); lg.addColorStop(0.5, hexA(light, 0.22)); lg.addColorStop(1, hexA(light, 0));
      c.fillStyle = lg; c.fillRect(x0 - 4, y0 - 4, w + 8, h + 8);
      // bounce light along the bottom edge
      if (bounce) { const bg = c.createLinearGradient(0, y1, 0, y1 - h * 0.35); bg.addColorStop(0, hexA(bounce, bounceA)); bg.addColorStop(1, hexA(bounce, 0)); c.fillStyle = bg; c.fillRect(x0 - 4, y1 - h * 0.4, w + 8, h * 0.4 + 4); }
      if (tex) tex(c, rng(seed));
      if (spec) { c.fillStyle = `rgba(255,255,255,${spec})`; ell(c, cx + lx * w * 0.28, cy + ly * h * 0.3, w * 0.09, h * 0.06, -0.5); c.fill(); }
      if (rim) { c.filter = 'blur(1px)'; c.lineWidth = 2.6; c.strokeStyle = hexA(rim, 0.85); c.translate(-lx * 1.6, -ly * 1.6); path(c); c.stroke(); c.filter = 'none'; }
    });
    if (outline) { c.lineJoin = 'round'; c.lineWidth = ow; c.strokeStyle = outline; path(c); c.stroke(); }
    c.restore();
  }
  /** Fine grain noise inside the current clip. */
  function grain(c, r, [x0, y0, x1, y1], n, a = 0.08) {
    for (let i = 0; i < n; i++) { c.fillStyle = r() < 0.5 ? `rgba(255,255,255,${a * r()})` : `rgba(0,0,0,${a * 1.5 * r()})`; c.fillRect(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 1 + r(), 1 + r()); }
  }
  /** Tapered stroke (for legs, roots, threads, whiskers). */
  function taperLine(c, pts, w0, w1, col) {
    const L = [], Rr = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const w = lerp(w0, w1, i / (pts.length - 1)) / 2;
      L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); Rr.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
    }
    c.fillStyle = col; poly(c, [...L, ...Rr.reverse()]); c.fill();
  }
  /** Sample a quadratic/cubic-ish curve through control points into a polyline. */
  function curve(pts, n = 16) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n; let p = pts.map((q) => q.slice());
      while (p.length > 1) p = p.slice(1).map((q, k) => [lerp(p[k][0], q[0], t), lerp(p[k][1], q[1], t)]);
      out.push(p[0]);
    }
    return out;
  }
  const outline = (c, path, w = 1.6, col = INK) => { c.lineJoin = 'round'; c.lineWidth = w; c.strokeStyle = col; path(c); c.stroke(); };

  window.__P2 = { R, form, grain, taperLine, curve, clipTo, outline };

  // ====================================================================
  // NIGHTPAW: whiskers grow from his cheeks above the scarf; scarf without whiskers
  // ====================================================================
  const SCARF = '#b3142c', SCARF_L = '#ff5a68', SCARF_D = '#4a0612';
  R('np_mask', 64, 26, (c) => {
    const path = (q) => blobPath(q, [[10, 6], [24, 3], [40, 3], [54, 6], [55, 19], [40, 23], [24, 23], [9, 19]]);
    P.paint(c, path, { base: SCARF, light: SCARF_L, dark: SCARF_D, rim: '#ff9aa4', rimW: 1.5, bbox: [8, 2, 56, 24], seed: 'mask2', tex: 0.05 });
    c.save(); path(c); c.clip();
    // knit ribs and a fold where it tucks under his cheeks
    c.strokeStyle = 'rgba(60,0,12,0.5)'; c.lineWidth = 1.3;
    for (let x = 16; x < 52; x += 7) { c.beginPath(); c.moveTo(x, 3); c.quadraticCurveTo(x + 3, 13, x - 1, 23); c.stroke(); }
    c.fillStyle = 'rgba(30,0,6,0.35)'; c.fillRect(8, 2, 48, 3);
    c.restore();
  });
  // Whiskers: three a side, rooted on the cheeks (drawn over the head, under the scarf's top edge).
  R('np_whiskers', 80, 22, (c) => {
    c.lineCap = 'round';
    const side = (s) => {
      for (const [dy, len, bend] of [[-3, 1, -5], [0, 1.08, 0], [3, 0.95, 5]]) {
        const x0 = 40 + s * 15, y0 = 12 + dy * 0.4;
        const pts = curve([[x0, y0], [x0 + s * 13 * len, y0 + dy * 0.6 - 2], [x0 + s * 25 * len, y0 + dy + bend * 0.8]], 10);
        c.globalAlpha = 0.45; taperLine(c, pts, 1.8, 0.4, '#05040a');
        c.globalAlpha = 0.95; taperLine(c, pts.map(([x, y]) => [x, y - 0.4]), 1.1, 0.25, '#ece8ff');
      }
      c.globalAlpha = 1;
      // whisker pads: three tiny dots on the cheek
      c.fillStyle = 'rgba(60,54,90,0.9)'; for (const dy of [-1.5, 0.5, 2.5]) { ell(c, 40 + s * 14, 12 + dy, 0.8, 0.8); c.fill(); }
    };
    side(-1); side(1);
  });

  // ====================================================================
  // CLAW SLASH: an animated strip (6 frames of 128x96, left → right)
  //   0 wind-up glint · 1 marks tearing open · 2 full bright · 3 glow bloom · 4 fading · 5 motes
  // ====================================================================
  const CLAW_FRAMES = 6, CW = 128, CH = 96;
  function crescent(c, x0, y0, x1, y1, bulge, width, head = 0, tail = 1) {
    // a tapered claw mark from (x0,y0) to (x1,y1), bulging by `bulge`; drawn only between head..tail (0..1)
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2 + bulge;
    const pts = curve([[x0, y0], [mx, my], [x1, y1]], 24).filter((_, i) => i / 24 >= head && i / 24 <= tail);
    if (pts.length < 2) return;
    const n = pts.length;
    const L = [], Rr = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
      const t = (head + (tail - head) * (i / (n - 1)));
      const w = width * Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** 0.7 / 2;
      L.push([p[0] - dy * w, p[1] + dx * w]); Rr.push([p[0] + dy * w, p[1] - dx * w]);
    });
    poly(c, [...L, ...Rr.reverse()]); c.fill();
  }
  function clawFrame(c, f) {
    const marks = [[16, 30, 118, 10, 26], [10, 52, 122, 34, 30], [16, 74, 114, 60, 26]];
    const prog = [0.25, 0.7, 1, 1, 1, 1][f], fade = [1, 1, 1, 0.8, 0.45, 0.15][f], bloom = [0.2, 0.6, 1, 1.25, 0.8, 0.3][f];
    const start = f >= 3 ? (f - 2) * 0.22 : 0; // the tail end peels away first
    // bloom
    c.save(); c.filter = `blur(${4 + bloom * 3}px)`;
    c.fillStyle = `rgba(255,90,120,${0.5 * fade})`;
    for (const [x0, y0, x1, y1, b] of marks) crescent(c, x0, y0, x1, y1, b, 14 * bloom + 4, start, prog);
    c.restore();
    // hot core: white with a pink edge
    for (const [x0, y0, x1, y1, b] of marks) {
      c.fillStyle = `rgba(255,150,170,${0.9 * fade})`; crescent(c, x0, y0, x1, y1, b, 7, start, prog);
      c.fillStyle = `rgba(255,255,255,${fade})`; crescent(c, x0, y0 - 0.5, x1, y1 - 0.5, b, 3.4, start, prog);
    }
    // leading sparkle where the claws are
    if (f <= 2) { const r = rng('cs' + f); for (const [x0, y0, x1, y1, b] of marks) { const t = prog; const x = lerp(x0, x1, t), y = lerp(y0, y1, t) + b * 4 * t * (1 - t); glow(c, x, y, 8, '#ffffff', 0.9); c.fillStyle = '#fff'; ell(c, x + (r() - 0.5) * 2, y, 1.6, 1.6); c.fill(); } }
    // dissolving motes
    if (f >= 3) { const r = rng('cm'); for (let i = 0; i < 26; i++) { const t = r(), m = marks[i % 3]; const x = lerp(m[0], m[2], t) + (f - 2) * 4 * (r() - 0.3), y = lerp(m[1], m[3], t) + m[4] * 4 * t * (1 - t) - (f - 2) * 3 * r(); c.fillStyle = `rgba(255,${200 + r() * 55},${220 + r() * 35},${fade * (0.5 + r() * 0.5)})`; ell(c, x, y, 0.8 + r(), 0.8 + r()); c.fill(); } }
  }
  R('fx_claw', CW * CLAW_FRAMES, CH, (c) => {
    for (let f = 0; f < CLAW_FRAMES; f++) { c.save(); c.beginPath(); c.rect(f * CW, 0, CW, CH); c.clip(); c.translate(f * CW, 0); clawFrame(c, f); c.restore(); }
  }, { frames: CLAW_FRAMES });

  // ====================================================================
  // ENEMIES
  // ====================================================================
  // ---- Thimble Mite: a dented pewter thimble worn as a shell; something with amber eyes inside.
  R('mite_shell', 64, 48, (c) => {
    const path = (q) => { q.beginPath(); q.moveTo(9, 43); q.bezierCurveTo(9, 22, 12, 6, 32, 5); q.bezierCurveTo(52, 6, 55, 22, 55, 43); q.closePath(); };
    form(c, path, [9, 5, 55, 43], { base: '#8a8ea0', light: '#eef0ff', shadow: '#1c1d2a', bounce: '#7a7ac8', rim: '#ffffff', ow: 1.8, seed: 'th2',
      tex: (c, r) => {
        // dimples: rows that curve with the dome, darker on their lit side, catching light on the far rim
        for (let row = 0; row < 7; row++) {
          const y = 11 + row * 4.6, half = 13 + row * 1.8 + (row > 4 ? 2 : 0);
          for (let k = -6; k <= 6; k++) {
            const x = 32 + (k + (row % 2) * 0.5) * (half / 6.4);
            if (Math.abs(x - 32) > half) continue;
            const edge = Math.abs(x - 32) / half, rad = 1.25 * (1 - edge * 0.45);
            c.fillStyle = `rgba(16,16,28,${0.55 - edge * 0.25})`; ell(c, x, y, rad, rad * 0.85); c.fill();
            c.fillStyle = `rgba(255,255,255,${0.35 - edge * 0.2})`; ell(c, x + 0.5, y + 0.6, rad * 0.55, rad * 0.35); c.fill();
          }
        }
        // a dent and two scratches
        c.fillStyle = 'rgba(10,10,20,0.35)'; ell(c, 41, 24, 5, 3.5, 0.4); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.35)'; ell(c, 39, 22.5, 3, 1.2, 0.4); c.fill();
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(20, 14); c.lineTo(27, 22); c.moveTo(16, 30); c.lineTo(20, 33); c.stroke();
        grain(c, r, [9, 5, 55, 43], 260, 0.06);
      } });
    // rolled rim band at the opening
    const band = (q) => { q.beginPath(); q.moveTo(7, 38); q.quadraticCurveTo(32, 35, 57, 38); q.lineTo(57, 44); q.quadraticCurveTo(32, 47, 7, 44); q.closePath(); };
    form(c, band, [7, 35, 57, 47], { base: '#9a9eb0', light: '#ffffff', shadow: '#262838', bounce: null, ow: 1.6, seed: 'thb', lx: -0.2, ly: -0.9 });
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(12, 38.6, 30, 0.9);
  });
  R('mite_face', 40, 20, (c) => {
    // the creature inside: a dark head under the rim, two lamp eyes, tiny mandibles
    const head = (q) => ell(q, 20, 10, 17, 8.5);
    form(c, head, [3, 1.5, 37, 18.5], { base: '#1c1622', light: '#4a3e5a', shadow: '#050308', bounce: '#5a3a6a', ow: 1.2, seed: 'mf' });
    for (const x of [13, 26]) { glow(c, x, 9, 7, '#ff9a3a', 0.55); c.fillStyle = '#ffcf7a'; ell(c, x, 9, 2.8, 2.4); c.fill(); c.fillStyle = '#2a1000'; ell(c, x + 0.6, 9, 0.9, 1.9); c.fill(); c.fillStyle = '#fff'; ell(c, x - 0.8, 8, 0.7, 0.7); c.fill(); }
    c.strokeStyle = '#d8c8a0'; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(33, 13); c.quadraticCurveTo(38, 14, 37, 18); c.moveTo(31, 15); c.quadraticCurveTo(34, 18, 32, 19.5); c.stroke();
  });
  R('mite_leg', 10, 20, (c) => {
    // jointed: femur, knee, tibia with a tiny claw
    const pts = [[5, 1], [7.5, 8], [5.5, 13], [3, 19]];
    taperLine(c, curve([pts[0], pts[1]], 6), 3.6, 2.6, INK);
    taperLine(c, curve([pts[1], pts[2], pts[3]], 8), 2.6, 1, INK);
    c.fillStyle = '#4a4058'; ell(c, 7.5, 8, 1.6, 1.6); c.fill();
    c.strokeStyle = 'rgba(160,150,200,0.5)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(4.6, 2); c.lineTo(6.6, 8); c.stroke();
  });

  // ---- Sock Wisp: a lost wool sock drifting like a jellyfish, two cold eyes in its dark opening.
  const WOOL = '#d6cbbd', WOOL_L = '#fffaf0', WOOL_D = '#5a4a58', STRIPE = '#b85a6a';
  const knit = (c, x0, y0, x1, y1, a = 0.28) => {
    // rows of little V stitches
    c.lineWidth = 0.8; c.strokeStyle = `rgba(70,50,60,${a})`;
    for (let y = y0; y < y1; y += 3.2) for (let x = x0 + ((y / 3.2) % 2) * 1.6; x < x1; x += 3.2) { c.beginPath(); c.moveTo(x - 1.2, y - 1); c.lineTo(x, y + 0.8); c.lineTo(x + 1.2, y - 1); c.stroke(); }
  };
  R('sock_cuff', 38, 26, (c) => {
    // a ribbed cuff seen slightly from above: the opening is a dark oval at the top
    const body = (q) => { q.beginPath(); q.moveTo(4, 8); q.lineTo(5, 25); q.quadraticCurveTo(19, 27, 33, 25); q.lineTo(34, 8); q.closePath(); };
    form(c, body, [4, 4, 34, 26], { base: WOOL, light: WOOL_L, shadow: WOOL_D, bounce: '#7aa0d8', rim: '#cfe8ff', ow: 1.5, seed: 'scf', lx: -0.5, ly: -0.3,
      tex: (c) => { c.strokeStyle = 'rgba(80,60,70,0.4)'; c.lineWidth = 1.1; for (let x = 7; x < 33; x += 3) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x + 0.3, 25); c.stroke(); } c.fillStyle = hexA(STRIPE, 0.85); c.fillRect(0, 17, 40, 3.5); } });
    // the opening
    const rimP = (q) => ell(q, 19, 8, 15, 5);
    form(c, rimP, [4, 3, 34, 13], { base: WOOL, light: WOOL_L, shadow: WOOL_D, bounce: null, ow: 1.5, seed: 'scr' });
    c.fillStyle = '#07060c'; ell(c, 19, 8.5, 12, 3.4); c.fill();
    const g = c.createRadialGradient(19, 9, 1, 19, 9, 12); g.addColorStop(0, 'rgba(120,180,255,0.35)'); g.addColorStop(1, 'rgba(120,180,255,0)'); c.fillStyle = g; ell(c, 19, 8.5, 12, 3.4); c.fill();
  });
  R('sock_eyes', 28, 14, (c) => {
    for (const x of [9, 19]) { glow(c, x, 7, 7, '#9ad8ff', 0.75); c.fillStyle = '#e8f8ff'; ell(c, x, 7, 1.8, 2.4); c.fill(); c.fillStyle = 'rgba(255,255,255,1)'; ell(c, x - 0.4, 6.2, 0.6, 0.7); c.fill(); }
  });
  R('sock_mid', 34, 30, (c) => {
    // the leg of the sock: knit tube with two stripes, a hole worn through
    const body = (q) => { q.beginPath(); q.moveTo(4, 0); q.lineTo(30, 0); q.bezierCurveTo(31, 12, 30, 22, 28, 29); q.quadraticCurveTo(17, 31, 6, 29); q.bezierCurveTo(4, 22, 3, 12, 4, 0); q.closePath(); };
    form(c, body, [3, 0, 31, 30], { base: WOOL, light: WOOL_L, shadow: WOOL_D, bounce: '#7aa0d8', rim: '#cfe8ff', ow: 1.5, seed: 'smd', lx: -0.5, ly: -0.2,
      tex: (c) => { knit(c, 3, 2, 31, 30); c.fillStyle = hexA(STRIPE, 0.85); c.fillRect(0, 8, 34, 3.4); c.fillRect(0, 15, 34, 3.4); c.fillStyle = 'rgba(40,20,30,0.3)'; c.fillRect(0, 11, 34, 0.8); c.fillRect(0, 18, 34, 0.8);
        c.fillStyle = '#0a0810'; ell(c, 22, 24, 2.4, 1.8); c.fill(); c.strokeStyle = 'rgba(255,250,240,0.7)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(20, 23); c.lineTo(19, 21); c.moveTo(24, 23.5); c.lineTo(25.5, 22); c.stroke(); } });
  });
  R('sock_foot', 44, 30, (c) => {
    // heel curve into the foot, a darned patch, a loose thread trailing from the toe
    const body = (q) => { q.beginPath(); q.moveTo(3, 1); q.lineTo(26, 1); q.bezierCurveTo(30, 6, 36, 8, 41, 13); q.bezierCurveTo(44, 18, 41, 25, 34, 25); q.lineTo(12, 26); q.bezierCurveTo(4, 26, 2, 18, 3, 1); q.closePath(); };
    form(c, body, [2, 1, 44, 27], { base: WOOL, light: WOOL_L, shadow: WOOL_D, bounce: '#7aa0d8', rim: '#cfe8ff', ow: 1.5, seed: 'sft', lx: -0.4, ly: -0.5,
      tex: (c) => { knit(c, 2, 2, 44, 27); c.fillStyle = hexA(STRIPE, 0.75); ell(c, 39, 18, 7, 9); c.fill(); /* toe */
        c.fillStyle = 'rgba(120,140,170,0.75)'; ell(c, 13, 16, 6, 5.5); c.fill(); c.strokeStyle = 'rgba(40,40,70,0.7)'; c.lineWidth = 0.7; for (let i = -4; i <= 4; i += 2) { c.beginPath(); c.moveTo(8, 16 + i); c.lineTo(18, 16 + i); c.moveTo(13 + i, 11); c.lineTo(13 + i, 21); c.stroke(); } } });
    c.strokeStyle = 'rgba(214,203,189,0.85)'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(37, 25); c.bezierCurveTo(36, 28, 40, 28, 38, 30); c.stroke();
  });

  // ---- Button Snail: a four-hole horn button for a shell, still threaded.
  R('snail_shell', 56, 56, (c) => {
    const disk = (q) => ell(q, 28, 28, 25, 25);
    form(c, disk, [3, 3, 53, 53], { base: '#8a5236', light: '#f2b88a', shadow: '#2a1008', bounce: '#7a5a9a', rim: '#ffd8b8', ow: 2, seed: 'btn2',
      tex: (c, r) => { // horn grain: soft concentric bands
        for (let k = 0; k < 9; k++) { c.strokeStyle = `rgba(${k % 2 ? '40,16,8' : '255,210,170'},0.12)`; c.lineWidth = 1.5; ell(c, 28 + r() * 2, 28 + r() * 2, 6 + k * 2.4, 6 + k * 2.4); c.stroke(); }
        grain(c, r, [3, 3, 53, 53], 300, 0.05);
      } });
    // raised rim and sunken centre
    c.strokeStyle = 'rgba(30,10,4,0.65)'; c.lineWidth = 2.2; ell(c, 28, 28.6, 18, 18); c.stroke();
    c.strokeStyle = 'rgba(255,220,190,0.45)'; c.lineWidth = 1; ell(c, 28, 27.4, 18.5, 18.5); c.stroke();
    const holes = [[22, 22], [34, 22], [22, 34], [34, 34]];
    // thread through the holes (an X), frayed
    c.lineCap = 'round'; c.strokeStyle = '#d8d0e8'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(22, 22); c.lineTo(34, 34); c.moveTo(34, 22); c.lineTo(22, 34); c.stroke();
    c.strokeStyle = 'rgba(80,70,110,0.6)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(23, 24); c.lineTo(32, 33); c.stroke();
    for (const [x, y] of holes) { c.fillStyle = '#140804'; ell(c, x, y, 3, 3); c.fill(); c.fillStyle = 'rgba(255,210,170,0.45)'; ell(c, x + 0.4, y + 1.6, 2, 0.9); c.fill(); }
    c.strokeStyle = '#d8d0e8'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(34, 34); c.bezierCurveTo(38, 40, 36, 44, 40, 47); c.stroke();
  });
  R('snail_body', 64, 28, (c) => {
    // a soft translucent foot, head raised at the front, a glistening edge
    const body = (q) => { q.beginPath(); q.moveTo(2, 25); q.bezierCurveTo(4, 17, 14, 13, 30, 13); q.bezierCurveTo(42, 13, 48, 12, 52, 6); q.bezierCurveTo(56, 1, 63, 4, 62, 12); q.bezierCurveTo(61, 18, 60, 23, 56, 25); q.closePath(); };
    form(c, body, [2, 2, 63, 26], { base: '#5a4e6a', light: '#c8bce8', shadow: '#1a1424', bounce: '#9ad0ff', bounceA: 0.5, rim: '#e8e0ff', ow: 1.6, seed: 'slg2',
      tex: (c, r) => { for (let i = 0; i < 14; i++) { c.strokeStyle = 'rgba(30,20,40,0.25)'; c.lineWidth = 0.8; const x = 6 + i * 3.8; c.beginPath(); c.moveTo(x, 25); c.quadraticCurveTo(x + 1.5, 21, x + 0.5, 17); c.stroke(); } grain(c, r, [2, 2, 63, 26], 120, 0.06); } });
    c.fillStyle = 'rgba(255,255,255,0.55)'; ell(c, 57, 7, 2.6, 1.3, -0.5); c.fill();
    // slime sheen along the sole
    const g = c.createLinearGradient(2, 0, 60, 0); g.addColorStop(0, 'rgba(190,234,255,0)'); g.addColorStop(0.5, 'rgba(190,234,255,0.6)'); g.addColorStop(1, 'rgba(190,234,255,0.2)');
    c.fillStyle = g; c.fillRect(4, 24.5, 54, 1.6);
    c.fillStyle = '#0a0810'; ell(c, 60.5, 13, 1, 0.8); c.fill(); // mouth
  });
  R('snail_stalk', 8, 22, (c) => {
    taperLine(c, curve([[4, 21], [2, 13], [4, 5]], 8), 3.2, 2, '#5a4e6a');
    taperLine(c, curve([[3.4, 20], [1.6, 13], [3.4, 6]], 8), 0.9, 0.5, 'rgba(220,210,255,0.5)');
    glow(c, 4, 4, 4, '#ffb070', 0.9); c.fillStyle = '#ffe0b0'; ell(c, 4, 4, 2, 2); c.fill(); c.fillStyle = '#3a1a00'; ell(c, 4.5, 4, 0.6, 1); c.fill();
  });

  // ---- Marble Toad: a squat warty toad whose eye is a lost glass marble.
  R('toad_body', 64, 48, (c) => {
    const body = (q) => { q.beginPath(); q.moveTo(5, 41); q.bezierCurveTo(2, 28, 10, 14, 26, 11); q.bezierCurveTo(36, 9, 44, 10, 50, 15); q.bezierCurveTo(58, 21, 62, 30, 61, 36); q.bezierCurveTo(60, 42, 52, 45, 40, 45); q.lineTo(16, 45); q.bezierCurveTo(9, 45, 6, 44, 5, 41); q.closePath(); };
    form(c, body, [2, 9, 62, 46], { base: '#45603e', light: '#a8c88a', shadow: '#0e1a10', bounce: '#6a8ab8', rim: '#d8f0b0', ow: 1.8, seed: 'td2', lx: -0.4, ly: -0.7,
      tex: (c, r) => {
        // ochre blotches, then raised warts with a highlight each
        for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(190,160,70,0.35)'; ell(c, 12 + r() * 40, 15 + r() * 18, 3 + r() * 4, 2 + r() * 3, r() * 3); c.fill(); }
        for (let i = 0; i < 26; i++) { const x = 9 + r() * 46, y = 14 + r() * 22, s = 1 + r() * 1.6; c.fillStyle = 'rgba(10,24,10,0.45)'; ell(c, x + 0.5, y + 0.6, s, s); c.fill(); c.fillStyle = 'rgba(200,230,160,0.55)'; ell(c, x - 0.3, y - 0.3, s * 0.7, s * 0.7); c.fill(); }
        // pale belly and throat
        const g = c.createLinearGradient(0, 34, 0, 46); g.addColorStop(0, 'rgba(230,220,170,0)'); g.addColorStop(1, 'rgba(230,220,170,0.55)'); c.fillStyle = g; c.fillRect(14, 34, 50, 12);
      } });
    // mouth: a long wide line with a slight smile
    c.strokeStyle = '#0a1208'; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(61, 31); c.bezierCurveTo(54, 33, 46, 32, 40, 29); c.stroke();
    c.fillStyle = '#0a1208'; ell(c, 59, 25, 0.8, 0.6); c.fill(); // nostril
    // brow ridge where the marble eye sits
    c.fillStyle = 'rgba(160,200,120,0.5)'; ell(c, 46, 15, 7, 3, -0.2); c.fill();
  });
  R('toad_eye', 22, 22, (c) => {
    glow(c, 11, 11, 11, '#7fe3ff', 0.4);
    const g = c.createRadialGradient(8, 8, 1, 11, 11, 8); g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, '#9ff0ff'); g.addColorStop(0.7, '#2a6ab0'); g.addColorStop(1, '#0a1a30');
    c.fillStyle = g; ell(c, 11, 11, 7.5, 7.5); c.fill();
    // the swirl inside the marble
    c.strokeStyle = 'rgba(255,140,90,0.9)'; c.lineWidth = 1.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(6, 13); c.bezierCurveTo(9, 6, 13, 16, 16.5, 9); c.stroke();
    c.strokeStyle = 'rgba(255,240,200,0.6)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(7, 14.5); c.bezierCurveTo(10, 9, 13, 17, 16, 11.5); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 1.3; ell(c, 11, 11, 7.5, 7.5); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.95)'; ell(c, 8, 7.5, 2.2, 1.4, -0.6); c.fill();
    // eyelid
    c.fillStyle = '#3a5434'; c.beginPath(); c.moveTo(3, 9); c.quadraticCurveTo(11, 1, 19, 8); c.quadraticCurveTo(11, 4.5, 3, 9); c.fill();
  });
  R('toad_leg', 26, 18, (c) => {
    // folded haunch with a webbed foot
    const thigh = (q) => { q.beginPath(); q.moveTo(2, 6); q.bezierCurveTo(6, 0, 18, 1, 20, 8); q.bezierCurveTo(21, 12, 14, 14, 8, 13); q.bezierCurveTo(3, 12, 1, 9, 2, 6); q.closePath(); };
    form(c, thigh, [1, 1, 21, 14], { base: '#3e5838', light: '#98b87e', shadow: '#0c160c', bounce: '#6a8ab8', ow: 1.5, seed: 'tl2' });
    const foot = (q) => { q.beginPath(); q.moveTo(12, 13); q.lineTo(25, 14); q.lineTo(23, 17.5); q.lineTo(19, 15.5); q.lineTo(16, 17.5); q.lineTo(13, 16); q.closePath(); };
    form(c, foot, [12, 13, 25, 18], { base: '#4e6a44', light: '#b8d098', shadow: '#0c160c', bounce: null, ow: 1.2, seed: 'tf2' });
  });

  // ====================================================================
  // ENVIRONMENT PROPS (the Hollows)
  // ====================================================================
  const STONE = '#3a3548', STONE_L = '#8a84a8', BRASS = '#c8a050', BRASS_D = '#5a3c10';
  const BLUEGLOW = '#9fe4ff';
  R('deco_mushroom', 40, 36, (c) => {
    // a little cluster of glowing ghost-caps: stems curve toward the light, gills underneath
    const shrooms = [[13, 15, 11, -0.15], [25, 9, 8, 0.12], [32, 4, 5, 0.25], [6, 4, 4.5, -0.3]];
    glow(c, 16, 18, 18, BLUEGLOW, 0.35);
    for (const [x, h, r, lean] of shrooms) {
      const top = 36 - h - 6, tx = x + lean * h;
      taperLine(c, curve([[x, 36], [x + lean * h * 0.3, 36 - h * 0.6], [tx, top + r * 0.3]], 8), r * 0.42 + 1.4, r * 0.32 + 0.8, INK);
      taperLine(c, curve([[x, 35.5], [x + lean * h * 0.3, 36 - h * 0.6], [tx, top + r * 0.35]], 8), r * 0.34, r * 0.24, '#cfe0ea');
      const cap = (q) => { q.beginPath(); q.moveTo(tx - r, top + r * 0.45); q.quadraticCurveTo(tx - r * 0.95, top - r * 0.75, tx, top - r * 0.8); q.quadraticCurveTo(tx + r * 0.95, top - r * 0.75, tx + r, top + r * 0.45); q.quadraticCurveTo(tx, top + r * 0.2, tx - r, top + r * 0.45); q.closePath(); };
      form(c, cap, [tx - r, top - r * 0.8, tx + r, top + r * 0.45], { base: '#6ac8e8', light: '#ecfbff', shadow: '#1a4a6a', bounce: null, ow: 1.2, seed: 'mc' + x });
      c.strokeStyle = 'rgba(20,60,90,0.6)'; c.lineWidth = 0.6; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(tx + k * r * 0.3, top + r * 0.32); c.lineTo(tx + k * r * 0.18, top + r * 0.12); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,0.8)'; for (const [a, b] of [[-0.4, -0.3], [0.25, -0.45]]) { ell(c, tx + a * r, top + b * r, r * 0.12, r * 0.09); c.fill(); }
    }
  });
  R('deco_roots', 48, 160, (c) => {
    // tangled roots: tapering, forking, rim-lit on one side, with fine root hairs
    const r = rng('roots2');
    const root = (x0, len, w, depth) => {
      let pts = [[x0, 0]]; let x = x0, y = 0;
      while (y < len) { y += 10 + r() * 8; x += (r() - 0.5) * 9; pts.push([x, Math.min(len, y)]); }
      taperLine(c, pts, w + 1.6, 0.8, INK);
      taperLine(c, pts, w, 0.4, depth ? '#1a1622' : '#241f2e');
      taperLine(c, pts.map(([px, py]) => [px - w * 0.25, py]), w * 0.25, 0.1, 'rgba(150,140,200,0.35)');
      // bark rings
      c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.7;
      for (let i = 1; i < pts.length - 2; i++) { const [px, py] = pts[i], ww = w * (1 - i / pts.length) * 0.5; c.beginPath(); c.moveTo(px - ww, py); c.lineTo(px + ww, py + 1.5); c.stroke(); }
      // root hairs
      c.strokeStyle = 'rgba(30,26,40,0.9)'; c.lineWidth = 0.6;
      for (let i = 1; i < pts.length; i++) if (r() < 0.6) { const [px, py] = pts[i], d = r() < 0.5 ? -1 : 1; c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo(px + d * 4, py + 3, px + d * (5 + r() * 5), py + 6 + r() * 6); c.stroke(); }
      if (depth < 1 && len > 60) { const k = 2 + Math.floor(r() * (pts.length - 3)); const [bx, by] = pts[k]; c.save(); c.translate(bx, by); root(0, len * 0.45, w * 0.55, depth + 1); c.restore(); }
    };
    root(14, 150, 7, 0); root(32, 115, 5.5, 0); root(24, 80, 4, 1); root(40, 60, 3, 1);
  });
  R('deco_bones', 48, 20, (c) => {
    // a little fish skeleton, picked clean
    const bone = '#d8d2e4';
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 3.2; c.beginPath(); c.moveTo(6, 13); c.quadraticCurveTo(22, 11, 36, 13); c.stroke();
    c.strokeStyle = bone; c.lineWidth = 1.6; c.beginPath(); c.moveTo(6, 13); c.quadraticCurveTo(22, 11, 36, 13); c.stroke();
    for (let i = 0; i < 6; i++) { const x = 12 + i * 4; for (const d of [-1, 1]) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 12.5); c.quadraticCurveTo(x + 2, 12.5 + d * 4, x + 1, 12.5 + d * (6 - Math.abs(i - 2.5) * 0.8)); c.stroke(); c.strokeStyle = bone; c.lineWidth = 0.9; c.stroke(); } }
    // tail
    c.fillStyle = INK; poly(c, [[7, 13], [1, 7], [3, 13], [1, 19]]); c.fill(); c.fillStyle = bone; poly(c, [[6, 13], [2.2, 8.6], [3.6, 13], [2.2, 17.4]]); c.fill();
    // skull
    const skull = (q) => { q.beginPath(); q.moveTo(35, 9); q.quadraticCurveTo(44, 7, 47, 13); q.quadraticCurveTo(44, 18, 35, 17); q.closePath(); };
    form(c, skull, [35, 7, 47, 18], { base: bone, light: '#ffffff', shadow: '#5a5470', bounce: null, ow: 1.4, seed: 'sk' });
    c.fillStyle = INK; ell(c, 41, 11.5, 1.6, 1.6); c.fill(); c.beginPath(); c.moveTo(47, 13); c.lineTo(42, 14.5); c.strokeStyle = INK; c.lineWidth = 0.8; c.stroke();
  });
  R('deco_key', 32, 16, (c) => {
    // an old brass key with a trefoil bow
    const br = { base: BRASS, light: '#fff0b0', shadow: BRASS_D, bounce: null, ow: 1.3 };
    const bow = (q) => { q.beginPath(); q.arc(6, 8, 4.5, 0, Math.PI * 2); q.moveTo(10.5, 8); q.arc(6, 8, 2, 0, Math.PI * 2, true); };
    const shaft = (q) => { q.beginPath(); q.rect(10, 6.8, 18, 2.6); q.rect(22, 9, 2.4, 4); q.rect(26, 9, 2.4, 3); q.rect(11, 6, 2, 4.2); };
    form(c, shaft, [10, 6, 29, 13], { ...br, seed: 'ks' });
    c.save(); c.fillStyle = BRASS; bow(c); c.fill('evenodd'); c.restore();
    form(c, (q) => ell(q, 6, 8, 4.5, 4.5), [1.5, 3.5, 10.5, 12.5], { ...br, seed: 'kb' });
    c.fillStyle = '#0b0a10'; ell(c, 6, 8, 1.8, 1.8); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(13, 7.2, 12, 0.7);
  });
  R('deco_teacup', 36, 26, (c) => {
    // a chipped teacup lying on its saucer, a gold line round the rim and blue forget-me-nots
    const saucer = (q) => ell(q, 18, 22, 16, 3.4);
    form(c, saucer, [2, 18.6, 34, 25.4], { base: '#d8d2e2', light: '#ffffff', shadow: '#6a6480', bounce: null, ow: 1.3, seed: 'sau' });
    const cup = (q) => { q.beginPath(); q.moveTo(7, 6); q.lineTo(27, 6); q.bezierCurveTo(27, 15, 23, 20, 17, 20); q.bezierCurveTo(11, 20, 7, 15, 7, 6); q.closePath(); };
    form(c, cup, [7, 6, 27, 20], { base: '#e8e2f0', light: '#ffffff', shadow: '#6a6480', bounce: '#8a90c8', ow: 1.4, seed: 'cup2',
      tex: (c) => { for (const [x, y] of [[12, 12], [19, 14], [23, 10]]) { c.fillStyle = 'rgba(80,120,210,0.8)'; for (let k = 0; k < 5; k++) { const a = k * 1.26; ell(c, x + Math.cos(a) * 1.4, y + Math.sin(a) * 1.4, 1, 1); c.fill(); } c.fillStyle = '#f0d070'; ell(c, x, y, 0.6, 0.6); c.fill(); } } });
    c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.arc(28, 11, 3.6, -1.4, 1.4); c.stroke(); c.strokeStyle = '#e8e2f0'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = '#2a1e10'; ell(c, 17, 6.5, 9.4, 1.6); c.fill(); // inside / old tea
    c.strokeStyle = '#d8b060'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(7.4, 7.6); c.lineTo(26.6, 7.6); c.stroke();
    c.fillStyle = '#0b0a10'; poly(c, [[20, 5.4], [24, 5.4], [22, 9]]); c.fill(); // chip
    c.strokeStyle = 'rgba(40,30,50,0.7)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(22, 9); c.lineTo(20, 14); c.lineTo(21, 17); c.stroke();
  });
  R('deco_spool', 26, 24, (c) => {
    // a wooden cotton reel, red thread, a loose end trailing on the ground
    const end = (y) => (q) => ell(q, 13, y, 10, 3);
    form(c, end(20), [3, 17, 23, 23], { base: '#8a5a38', light: '#e8b888', shadow: '#2a1408', bounce: null, ow: 1.3, seed: 'sp1' });
    const thread = (q) => { q.beginPath(); q.rect(5.5, 6, 15, 14); };
    form(c, thread, [5.5, 6, 20.5, 20], { base: '#b8283a', light: '#ff8a96', shadow: '#3a0410', bounce: null, ow: 1.2, seed: 'sp2', lx: -0.8, ly: -0.1,
      tex: (c) => { c.strokeStyle = 'rgba(60,0,10,0.5)'; c.lineWidth = 0.6; for (let y = 7; y < 20; y += 1.4) { c.beginPath(); c.moveTo(5.5, y); c.lineTo(20.5, y + 0.6); c.stroke(); } } });
    form(c, end(6), [3, 3, 23, 9], { base: '#9a6a44', light: '#f0c898', shadow: '#2a1408', bounce: null, ow: 1.3, seed: 'sp3' });
    c.fillStyle = '#1a0c04'; ell(c, 13, 6, 2, 0.8); c.fill();
    c.strokeStyle = '#b8283a'; c.lineWidth = 1; c.beginPath(); c.moveTo(20, 15); c.bezierCurveTo(24, 18, 22, 23, 26, 23.5); c.stroke();
  });
  R('deco_specs', 30, 14, (c) => {
    // round spectacles, one lens cracked
    c.lineCap = 'round';
    for (const x of [8, 22]) { c.fillStyle = 'rgba(170,200,255,0.18)'; ell(c, x, 8, 5.5, 5); c.fill(); c.strokeStyle = INK; c.lineWidth = 2.6; ell(c, x, 8, 5.5, 5); c.stroke(); c.strokeStyle = '#c8b070'; c.lineWidth = 1.1; c.stroke(); c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, x - 2, 6, 1.4, 0.8, -0.6); c.fill(); }
    c.strokeStyle = '#c8b070'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(13.4, 7); c.quadraticCurveTo(15, 5.5, 16.6, 7); c.moveTo(2.6, 7); c.lineTo(0.5, 11); c.moveTo(27.4, 7); c.lineTo(29.5, 12); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(19, 5); c.lineTo(22, 8.5); c.lineTo(20.5, 11.5); c.moveTo(22, 8.5); c.lineTo(25.5, 9); c.stroke();
  });
  R('deco_pebbles', 40, 14, (c) => {
    const r = rng('peb');
    for (let i = 0; i < 6; i++) { const x = 4 + r() * 32, rx = 2.5 + r() * 4, ry = rx * (0.55 + r() * 0.2), y = 14 - ry; form(c, (q) => ell(q, x, y, rx, ry, (r() - 0.5) * 0.4), [x - rx, y - ry, x + rx, y + ry], { base: mix(STONE, '#5a5470', r()), light: STONE_L, shadow: '#08070c', bounce: null, ow: 1.1, seed: 'pb' + i }); }
  });
  R('deco_coats', 160, 150, (c) => {
    // a rail of lost coats: collars, sleeves, buttons, moth holes; slightly different lengths
    c.lineCap = 'round';
    c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 6); c.lineTo(160, 6); c.stroke();
    c.strokeStyle = '#5a5268'; c.lineWidth = 2.4; c.stroke();
    const r = rng('coats2');
    const cols = ['#2a2034', '#3a2430', '#1e2634', '#34302a'];
    for (let i = 0; i < 4; i++) {
      const x = 8 + i * 38 + r() * 4, len = 92 + r() * 48, col = cols[i];
      // hanger
      c.strokeStyle = '#8a82a0'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + 14, 6); c.quadraticCurveTo(x + 18, 2, x + 15, 10); c.moveTo(x + 2, 17); c.lineTo(x + 15, 10); c.lineTo(x + 28, 17); c.stroke();
      const coat = (q) => { q.beginPath(); q.moveTo(x + 2, 17); q.quadraticCurveTo(x + 15, 12, x + 28, 17); q.lineTo(x + 32, 40); q.lineTo(x + 31, len); q.lineTo(x + 22, len - 4); q.lineTo(x + 15, len + 2); q.lineTo(x + 8, len - 3); q.lineTo(x - 1, len); q.lineTo(x - 2, 40); q.closePath(); };
      form(c, coat, [x - 2, 12, x + 32, len + 2], { base: col, light: mix(col, '#a090b8', 0.5), shadow: '#030206', bounce: '#4a4a7a', bounceA: 0.2, rim: '#8a7a98', ow: 1.6, seed: 'ct' + i, lx: -0.6, ly: -0.3,
        tex: (c, rr) => {
          c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 1.2; for (const f of [0.3, 0.55, 0.78]) { c.beginPath(); c.moveTo(x + 30 * f, 30); c.bezierCurveTo(x + 30 * f + 2, len * 0.6, x + 30 * f - 2, len * 0.8, x + 30 * f + 1, len); c.stroke(); }
          c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 15, 16); c.lineTo(x + 15, len); c.stroke(); // front opening
          for (let k = 0; k < 4; k++) { const by = 30 + k * 16; c.fillStyle = '#c8a878'; ell(c, x + 17.5, by, 1.8, 1.8); c.fill(); c.fillStyle = 'rgba(0,0,0,0.5)'; ell(c, x + 17.5, by + 0.6, 0.6, 0.6); c.fill(); }
          for (let k = 0; k < 3; k++) { c.fillStyle = '#05040a'; ell(c, x + 4 + rr() * 22, 30 + rr() * (len - 40), 1 + rr() * 1.6, 0.8 + rr()); c.fill(); }
          grain(c, rr, [x - 2, 12, x + 32, len], 200, 0.06);
        } });
      // collar
      c.fillStyle = mix(col, '#000000', 0.3); poly(c, [[x + 4, 17], [x + 15, 13], [x + 12, 26]]); c.fill(); poly(c, [[x + 26, 17], [x + 15, 13], [x + 18, 26]]); c.fill();
    }
  });
  R('deco_umbrella', 64, 72, (c) => {
    // a broken umbrella: a torn canopy, one rib snapped, the crook handle
    c.lineCap = 'round';
    const canopy = (q) => { q.beginPath(); q.moveTo(4, 32); q.quadraticCurveTo(10, 10, 32, 7); q.quadraticCurveTo(54, 10, 60, 30); q.lineTo(50, 27); q.quadraticCurveTo(45, 33, 40, 28); q.lineTo(33, 31); q.lineTo(26, 27); q.quadraticCurveTo(20, 34, 15, 28); q.closePath(); };
    form(c, canopy, [4, 7, 60, 34], { base: '#241c2c', light: '#6a5a78', shadow: '#05040a', bounce: '#4a4a7a', rim: '#a898c0', ow: 1.6, seed: 'umb2',
      tex: (c) => { c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 1; for (const [x1, y1] of [[15, 28], [26, 27], [40, 28], [50, 27]]) { c.beginPath(); c.moveTo(32, 8); c.quadraticCurveTo((32 + x1) / 2 + 2, 14, x1, y1); c.stroke(); } c.fillStyle = '#05040a'; ell(c, 22, 18, 3, 2.2, 0.3); c.fill(); ell(c, 44, 22, 2.4, 1.8); c.fill(); } });
    // snapped rib poking out
    c.strokeStyle = INK; c.lineWidth = 2.4; c.beginPath(); c.moveTo(56, 27); c.lineTo(63, 21); c.stroke(); c.strokeStyle = '#9a92b0'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(32, 6); c.lineTo(32, 64); c.arc(27, 64, 5, 0, Math.PI); c.stroke();
    c.strokeStyle = '#8a7a68'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(32, 6); c.lineTo(32, 64); c.arc(27, 64, 5, 0, Math.PI); c.stroke();
    c.fillStyle = '#c8b890'; ell(c, 32, 4, 1.6, 2.2); c.fill();
  });
  R('deco_rockfall', 96, 96, (c) => {
    // a heap of fallen stones: faceted boulders, dust, a few lost things caught in the pile
    const r = rng('rf2');
    const rocks = [];
    for (let i = 0; i < 16; i++) { const t = i / 16; rocks.push([10 + r() * 76, 92 - t * 70 * (0.6 + r() * 0.4) - r() * 8, 9 + r() * 12]); }
    rocks.sort((a, b) => a[1] - b[1]);
    for (const [x, y, sz] of rocks) {
      const n = 6, pts = [];
      for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 + r() * 0.5, rr = sz * (0.75 + r() * 0.3); pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8]); }
      const path = (q) => poly(q, pts);
      form(c, path, [x - sz, y - sz, x + sz, y + sz], { base: mix('#2c2838', '#423c54', r()), light: '#9a94b8', shadow: '#06050a', bounce: '#4a4a7a', bounceA: 0.2, rim: '#b0a8d8', ow: 1.6, seed: 'rk' + x,
        tex: (c, rr) => { // a facet edge and some speckle
          c.strokeStyle = 'rgba(200,190,240,0.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(x - sz * 0.2, y - sz * 0.1); c.lineTo(pts[3][0], pts[3][1]); c.stroke(); grain(c, rr, [x - sz, y - sz, x + sz, y + sz], 60, 0.07); } });
    }
    c.fillStyle = 'rgba(140,130,170,0.25)'; for (let i = 0; i < 40; i++) { ell(c, 6 + r() * 84, 88 + r() * 8, 1 + r() * 1.5, 0.8); c.fill(); }
  });
  R('button_jar', 44, 52, (c) => {
    // a glass jar of buttons: thick glass with reflections, a cork lid with string
    const jar = (q) => { q.beginPath(); q.moveTo(10, 12); q.bezierCurveTo(3, 16, 3, 30, 4, 44); q.quadraticCurveTo(5, 50, 22, 50); q.quadraticCurveTo(39, 50, 40, 44); q.bezierCurveTo(41, 30, 41, 16, 34, 12); q.closePath(); };
    // contents first (seen through the glass)
    clipTo(c, jar, () => {
      c.fillStyle = 'rgba(30,40,60,0.6)'; c.fillRect(0, 0, 44, 52);
      const r = rng('jarb'); const cols = ['#c84a4a', '#e8c040', '#5a9ad8', '#e8e0d0', '#8a5a38', '#5ab07a'];
      for (let i = 0; i < 26; i++) { const x = 8 + r() * 28, y = 24 + r() * 24, s = 2.6 + r() * 2; c.fillStyle = cols[i % cols.length]; ell(c, x, y, s, s * (0.6 + r() * 0.4), r() * 3); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.6; c.stroke(); c.fillStyle = 'rgba(0,0,0,0.5)'; ell(c, x - 0.6, y, 0.5, 0.5); c.fill(); ell(c, x + 0.6, y, 0.5, 0.5); c.fill(); }
      const g = c.createLinearGradient(4, 0, 40, 0); g.addColorStop(0, 'rgba(180,220,255,0.35)'); g.addColorStop(0.3, 'rgba(180,220,255,0.05)'); g.addColorStop(0.85, 'rgba(180,220,255,0.08)'); g.addColorStop(1, 'rgba(180,220,255,0.3)');
      c.fillStyle = g; c.fillRect(0, 0, 44, 52);
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.moveTo(8, 18); c.quadraticCurveTo(6, 30, 8, 44); c.lineTo(10, 44); c.quadraticCurveTo(8.4, 30, 10.5, 18); c.closePath(); c.fill();
    });
    outline(c, jar, 1.6);
    c.strokeStyle = 'rgba(220,240,255,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(34, 16); c.quadraticCurveTo(38, 28, 37, 42); c.stroke();
    // neck and cork
    form(c, (q) => { q.beginPath(); q.rect(11, 4, 22, 9); }, [11, 4, 33, 13], { base: '#a87a50', light: '#f0c898', shadow: '#3a2010', bounce: null, ow: 1.4, seed: 'cork', tex: (c, r) => grain(c, r, [11, 4, 33, 13], 80, 0.25) });
    c.strokeStyle = '#d8d0c0'; c.lineWidth = 1; c.beginPath(); c.moveTo(10, 11); c.lineTo(34, 11); c.moveTo(34, 11); c.quadraticCurveTo(38, 14, 36, 18); c.stroke();
  });
  R('shrine', 96, 112, (c) => {
    // a candle niche cut into an old stone arch; a moth carved in the keystone
    const arch = (q) => { q.beginPath(); q.moveTo(8, 106); q.lineTo(9, 44); q.bezierCurveTo(10, 20, 30, 6, 48, 6); q.bezierCurveTo(66, 6, 86, 20, 87, 44); q.lineTo(88, 106); q.closePath(); };
    form(c, arch, [8, 6, 88, 106], { base: '#2c2838', light: '#7a7498', shadow: '#07060c', bounce: '#5a5aa0', bounceA: 0.2, rim: '#b8b0e0', ow: 2, seed: 'arch2',
      tex: (c, r) => { // stone courses
        c.strokeStyle = 'rgba(0,0,0,0.55)'; c.lineWidth = 1.3;
        for (let y = 18; y < 106; y += 13) { c.beginPath(); c.moveTo(0, y); c.lineTo(96, y + (r() - 0.5) * 2); c.stroke(); for (let x = (y / 13) % 2 ? 6 : 18; x < 96; x += 24) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y + 13); c.stroke(); } }
        c.strokeStyle = 'rgba(200,190,240,0.12)'; for (let y = 19.5; y < 106; y += 13) { c.beginPath(); c.moveTo(0, y); c.lineTo(96, y); c.stroke(); }
        grain(c, r, [8, 6, 88, 106], 900, 0.08);
        // moss creeping from the base
        for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${90 + r() * 40},${140 + r() * 40},${120 + r() * 30},0.35)`; ell(c, 10 + r() * 76, 100 - r() * r() * 30, 1 + r() * 2, 1 + r()); c.fill(); }
      } });
    // the niche, warm inside
    const niche = (q) => { q.beginPath(); q.moveTo(26, 104); q.lineTo(26, 54); q.bezierCurveTo(26, 36, 38, 28, 48, 28); q.bezierCurveTo(58, 28, 70, 36, 70, 54); q.lineTo(70, 104); q.closePath(); };
    clipTo(c, niche, () => { const g = c.createLinearGradient(0, 28, 0, 104); g.addColorStop(0, '#0a0810'); g.addColorStop(1, '#2a1a14'); c.fillStyle = g; c.fillRect(20, 20, 60, 90); glow(c, 48, 88, 40, '#ffcf7a', 0.45); });
    outline(c, niche, 1.8);
    c.strokeStyle = 'rgba(255,207,122,0.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(27.5, 104); c.lineTo(27.5, 56); c.stroke();
    // keystone moth
    c.fillStyle = 'rgba(10,8,16,0.6)'; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(48, 16); c.quadraticCurveTo(48 + d * 11, 7, 48 + d * 13, 17); c.quadraticCurveTo(48 + d * 8, 22, 48, 19); c.fill(); }
    c.strokeStyle = 'rgba(220,210,255,0.55)'; c.lineWidth = 1.2; for (const d of [-1, 1]) { c.beginPath(); c.moveTo(48, 15.5); c.quadraticCurveTo(48 + d * 11, 6.5, 48 + d * 13, 16.5); c.stroke(); }
    c.beginPath(); c.moveTo(48, 12); c.lineTo(48, 24); c.stroke();
    // base step
    form(c, (q) => { q.beginPath(); q.rect(2, 102, 92, 9); }, [2, 102, 94, 111], { base: '#3a3448', light: '#9a94b8', shadow: '#0a0810', bounce: null, ow: 1.6, seed: 'step' });
  });
  R('gate_bars', 32, 96, (c) => {
    // a portcullis: three iron bars, two riveted crosspieces, spiked feet
    for (const x of [6, 16, 26]) {
      form(c, (q) => { q.beginPath(); q.rect(x - 2.6, 0, 5.2, 88); }, [x - 2.6, 0, x + 2.6, 88], { base: '#4a4458', light: '#b8b0d0', shadow: '#0a0810', bounce: null, ow: 1.3, seed: 'gb' + x, lx: -0.9, ly: 0 });
      form(c, (q) => poly(q, [[x - 4, 87], [x, 96], [x + 4, 87]]), [x - 4, 87, x + 4, 96], { base: '#6a6280', light: '#d8d0f0', shadow: '#0a0810', bounce: null, ow: 1.2, seed: 'gs' + x });
    }
    for (const y of [10, 58]) {
      form(c, (q) => { q.beginPath(); q.rect(0, y, 32, 6); }, [0, y, 32, y + 6], { base: '#3a3448', light: '#9a92b8', shadow: '#08060c', bounce: null, ow: 1.3, seed: 'gx' + y, lx: 0, ly: -1 });
      for (const x of [6, 16, 26]) { c.fillStyle = '#c8c0e0'; ell(c, x, y + 3, 1.2, 1.2); c.fill(); }
    }
  });
  R('hol_plank', 64, 24, (c) => {
    // an old board laid across: grain, two nails, rope lashings at the ends, a plank hanging underneath
    const board = (q) => { q.beginPath(); q.moveTo(0, 3); q.lineTo(64, 2); q.lineTo(64, 11); q.lineTo(0, 12); q.closePath(); };
    form(c, board, [0, 2, 64, 12], { base: '#4a382e', light: '#b89878', shadow: '#140a06', bounce: null, rim: '#d8b898', ow: 1.4, seed: 'plk2', lx: 0, ly: -1,
      tex: (c, r) => { c.strokeStyle = 'rgba(20,10,4,0.5)'; c.lineWidth = 0.7; for (let y = 4.5; y < 11; y += 2.2) { c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= 64; x += 8) c.lineTo(x, y + Math.sin(x * 0.2 + y) * 0.5); c.stroke(); } c.fillStyle = 'rgba(20,10,4,0.6)'; ell(c, 40, 7, 2.2, 1.2); c.fill(); grain(c, r, [0, 2, 64, 12], 80, 0.1); } });
    for (const x of [7, 57]) { c.fillStyle = '#c8c0d8'; ell(c, x, 7, 1, 1); c.fill(); c.strokeStyle = '#b0a080'; c.lineWidth = 1.3; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x - 3 + k * 1.5, 1.5); c.lineTo(x - 2 + k * 1.5, 12.5); c.stroke(); } }
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(8, 12); c.lineTo(9, 22); c.moveTo(56, 12); c.lineTo(55, 22); c.stroke();
    c.strokeStyle = '#6a5a4a'; c.lineWidth = 1; c.stroke();
  });
  R('hol_thorns', 64, 44, (c) => {
    // a bramble: dark looping canes with hooked thorns and a few red berries
    const r = rng('br2');
    c.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const x = 4 + i * 14 + r() * 6, top = 8 + r() * 16, dir = r() < 0.5 ? -1 : 1;
      const pts = curve([[x, 44], [x + dir * 12, top + 10], [x + dir * 4 - dir * 14, top], [x - dir * 6, top + 14]], 18);
      taperLine(c, pts, 4.4, 1.6, INK);
      taperLine(c, pts.map(([px, py]) => [px - 0.6, py - 0.4]), 2, 0.8, '#2a2234');
      for (let k = 2; k < pts.length - 1; k += 3) { const [px, py] = pts[k], [qx, qy] = pts[k + 1]; const nx = -(qy - py), ny = qx - px, m = Math.hypot(nx, ny) || 1, s = r() < 0.5 ? -1 : 1; c.fillStyle = INK; poly(c, [[px - 1, py], [px + (nx / m) * 5 * s + (qx - px) * 0.6, py + (ny / m) * 5 * s + (qy - py) * 0.6], [px + 1.4, py + 0.6]]); c.fill(); c.fillStyle = 'rgba(200,180,220,0.5)'; ell(c, px + (nx / m) * 4.6 * s, py + (ny / m) * 4.6 * s, 0.5, 0.5); c.fill(); }
    }
    for (let i = 0; i < 5; i++) { const x = 6 + r() * 52, y = 16 + r() * 22; glow(c, x, y, 4, '#ff5a7a', 0.4); c.fillStyle = '#c82a4a'; ell(c, x, y, 1.8, 1.8); c.fill(); c.fillStyle = 'rgba(255,220,230,0.8)'; ell(c, x - 0.5, y - 0.6, 0.6, 0.5); c.fill(); }
  });

  // ====================================================================
  // NURSERY FLOOR SCATTER (sharper, outlined)
  // ====================================================================
  R('nur_block_small', 36, 36, (c) => {
    const rr = (q, x, y, w, h, r) => { q.beginPath(); q.moveTo(x + r, y); q.arcTo(x + w, y, x + w, y + h, r); q.arcTo(x + w, y + h, x, y + h, r); q.arcTo(x, y + h, x, y, r); q.arcTo(x, y, x + w, y, r); q.closePath(); };
    const top = (q) => poly(q, [[6, 9], [26, 9], [32, 4], [12, 4]]), side = (q) => poly(q, [[26, 9], [32, 4], [32, 28], [26, 33]]), face = (q) => rr(q, 4, 9, 22, 24, 2);
    form(c, top, [6, 4, 32, 9], { base: '#d890a0', light: '#ffe0e8', shadow: '#5a2030', bounce: null, ow: 1.3, seed: 'nbt' });
    form(c, side, [26, 4, 32, 33], { base: '#8a4a5a', light: '#c87a8a', shadow: '#2a0a14', bounce: null, ow: 1.3, seed: 'nbs2' });
    form(c, face, [4, 9, 26, 33], { base: '#b86a7a', light: '#ffc0cc', shadow: '#3a1018', bounce: '#7a7ac8', ow: 1.4, seed: 'nbf' });
    c.strokeStyle = 'rgba(255,240,230,0.6)'; c.lineWidth = 1; rr(c, 7, 12, 16, 18, 1.5); c.stroke();
    c.font = 'bold 15px Georgia, serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(40,10,20,0.6)'; c.fillText('B', 15.6, 27.4); c.fillStyle = '#fff4e8'; c.fillText('B', 15, 26.6);
  });
  R('nur_marble', 16, 16, (c) => {
    glow(c, 8, 9, 8, '#bfe6ff', 0.4);
    const g = c.createRadialGradient(6, 7, 0.5, 8, 9, 6); g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#8ad0ff'); g.addColorStop(1, '#0a3050');
    c.fillStyle = g; ell(c, 8, 9.5, 5.2, 5.2); c.fill();
    c.strokeStyle = 'rgba(255,170,90,0.9)'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(4.5, 11); c.bezierCurveTo(6.5, 6.5, 9, 13, 11.5, 8); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 1.1; ell(c, 8, 9.5, 5.2, 5.2); c.stroke();
    c.fillStyle = '#fff'; ell(c, 6.2, 7.4, 1.3, 0.8, -0.6); c.fill();
  });
  R('nur_thimble', 20, 22, (c) => {
    const path = (q) => { q.beginPath(); q.moveTo(4, 20); q.bezierCurveTo(4, 10, 5, 3, 10, 3); q.bezierCurveTo(15, 3, 16, 10, 16, 20); q.closePath(); };
    form(c, path, [4, 3, 16, 20], { base: '#a8aebc', light: '#ffffff', shadow: '#2a2c3a', bounce: '#7a7ac8', ow: 1.2, seed: 'nth', tex: (c) => { for (let y = 6; y < 18; y += 2.6) for (let x = 6 + ((y / 2.6) % 2) * 1.3; x < 15; x += 2.6) { c.fillStyle = 'rgba(20,20,40,0.5)'; ell(c, x, y, 0.6, 0.55); c.fill(); } } });
    form(c, (q) => { q.beginPath(); q.rect(3, 18, 14, 3); }, [3, 18, 17, 21], { base: '#b8bece', light: '#ffffff', shadow: '#2a2c3a', bounce: null, ow: 1.1, seed: 'nthb' });
  });
  R('nur_bead', 24, 14, (c) => {
    c.strokeStyle = 'rgba(230,220,210,0.8)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 12); c.quadraticCurveTo(12, 6, 24, 12); c.stroke();
    [[5, '#c83a4a'], [12, '#e8c040'], [19, '#4a8ad8']].forEach(([x, col]) => form(c, (q) => ell(q, x, 9.5, 3.4, 3.4), [x - 3.4, 6, x + 3.4, 13], { base: col, light: '#ffffff', shadow: '#10080c', bounce: null, ow: 1.1, seed: 'bd2' + x, spec: 0.8 }));
  });
})();

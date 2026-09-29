/* Nightpaw art: The Drowned Nursery (Area 2).
 * Loaded after painter.js and story.js; uses their helpers (window.__P, window.__S).
 * Tiles, backdrops, decor, the toy enemies, Dunk, the Music Box Queen, pickups and portraits.
 * Same rules as painter.js: 4 px per world unit, pivots for puppet parts live in src/render/rigs.ts.
 */
(function () {
  'use strict';
  const { rng, lerp, hexA, mix, ell, poly, blobPath, glow, paint, strokes, A, C } = window.__P;
  const { INK, FUR, FUR_L, RIM, EYE } = C;

  const WALL = '#1c2130', WALL_L = '#3c4862', CREAM = '#e8dcc4', CREAM_D = '#8a7e6a', PINK = '#e8a0b0', PINK_D = '#7a3450',
    TEAL = '#3a8a9a', WOOD = '#4a3428', WOOD_L = '#9a7656', WOOD_D = '#1a100c', BRASS = '#d4aa58', BRASS_D = '#6a4a18',
    TIN = '#a8b6c6', TIN_D = '#3a4656', PORC = '#f4eaee', PORC_D = '#a88e9a', RED = '#c8283a', BLUE = '#6aa0d8', MOONC = '#dfe8ff';

  // opaque paintings ship as JPEG (much smaller than a speckled PNG)
  const AJ = (key, w, h, draw) => { A(key, w, h, draw); window.__P.assets[window.__P.assets.length - 1].jpeg = true; };
  const rr = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
  const P = (c, path, bbox, o) => paint(c, path, { bbox, ...o });
  function chalk(c, pts, w = 3, a = 0.75) {
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    for (let k = 0; k < 3; k++) {
      c.strokeStyle = `rgba(240,236,255,${a * (k === 0 ? 1 : 0.3)})`; c.lineWidth = w * (k === 0 ? 1 : 1.8);
      c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x + k * 0.6, y - k * 0.4) : c.moveTo(x + k * 0.6, y - k * 0.4))); c.stroke();
    }
    c.restore();
  }
  function chalkText(c, text, x, y, size, rot = 0, a = 0.8) {
    c.save(); c.translate(x, y); c.rotate(rot);
    c.font = `bold ${size}px "Comic Sans MS", "Chalkboard", sans-serif`;
    c.fillStyle = `rgba(240,236,255,${a})`; c.fillText(text, 0, 0);
    c.globalAlpha = 0.35; c.fillText(text, 1, -1);
    c.restore();
  }

  // ====================================================================
  // TILES: faded wallpaper over old wood; lace-edged skirting; drips; shelf planks.
  // ====================================================================
  A('nur_rock', 512, 512, (c) => {
    const W = 512, r = rng('nurrock');
    c.fillStyle = '#1a1e2b'; c.fillRect(0, 0, W, W);
    // wallpaper stripes (seamless: 8 stripes)
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? 'rgba(90,110,150,0.10)' : 'rgba(0,0,0,0.12)'; c.fillRect(i * 64, 0, 64, W); c.fillStyle = 'rgba(200,190,220,0.06)'; c.fillRect(i * 64 + 30, 0, 3, W); }
    // tiny faded flower sprigs in a grid (seamless)
    for (let y = 0; y < W; y += 64) for (let x = 0; x < W; x += 64) {
      const fx = x + 14 + ((y / 64) % 2) * 32, fy = y + 20;
      c.fillStyle = 'rgba(232,160,176,0.16)'; for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; ell(c, fx + Math.cos(a) * 3, fy + Math.sin(a) * 3, 2.2, 2.2); c.fill(); }
      c.fillStyle = 'rgba(160,200,170,0.12)'; ell(c, fx - 5, fy + 6, 3, 1.4, 0.6); c.fill();
    }
    // water stains and peeling (wrapped)
    for (let i = 0; i < 18; i++) {
      const x = r() * W, y = r() * W, rx = 30 + r() * 70, ry = 20 + r() * 60;
      for (const ox of [-W, 0, W]) for (const oy of [-W, 0, W]) {
        const g = c.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rx);
        g.addColorStop(0, 'rgba(10,12,20,0.28)'); g.addColorStop(0.8, 'rgba(10,12,20,0.1)'); g.addColorStop(1, 'rgba(120,110,90,0)');
        c.fillStyle = g; ell(c, x + ox, y + oy, rx, ry); c.fill();
      }
    }
    for (let i = 0; i < 9000; i++) { c.fillStyle = r() < 0.5 ? `rgba(255,255,255,${0.025 * r()})` : `rgba(0,0,0,${0.12 * r()})`; c.fillRect(r() * W, r() * W, 2, 2); }
  });
  function lip(c, seed, lace) {
    // painted skirting board lip, anchored at y = 10 (tile top)
    const g = c.createLinearGradient(0, 6, 0, 26); g.addColorStop(0, '#d8cdb4'); g.addColorStop(0.25, '#7a7060'); g.addColorStop(1, 'rgba(26,30,43,0)');
    c.fillStyle = g; c.fillRect(0, 8, 64, 18);
    c.fillStyle = '#f0e6d0'; c.fillRect(0, 8, 64, 2);
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, 13, 64, 1);
    const r = rng(seed);
    if (lace) { c.fillStyle = 'rgba(245,238,228,0.85)'; for (let x = 2; x < 64; x += 8) { c.beginPath(); c.arc(x + 2, 10, 3.2, Math.PI, 0); c.fill(); } c.fillStyle = 'rgba(26,30,43,0.8)'; for (let x = 2; x < 64; x += 8) { ell(c, x + 2, 8.6, 1, 1); c.fill(); } }
    else for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(200,220,240,0.5)'; ell(c, 4 + r() * 56, 9, 3 + r() * 5, 1.2); c.fill(); }
  }
  A('nur_top', 64, 32, (c) => lip(c, 'nt1', true));
  A('nur_top2', 64, 32, (c) => {
    lip(c, 'nt2', false);
    const r = rng('nt2b'); // a small puddle glint and a bead
    c.fillStyle = 'rgba(190,230,255,0.35)'; ell(c, 20 + r() * 20, 10, 10, 1.6); c.fill();
  });
  A('nur_bottom', 64, 28, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 12); g.addColorStop(0, 'rgba(10,12,20,0)'); g.addColorStop(1, '#0d1018');
    c.fillStyle = g; c.fillRect(0, 0, 64, 10);
    const r = rng('nurdrip');
    c.fillStyle = '#0d1018'; c.fillRect(0, 7, 64, 2);
    for (let i = 0; i < 4; i++) { const x = 6 + r() * 52, h = 4 + r() * 10; c.fillStyle = 'rgba(160,210,240,0.55)'; blobPath(c, [[x - 1.6, 8], [x + 1.6, 8], [x + 2.2, 8 + h], [x, 10 + h], [x - 2.2, 8 + h]]); c.fill(); c.fillStyle = 'rgba(255,255,255,0.7)'; ell(c, x - 0.6, 7 + h, 0.7, 1.2); c.fill(); }
  });
  A('nur_side', 24, 64, (c) => {
    const g = c.createLinearGradient(0, 0, 24, 0); g.addColorStop(0, 'rgba(200,210,240,0.25)'); g.addColorStop(0.25, 'rgba(70,84,120,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, 24, 64);
  });
  A('nur_plank', 64, 24, (c) => {
    // a painted nursery shelf with a scalloped paper edge
    P(c, (q) => { q.beginPath(); q.rect(0, 2, 64, 9); }, [0, 2, 64, 11], { base: '#6a4a3a', light: '#c8a080', dark: '#1a0c08', rim: '#f0d8c0', rimW: 1.3, seed: 'nplank', tex: 0.07 });
    c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(0, 10, 64, 1);
    c.fillStyle = 'rgba(232,160,176,0.85)'; for (let x = 0; x < 64; x += 8) { c.beginPath(); c.arc(x + 4, 11, 4, 0, Math.PI); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = 0; x < 64; x += 8) { ell(c, x + 4, 12.5, 1.2, 1); c.fill(); }
    c.strokeStyle = '#3a2418'; c.lineWidth = 2; c.beginPath(); c.moveTo(8, 12); c.lineTo(8, 20); c.lineTo(14, 13); c.moveTo(56, 12); c.lineTo(56, 20); c.lineTo(50, 13); c.stroke();
  });
  A('nur_thorns', 64, 44, (c) => {
    // toy jacks and dressmaker's pins, points up
    const r = rng('nurpins');
    for (let i = 0; i < 9; i++) {
      const x = 4 + r() * 56, h = 18 + r() * 20, a = (r() - 0.5) * 0.5;
      c.save(); c.translate(x, 44); c.rotate(a);
      c.strokeStyle = '#c8ccd8'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -h); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-0.4, -4); c.lineTo(-0.4, -h + 2); c.stroke();
      const col = [RED, '#e8c040', BLUE, '#80d0a0', PINK][Math.floor(r() * 5)];
      c.fillStyle = col; ell(c, 0, 2 - h * 0 - 0, 0.1, 0.1); c.fill();
      c.restore();
      // pin head at the base (points up means head is buried; show a glint at the tip)
      c.fillStyle = 'rgba(255,255,255,0.9)'; ell(c, x + Math.sin(a) * h, 44 - Math.cos(a) * h, 0.9, 0.9); c.fill();
    }
    for (let i = 0; i < 4; i++) { // jacks
      const x = 6 + r() * 52, y = 30 + r() * 8, s = 5 + r() * 2;
      c.strokeStyle = r() < 0.5 ? '#d4aa58' : '#b8c0d0'; c.lineWidth = 2;
      for (let k = 0; k < 3; k++) { const a = k * 1.05 + r(); c.beginPath(); c.moveTo(x - Math.cos(a) * s, y - Math.sin(a) * s); c.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s); c.stroke(); }
      c.fillStyle = '#ffe9a8'; for (let k = 0; k < 2; k++) { ell(c, x + (r() - 0.5) * 2 * s, y - s + r() * 2, 1.6, 1.6); c.fill(); }
    }
    c.fillStyle = 'rgba(255,90,120,0.8)'; for (let i = 0; i < 6; i++) { ell(c, 4 + r() * 56, 36 + r() * 6, 1.8, 1.8); c.fill(); }
  });

  // floor & ceiling scatter (drawn straight into the room texture at 4 px / unit)
  A('nur_block_small', 36, 36, (c) => {
    P(c, (q) => rr(q, 4, 6, 28, 28, 3), [4, 6, 32, 34], { base: '#8a5a6a', light: '#e8a8b8', dark: '#2a1018', rim: '#ffe0e8', rimW: 1.2, seed: 'nbs', tex: 0.05 });
    c.font = 'bold 20px Georgia, serif'; c.fillStyle = 'rgba(255,240,220,0.8)'; c.fillText('B', 11, 28);
  });
  A('nur_marble', 16, 16, (c) => {
    glow(c, 8, 8, 8, '#bfe6ff', 0.4);
    P(c, (q) => ell(q, 8, 9, 5, 5), [3, 4, 13, 14], { base: '#4a90c0', light: '#e0f4ff', dark: '#0a2030', rim: '#ffffff', rimW: 0.8, seed: 'mar', tex: 0.02 });
    c.strokeStyle = 'rgba(255,200,120,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(5, 10); c.quadraticCurveTo(8, 6, 11, 9); c.stroke();
  });
  A('nur_thimble', 20, 22, (c) => {
    P(c, (q) => poly(q, [[4, 21], [6, 6], [10, 3], [14, 6], [16, 21]]), [4, 3, 16, 21], { base: '#8a92a0', light: '#e8eef8', dark: '#20242c', rim: '#ffffff', rimW: 0.8, seed: 'thim', tex: 0.02 });
    c.fillStyle = 'rgba(0,0,0,0.3)'; for (let y = 8; y < 20; y += 3) for (let x = 7; x < 14; x += 3) { ell(c, x, y, 0.6, 0.6); c.fill(); }
  });
  A('nur_bead', 24, 14, (c) => {
    [[5, RED], [12, '#e8c040'], [19, BLUE]].forEach(([x, col]) => P(c, (q) => ell(q, x, 9, 3.6, 3.6), [x - 4, 5, x + 4, 13], { base: col, light: '#ffffff', dark: '#10080c', rim: '#ffffff', rimW: 0.6, seed: 'bd' + x, tex: 0 }));
    c.strokeStyle = 'rgba(220,210,200,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 12); c.quadraticCurveTo(12, 6, 24, 12); c.stroke();
  });
  A('nur_bunting', 96, 48, (c) => {
    c.strokeStyle = 'rgba(220,210,200,0.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 4); c.quadraticCurveTo(48, 20, 96, 4); c.stroke();
    const cols = [PINK, '#e8d080', '#9ad0e8', '#b8e0b0', PINK];
    for (let i = 0; i < 5; i++) {
      const x = 8 + i * 19, y = 4 + Math.sin((x / 96) * Math.PI) * 11;
      P(c, (q) => poly(q, [[x - 7, y], [x + 7, y], [x, y + 18]]), [x - 7, y, x + 7, y + 18], { base: cols[i], light: '#ffffff', dark: '#302030', seed: 'bn' + i, tex: 0.05 });
    }
  });

  // ====================================================================
  // PARALLAX BACKDROPS
  // ====================================================================
  AJ('nur_bg_far', 1024, 640, (c) => {
    const g = c.createLinearGradient(0, 0, 0, 640); g.addColorStop(0, '#0c1220'); g.addColorStop(0.6, '#18223a'); g.addColorStop(1, '#223248');
    c.fillStyle = g; c.fillRect(0, 0, 1024, 640);
    const r = rng('nfar');
    // enormous faded wallpaper stripes
    for (let x = 0; x < 1024; x += 128) { c.fillStyle = 'rgba(120,140,190,0.05)'; c.fillRect(x, 0, 64, 640); }
    // a tall window with moonlight, and a second one (seamless-ish: both well inside)
    for (const [wx, ww] of [[180, 150], [660, 130]]) {
      const wy = 90, wh = 300;
      glow(c, wx + ww / 2, wy + wh / 2, 260, MOONC, 0.12);
      c.fillStyle = 'rgba(160,190,240,0.16)'; c.fillRect(wx, wy, ww, wh);
      c.strokeStyle = 'rgba(20,26,44,0.9)'; c.lineWidth = 10; c.strokeRect(wx, wy, ww, wh);
      c.lineWidth = 5; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh * 0.45); c.lineTo(wx + ww, wy + wh * 0.45); c.stroke();
      const lg = c.createLinearGradient(wx, wy, wx + 160, 640); lg.addColorStop(0, 'rgba(200,220,255,0.10)'); lg.addColorStop(1, 'rgba(200,220,255,0)');
      c.fillStyle = lg; poly(c, [[wx, wy + wh], [wx + ww, wy + wh], [wx + ww + 200, 640], [wx + 60, 640]]); c.fill();
      // curtains
      for (const s of [-1, 1]) { c.fillStyle = 'rgba(40,40,70,0.75)'; const cx = s < 0 ? wx - 10 : wx + ww + 10; blobPath(c, [[cx - 22 * -s, wy - 20], [cx + 16 * -s, wy - 20], [cx + 30 * -s, wy + 200], [cx + 8 * -s, wy + wh + 30], [cx - 26 * -s, wy + wh + 30]]); c.fill(); }
    }
    // giant toy silhouettes far away: a doll's house, a rocking horse, stacked blocks
    c.fillStyle = 'rgba(40,52,80,0.7)';
    poly(c, [[380, 640], [380, 420], [460, 350], [540, 420], [540, 640]]); c.fill();
    c.fillStyle = 'rgba(150,170,210,0.18)'; for (const [x, y] of [[400, 440], [490, 440], [400, 520], [490, 520]]) c.fillRect(x, y, 30, 36);
    c.fillStyle = 'rgba(40,52,80,0.7)';
    for (const [x, y, s] of [[860, 560, 70], [900, 490, 62], [850, 430, 56]]) { c.save(); c.translate(x, y); c.rotate((r() - 0.5) * 0.2); c.fillRect(-s / 2, -s / 2, s, s); c.restore(); }
    c.beginPath(); c.moveTo(20, 600); c.quadraticCurveTo(100, 640, 180, 600); c.lineTo(170, 596); c.quadraticCurveTo(100, 628, 30, 596); c.fill();
    blobPath(c, [[60, 590], [70, 520], [110, 500], [160, 508], [150, 540], [120, 560], [140, 590]]); c.fill();
    c.filter = 'blur(3px)';
    for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(200,225,255,${0.04 + r() * 0.1})`; ell(c, r() * 1024, r() * 640, 1 + r() * 2, 1 + r() * 2); c.fill(); }
    c.filter = 'none';
    // the water line far away: everything below it is drowned
    const wg = c.createLinearGradient(0, 470, 0, 640); wg.addColorStop(0, 'rgba(90,170,200,0.22)'); wg.addColorStop(1, 'rgba(20,60,90,0.5)');
    c.fillStyle = wg; c.fillRect(0, 480, 1024, 160);
    c.strokeStyle = 'rgba(200,240,255,0.25)'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= 1024; x += 16) c.lineTo(x, 480 + Math.sin(x * 0.04) * 2); c.stroke();
    const edge = c.getImageData(0, 0, 32, 640); c.putImageData(edge, 1024 - 32, 0);
  });
  A('nur_bg_mid', 1024, 640, (c) => {
    const r = rng('nmid');
    const col = '#121826';
    // giant furniture: table and chair legs, a shelf with toys, strings of a mobile
    for (let i = 0; i < 5; i++) {
      const x = 60 + i * 210 + r() * 40, w = 26 + r() * 16;
      const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#0e131e'); g.addColorStop(0.35, '#2a3448'); g.addColorStop(1, '#0c101a');
      c.fillStyle = g;
      c.beginPath(); c.moveTo(x, 640); c.lineTo(x + 4, 240 + r() * 100); c.quadraticCurveTo(x + w / 2, 200, x + w - 4, 240); c.lineTo(x + w, 640); c.fill();
      c.fillStyle = col; ell(c, x + w / 2, 300 + r() * 80, w * 0.75, 10); c.fill();
    }
    // a long shelf with little silhouettes
    c.fillStyle = col; c.fillRect(0, 150, 1024, 14);
    for (let x = 20; x < 1000; x += 60 + r() * 50) {
      const k = r();
      if (k < 0.3) { ell(c, x, 128, 14, 18); c.fill(); ell(c, x, 104, 10, 10); c.fill(); ell(c, x - 8, 96, 4, 4); c.fill(); ell(c, x + 8, 96, 4, 4); c.fill(); } // bear
      else if (k < 0.55) { c.fillRect(x - 10, 128, 20, 22); ell(c, x, 118, 8, 9); c.fill(); } // doll
      else if (k < 0.8) { c.fillRect(x - 14, 122, 28, 28); } // box
      else { c.beginPath(); c.moveTo(x - 12, 150); c.lineTo(x, 110); c.lineTo(x + 12, 150); c.fill(); } // cone
    }
    // mobile threads with tin moons
    c.strokeStyle = 'rgba(18,24,38,0.9)'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const x = r() * 1024, len = 120 + r() * 200;
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x, len); c.stroke();
      c.fillStyle = col; c.beginPath(); c.arc(x, len + 10, 12, Math.PI * 0.3, Math.PI * 1.7); c.arc(x + 5, len + 8, 9, Math.PI * 1.6, Math.PI * 0.4, true); c.fill();
    }
    // drowned floor clutter
    c.fillStyle = col; c.beginPath(); c.moveTo(0, 640);
    for (let x = 0; x <= 1024; x += 24) c.lineTo(x, 580 + Math.sin(x * 0.02) * 16 + r() * 18);
    c.lineTo(1024, 640); c.closePath(); c.fill();
    const edge = c.getImageData(0, 0, 24, 640); c.putImageData(edge, 1024 - 24, 0);
  });
  A('nur_fg', 1024, 256, (c) => {
    const r = rng('nfg');
    // hanging strings of beads, bunting and a tassel, very dark (foreground)
    c.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const x0 = r() * 1024, x1 = x0 + 120 + r() * 200, sag = 60 + r() * 120;
      c.strokeStyle = '#05060a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, 0); c.quadraticCurveTo((x0 + x1) / 2, sag * 2, x1, 0); c.stroke();
      for (let t = 0.1; t < 0.95; t += 0.1) {
        const x = lerp(lerp(x0, (x0 + x1) / 2, t), lerp((x0 + x1) / 2, x1, t), t), y = 2 * (1 - t) * t * sag * 2;
        c.fillStyle = '#05060a';
        if (i % 2) { poly(c, [[x - 9, y], [x + 9, y], [x, y + 20]]); c.fill(); } else { ell(c, x, y + 3, 6, 6); c.fill(); }
      }
    }
    for (let i = 0; i < 5; i++) { const x = r() * 1024, l = 40 + r() * 150; c.strokeStyle = '#05060a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, l); c.stroke(); c.fillStyle = '#05060a'; ell(c, x, l + 8, 7, 10); c.fill(); }
  });

  // ====================================================================
  // DECALS
  // ====================================================================
  function chalkBoard(c, w, h) { void c; void w; void h; }
  A('chalk_nursery', 256, 128, (c) => {
    chalkText(c, 'NIGHTPAW', 12, 50, 30, -0.04);
    chalk(c, [[232, 72], [232, 20], [218, 36], [232, 20], [246, 36]], 3.5);
    chalkText(c, '(its WET)', 60, 100, 22, 0.03, 0.65);
    chalk(c, [[40, 112], [60, 118], [80, 112], [100, 118], [120, 112]], 2, 0.5);
  });
  A('chalk_up', 256, 128, (c) => {
    chalk(c, [[128, 120], [128, 20], [104, 46], [128, 20], [152, 46]], 4);
    for (const [x, y] of [[70, 110], [84, 90], [70, 70], [84, 50]]) { for (const [dx, dy, r] of [[0, 0, 5], [-5, -7, 2], [0, -9, 2], [5, -7, 2]]) { c.fillStyle = 'rgba(240,236,255,0.5)'; ell(c, x + dx, y + dy, r, r); c.fill(); } }
  });
  A('chalk_fire', 256, 128, (c) => {
    // a child's drawing of fireworks and a small cat hiding
    for (const [x, y, n] of [[60, 40, 10], [150, 30, 12], [210, 60, 8]]) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; chalk(c, [[x + Math.cos(a) * 6, y + Math.sin(a) * 6], [x + Math.cos(a) * 20, y + Math.sin(a) * 20]], 2, 0.6); }
    chalk(c, [[100, 120], [102, 96], [108, 88], [112, 96], [124, 96], [128, 88], [132, 96], [134, 120]], 2.5);
    chalkText(c, 'BANG', 20, 110, 18, -0.1, 0.5);
  });
  A('chalk_sings', 256, 128, (c) => {
    chalkText(c, 'SHE SINGS', 24, 52, 30, -0.03, 0.55);
    chalkText(c, 'TO THEM', 50, 96, 30, 0.02, 0.5);
  });
  A('nur_block', 256, 256, (c) => {
    // a stack of three wooden alphabet blocks
    const block = (x, y, s, col, letter, rot) => {
      c.save(); c.translate(x, y); c.rotate(rot);
      P(c, (q) => rr(q, -s / 2, -s / 2, s, s, s * 0.08), [-s / 2, -s / 2, s / 2, s / 2], { base: col, light: '#fff0e0', dark: '#1a0c10', rim: '#fff4e8', rimW: 2.5, seed: 'blk' + letter, tex: 0.06 });
      c.strokeStyle = 'rgba(255,245,230,0.5)'; c.lineWidth = 3; rr(c, -s * 0.38, -s * 0.38, s * 0.76, s * 0.76, s * 0.06); c.stroke();
      c.font = `bold ${s * 0.55}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = 'rgba(255,245,230,0.9)'; c.fillText(letter, 0, s * 0.03);
      c.restore();
    };
    block(80, 196, 110, '#6a8ab0', 'M', -0.04);
    block(180, 200, 100, '#b06a7a', 'I', 0.05);
    block(128, 104, 100, '#8ab06a', 'A', 0.12);
  });
  A('nur_rattle', 200, 120, (c) => {
    c.save(); c.translate(100, 60); c.rotate(-0.3);
    P(c, (q) => rr(q, -70, -6, 90, 12, 6), [-70, -6, 20, 6], { base: PINK, light: '#ffffff', dark: PINK_D, rim: '#ffffff', rimW: 1.5, seed: 'rat1', tex: 0.03 });
    P(c, (q) => ell(q, 44, 0, 34, 34), [10, -34, 78, 34], { base: '#e8d080', light: '#ffffff', dark: '#6a5018', rim: '#fff8e0', rimW: 2, seed: 'rat2', tex: 0.03 });
    c.strokeStyle = 'rgba(200,40,58,0.8)'; c.lineWidth = 4; c.beginPath(); c.arc(44, 0, 24, 0, Math.PI * 2); c.stroke();
    P(c, (q) => ell(q, -74, 0, 12, 12), [-86, -12, -62, 12], { base: '#e8d080', light: '#ffffff', dark: '#6a5018', seed: 'rat3', tex: 0.03 });
    c.restore();
  });
  A('nur_boat', 280, 160, (c) => {
    // a folded paper boat, slightly soggy, with a word written on its side
    const hull = (q) => poly(q, [[10, 90], [270, 90], [220, 150], [60, 150]]);
    P(c, hull, [10, 90, 270, 150], { base: '#e8e0d0', light: '#ffffff', dark: '#8a8070', rim: '#ffffff', rimW: 2, seed: 'boat', tex: 0.03 });
    P(c, (q) => poly(q, [[80, 92], [140, 10], [200, 92]]), [80, 10, 200, 92], { base: '#d8d0c0', light: '#ffffff', dark: '#6a6050', rim: '#ffffff', rimW: 2, seed: 'boat2', tex: 0.03 });
    c.strokeStyle = 'rgba(80,70,60,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(140, 10); c.lineTo(140, 92); c.stroke();
    c.font = 'italic 22px Georgia, serif'; c.fillStyle = 'rgba(60,80,140,0.6)'; c.fillText('the S.S. Mira', 70, 128);
    c.fillStyle = 'rgba(90,140,170,0.35)'; c.fillRect(40, 140, 200, 12);
  });
  A('nur_bear', 200, 240, (c) => {
    // a waterlogged teddy bear slumped against the wall, one button eye
    const fur = { base: '#8a6448', light: '#d8b088', dark: '#2a160c', rim: '#f0d8b8', rimW: 2, tex: 0.1 };
    P(c, (q) => ell(q, 100, 170, 62, 60), [38, 110, 162, 230], { ...fur, seed: 'bb' });
    P(c, (q) => ell(q, 44, 214, 26, 20), [18, 194, 70, 234], { ...fur, seed: 'bl1' });
    P(c, (q) => ell(q, 156, 214, 26, 20), [130, 194, 182, 234], { ...fur, seed: 'bl2' });
    P(c, (q) => ell(q, 100, 82, 52, 48, 0.1), [48, 34, 152, 130], { ...fur, seed: 'bh' });
    for (const x of [58, 142]) P(c, (q) => ell(q, x, 42, 18, 18), [x - 18, 24, x + 18, 60], { ...fur, seed: 'be' + x });
    c.fillStyle = '#d8b088'; ell(c, 100, 100, 22, 16); c.fill();
    c.fillStyle = '#1a0c08'; ell(c, 100, 92, 7, 5); c.fill();
    c.fillStyle = '#10080a'; ell(c, 80, 72, 6, 6); c.fill();
    c.strokeStyle = '#1a0c08'; c.lineWidth = 2; for (const [a, b] of [[114, 66], [126, 78], [114, 78], [126, 66]]) { void b; } c.beginPath(); c.moveTo(114, 66); c.lineTo(126, 78); c.moveTo(126, 66); c.lineTo(114, 78); c.stroke();
    c.fillStyle = 'rgba(200,40,58,0.85)'; blobPath(c, [[70, 124], [100, 132], [130, 124], [124, 140], [100, 136], [76, 140]]); c.fill();
  });
  A('nur_cot', 640, 480, (c) => {
    // the drowned cot: turned posts, bars, a quilt, legs standing in water (mattress at y = 288)
    const wood = { base: '#c8bca8', light: '#ffffff', dark: '#4a4038', rim: '#fff8f0', rimW: 2.5, tex: 0.05 };
    for (const x of [60, 580]) {
      P(c, (q) => rr(q, x - 14, 120, 28, 360, 10), [x - 14, 120, x + 14, 480], { ...wood, seed: 'post' + x });
      P(c, (q) => ell(q, x, 114, 20, 20), [x - 20, 94, x + 20, 134], { ...wood, seed: 'knob' + x });
    }
    // head and foot boards
    P(c, (q) => { q.beginPath(); q.moveTo(46, 300); q.lineTo(46, 150); q.quadraticCurveTo(100, 120, 140, 150); q.lineTo(140, 300); q.closePath(); }, [46, 120, 140, 300], { ...wood, seed: 'hb' });
    // bars
    for (let x = 90; x < 560; x += 28) P(c, (q) => rr(q, x, 186, 10, 104, 5), [x, 186, x + 10, 290], { ...wood, rimW: 1.5, seed: 'bar' + x });
    P(c, (q) => rr(q, 46, 176, 548, 14, 7), [46, 176, 594, 190], { ...wood, seed: 'rail' });
    // mattress + quilt
    P(c, (q) => rr(q, 70, 282, 500, 34, 12), [70, 282, 570, 316], { base: '#d8d4e4', light: '#ffffff', dark: '#6a6680', rim: '#ffffff', rimW: 1.5, seed: 'matt', tex: 0.03 });
    const quilt = (q) => blobPath(q, [[250, 290], [420, 280], [560, 290], [570, 340], [520, 360], [300, 350], [240, 330]]);
    P(c, quilt, [240, 280, 570, 360], { base: '#b86a80', light: '#ffd0dc', dark: '#401828', rim: '#ffe8ee', rimW: 2, seed: 'quilt', tex: 0.05 });
    c.save(); quilt(c); c.clip(); c.strokeStyle = 'rgba(255,240,245,0.35)'; c.lineWidth = 2; for (let x = 240; x < 580; x += 40) { c.beginPath(); c.moveTo(x, 270); c.lineTo(x - 30, 370); c.stroke(); } for (let y = 290; y < 360; y += 24) { c.beginPath(); c.moveTo(230, y); c.lineTo(580, y + 10); c.stroke(); } c.restore();
    // a little pillow with a dent
    P(c, (q) => blobPath(q, [[90, 290], [110, 262], [180, 258], [200, 280], [180, 296], [110, 298]]), [90, 258, 200, 298], { base: '#e8e4f0', light: '#ffffff', dark: '#8a86a0', rim: '#ffffff', rimW: 1.4, seed: 'pil', tex: 0.02 });
    // legs in the water
    c.fillStyle = 'rgba(40,110,140,0.45)'; c.fillRect(0, 400, 640, 80);
  });
  A('nur_mobile', 512, 512, (c) => {
    // a mobile of tin moons and stars hanging from a cross of wire (origin at the top)
    c.strokeStyle = '#8a8a9a'; c.lineWidth = 3; c.beginPath(); c.moveTo(256, 0); c.lineTo(256, 120); c.stroke();
    c.lineWidth = 4; c.beginPath(); c.moveTo(60, 140); c.quadraticCurveTo(256, 100, 452, 140); c.stroke();
    const items = [[80, 300, 'moon'], [170, 250, 'star'], [256, 330, 'moon'], [342, 250, 'star'], [432, 300, 'moon']];
    for (const [x, y, k] of items) {
      c.strokeStyle = 'rgba(200,200,220,0.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, 130 - Math.abs(x - 256) * -0.1); c.lineTo(x, y - 30); c.stroke();
      glow(c, x, y, 60, MOONC, 0.25);
      if (k === 'moon') P(c, (q) => { q.beginPath(); q.arc(x, y, 34, Math.PI * 0.35, Math.PI * 1.65); q.arc(x + 14, y - 4, 26, Math.PI * 1.55, Math.PI * 0.45, true); q.closePath(); }, [x - 34, y - 34, x + 34, y + 34], { base: TIN, light: '#ffffff', dark: TIN_D, rim: '#ffffff', rimW: 2, seed: 'mm' + x, tex: 0.04 });
      else P(c, (q) => { q.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i / 10) * Math.PI * 2, R = i % 2 ? 12 : 28; i ? q.lineTo(x + Math.cos(a) * R, y + Math.sin(a) * R) : q.moveTo(x + Math.cos(a) * R, y + Math.sin(a) * R); } q.closePath(); }, [x - 28, y - 28, x + 28, y + 28], { base: '#e8d080', light: '#ffffff', dark: '#6a5018', rim: '#ffffff', rimW: 1.5, seed: 'ms' + x, tex: 0.03 });
    }
  });
  A('nur_horse', 512, 400, (c) => {
    // a dapple rocking horse, paint flaking
    const wood = { base: '#6a4432', light: '#c89070', dark: '#1a0a06', rim: '#f0c8a8', rimW: 2.5, tex: 0.06 };
    P(c, (q) => { q.beginPath(); q.moveTo(20, 340); q.quadraticCurveTo(256, 430, 492, 340); q.lineTo(492, 356); q.quadraticCurveTo(256, 450, 20, 356); q.closePath(); }, [20, 330, 492, 440], { ...wood, seed: 'rock' });
    for (const x of [140, 360]) for (const s of [-1, 1]) P(c, (q) => rr(q, x + s * 20 - 6, 220, 12, 150, 6), [x - 30, 220, x + 30, 370], { ...wood, seed: 'leg' + x + s });
    const body = (q) => blobPath(q, [[110, 230], [150, 190], [300, 184], [380, 200], [400, 240], [360, 262], [160, 262]]);
    P(c, body, [110, 184, 400, 262], { base: '#e8e0d8', light: '#ffffff', dark: '#6a6068', rim: '#ffffff', rimW: 2.5, seed: 'hbody', tex: 0.05 });
    c.save(); body(c); c.clip(); const r = rng('dap'); for (let i = 0; i < 30; i++) { c.fillStyle = 'rgba(90,90,110,0.35)'; ell(c, 130 + r() * 260, 190 + r() * 70, 5 + r() * 8, 4 + r() * 5); c.fill(); } c.restore();
    const head = (q) => blobPath(q, [[360, 210], [390, 120], [420, 80], [470, 90], [490, 120], [460, 140], [420, 150], [400, 230]]);
    P(c, head, [360, 80, 490, 230], { base: '#e8e0d8', light: '#ffffff', dark: '#6a6068', rim: '#ffffff', rimW: 2.5, seed: 'hhead', tex: 0.05 });
    c.fillStyle = '#1a1018'; ell(c, 440, 104, 5, 5); c.fill();
    P(c, (q) => blobPath(q, [[380, 110], [400, 70], [420, 80], [400, 150], [380, 200], [366, 190]]), [360, 70, 420, 200], { base: '#3a2418', light: '#8a6048', dark: '#0a0404', seed: 'mane', tex: 0.08 });
    P(c, (q) => blobPath(q, [[110, 230], [70, 250], [50, 300], [80, 290], [110, 250]]), [50, 230, 110, 300], { base: '#3a2418', light: '#8a6048', dark: '#0a0404', seed: 'htail', tex: 0.08 });
    P(c, (q) => rr(q, 220, 172, 90, 26, 8), [220, 172, 310, 198], { base: RED, light: '#ff9aa4', dark: '#4a0810', rim: '#ffd0d8', rimW: 1.5, seed: 'saddle', tex: 0.05 });
  });
  AJ('nur_chest', 640, 480, (c) => {
    // the inside of an enormous toy chest: panelled walls, a painted border of ducks
    const W = 640, H = 480;
    P(c, (q) => { q.beginPath(); q.rect(0, 0, W, H); }, [0, 0, W, H], { base: '#3a2a2a', light: '#7a5a50', dark: '#0a0404', seed: 'chestin', tex: 0.08 });
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 4; for (let x = 0; x < W; x += 80) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    c.fillStyle = 'rgba(232,160,176,0.35)'; c.fillRect(0, 40, W, 34);
    for (let x = 30; x < W; x += 70) { c.fillStyle = 'rgba(255,224,122,0.6)'; ell(c, x, 58, 14, 10); c.fill(); ell(c, x + 12, 50, 8, 7); c.fill(); c.fillStyle = 'rgba(232,120,40,0.7)'; poly(c, [[x + 19, 50], [x + 27, 52], [x + 19, 54]]); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(0, 0, W, 30);
    const r = rng('chestjunk');
    for (let i = 0; i < 14; i++) { const x = r() * W, y = H - 20 - r() * 40, s = 14 + r() * 20; c.fillStyle = ['rgba(106,138,176,0.7)', 'rgba(176,106,122,0.7)', 'rgba(138,176,106,0.7)'][i % 3]; c.save(); c.translate(x, y); c.rotate(r()); c.fillRect(-s / 2, -s / 2, s, s); c.restore(); }
    glow(c, W / 2, H - 20, 180, '#ff9ab0', 0.25);
  });
  A('nur_hearth', 512, 544, (c) => {
    // a cold nursery fireplace with a brass fender and a guard (open mouth in the middle)
    const W = 512, H = 544;
    const brick = { base: '#5a3a36', light: '#b07a6a', dark: '#1a0808', rim: '#f0c0b0', rimW: 1.5, tex: 0.08 };
    const r = rng('hb');
    const surround = (q) => { q.beginPath(); q.rect(0, 40, W, H - 40); q.moveTo(80, H); q.lineTo(80, 200); q.quadraticCurveTo(256, 120, 432, 200); q.lineTo(432, H); q.closePath(); };
    c.save(); surround(c); c.clip('evenodd');
    for (let y = 40; y < H; y += 26) for (let x = (y / 26) % 2 ? -30 : 0; x < W; x += 60) P(c, (q) => rr(q, x + 2, y + 2, 56, 22, 3), [x, y, x + 60, y + 26], { ...brick, base: mix('#5a3a36', '#3a2220', r()), seed: 'br' + x + y });
    c.restore();
    // the dark inside, soot, cold ash
    c.save(); c.beginPath(); c.moveTo(80, H); c.lineTo(80, 200); c.quadraticCurveTo(256, 120, 432, 200); c.lineTo(432, H); c.closePath(); c.clip();
    const g = c.createLinearGradient(0, 140, 0, H); g.addColorStop(0, '#040306'); g.addColorStop(1, '#16100e'); c.fillStyle = g; c.fillRect(80, 120, 352, H);
    c.fillStyle = 'rgba(160,150,150,0.35)'; blobPath(c, [[120, H - 10], [200, H - 40], [320, H - 36], [400, H - 12]]); c.fill();
    c.restore();
    // mantel
    P(c, (q) => rr(q, -10, 20, W + 20, 30, 4), [-10, 20, W + 10, 50], { base: '#e8dcc4', light: '#ffffff', dark: '#6a5e4a', rim: '#ffffff', rimW: 2, seed: 'mantel', tex: 0.04 });
    // fender and guard
    c.strokeStyle = BRASS; c.lineWidth = 4; c.beginPath(); c.moveTo(60, H - 6); c.lineTo(452, H - 6); c.stroke();
    c.strokeStyle = 'rgba(40,40,50,0.8)'; c.lineWidth = 2; for (let x = 110; x < 410; x += 12) { c.beginPath(); c.moveTo(x, H - 8); c.lineTo(x, H - 110); c.stroke(); }
    c.strokeStyle = BRASS; c.lineWidth = 3; c.beginPath(); c.moveTo(106, H - 110); c.quadraticCurveTo(256, H - 150, 406, H - 110); c.stroke();
    // a sock hung on the mantel, forgotten
    P(c, (q) => blobPath(q, [[380, 50], [400, 50], [402, 110], [420, 126], [406, 140], [382, 120]]), [378, 50, 420, 140], { base: '#b83a4a', light: '#ff9aa4', dark: '#3a0810', rim: '#ffd0d8', rimW: 1.5, seed: 'msock', tex: 0.06 });
  });
  A('nur_faucet', 256, 256, (c) => {
    // a big brass bath tap
    const br = { base: BRASS, light: '#fff0c0', dark: BRASS_D, rim: '#ffffff', rimW: 2.5, tex: 0.04 };
    P(c, (q) => rr(q, 100, 120, 56, 136, 10), [100, 120, 156, 256], { ...br, seed: 'fp' });
    P(c, (q) => { q.beginPath(); q.moveTo(110, 140); q.quadraticCurveTo(110, 60, 40, 70); q.lineTo(40, 100); q.quadraticCurveTo(80, 96, 84, 140); q.closePath(); }, [40, 60, 110, 140], { ...br, seed: 'spout' });
    P(c, (q) => ell(q, 128, 104, 34, 12), [94, 92, 162, 116], { ...br, seed: 'fcap' });
    P(c, (q) => rr(q, 122, 70, 12, 36, 4), [122, 70, 134, 106], { ...br, seed: 'fstem' });
    for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) P(c, (q) => ell(q, 128 + Math.cos(a) * 26, 64 + Math.sin(a) * 8, 12, 7), [90, 50, 166, 80], { base: PORC, light: '#ffffff', dark: PORC_D, seed: 'fh' + a, tex: 0.02 });
    c.font = 'bold 18px Georgia, serif'; c.fillStyle = 'rgba(60,40,10,0.8)'; c.fillText('H', 122, 70);
    c.fillStyle = 'rgba(190,230,255,0.8)'; ell(c, 44, 112, 5, 8); c.fill();
  });
  AJ('nur_shelf', 512, 256, (c) => {
    // the painted back of a toy shelf: wallpaper and brackets
    P(c, (q) => { q.beginPath(); q.rect(0, 0, 512, 256); }, [0, 0, 512, 256], { base: '#2a3044', light: '#5a6488', dark: '#0a0c14', seed: 'shelfb', tex: 0.05 });
    for (let x = 0; x < 512; x += 48) { c.fillStyle = 'rgba(232,160,176,0.12)'; c.fillRect(x, 0, 20, 256); }
    c.strokeStyle = 'rgba(0,0,0,0.4)'; c.lineWidth = 6; c.strokeRect(3, 3, 506, 250);
  });
  A('nur_pincushion', 512, 400, (c) => {
    // a huge tomato pincushion bristling with pins
    const body = (q) => blobPath(q, [[40, 330], [60, 220], [160, 150], [256, 140], [352, 150], [452, 220], [472, 330], [380, 390], [132, 390]]);
    P(c, body, [40, 140, 472, 390], { base: '#b8303e', light: '#ff8a96', dark: '#3a0810', rim: '#ffc0c8', rimW: 3, seed: 'pcush', tex: 0.08 });
    c.save(); body(c); c.clip(); c.strokeStyle = 'rgba(40,0,8,0.45)'; c.lineWidth = 4; for (const x of [140, 256, 372]) { c.beginPath(); c.moveTo(x, 130); c.quadraticCurveTo(x + (x - 256) * 0.4, 280, x, 400); c.stroke(); } c.restore();
    P(c, (q) => blobPath(q, [[226, 150], [256, 110], [286, 150], [256, 140]]), [226, 110, 286, 150], { base: '#3a7a3a', light: '#9ad09a', dark: '#0a200a', seed: 'pleaf', tex: 0.05 });
    const r = rng('pcpins');
    for (let i = 0; i < 26; i++) {
      const x = 80 + r() * 350, y = 170 + r() * 150, a = -Math.PI / 2 + (x - 256) / 300 + (r() - 0.5) * 0.4, l = 50 + r() * 50;
      c.strokeStyle = '#d8dce8'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
      c.fillStyle = [RED, '#e8c040', BLUE, '#ffffff', '#80d0a0'][i % 5]; ell(c, x + Math.cos(a) * l, y + Math.sin(a) * l, 5, 5); c.fill();
    }
  });
  A('nur_musicbox_big', 512, 320, (c) => {
    // the painted side of a gigantic music box: lacquer, gilt, a little painted scene (half resolution; shown at 2x)
    c.scale(0.5, 0.5);
    const W = 1024, H = 640;
    P(c, (q) => rr(q, 20, 60, W - 40, H - 60, 20), [20, 60, W - 20, H], { base: '#4a1a2a', light: '#a04a68', dark: '#10040a', rim: '#ffc0d0', rimW: 4, seed: 'mbb', tex: 0.05 });
    c.strokeStyle = BRASS; c.lineWidth = 8; rr(c, 60, 100, W - 120, H - 140, 14); c.stroke();
    c.strokeStyle = 'rgba(212,170,88,0.5)'; c.lineWidth = 3; rr(c, 76, 116, W - 152, H - 172, 10); c.stroke();
    // painted panel: a dancer under stars
    const g = c.createLinearGradient(0, 130, 0, 560); g.addColorStop(0, '#1a2848'); g.addColorStop(1, '#3a4a78'); c.fillStyle = g; rr(c, 100, 136, W - 200, 420, 8); c.fill();
    const r = rng('mbstars'); for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(255,240,200,${0.3 + r() * 0.6})`; ell(c, 110 + r() * (W - 220), 146 + r() * 240, 1.5 + r() * 2, 1.5 + r() * 2); c.fill(); }
    c.fillStyle = 'rgba(244,234,238,0.7)'; ell(c, 512, 330, 16, 18); c.fill(); poly(c, [[496, 344], [528, 344], [560, 420], [464, 420]]); c.fill();
    c.strokeStyle = 'rgba(244,234,238,0.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(500, 350); c.quadraticCurveTo(450, 300, 440, 260); c.moveTo(524, 350); c.quadraticCurveTo(574, 300, 584, 260); c.moveTo(505, 420); c.lineTo(500, 500); c.moveTo(519, 420); c.lineTo(540, 470); c.stroke();
    // lid edge and a keyhole
    P(c, (q) => rr(q, 0, 40, W, 40, 10), [0, 40, W, 80], { base: '#5a2234', light: '#c06080', dark: '#10040a', rim: '#ffd0e0', rimW: 3, seed: 'mblid', tex: 0.05 });
    c.fillStyle = BRASS; ell(c, W / 2, 596, 22, 22); c.fill(); c.fillStyle = '#10040a'; ell(c, W / 2, 592, 6, 6); c.fill(); poly(c, [[W / 2 - 4, 594], [W / 2 + 4, 594], [W / 2 + 6, 608], [W / 2 - 6, 608]]); c.fill();
  });
  A('nur_comb', 512, 256, (c) => {
    // inside the music box: the pinned cylinder and the steel comb (half resolution)
    c.scale(0.5, 0.5);
    const W = 1024;
    P(c, (q) => rr(q, 80, 80, W - 160, 200, 100), [80, 80, W - 80, 280], { base: BRASS, light: '#fff0c0', dark: BRASS_D, rim: '#ffffff', rimW: 3, seed: 'cyl', tex: 0.05 });
    const r = rng('cylpins'); c.fillStyle = 'rgba(255,255,240,0.9)'; for (let i = 0; i < 160; i++) { ell(c, 110 + r() * (W - 220), 100 + r() * 160, 2.2, 2.2); c.fill(); }
    c.fillStyle = '#8a929e'; c.fillRect(120, 300, W - 240, 40);
    for (let x = 130; x < W - 130; x += 22) P(c, (q) => rr(q, x, 330, 14, 120 + Math.sin(x * 0.02) * 30, 4), [x, 330, x + 14, 480], { base: '#b8c0cc', light: '#ffffff', dark: '#3a4250', rim: '#ffffff', rimW: 1.2, seed: 'tine' + x, tex: 0.02 });
    P(c, (q) => ell(q, 60, 180, 50, 110), [10, 70, 110, 290], { base: '#6a4a2a', light: '#c0986a', dark: '#1a0c04', seed: 'gearL', tex: 0.06 });
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 3; for (let a = 0; a < Math.PI * 2; a += 0.4) { c.beginPath(); c.moveTo(60, 180); c.lineTo(60 + Math.cos(a) * 48, 180 + Math.sin(a) * 108); c.stroke(); }
  });
  A('nur_chain', 16, 896, (c) => {
    // a long bath-plug chain (little beads); shown at 2x
    c.strokeStyle = 'rgba(60,56,48,0.9)'; c.lineWidth = 1; c.beginPath(); c.moveTo(8, 0); c.lineTo(8, 896); c.stroke();
    for (let y = 4; y < 896; y += 7) P(c, (q) => ell(q, 8, y, 3, 3), [5, y - 3, 11, y + 3], { base: '#b8b0a0', light: '#ffffff', dark: '#3a3428', seed: 'cb' + y, tex: 0 });
  });
  A('nur_plughole', 320, 200, (c) => {
    // the plughole seen from below: a brass ring with warm market light pouring through
    glow(c, 160, 70, 150, '#ffd9a0', 0.5);
    P(c, (q) => { q.beginPath(); q.ellipse(160, 60, 130, 50, 0, 0, Math.PI * 2); q.ellipse(160, 60, 96, 34, 0, 0, Math.PI * 2); }, [30, 10, 290, 110], { base: BRASS, light: '#fff0c0', dark: BRASS_D, rim: '#ffffff', rimW: 2, seed: 'plug', tex: 0.04 });
    c.fillStyle = 'rgba(255,230,180,0.9)'; ell(c, 160, 60, 94, 32); c.fill();
    c.strokeStyle = 'rgba(80,50,20,0.7)'; c.lineWidth = 5; for (const x of [110, 160, 210]) { c.beginPath(); c.moveTo(x, 30); c.lineTo(x, 90); c.stroke(); }
    const g = c.createLinearGradient(0, 90, 0, 200); g.addColorStop(0, 'rgba(255,220,160,0.35)'); g.addColorStop(1, 'rgba(255,220,160,0)');
    c.fillStyle = g; poly(c, [[80, 80], [240, 80], [300, 200], [20, 200]]); c.fill();
  });
  A('nur_mothshadow', 512, 320, (c) => {
    // Mothmother's shadow: huge soft wings, seen from below
    c.filter = 'blur(6px)';
    c.fillStyle = 'rgba(2,2,6,0.9)';
    blobPath(c, [[256, 150], [180, 40], [60, 20], [10, 90], [60, 170], [150, 190]]); c.fill();
    blobPath(c, [[256, 150], [332, 40], [452, 20], [502, 90], [452, 170], [362, 190]]); c.fill();
    blobPath(c, [[256, 170], [150, 210], [100, 300], [190, 290], [240, 220]]); c.fill();
    blobPath(c, [[256, 170], [362, 210], [412, 300], [322, 290], [272, 220]]); c.fill();
    ell(c, 256, 170, 22, 90); c.fill();
    c.filter = 'none';
    c.fillStyle = 'rgba(255,207,122,0.35)'; glow(c, 256, 90, 20, '#ffcf7a', 0.5);
  });
  A('nur_wheel', 256, 256, (c) => {
    // a wooden paddle-wheel
    const wood = { base: '#6a4a32', light: '#c89a70', dark: '#1a0c06', rim: '#f0d0b0', rimW: 2, tex: 0.06 };
    for (let i = 0; i < 8; i++) { c.save(); c.translate(128, 128); c.rotate((i / 8) * Math.PI * 2); P(c, (q) => rr(q, -8, -124, 16, 110, 4), [-8, -124, 8, -14], { ...wood, seed: 'sp' + i }); P(c, (q) => rr(q, -26, -126, 52, 28, 4), [-26, -126, 26, -98], { ...wood, base: '#7a8ab0', light: '#d0e0ff', dark: '#1a2030', seed: 'pd' + i }); c.restore(); }
    c.strokeStyle = '#3a2418'; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 84, 0, Math.PI * 2); c.stroke();
    P(c, (q) => ell(q, 128, 128, 22, 22), [106, 106, 150, 150], { base: BRASS, light: '#fff0c0', dark: BRASS_D, rim: '#ffffff', rimW: 1.5, seed: 'hub', tex: 0.03 });
  });
  A('musicbox', 160, 140, (c) => {
    // a little music box, lid open, a tiny dancer inside
    P(c, (q) => rr(q, 14, 70, 132, 66, 8), [14, 70, 146, 136], { base: '#8a2a44', light: '#f08aa4', dark: '#200410', rim: '#ffd0dc', rimW: 2, seed: 'mbx', tex: 0.05 });
    c.strokeStyle = BRASS; c.lineWidth = 3; rr(c, 22, 78, 116, 50, 6); c.stroke();
    c.save(); c.translate(20, 70); c.rotate(-1.9); P(c, (q) => rr(q, 0, -4, 120, 12, 4), [0, -4, 120, 8], { base: '#8a2a44', light: '#f08aa4', dark: '#200410', rim: '#ffd0dc', rimW: 1.5, seed: 'mbl', tex: 0.05 }); c.fillStyle = 'rgba(200,220,255,0.4)'; c.fillRect(8, 8, 104, 3); c.restore();
    glow(c, 80, 60, 40, '#ffd9a0', 0.4);
    c.fillStyle = PORC; ell(c, 80, 40, 5, 6); c.fill(); poly(c, [[74, 48], [86, 48], [94, 62], [66, 62]]); c.fill();
    c.strokeStyle = PORC; c.lineWidth = 2; c.beginPath(); c.moveTo(78, 62); c.lineTo(78, 72); c.moveTo(82, 62); c.lineTo(86, 70); c.moveTo(76, 50); c.lineTo(66, 36); c.moveTo(84, 50); c.lineTo(94, 36); c.stroke();
  });
  A('mb_crank', 40, 16, (c) => {
    c.strokeStyle = BRASS; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(4, 8); c.lineTo(30, 8); c.stroke();
    P(c, (q) => ell(q, 32, 8, 6, 6), [26, 2, 38, 14], { base: BRASS, light: '#fff0c0', dark: BRASS_D, seed: 'crk', tex: 0 });
  });

  // ====================================================================
  // ENEMIES (every one was somebody's toy). Facing right.
  // ====================================================================
  const tin = { base: TIN, light: '#ffffff', dark: TIN_D, rim: '#ffffff', rimW: 1.5, tex: 0.03 };
  // Wind-up mouse
  A('wm_body', 46, 28, (c) => {
    const b = (q) => blobPath(q, [[2, 22], [6, 10], [18, 4], [32, 6], [42, 14], [45, 19], [40, 23], [20, 26]]);
    P(c, b, [2, 4, 45, 26], { ...tin, seed: 'wmb' });
    c.save(); b(c); c.clip(); c.strokeStyle = 'rgba(40,50,60,0.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(4, 17); c.quadraticCurveTo(24, 12, 44, 18); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.6)'; for (const x of [10, 18, 26, 34]) { ell(c, x, 15 - (x - 24) * 0.05, 0.8, 0.8); c.fill(); } c.restore();
    c.fillStyle = PINK; ell(c, 44, 18, 2.4, 2.2); c.fill();
    c.fillStyle = '#10141c'; ell(c, 36, 12, 1.8, 2); c.fill(); c.fillStyle = '#ffffff'; ell(c, 36.5, 11.2, 0.6, 0.6); c.fill();
    c.strokeStyle = 'rgba(30,30,40,0.7)'; c.lineWidth = 0.6; for (const d of [-2, 0, 2]) { c.beginPath(); c.moveTo(42, 18); c.lineTo(46, 17 + d); c.stroke(); }
  });
  A('wm_ear', 14, 16, (c) => { P(c, (q) => ell(q, 7, 8, 6, 7), [1, 1, 13, 15], { ...tin, seed: 'wme' }); c.fillStyle = 'rgba(232,160,176,0.8)'; ell(c, 7, 8.5, 3.4, 4.2); c.fill(); });
  A('wm_wheel', 14, 14, (c) => {
    P(c, (q) => ell(q, 7, 7, 6, 6), [1, 1, 13, 13], { base: '#2a2a34', light: '#8a8a9a', dark: '#050508', rim: '#c0c0d0', rimW: 1, seed: 'wmw', tex: 0.02 });
    c.strokeStyle = BRASS; c.lineWidth = 1; c.beginPath(); c.moveTo(7, 2); c.lineTo(7, 12); c.moveTo(2, 7); c.lineTo(12, 7); c.stroke(); c.fillStyle = BRASS; ell(c, 7, 7, 1.6, 1.6); c.fill();
  });
  A('wm_tail', 24, 10, (c) => { c.strokeStyle = '#d0d4dc'; c.lineWidth = 1.4; c.lineCap = 'round'; c.beginPath(); c.moveTo(23, 5); c.bezierCurveTo(16, 1, 12, 9, 8, 5); c.bezierCurveTo(5, 2, 3, 3, 1, 6); c.stroke(); });
  A('wm_key', 20, 18, (c) => {
    c.strokeStyle = BRASS_D; c.lineWidth = 2.5; c.beginPath(); c.moveTo(10, 18); c.lineTo(10, 9); c.stroke();
    P(c, (q) => { q.beginPath(); q.ellipse(5, 6, 4.5, 4, 0, 0, Math.PI * 2); q.ellipse(15, 6, 4.5, 4, 0, 0, Math.PI * 2); }, [0, 2, 20, 10], { base: BRASS, light: '#fff0c0', dark: BRASS_D, rim: '#ffffff', rimW: 1, seed: 'wmk', tex: 0 });
    c.fillStyle = 'rgba(40,24,8,0.8)'; ell(c, 5, 6, 1.6, 1.4); c.fill(); ell(c, 15, 6, 1.6, 1.4); c.fill();
  });
  // Jack-in-the-box
  A('jb_box', 64, 60, (c) => {
    P(c, (q) => rr(q, 2, 2, 60, 56, 4), [2, 2, 62, 58], { base: '#3a5aa0', light: '#a0c0ff', dark: '#0a1430', rim: '#e0ecff', rimW: 2, seed: 'jbb', tex: 0.05 });
    c.save(); rr(c, 2, 2, 60, 56, 4); c.clip();
    for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? 'rgba(232,200,64,0.85)' : 'rgba(200,40,58,0.85)'; const x = 8 + i * 14; poly(c, [[x + 6, 18], [x + 12, 30], [x + 6, 42], [x, 30]]); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.7)'; for (let x = 10; x < 58; x += 8) { ell(c, x, 51, 1.6, 1.6); c.fill(); }
    c.restore();
    c.strokeStyle = BRASS; c.lineWidth = 2; c.strokeRect(4, 4, 56, 52);
    c.strokeStyle = BRASS_D; c.lineWidth = 3; c.beginPath(); c.moveTo(62, 30); c.lineTo(66, 30); c.stroke();
  });
  A('jb_lid', 68, 12, (c) => { P(c, (q) => rr(q, 1, 2, 66, 8, 3), [1, 2, 67, 10], { base: '#3a5aa0', light: '#a0c0ff', dark: '#0a1430', rim: '#e0ecff', rimW: 1.4, seed: 'jbl', tex: 0.05 }); c.fillStyle = BRASS; c.fillRect(1, 4, 5, 4); });
  A('jb_spring', 24, 38, (c) => {
    c.strokeStyle = '#c8ccd8'; c.lineWidth = 2.2;
    for (let y = 36; y > 2; y -= 4) { c.beginPath(); c.ellipse(12, y, 9, 2.4, 0, Math.PI, Math.PI * 2); c.stroke(); }
    c.strokeStyle = '#6a7080'; for (let y = 36; y > 2; y -= 4) { c.beginPath(); c.ellipse(12, y, 9, 2.4, 0, 0, Math.PI); c.stroke(); }
  });
  A('jb_head', 40, 44, (c) => {
    // a grinning clown head with a pointy hat, facing right
    P(c, (q) => blobPath(q, [[6, 26], [10, 16], [22, 13], [34, 18], [37, 28], [32, 38], [20, 42], [9, 37]]), [6, 13, 37, 42], { base: PORC, light: '#ffffff', dark: PORC_D, rim: '#ffffff', rimW: 1.4, seed: 'jbh', tex: 0.03 });
    P(c, (q) => poly(q, [[8, 18], [34, 16], [26, 2]]), [8, 2, 34, 18], { base: '#c8283a', light: '#ff8a96', dark: '#3a0810', seed: 'jbhat', tex: 0.04 });
    c.fillStyle = '#e8c040'; ell(c, 26, 2, 3, 3); c.fill();
    c.fillStyle = '#e8c040'; for (const [x, y] of [[6, 22], [5, 30], [8, 36]]) { ell(c, x, y, 3.6, 3.6); c.fill(); }
    c.fillStyle = '#10080c'; ell(c, 24, 25, 1.8, 2.4); c.fill(); ell(c, 32, 25, 1.6, 2.2); c.fill();
    c.strokeStyle = '#10080c'; c.lineWidth = 1; c.beginPath(); c.moveTo(21, 20); c.lineTo(26, 21); c.moveTo(30, 21); c.lineTo(34, 20); c.stroke();
    c.fillStyle = RED; ell(c, 36, 30, 3.2, 3.2); c.fill();
    c.strokeStyle = '#6a1020'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(20, 34); c.quadraticCurveTo(28, 40, 35, 34); c.stroke();
    c.fillStyle = 'rgba(232,120,140,0.5)'; ell(c, 20, 31, 3, 2); c.fill();
    P(c, (q) => blobPath(q, [[10, 38], [20, 44], [32, 40], [24, 43.5], [14, 43.5]]), [10, 38, 32, 44], { base: '#ffffff', light: '#ffffff', dark: '#a0a0b0', seed: 'ruff', tex: 0 });
  });
  A('jb_fist', 18, 16, (c) => {
    P(c, (q) => blobPath(q, [[2, 6], [8, 2], [15, 3], [17, 9], [13, 14], [5, 13]]), [2, 2, 17, 14], { base: '#c8283a', light: '#ff9aa4', dark: '#3a0810', rim: '#ffd0d8', rimW: 1, seed: 'fist', tex: 0.03 });
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(1, 5, 3, 7);
  });
  // Tin fish
  A('tf_body', 52, 28, (c) => {
    const b = (q) => blobPath(q, [[3, 15], [12, 5], [30, 3], [44, 8], [51, 14], [44, 21], [28, 25], [12, 23]]);
    P(c, b, [3, 3, 51, 25], { base: '#d86a3a', light: '#ffd0a0', dark: '#4a1808', rim: '#fff0e0', rimW: 1.4, seed: 'tfb', tex: 0.03 });
    c.save(); b(c); c.clip(); c.strokeStyle = 'rgba(255,240,220,0.5)'; c.lineWidth = 1;
    for (let x = 14; x < 42; x += 6) { c.beginPath(); c.arc(x, 10, 4, 0.3, Math.PI - 0.3); c.stroke(); c.beginPath(); c.arc(x + 3, 17, 4, 0.3, Math.PI - 0.3); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 13, 52, 1.2); c.restore();
    c.fillStyle = '#fff4e0'; ell(c, 42, 11, 3.4, 3.4); c.fill(); c.fillStyle = '#10080c'; ell(c, 43, 11, 1.8, 2); c.fill();
    c.strokeStyle = '#4a1808'; c.lineWidth = 1; c.beginPath(); c.moveTo(47, 17); c.lineTo(51, 16); c.stroke();
  });
  A('tf_tail', 20, 22, (c) => P(c, (q) => poly(q, [[19, 11], [2, 1], [7, 11], [2, 21]]), [2, 1, 19, 21], { base: '#d86a3a', light: '#ffd0a0', dark: '#4a1808', rim: '#fff0e0', rimW: 1, seed: 'tft', tex: 0.02 }));
  A('tf_fin', 20, 12, (c) => P(c, (q) => poly(q, [[2, 12], [8, 1], [18, 12]]), [2, 1, 18, 12], { base: '#e8a040', light: '#fff0c0', dark: '#5a2808', seed: 'tff', tex: 0.02 }));
  A('tf_key', 14, 12, (c) => {
    c.strokeStyle = BRASS_D; c.lineWidth = 2; c.beginPath(); c.moveTo(7, 0); c.lineTo(7, 5); c.stroke();
    P(c, (q) => { q.beginPath(); q.ellipse(3.5, 8, 3.2, 3, 0, 0, Math.PI * 2); q.ellipse(10.5, 8, 3.2, 3, 0, 0, Math.PI * 2); }, [0, 5, 14, 11], { base: BRASS, light: '#fff0c0', dark: BRASS_D, seed: 'tfk', tex: 0 });
  });

  // ====================================================================
  // DUNK (rubber duck), DOLLS
  // ====================================================================
  const duckY = { base: '#f0c030', light: '#fff6c0', dark: '#8a5a08', rim: '#fffbe0', rimW: 1.8, tex: 0.03 };
  A('duck_body', 64, 40, (c) => P(c, (q) => blobPath(q, [[3, 10], [12, 6], [22, 11], [38, 10], [54, 12], [62, 22], [56, 34], [32, 39], [10, 34], [4, 22]]), [3, 6, 62, 39], { ...duckY, seed: 'dkb' }));
  A('duck_wing', 26, 18, (c) => P(c, (q) => blobPath(q, [[2, 4], [16, 2], [25, 8], [18, 16], [6, 13]]), [2, 2, 25, 16], { ...duckY, base: '#e0a820', seed: 'dkw' }));
  A('duck_head', 34, 34, (c) => {
    P(c, (q) => ell(q, 16, 17, 14, 14), [2, 3, 30, 31], { ...duckY, seed: 'dkh' });
    c.fillStyle = '#10080c'; ell(c, 21, 13, 2.6, 3); c.fill(); c.fillStyle = '#ffffff'; ell(c, 21.8, 12, 0.9, 0.9); c.fill();
    c.fillStyle = 'rgba(255,140,120,0.45)'; ell(c, 20, 21, 3.5, 2.2); c.fill();
    c.strokeStyle = 'rgba(138,90,8,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(12, 4); c.quadraticCurveTo(14, 0, 18, 2); c.stroke();
  });
  A('duck_beak', 20, 12, (c) => P(c, (q) => blobPath(q, [[1, 3], [10, 1], [19, 5], [12, 10], [1, 9]]), [1, 1, 19, 10], { base: '#f07a28', light: '#ffc890', dark: '#6a2008', rim: '#fff0e0', rimW: 1, seed: 'dkk', tex: 0.02 }));
  A('doll_body', 36, 44, (c) => {
    P(c, (q) => blobPath(q, [[18, 2], [26, 6], [32, 38], [18, 43], [4, 38], [10, 6]]), [4, 2, 32, 43], { base: '#8a6a9a', light: '#e0c8f0', dark: '#20102a', rim: '#f8e8ff', rimW: 1.5, seed: 'dlb', tex: 0.05 });
    c.fillStyle = 'rgba(255,255,255,0.8)'; for (let x = 6; x < 32; x += 4) { ell(c, x, 39, 2, 2); c.fill(); }
    c.fillStyle = PORC; ell(c, 6, 20, 3, 3); c.fill(); ell(c, 30, 20, 3, 3); c.fill();
  });
  A('doll_head', 34, 36, (c) => {
    P(c, (q) => ell(q, 17, 20, 12, 13), [5, 7, 29, 33], { base: PORC, light: '#ffffff', dark: PORC_D, rim: '#ffffff', rimW: 1.2, seed: 'dlh', tex: 0.02 });
    P(c, (q) => blobPath(q, [[3, 22], [5, 8], [17, 3], [29, 8], [31, 22], [26, 12], [17, 10], [8, 12]]), [3, 3, 31, 22], { base: '#6a3a1a', light: '#c08050', dark: '#1a0804', seed: 'dlhair', tex: 0.06 });
    c.fillStyle = '#1a2a4a'; ell(c, 13, 20, 2.4, 2.8); c.fill(); ell(c, 22, 20, 2.4, 2.8); c.fill();
    c.fillStyle = '#ffffff'; ell(c, 13.6, 19.2, 0.8, 0.8); c.fill(); ell(c, 22.6, 19.2, 0.8, 0.8); c.fill();
    c.fillStyle = 'rgba(232,120,140,0.5)'; ell(c, 10, 25, 2.6, 1.6); c.fill(); ell(c, 25, 25, 2.6, 1.6); c.fill();
    c.fillStyle = '#b83a4a'; ell(c, 17.5, 28, 1.6, 1); c.fill();
    c.strokeStyle = 'rgba(40,20,20,0.45)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(24, 10); c.lineTo(22, 16); c.lineTo(25, 22); c.stroke(); // a crack
  });

  // ====================================================================
  // THE MUSIC BOX QUEEN (porcelain ballerina). Facing right.
  // ====================================================================
  const porc = { base: PORC, light: '#ffffff', dark: PORC_D, rim: '#ffffff', rimW: 1.6, tex: 0.02 };
  A('q_leg', 12, 78, (c) => {
    P(c, (q) => blobPath(q, [[3, 2], [9, 2], [9.5, 30], [8, 56], [7.5, 70], [4.5, 70], [4, 56], [2.5, 30]]), [2.5, 2, 9.5, 70], { ...porc, base: '#f0dce4', seed: 'ql' });
    P(c, (q) => blobPath(q, [[4, 62], [8, 62], [8.5, 72], [6, 77.5], [3.5, 72]]), [3.5, 62, 8.5, 77.5], { base: '#e890a8', light: '#ffd0dc', dark: '#6a2038', rim: '#ffe8f0', rimW: 0.8, seed: 'qshoe', tex: 0.02 });
    c.strokeStyle = 'rgba(232,144,168,0.9)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(4, 60); c.lineTo(8, 56); c.moveTo(4, 56); c.lineTo(8, 60); c.stroke();
  });
  A('q_torso', 36, 56, (c) => {
    P(c, (q) => blobPath(q, [[10, 54], [8, 34], [12, 16], [18, 12], [24, 16], [28, 34], [26, 54]]), [8, 12, 28, 54], { base: '#e8a0b8', light: '#fff0f4', dark: '#6a2848', rim: '#ffe8f0', rimW: 1.4, seed: 'qt', tex: 0.03 });
    c.fillStyle = 'rgba(255,255,255,0.8)'; for (const [x, y] of [[18, 30], [18, 36], [18, 42], [15, 48], [21, 48]]) { ell(c, x, y, 1, 1); c.fill(); }
    P(c, (q) => blobPath(q, [[13, 16], [18, 4], [23, 16], [18, 14]]), [13, 4, 23, 16], { ...porc, seed: 'qneck' });
    c.strokeStyle = 'rgba(40,20,20,0.35)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(24, 22); c.lineTo(21, 30); c.lineTo(24, 36); c.stroke(); // a hairline crack
  });
  A('q_tutu', 92, 36, (c) => {
    const r = rng('tutu');
    for (let layer = 0; layer < 3; layer++) {
      const y = 12 + layer * 5, a = 0.55 + layer * 0.15;
      c.save(); c.globalAlpha = a;
      P(c, (q) => { q.beginPath(); q.moveTo(46, y - 8); for (let i = 0; i <= 18; i++) { const t = i / 18, x = 2 + t * 88, yy = y + Math.sin(t * Math.PI) * 10 + (i % 2 ? 4 : -2) + r() * 2; q.lineTo(x, yy); } q.closePath(); }, [2, y - 8, 90, y + 16], { base: layer === 2 ? '#f8c8d8' : '#fff0f6', light: '#ffffff', dark: '#b87090', rim: '#ffffff', rimW: 1, seed: 'tt' + layer, tex: 0.02 });
      c.restore();
    }
    c.fillStyle = 'rgba(255,255,255,0.9)'; for (let i = 0; i < 16; i++) { ell(c, 8 + r() * 76, 14 + r() * 14, 0.8, 0.8); c.fill(); }
  });
  A('q_head', 40, 46, (c) => {
    // porcelain face, dark bun, tiara; painted-on eyes, closed and serene
    P(c, (q) => blobPath(q, [[8, 10], [20, 4], [34, 8], [36, 18], [30, 12], [16, 12], [10, 22]]), [8, 4, 36, 22], { base: '#2a1a24', light: '#7a5068', dark: '#050204', seed: 'qhair', tex: 0.05 });
    P(c, (q) => ell(q, 14, 8, 8, 7), [6, 1, 22, 15], { base: '#2a1a24', light: '#7a5068', dark: '#050204', seed: 'qbun', tex: 0.05 });
    P(c, (q) => blobPath(q, [[10, 22], [14, 12], [24, 11], [33, 16], [35, 27], [30, 38], [22, 41], [14, 36]]), [10, 11, 35, 41], { ...porc, seed: 'qface' });
    P(c, (q) => blobPath(q, [[10, 22], [12, 14], [22, 12], [32, 15], [26, 16], [16, 18]]), [10, 12, 32, 22], { base: '#2a1a24', light: '#7a5068', dark: '#050204', seed: 'qfringe', tex: 0.05 });
    c.fillStyle = BRASS; poly(c, [[14, 12], [18, 5], [21, 11], [24, 3], [27, 11], [30, 6], [31, 13]]); c.fill();
    c.fillStyle = '#9ad0ff'; ell(c, 24, 7, 1.6, 1.6); c.fill();
    c.strokeStyle = '#2a1a24'; c.lineWidth = 1.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(21, 25); c.quadraticCurveTo(24, 27.5, 27, 25); c.moveTo(29, 25); c.quadraticCurveTo(31.5, 27, 34, 25); c.stroke();
    c.lineWidth = 0.7; for (const x of [22, 24, 26, 30, 32]) { c.beginPath(); c.moveTo(x, 26.5); c.lineTo(x - 0.5, 28.5); c.stroke(); }
    c.fillStyle = 'rgba(232,120,150,0.55)'; ell(c, 23, 31, 3.2, 2); c.fill(); ell(c, 33, 30.5, 2, 1.6); c.fill();
    c.fillStyle = '#c83a5a'; ell(c, 30, 35.5, 2.2, 1.2); c.fill();
    c.strokeStyle = 'rgba(40,20,20,0.4)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(16, 24); c.lineTo(19, 30); c.lineTo(17, 35); c.stroke();
  });
  A('q_arm_u', 12, 32, (c) => P(c, (q) => blobPath(q, [[3, 2], [9, 2], [8.5, 30], [3.5, 30]]), [3, 2, 9, 30], { ...porc, seed: 'qau' }));
  A('q_arm_l', 10, 32, (c) => {
    P(c, (q) => blobPath(q, [[3, 2], [7, 2], [6.5, 24], [3.5, 24]]), [3, 2, 7, 24], { ...porc, seed: 'qal' });
    P(c, (q) => blobPath(q, [[2.5, 23], [7.5, 23], [8, 29], [5, 31.5], [2, 29]]), [2, 23, 8, 31.5], { ...porc, seed: 'qhand' });
  });
  A('q_key', 34, 28, (c) => {
    c.strokeStyle = BRASS_D; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(33, 14); c.lineTo(16, 14); c.stroke();
    P(c, (q) => { q.beginPath(); q.ellipse(9, 7, 7, 6, 0, 0, Math.PI * 2); q.ellipse(9, 21, 7, 6, 0, 0, Math.PI * 2); }, [2, 1, 16, 27], { base: BRASS, light: '#fff0c0', dark: BRASS_D, rim: '#ffffff', rimW: 1.2, seed: 'qk', tex: 0.02 });
    c.fillStyle = 'rgba(40,24,8,0.8)'; ell(c, 9, 7, 2.6, 2.2); c.fill(); ell(c, 9, 21, 2.6, 2.2); c.fill();
  });
  A('q_note', 48, 48, (c) => {
    glow(c, 24, 24, 24, '#ffb0d8', 0.7);
    c.fillStyle = '#fff4fa'; ell(c, 18, 32, 7, 5.4, -0.4); c.fill();
    c.strokeStyle = '#fff4fa'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(24, 31); c.lineTo(24, 10); c.quadraticCurveTo(32, 12, 34, 20); c.stroke();
  });

  // ====================================================================
  // PICKUPS
  // ====================================================================
  A('relic_claws', 48, 48, (c) => {
    glow(c, 24, 24, 24, '#ff9ab0', 0.45);
    for (const [x, rot, s] of [[17, -0.25, 1], [30, 0.2, 0.92]]) {
      c.save(); c.translate(x, 26); c.rotate(rot); c.scale(s, s);
      P(c, (q) => blobPath(q, [[-8, 12], [-9, -2], [-6, -10], [0, -13], [6, -10], [9, -2], [8, 12]]), [-9, -13, 9, 12], { base: '#7a2a4a', light: '#e080a8', dark: '#200410', rim: '#ffd0e0', rimW: 1.4, seed: 'mit' + x, tex: 0.09 });
      P(c, (q) => ell(q, -8, 0, 3.5, 5, -0.4), [-12, -5, -4, 5], { base: '#7a2a4a', light: '#e080a8', dark: '#200410', seed: 'mth' + x, tex: 0.09 });
      c.fillStyle = '#f4eaee'; c.fillRect(-8, 9, 16, 4);
      c.strokeStyle = '#e8ecf4'; c.lineWidth = 1.1; for (const [a, b] of [[-4, -8], [0, -10], [4, -8]]) { c.beginPath(); c.moveTo(a, b + 4); c.lineTo(a + 1, b - 6); c.stroke(); c.fillStyle = '#ffffff'; ell(c, a + 1, b - 6, 0.8, 0.8); c.fill(); }
      c.restore();
    }
  });
  A('ribbon', 44, 40, (c) => {
    glow(c, 22, 20, 22, '#ff8a9a', 0.35);
    const sc = { base: RED, light: '#ff9aa4', dark: '#4a0810', rim: '#ffd0d8', rimW: 1.2, tex: 0.03 };
    P(c, (q) => blobPath(q, [[22, 18], [8, 8], [4, 18], [8, 28]]), [4, 8, 22, 28], { ...sc, seed: 'rb1' });
    P(c, (q) => blobPath(q, [[22, 18], [36, 8], [40, 18], [36, 28]]), [22, 8, 40, 28], { ...sc, seed: 'rb2' });
    P(c, (q) => blobPath(q, [[20, 20], [14, 36], [18, 38], [23, 22]]), [14, 20, 23, 38], { ...sc, seed: 'rb3' });
    P(c, (q) => blobPath(q, [[24, 20], [30, 36], [26, 38], [21, 22]]), [21, 20, 30, 38], { ...sc, seed: 'rb4' });
    P(c, (q) => ell(q, 22, 18, 4, 4.5), [18, 13, 26, 23], { ...sc, seed: 'rbk' });
  });
  A('drawing', 44, 44, (c) => {
    glow(c, 22, 22, 22, '#fff0c0', 0.3);
    c.save(); c.translate(22, 22); c.rotate(-0.12);
    P(c, (q) => { q.beginPath(); q.rect(-16, -14, 32, 28); }, [-16, -14, 16, 14], { base: '#f4ecd8', light: '#ffffff', dark: '#a89c80', rim: '#ffffff', rimW: 0.8, seed: 'dpaper', tex: 0.03 });
    c.fillStyle = '#10080c'; ell(c, 0, 4, 7, 6); c.fill(); ell(c, 0, -3, 5, 4.5); c.fill(); poly(c, [[-5, -5], [-4, -10], [-1, -6]]); c.fill(); poly(c, [[5, -5], [4, -10], [1, -6]]); c.fill();
    c.fillStyle = '#e8c040'; poly(c, [[-5, -9], [-4, -14], [-1, -11], [1, -15], [3, -11], [5, -14], [5, -9]]); c.fill();
    c.fillStyle = '#ffd45a'; ell(c, -2, -3, 1, 1); c.fill(); ell(c, 2, -3, 1, 1); c.fill();
    c.fillStyle = RED; c.fillRect(-5, 0, 10, 2);
    c.restore();
  });

  // ====================================================================
  // PORTRAITS (192x192)
  // ====================================================================
  function frame(c, col) { const g = c.createRadialGradient(96, 96, 10, 96, 96, 96); g.addColorStop(0, col); g.addColorStop(1, '#0b0a10'); c.fillStyle = g; ell(c, 96, 96, 92, 92); c.fill(); }
  function ring(c) { c.strokeStyle = 'rgba(220,210,255,0.5)'; c.lineWidth = 3; ell(c, 96, 96, 91, 91); c.stroke(); }
  const drawPart = (c, key, x, y, s, rot = 0) => { const a = window.__P.assets.find((q) => q.key === key); c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.translate(-a.w / 2, -a.h / 2); a.draw(c); c.restore(); };
  A('pt_dunk', 192, 192, (c) => {
    frame(c, '#2a3a48');
    c.save(); ell(c, 96, 96, 90, 90); c.clip();
    c.fillStyle = 'rgba(80,150,190,0.5)'; c.fillRect(0, 140, 192, 60);
    drawPart(c, 'duck_body', 84, 132, 2.4);
    drawPart(c, 'duck_head', 118, 76, 3.2);
    drawPart(c, 'duck_beak', 162, 78, 2.6);
    c.strokeStyle = 'rgba(220,240,255,0.7)'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x < 192; x += 8) c.lineTo(x, 146 + Math.sin(x * 0.1) * 2); c.stroke();
    c.restore(); ring(c);
  });
  A('pt_queen', 192, 192, (c) => {
    frame(c, '#3a2034');
    c.save(); ell(c, 96, 96, 90, 90); c.clip();
    glow(c, 96, 90, 90, '#ffd6ec', 0.25);
    drawPart(c, 'q_tutu', 96, 176, 2.4);
    drawPart(c, 'q_torso', 96, 150, 2.2);
    drawPart(c, 'q_head', 96, 72, 3.2);
    c.restore(); ring(c);
  });
})();

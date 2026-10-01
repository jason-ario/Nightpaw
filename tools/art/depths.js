/* Nightpaw art: the depths (2.4.0). Loaded after pass3.js. New props for the expanded areas:
 * Lost Name tags, the whetstone, the Sunken Belfry's bell and rope, the Quiet Graves' little
 * headstones, the Warden's hoard, the top of the well, and words scratched into stone.
 * Palette: muted, cold, worn. Nothing here is new; everything has been lost a long time.
 */
(function () {
  'use strict';
  const P = window.__P;
  const { rng, hexA, mix, ell, poly, blobPath, glow, C } = P;
  const { INK } = C;
  const { R, form, grain, taperLine, curve, clipTo } = window.__P2;
  const rr = (q, x, y, w, h, r) => { q.beginPath(); q.roundRect(x, y, w, h, r); };
  const BRASS = { base: '#9a7a44', light: '#e8d0a0', shadow: '#2a1a08', bounce: '#5a5a70', rim: '#f0e0c0' };
  const STONE = { base: '#5a5866', light: '#a8a4b4', shadow: '#121018', bounce: '#4a4a68', rim: '#c8c4d8' };
  const scratchText = (c, txt, x, y, size, a = 0.75, seed = 'st') => {
    // letters gouged into stone: a dark groove with a pale lower lip, a little shaky
    const r = rng(seed);
    c.save(); c.font = `bold ${size}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    let cx = x - c.measureText(txt).width / 2;
    for (const ch of txt) {
      const w = c.measureText(ch).width, dy = (r() - 0.5) * size * 0.12, rot = (r() - 0.5) * 0.12;
      c.save(); c.translate(cx + w / 2, y + dy); c.rotate(rot);
      c.fillStyle = `rgba(230,226,240,${a * 0.45})`; c.fillText(ch, 0.8, 1);
      c.fillStyle = `rgba(8,6,12,${a})`; c.fillText(ch, 0, 0);
      c.restore(); cx += w;
    }
    c.restore();
  };

  // ------------------------------------------------------------------ pickups
  R('nametag', 72, 48, (c) => {
    // a tarnished brass tag on a frayed loop of string
    c.strokeStyle = '#8a7a64'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(6, 6); c.bezierCurveTo(14, -2, 26, 4, 24, 14); c.stroke();
    const t = (q) => { q.beginPath(); q.moveTo(22, 12); q.lineTo(60, 10); q.quadraticCurveTo(68, 10, 68, 18); q.lineTo(68, 34); q.quadraticCurveTo(68, 42, 60, 42); q.lineTo(22, 40); q.lineTo(14, 26); q.closePath(); };
    form(c, t, [14, 10, 68, 42], { ...BRASS, ow: 1.6, seed: 'tag', spec: 0.35, tex: (q, r) => { grain(q, r, [14, 10, 68, 42], 200, 0.12); for (let i = 0; i < 6; i++) { q.fillStyle = 'rgba(70,110,90,0.35)'; ell(q, 20 + r() * 44, 14 + r() * 24, 2 + r() * 4, 1.5 + r() * 2); q.fill(); } } });
    c.fillStyle = '#10080a'; ell(c, 22, 26, 3, 3); c.fill();
    c.strokeStyle = 'rgba(30,20,8,0.75)'; c.lineWidth = 1.4; for (const [x0, x1, y] of [[30, 58, 22], [30, 50, 30]]) { c.beginPath(); c.moveTo(x0, y); for (let x = x0; x <= x1; x += 4) c.lineTo(x, y + (x % 8 ? -1.5 : 1)); c.stroke(); }
  });
  R('whetstone', 80, 48, (c) => {
    const s = (q) => { q.beginPath(); q.moveTo(8, 30); q.quadraticCurveTo(10, 14, 26, 12); q.lineTo(62, 10); q.quadraticCurveTo(74, 12, 74, 24); q.quadraticCurveTo(72, 38, 58, 40); q.lineTo(20, 42); q.quadraticCurveTo(8, 42, 8, 30); q.closePath(); };
    form(c, s, [8, 10, 74, 42], { ...STONE, base: '#6a6e7a', ow: 1.8, seed: 'whet', tex: (q, r) => grain(q, r, [8, 10, 74, 42], 500, 0.14) });
    clipTo(c, s, () => {
      // the worn hollow, polished smooth
      const g = c.createLinearGradient(20, 18, 64, 18); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(220,230,255,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g; ell(c, 41, 17, 24, 4, -0.03); c.fill();
      c.fillStyle = 'rgba(10,10,20,0.35)'; ell(c, 41, 20, 24, 3, -0.03); c.fill();
    });
  });

  // ------------------------------------------------------------------ the Sunken Belfry
  R('bell_big', 256, 300, (c) => {
    // the yoke and iron hanger
    form(c, (q) => rr(q, 70, 6, 116, 22, 6), [70, 6, 186, 28], { base: '#3a2a20', light: '#8a6a50', shadow: '#0a0604', bounce: null, ow: 2.4, seed: 'yoke', tex: (q, r) => grain(q, r, [70, 6, 186, 28], 200, 0.15) });
    for (const x of [104, 152]) form(c, (q) => rr(q, x - 5, 22, 10, 30, 3), [x - 5, 22, x + 5, 52], { base: '#3a3a44', light: '#8a8a9a', shadow: '#08080c', bounce: null, ow: 1.6, seed: 'hang' + x });
    // the bell: crown, waist, flaring lip; old bronze gone green
    const b = (q) => { q.beginPath(); q.moveTo(96, 50); q.quadraticCurveTo(128, 34, 160, 50); q.bezierCurveTo(178, 60, 178, 120, 186, 190); q.bezierCurveTo(192, 236, 214, 250, 234, 262); q.quadraticCurveTo(238, 276, 220, 280); q.quadraticCurveTo(128, 296, 36, 280); q.quadraticCurveTo(18, 276, 22, 262); q.bezierCurveTo(42, 250, 64, 236, 70, 190); q.bezierCurveTo(78, 120, 78, 60, 96, 50); q.closePath(); };
    form(c, b, [18, 34, 238, 294], { base: '#4a5a4a', light: '#a8c0a0', shadow: '#0a100c', bounce: '#3a4a5a', rim: '#d0e8d0', ow: 3, seed: 'bell', tex: (q, r) => {
      // verdigris streaks running down from the crown, bronze showing through where it was struck
      for (let i = 0; i < 40; i++) { const x = 40 + r() * 176; q.strokeStyle = r() < 0.6 ? 'rgba(110,170,140,0.18)' : 'rgba(20,30,24,0.25)'; q.lineWidth = 2 + r() * 6; q.beginPath(); q.moveTo(x, 50 + r() * 40); q.quadraticCurveTo(x + (r() - 0.5) * 10, 160, x + (r() - 0.5) * 16, 270); q.stroke(); }
      q.fillStyle = 'rgba(190,130,70,0.35)'; ell(q, 128, 250, 40, 10); q.fill();
      grain(q, r, [18, 34, 238, 294], 1400, 0.1);
    } });
    // raised bands and an inscription nobody can read any more
    c.strokeStyle = 'rgba(200,230,200,0.35)'; c.lineWidth = 3;
    for (const [y, w] of [[96, 50], [112, 52], [232, 92]]) { c.beginPath(); c.ellipse(128, y, w, 5, 0, 0, Math.PI); c.stroke(); }
    c.fillStyle = 'rgba(10,16,12,0.55)'; for (let i = 0; i < 14; i++) { ell(c, 92 + i * 5.4, 104 + Math.sin(i) * 1.5, 1.8, 3); c.fill(); }
    // a crack running up from the lip
    c.strokeStyle = 'rgba(4,6,4,0.85)'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(150, 284); c.lineTo(156, 258); c.lineTo(150, 236); c.lineTo(158, 214); c.lineTo(154, 196); c.stroke();
    // the clapper, just visible
    form(c, (q) => ell(q, 128, 276, 14, 12), [114, 264, 142, 288], { base: '#2a2a30', light: '#6a6a7a', shadow: '#050508', bounce: null, ow: 2, seed: 'clap' });
  });
  R('bell_rope', 24, 512, (c) => {
    const pts = []; for (let y = 0; y <= 512; y += 32) pts.push([12 + Math.sin(y * 0.02) * 2, y]);
    const p = curve(pts, 40);
    taperLine(c, p, 9, 7, INK); taperLine(c, p, 6.5, 5, '#7a6a52');
    c.strokeStyle = 'rgba(30,20,10,0.6)'; c.lineWidth = 1.2; for (let y = 4; y < 500; y += 7) { c.beginPath(); c.moveTo(9, y); c.lineTo(15, y + 5); c.stroke(); }
    // a frayed knot at the end
    form(c, (q) => ell(q, 12, 486, 7, 9), [5, 477, 19, 495], { base: '#7a6a52', light: '#c8b898', shadow: '#1a1208', bounce: null, ow: 1.4, seed: 'knot' });
    c.strokeStyle = '#8a7a62'; c.lineWidth = 1; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(12 + i, 494); c.lineTo(12 + i * 1.8, 510); c.stroke(); }
  });

  // ------------------------------------------------------------------ the Quiet Graves
  const grave = (key, shape, epitaphish) => R(key, 64, 80, (c) => {
    const r = rng(key);
    form(c, shape, [8, 6, 56, 76], { ...STONE, ow: 1.8, seed: key, tex: (q, rr2) => { grain(q, rr2, [8, 6, 56, 76], 380, 0.14); for (let i = 0; i < 5; i++) { q.fillStyle = 'rgba(90,110,80,0.3)'; ell(q, 10 + rr2() * 44, 40 + rr2() * 34, 3 + rr2() * 5, 2 + rr2() * 3); q.fill(); } } });
    epitaphish(c, r);
    // a mound of dirt at the foot
    form(c, (q) => { q.beginPath(); q.ellipse(32, 78, 28, 6, 0, Math.PI, 0); q.closePath(); }, [4, 72, 60, 80], { base: '#2a2228', light: '#5a4a50', shadow: '#08060a', bounce: null, ow: 1, seed: key + 'm' });
  });
  // a domino stood on end
  grave('gr_stone1', (q) => rr(q, 16, 8, 32, 68, 5), (c) => { c.strokeStyle = 'rgba(10,8,14,0.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(18, 42); c.lineTo(46, 42); c.stroke(); for (const [x, y] of [[26, 22], [38, 30], [32, 56], [24, 64], [40, 50]]) { c.fillStyle = 'rgba(10,8,14,0.75)'; ell(c, x, y, 3, 3); c.fill(); } });
  // a rounded headstone with a worn cross-hatch of letters
  grave('gr_stone2', (q) => { q.beginPath(); q.moveTo(12, 76); q.lineTo(12, 30); q.quadraticCurveTo(12, 8, 32, 8); q.quadraticCurveTo(52, 8, 52, 30); q.lineTo(52, 76); q.closePath(); }, (c, r) => { c.strokeStyle = 'rgba(10,8,14,0.6)'; c.lineWidth = 1.6; for (let y = 28; y < 60; y += 8) { c.beginPath(); c.moveTo(20, y); for (let x = 20; x < 44; x += 3) c.lineTo(x, y + (r() - 0.5) * 3); c.stroke(); } });
  // a matchbox, tipped up, a matchstick laid across it like a cross
  grave('gr_stone3', (q) => rr(q, 14, 20, 36, 56, 3), (c) => {
    c.fillStyle = 'rgba(150,40,40,0.4)'; c.fillRect(16, 34, 32, 14);
    taperLine(c, [[32, 6], [32, 40]], 3.4, 3, '#c8a878'); taperLine(c, [[22, 16], [42, 16]], 3, 3, '#c8a878');
    c.fillStyle = '#5a1a1a'; ell(c, 32, 5, 3, 3.5); c.fill();
  });

  // ------------------------------------------------------------------ the Warden's hoard
  R('hoard_pile', 512, 256, (c) => {
    const r = rng('hoard');
    // a heap of caught things, half in shadow
    const heap = (q) => { q.beginPath(); q.moveTo(8, 256); q.bezierCurveTo(60, 170, 150, 90, 250, 70); q.bezierCurveTo(350, 80, 450, 160, 504, 256); q.closePath(); };
    form(c, heap, [8, 70, 504, 256], { base: '#2a2630', light: '#6a6278', shadow: '#060508', bounce: null, ow: 2.4, seed: 'heap' });
    clipTo(c, heap, () => {
      // things poking out: keys, a shoe, a pram wheel, spoons, buttons, a doll's arm
      for (let i = 0; i < 90; i++) {
        const x = 30 + r() * 450, y = 90 + r() * 170, k = r();
        c.save(); c.translate(x, y); c.rotate(r() * 6.3);
        if (k < 0.25) { c.strokeStyle = '#8a7444'; c.lineWidth = 3; ell(c, 0, 0, 6, 6); c.stroke(); c.fillStyle = '#8a7444'; c.fillRect(5, -1.5, 16, 3); c.fillRect(17, 1, 3, 5); }
        else if (k < 0.45) { c.fillStyle = ['#6a3030', '#3a4a6a', '#6a6040', '#4a4a4a'][Math.floor(r() * 4)]; ell(c, 0, 0, 6 + r() * 4, 6 + r() * 4); c.fill(); c.fillStyle = 'rgba(0,0,0,0.5)'; ell(c, -2, 0, 1, 1); c.fill(); ell(c, 2, 0, 1, 1); c.fill(); }
        else if (k < 0.6) { c.fillStyle = '#8a8a96'; ell(c, 0, 0, 4, 6); c.fill(); c.fillRect(-1.2, 5, 2.4, 18); }
        else if (k < 0.7) { c.fillStyle = '#4a3a30'; blobPath(c, [[-14, 0], [-10, -8], [8, -6], [16, 2], [14, 6], [-12, 6]]); c.fill(); }
        else if (k < 0.78) { c.strokeStyle = '#5a5a64'; c.lineWidth = 2.5; ell(c, 0, 0, 16, 16); c.stroke(); for (let a = 0; a < 6.3; a += 0.8) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); c.stroke(); } }
        else if (k < 0.84) { c.fillStyle = '#c8b0a0'; blobPath(c, [[0, 0], [4, -2], [22, -1], [26, 2], [22, 4], [4, 3]]); c.fill(); }
        else { c.fillStyle = hexA('#9a90a8', 0.5); c.fillRect(-6, -2, 12, 4); }
        c.restore();
      }
      const g = c.createLinearGradient(0, 70, 0, 256); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(4,3,6,0.75)'); c.fillStyle = g; c.fillRect(0, 70, 512, 186);
    });
    // a collar with a bell, nothing in it, hung on the very top
    c.strokeStyle = '#7a2a2a'; c.lineWidth = 4; ell(c, 250, 64, 16, 7); c.stroke();
    form(c, (q) => ell(q, 250, 74, 5, 5), [245, 69, 255, 79], { ...BRASS, ow: 1, seed: 'cbell' });
  });

  // ------------------------------------------------------------------ the top of the well
  R('well_grate', 256, 96, (c) => {
    glow(c, 128, 40, 120, '#a8b8e8', 0.35);
    const g = c.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, 'rgba(160,180,230,0.35)'); g.addColorStop(1, 'rgba(160,180,230,0)');
    c.fillStyle = g; poly(c, [[60, 20], [196, 20], [230, 96], [26, 96]]); c.fill();
    // rain falling through
    const r = rng('wrain'); c.strokeStyle = 'rgba(200,215,255,0.35)'; c.lineWidth = 1;
    for (let i = 0; i < 40; i++) { const x = 64 + r() * 128, y = 22 + r() * 70; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y + 8); c.stroke(); }
    form(c, (q) => rr(q, 40, 8, 176, 16, 4), [40, 8, 216, 24], { base: '#3a3640', light: '#7a7488', shadow: '#060508', bounce: null, ow: 2, seed: 'grim' });
    for (let x = 58; x <= 198; x += 20) form(c, (q) => rr(q, x - 3, 2, 6, 26, 2), [x - 3, 2, x + 3, 28], { base: '#4a3a34', light: '#9a7a64', shadow: '#080404', bounce: null, ow: 1.2, seed: 'bar' + x });
  });
  R('well_bucket', 96, 96, (c) => {
    c.strokeStyle = '#5a4a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, 40); c.quadraticCurveTo(48, -2, 76, 40); c.stroke();
    const b = (q) => { q.beginPath(); q.moveTo(16, 38); q.lineTo(80, 38); q.lineTo(72, 92); q.lineTo(24, 92); q.closePath(); };
    form(c, b, [16, 38, 80, 92], { base: '#4a3a2c', light: '#9a7a5a', shadow: '#0a0604', bounce: null, ow: 2, seed: 'bkt', tex: (q, r) => { q.strokeStyle = 'rgba(0,0,0,0.35)'; q.lineWidth = 1.2; for (let x = 24; x < 76; x += 8) { q.beginPath(); q.moveTo(x, 38); q.lineTo(x + (48 - x) * 0.15, 92); q.stroke(); } grain(q, r, [16, 38, 80, 92], 200, 0.12); } });
    for (const y of [48, 80]) { c.strokeStyle = '#2a2a30'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(16 + (y - 38) * 0.12, y); c.lineTo(80 - (y - 38) * 0.12, y); c.stroke(); }
  });

  // ------------------------------------------------------------------ words scratched into stone
  R('scratch_mira', 128, 96, (c) => {
    scratchText(c, 'MIRA', 64, 36, 30, 0.85, 'sm1');
    c.strokeStyle = 'rgba(8,6,12,0.6)'; c.lineWidth = 1.4;
    // older names beneath, almost gone
    scratchText(c, 'ELSIE  TOM', 64, 66, 14, 0.4, 'sm2');
    scratchText(c, 'W  N   E', 64, 84, 11, 0.25, 'sm3');
  });
  R('scratch_tally', 160, 128, (c) => {
    const r = rng('tally');
    for (let row = 0; row < 7; row++) for (let g = 0; g < (row === 6 ? 2 : 6); g++) {
      const x0 = 10 + g * 24, y0 = 10 + row * 16;
      c.strokeStyle = `rgba(8,6,12,${0.5 + r() * 0.3})`; c.lineWidth = 1.5;
      for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x0 + k * 4 + (r() - 0.5), y0); c.lineTo(x0 + k * 4 + (r() - 0.5) * 2, y0 + 11); c.stroke(); }
      c.beginPath(); c.moveTo(x0 - 2, y0 + 9); c.lineTo(x0 + 16, y0 + 2); c.stroke();
      c.strokeStyle = 'rgba(220,216,232,0.18)'; c.beginPath(); c.moveTo(x0 + 0.6, y0 + 1); c.lineTo(x0 + 0.6, y0 + 12); c.stroke();
    }
  });
  // ====================================================================
  // THE NURSERY, EXPANDED
  // ====================================================================
  const WOOD = { base: '#4a2e26', light: '#9a6a52', shadow: '#0e0606', bounce: '#4a4060', rim: '#e0b098' };
  R('nur_door', 96, 192, (c) => {
    form(c, (q) => rr(q, 6, 4, 84, 186, 6), [6, 4, 90, 190], { ...WOOD, ow: 2.4, seed: 'door', tex: (q, r) => { for (let i = 0; i < 26; i++) { const x = 10 + r() * 76; q.strokeStyle = r() < 0.5 ? 'rgba(255,200,170,0.07)' : 'rgba(0,0,0,0.2)'; q.lineWidth = 1 + r() * 2; q.beginPath(); q.moveTo(x, 6); q.lineTo(x + (r() - 0.5) * 6, 188); q.stroke(); } } });
    for (const [y, h] of [[16, 70], [104, 74]]) { c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 3; rr(c, 18, y, 60, h, 4); c.stroke(); c.strokeStyle = 'rgba(255,210,180,0.15)'; c.lineWidth = 1.5; rr(c, 21, y + 3, 54, h - 6, 3); c.stroke(); }
    // brass plate and a lamb-shaped keyhole
    form(c, (q) => rr(q, 62, 86, 18, 30, 4), [62, 86, 80, 116], { ...BRASS, ow: 1.2, seed: 'plate' });
    c.fillStyle = '#0a0406'; ell(c, 71, 96, 3.4, 3); c.fill(); ell(c, 74, 94, 1.6, 1.4); c.fill(); poly(c, [[69, 97], [73, 97], [74, 106], [68, 106]]); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(8, 184, 80, 6);
  });
  R('nur_key', 72, 40, (c) => {
    taperLine(c, [[30, 20], [68, 20]], 5, 4.5, INK); taperLine(c, [[30, 20], [68, 20]], 3.2, 3, '#7a7068');
    for (const x of [58, 64]) { c.fillStyle = '#7a7068'; c.fillRect(x, 20, 4, 10); c.strokeStyle = INK; c.lineWidth = 1; c.strokeRect(x, 20, 4, 10); }
    // the bow: a little lamb, iron, worn smooth
    const lamb = (q) => { q.beginPath(); q.ellipse(18, 20, 13, 9, 0, 0, Math.PI * 2); q.ellipse(30, 15, 5.5, 5, 0, 0, Math.PI * 2); };
    form(c, lamb, [5, 10, 36, 29], { base: '#7a7068', light: '#d8d0c8', shadow: '#141010', bounce: null, ow: 1.4, seed: 'lamb', spec: 0.4 });
    c.fillStyle = 'rgba(30,24,20,0.6)'; for (let i = 0; i < 9; i++) { ell(c, 9 + (i % 3) * 7, 15 + Math.floor(i / 3) * 5, 2.4, 2.2); c.fill(); }
    c.fillStyle = '#100808'; ell(c, 32, 14, 1, 1); c.fill();
    for (const x of [12, 22]) { c.fillStyle = '#5a5048'; c.fillRect(x, 27, 3, 6); }
  });
  R('nur_rocker', 160, 180, (c) => {
    // an empty rocking chair: tall spindle back, rockers curving under
    const w = WOOD;
    taperLine(c, curve([[8, 168], [80, 182], [156, 160]], 16), 9, 7, INK); taperLine(c, curve([[8, 168], [80, 182], [156, 160]], 16), 6, 4.5, '#5a382c');
    for (const x of [40, 118]) { taperLine(c, [[x, 120], [x - 4, 170]], 9, 8, INK); taperLine(c, [[x, 120], [x - 4, 170]], 6, 5, '#5a382c'); }
    form(c, (q) => rr(q, 30, 108, 100, 14, 4), [30, 108, 130, 122], { ...w, ow: 2, seed: 'seat' });
    for (const x of [36, 112]) form(c, (q) => rr(q, x, 8, 10, 112, 4), [x, 8, x + 10, 120], { ...w, ow: 1.8, seed: 'post' + x });
    form(c, (q) => rr(q, 30, 6, 98, 14, 6), [30, 6, 128, 20], { ...w, ow: 1.8, seed: 'crest' });
    for (let x = 54; x < 110; x += 13) { taperLine(c, [[x, 20], [x, 108]], 5, 4, INK); taperLine(c, [[x, 20], [x, 108]], 3, 2.4, '#6a4436'); }
    // a crocheted blanket left over the arm
    form(c, (q) => { q.beginPath(); q.moveTo(108, 100); q.quadraticCurveTo(140, 104, 136, 150); q.lineTo(118, 154); q.quadraticCurveTo(116, 124, 100, 118); q.closePath(); }, [100, 100, 140, 154], { base: '#5a4a6a', light: '#a898b8', shadow: '#140e1a', bounce: null, ow: 1.4, seed: 'blank', tex: (q) => { q.strokeStyle = 'rgba(200,190,220,0.25)'; q.lineWidth = 1; for (let y = 108; y < 154; y += 6) { q.beginPath(); q.moveTo(100, y); q.lineTo(140, y + 2); q.stroke(); } } });
  });
  R('nur_basket', 96, 64, (c) => {
    form(c, (q) => { q.beginPath(); q.moveTo(8, 24); q.lineTo(88, 24); q.lineTo(80, 62); q.lineTo(16, 62); q.closePath(); }, [8, 24, 88, 62], { base: '#6a5034', light: '#c8a070', shadow: '#140a04', bounce: null, ow: 1.6, seed: 'bask', tex: (q) => { q.strokeStyle = 'rgba(30,16,4,0.5)'; q.lineWidth = 1.2; for (let y = 28; y < 62; y += 5) { q.beginPath(); q.moveTo(8, y); q.lineTo(88, y); q.stroke(); } } });
    for (const [x, col] of [[30, '#6a3a4a'], [52, '#4a5a6a'], [66, '#7a6a4a']]) form(c, (q) => ell(q, x, 22, 12, 10), [x - 12, 12, x + 12, 32], { base: col, light: mix(col, '#ffffff', 0.4), shadow: '#0a0608', bounce: null, ow: 1.2, seed: 'yarn' + x });
    c.strokeStyle = '#a8a0b0'; c.lineWidth = 2; c.beginPath(); c.moveTo(40, 2); c.lineTo(58, 30); c.moveTo(70, 0); c.lineTo(50, 30); c.stroke();
  });
  R('nur_sheet', 200, 160, (c) => {
    // a dust sheet over something tall and lumpy: furniture, probably
    const sh = (q) => { q.beginPath(); q.moveTo(6, 158); q.bezierCurveTo(14, 110, 30, 60, 62, 44); q.bezierCurveTo(82, 10, 128, 12, 140, 40); q.bezierCurveTo(172, 56, 186, 120, 194, 158); q.closePath(); };
    form(c, sh, [6, 12, 194, 158], { base: '#8a8698', light: '#e0dce8', shadow: '#1a1822', bounce: '#5a5a7a', rim: '#ffffff', ow: 2, seed: 'sheet', bounceA: 0.2, tex: (q, r) => {
      q.strokeStyle = 'rgba(20,18,30,0.3)'; q.lineWidth = 3; for (let i = 0; i < 6; i++) { const x = 30 + i * 28 + r() * 10; q.beginPath(); q.moveTo(x, 50 + r() * 20); q.quadraticCurveTo(x + (r() - 0.5) * 20, 110, x + (r() - 0.5) * 24, 158); q.stroke(); }
      grain(q, r, [6, 12, 194, 158], 600, 0.08);
    } });
    c.fillStyle = 'rgba(0,0,0,0.3)'; ell(c, 100, 158, 96, 4); c.fill();
  });
  R('nur_mirror', 120, 220, (c) => {
    form(c, (q) => { q.beginPath(); q.moveTo(10, 216); q.lineTo(10, 40); q.quadraticCurveTo(10, 6, 60, 6); q.quadraticCurveTo(110, 6, 110, 40); q.lineTo(110, 216); q.closePath(); }, [10, 6, 110, 216], { ...WOOD, base: '#3a2420', ow: 2.4, seed: 'mframe' });
    const gl = (q) => { q.beginPath(); q.moveTo(22, 206); q.lineTo(22, 44); q.quadraticCurveTo(22, 18, 60, 18); q.quadraticCurveTo(98, 18, 98, 44); q.lineTo(98, 206); q.closePath(); };
    gl(c); const g = c.createLinearGradient(22, 18, 98, 206); g.addColorStop(0, '#5a5e70'); g.addColorStop(0.5, '#2a2c38'); g.addColorStop(1, '#14141c'); c.fillStyle = g; c.fill();
    clipTo(c, gl, () => {
      const r = rng('mir'); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(10,10,14,${0.2 + r() * 0.4})`; ell(c, 22 + r() * 76, 18 + r() * 188, 2 + r() * 8, 2 + r() * 6); c.fill(); }
      c.strokeStyle = 'rgba(220,226,240,0.25)'; c.lineWidth = 8; c.beginPath(); c.moveTo(30, 120); c.lineTo(80, 40); c.stroke();
      c.strokeStyle = 'rgba(230,236,250,0.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(70, 18); c.lineTo(58, 80); c.lineTo(76, 130); c.lineTo(62, 206); c.moveTo(58, 80); c.lineTo(30, 110); c.stroke();
    });
  });
  R('nur_portrait', 96, 120, (c) => {
    form(c, (q) => rr(q, 4, 4, 88, 112, 4), [4, 4, 92, 116], { ...BRASS, base: '#6a5230', ow: 2, seed: 'pframe' });
    const pic = (q) => rr(q, 14, 14, 68, 92, 2);
    pic(c); const g = c.createLinearGradient(0, 14, 0, 106); g.addColorStop(0, '#3a3440'); g.addColorStop(1, '#1a1620'); c.fillStyle = g; c.fill();
    clipTo(c, pic, () => {
      // a sitter in dark clothes, the face rubbed away to a pale smudge
      form(c, (q) => { q.beginPath(); q.moveTo(18, 106); q.quadraticCurveTo(24, 70, 48, 66); q.quadraticCurveTo(72, 70, 78, 106); q.closePath(); }, [18, 66, 78, 106], { base: '#2a2230', light: '#5a4a60', shadow: '#08060a', bounce: null, ow: 0, outline: null, seed: 'sitter' });
      c.filter = 'blur(3px)'; c.fillStyle = 'rgba(200,190,190,0.55)'; ell(c, 48, 48, 14, 17); c.fill(); c.filter = 'none';
      c.strokeStyle = 'rgba(230,220,220,0.35)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(36 + i * 4, 34); c.lineTo(40 + i * 4, 62); c.stroke(); }
    });
  });

  // ====================================================================
  // WORDS ON THE WALLS: once chalk doodles, now scratched faintly into the stone
  // ====================================================================
  const gouge = (c, pts, w = 2, a = 0.7) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = `rgba(220,214,232,${a * 0.35})`; c.lineWidth = w; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x + 0.8, y + 1) : c.moveTo(x + 0.8, y + 1))); c.stroke();
    c.strokeStyle = `rgba(6,4,10,${a})`; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
  };
  R('chalk_arrow', 256, 96, (c) => {
    scratchText(c, 'NIGHTPAW', 100, 40, 26, 0.7, 'ca1');
    gouge(c, [[176, 42], [232, 40]], 2.4); gouge(c, [[218, 30], [234, 40], [218, 52]], 2.4);
    scratchText(c, 'this way', 100, 70, 13, 0.4, 'ca2');
  });
  R('chalk_dont', 256, 96, (c) => {
    scratchText(c, 'NIGHTPAW DONT', 128, 40, 24, 0.65, 'cd1');
    // gouged over by something with much bigger claws
    for (let i = 0; i < 4; i++) gouge(c, [[150 + i * 18, 10], [176 + i * 18, 52], [190 + i * 18, 86]], 4.5, 0.9);
  });
  R('chalk_cat', 128, 96, (c) => {
    // a child's cat, scratched with a hairpin: ears, two eyes, a scarf
    gouge(c, [[34, 80], [34, 40], [42, 18], [52, 36], [76, 36], [86, 18], [94, 40], [94, 80], [34, 80]], 2, 0.55);
    for (const x of [52, 76]) gouge(c, [[x - 3, 52], [x + 3, 52]], 2.6, 0.6);
    gouge(c, [[40, 66], [88, 66]], 3, 0.45);
  });
  R('chalk_nursery', 256, 128, (c) => {
    scratchText(c, 'NIGHTPAW', 110, 44, 26, 0.7, 'cn1');
    gouge(c, [[200, 70], [200, 26]], 2.4); gouge(c, [[188, 38], [200, 24], [212, 38]], 2.4);
    scratchText(c, 'its so cold', 116, 88, 13, 0.4, 'cn2');
  });
  R('chalk_up', 256, 128, (c) => { gouge(c, [[128, 110], [128, 22]], 2.6, 0.6); gouge(c, [[110, 42], [128, 20], [146, 42]], 2.6, 0.6); });
  R('chalk_fire', 256, 128, (c) => {
    // starbursts scratched in a ring, over and over, hard enough to chip the plaster
    const r = rng('cf');
    for (const [x, y, s] of [[70, 44, 18], [132, 30, 22], [190, 52, 16], [104, 86, 12]]) for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + r() * 0.2; gouge(c, [[x + Math.cos(a) * 4, y + Math.sin(a) * 4], [x + Math.cos(a) * s, y + Math.sin(a) * s]], 1.6, 0.5); }
  });
  R('chalk_sings', 256, 128, (c) => {
    scratchText(c, 'SHE SINGS', 128, 46, 22, 0.55, 'cs1');
    scratchText(c, 'TO THEM', 128, 78, 22, 0.5, 'cs2');
  });

})();

/* Nightpaw art: pass 3 (2.3.1). Loaded after pass2.js; repaints in place, same keys and sizes.
 *   - the Nursery's set pieces: the painted toy water-wheel, the music-box movement in the Queen's
 *     hall (pinned cylinder, steel comb, gears, fan), the giant music box's marquetry side, and the
 *     little music boxes with their dancers and cranks
 *   - Dunk (a proper rubber duck that floats high), Nib (head, body and waistcoat that join up),
 *     the shelf dolls' dresses, the wind-up mouse, and Tallow's lost slipper
 */
(function () {
  'use strict';
  const P = window.__P;
  const { rng, lerp, hexA, mix, ell, poly, blobPath, glow, C } = P;
  const { INK } = C;
  const { R, form, grain, taperLine, curve, clipTo, outline } = window.__P2;

  const rr = (q, x, y, w, h, r) => { q.beginPath(); q.roundRect(x, y, w, h, r); };
  const BR = { base: '#c89a48', light: '#fff2c4', shadow: '#3a2408', bounce: '#8a6a50', rim: '#fff6d8' };
  const STEEL = { base: '#9aa4b2', light: '#ffffff', shadow: '#1e2430', bounce: '#7a86a8', rim: '#ffffff' };
  const ROSE = { base: '#5a2030', light: '#b8607a', shadow: '#12040a', bounce: '#6a4a78', rim: '#ffc8d8' };
  const PORC = '#f4ece8';
  const screw = (c, x, y, r = 5, a = 0.6) => {
    form(c, (q) => ell(q, x, y, r, r), [x - r, y - r, x + r, y + r], { ...BR, ow: 1, bounce: null, seed: 's' + x + y });
    c.strokeStyle = 'rgba(40,24,8,0.8)'; c.lineWidth = Math.max(1, r * 0.3); c.beginPath(); c.moveTo(x - Math.cos(a) * r * 0.7, y - Math.sin(a) * r * 0.7); c.lineTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7); c.stroke();
  };

  // ====================================================================
  // THE TOY WATER-WHEEL (256x256, rotates about its centre)
  // ====================================================================
  R('nur_wheel', 256, 256, (c) => {
    const cx = 128, cy = 128, RIM = 92;
    const BLUE = { base: '#3a5c92', light: '#a8c4ff', shadow: '#0c1630', bounce: '#5a6aa0', rim: '#d8e4ff' };
    // the back rim, seen a little off-axis: gives the wheel thickness
    c.strokeStyle = '#0c1226'; c.lineWidth = 15; c.beginPath(); c.arc(cx + 3, cy + 4, RIM, 0, Math.PI * 2); c.stroke();
    // spokes
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const pts = [[cx + ca * 16, cy + sa * 16], [cx + ca * (RIM - 2), cy + sa * (RIM - 2)]];
      taperLine(c, pts, 13, 9, INK);
      taperLine(c, pts, 10, 6.5, BLUE.base);
      taperLine(c, [[pts[0][0] - sa * 2, pts[0][1] + ca * 2], [pts[1][0] - sa * 2, pts[1][1] + ca * 2]], 2.4, 1.6, hexA(BLUE.light, 0.55));
    }
    // paddles: painted boards, cupped a little, red and yellow by turns
    for (let i = 0; i < 8; i++) {
      c.save(); c.translate(cx, cy); c.rotate(((i + 0.5) / 8) * Math.PI * 2);
      const col = i % 2 ? { base: '#e8b830', light: '#fff4b0', shadow: '#5a3a04', bounce: '#a08060', rim: '#fffbe0' } : { base: '#c8383a', light: '#ffb0a0', shadow: '#3a0408', bounce: '#8a5a7a', rim: '#ffd8d0' };
      const pad = (q) => { q.beginPath(); q.moveTo(-17, -RIM + 6); q.lineTo(17, -RIM + 6); q.lineTo(18, -RIM - 30); q.quadraticCurveTo(0, -RIM - 24, -18, -RIM - 30); q.closePath(); };
      form(c, pad, [-18, -RIM - 30, 18, -RIM + 6], { ...col, lx: -0.3, ly: -0.9, ow: 2, seed: 'pd' + i, tex: (q, r) => { q.strokeStyle = 'rgba(0,0,0,0.18)'; q.lineWidth = 1; for (let k = 0; k < 3; k++) { q.beginPath(); q.moveTo(-16 + r() * 4, -RIM - 10 - k * 7); q.lineTo(16, -RIM - 10 - k * 7 + (r() - 0.5) * 2); q.stroke(); } } });
      // brass strap where it meets the rim, and a drip of bathwater
      c.fillStyle = '#c89a48'; c.fillRect(-17, -RIM + 1, 34, 4); c.fillStyle = 'rgba(255,240,200,0.7)'; c.fillRect(-17, -RIM + 1, 34, 1.2);
      for (const x of [-11, 11]) { c.fillStyle = '#3a2408'; ell(c, x, -RIM + 3, 1.4, 1.4); c.fill(); }
      if (i % 3 === 0) { c.fillStyle = 'rgba(200,236,255,0.85)'; ell(c, 8, -RIM - 31, 2.2, 3); c.fill(); c.fillStyle = '#fff'; ell(c, 7.4, -RIM - 32, 0.7, 0.9); c.fill(); }
      c.restore();
    }
    // the front rim: a painted hoop with a brass band and rivets
    c.lineWidth = 14; c.strokeStyle = INK; c.beginPath(); c.arc(cx, cy, RIM, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 11; c.strokeStyle = BLUE.base; c.beginPath(); c.arc(cx, cy, RIM, 0, Math.PI * 2); c.stroke();
    const rg = c.createRadialGradient(cx, cy, RIM - 6, cx, cy, RIM + 6); rg.addColorStop(0, 'rgba(10,20,50,0.5)'); rg.addColorStop(0.45, 'rgba(180,200,255,0.35)'); rg.addColorStop(1, 'rgba(0,0,0,0.4)');
    c.lineWidth = 11; c.strokeStyle = rg; c.beginPath(); c.arc(cx, cy, RIM, 0, Math.PI * 2); c.stroke();
    c.lineWidth = 2.6; c.strokeStyle = '#c89a48'; c.beginPath(); c.arc(cx, cy, RIM, 0, Math.PI * 2); c.stroke();
    for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; c.fillStyle = '#fff0c0'; ell(c, cx + Math.cos(a) * RIM, cy + Math.sin(a) * RIM, 1.4, 1.4); c.fill(); }
    // hub: a painted wooden boss with a brass cap and six bolts
    form(c, (q) => ell(q, cx, cy, 25, 25), [cx - 25, cy - 25, cx + 25, cy + 25], { base: '#c8383a', light: '#ffb0a0', shadow: '#3a0408', bounce: null, rim: '#ffd8d0', ow: 2, seed: 'hubw' });
    form(c, (q) => ell(q, cx, cy, 14, 14), [cx - 14, cy - 14, cx + 14, cy + 14], { ...BR, ow: 1.6, spec: 0.7, seed: 'hubb' });
    for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2 + 0.3; screw(c, cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, 2.6, a); }
    c.fillStyle = '#3a2408'; ell(c, cx, cy, 4, 4); c.fill();
  });

  // ====================================================================
  // THE MUSIC-BOX MOVEMENT behind the Queen (512x256, painted at 1024x512 and halved)
  // ====================================================================
  R('nur_comb', 512, 256, (c) => {
    c.scale(0.5, 0.5);
    const r = rng('mvmt');
    // bedplate
    form(c, (q) => rr(q, 40, 404, 944, 72, 12), [40, 404, 984, 476], { ...BR, base: '#a87a38', ow: 3, seed: 'bed', tex: (q, rr2) => grain(q, rr2, [40, 404, 984, 476], 700, 0.1) });
    c.fillStyle = 'rgba(255,240,200,0.35)'; c.fillRect(52, 410, 920, 3);
    for (const x of [80, 300, 520, 740, 950]) screw(c, x, 446, 9, x * 0.01);
    // great wheel and pinion at the left, behind the bracket (seen at a slant, so elliptical)
    const gear = (x, y, rx, ry, teeth, seed) => {
      c.save(); c.translate(x, y);
      const g = (q) => { q.beginPath(); for (let i = 0; i <= teeth * 2; i++) { const a = (i / (teeth * 2)) * Math.PI * 2, k = i % 2 ? 1 : 0.9; q.lineTo(Math.cos(a) * rx * k, Math.sin(a) * ry * k); } q.closePath(); };
      form(c, g, [-rx, -ry, rx, ry], { ...BR, ow: 2.4, seed });
      c.strokeStyle = 'rgba(58,36,8,0.7)'; c.lineWidth = 3; ell(c, 0, 0, rx * 0.68, ry * 0.68); c.stroke();
      for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; c.fillStyle = 'rgba(30,18,4,0.75)'; ell(c, Math.cos(a) * rx * 0.42, Math.sin(a) * ry * 0.42, rx * 0.13, ry * 0.13); c.fill(); }
      form(c, (q) => ell(q, 0, 0, rx * 0.18, ry * 0.18), [-rx * 0.18, -ry * 0.18, rx * 0.18, ry * 0.18], { ...BR, ow: 1.4, seed: seed + 'c' });
      c.restore();
    };
    gear(88, 196, 46, 150, 40, 'gw');
    gear(70, 352, 16, 46, 12, 'gp');
    // brackets (bearing blocks) at each end of the cylinder
    for (const x of [140, 884]) {
      const br = (q) => { q.beginPath(); q.moveTo(x - 30, 404); q.lineTo(x - 18, 150); q.quadraticCurveTo(x, 128, x + 18, 150); q.lineTo(x + 30, 404); q.closePath(); };
      form(c, br, [x - 30, 128, x + 30, 404], { ...BR, base: '#b4883e', ow: 2.6, seed: 'brk' + x });
      screw(c, x, 380, 7, 1.2);
      form(c, (q) => ell(q, x, 182, 15, 15), [x - 15, 167, x + 15, 197], { ...STEEL, ow: 2, spec: 0.6, seed: 'arb' + x });
    }
    // the pinned cylinder: a long brass drum with round ends
    const X0 = 168, X1 = 856, Y0 = 102, Y1 = 262, MY = (Y0 + Y1) / 2, ER = 24;
    const cyl = (q) => { q.beginPath(); q.moveTo(X0, Y0); q.lineTo(X1, Y0); q.ellipse(X1, MY, ER, (Y1 - Y0) / 2, 0, -Math.PI / 2, Math.PI / 2); q.lineTo(X0, Y1); q.ellipse(X0, MY, ER, (Y1 - Y0) / 2, 0, Math.PI / 2, Math.PI * 1.5); q.closePath(); };
    cyl(c); const vg = c.createLinearGradient(0, Y0, 0, Y1);
    vg.addColorStop(0, '#6a4a18'); vg.addColorStop(0.18, '#e8c070'); vg.addColorStop(0.3, '#fff4c8'); vg.addColorStop(0.42, '#d8a850'); vg.addColorStop(0.75, '#8a6024'); vg.addColorStop(1, '#2a1804');
    c.fillStyle = vg; c.fill();
    clipTo(c, cyl, () => {
      grain(c, r, [X0 - ER, Y0, X1 + ER, Y1], 1400, 0.07);
      // pins, laid along a slow helix; foreshortened toward the top and bottom of the drum
      for (let col = 0; col < 56; col++) {
        const x = X0 + 14 + col * 12;
        for (let k = 0; k < 4; k++) {
          const th = (col * 0.37 + k * 1.57 + r() * 0.5) % Math.PI; // 0 = top, PI = bottom (front half)
          const y = MY - Math.cos(th) * (Y1 - Y0) / 2 * 0.98, f = Math.sin(th);
          c.fillStyle = 'rgba(40,24,6,0.6)'; ell(c, x + 1.6, y + 1.6, 2.6 * f + 0.4, 2.6 * f + 0.4); c.fill();
          c.fillStyle = '#fffbe8'; ell(c, x, y, 2.4 * f + 0.4, 2.4 * f + 0.4); c.fill();
        }
      }
      // end caps
      for (const x of [X0, X1]) { c.fillStyle = 'rgba(60,40,10,0.55)'; ell(c, x, MY, ER, (Y1 - Y0) / 2); c.fill(); c.strokeStyle = 'rgba(255,240,200,0.5)'; c.lineWidth = 2; ell(c, x, MY, ER - 4, (Y1 - Y0) / 2 - 6); c.stroke(); }
    });
    outline(c, cyl, 3);
    // pins standing proud along the lower edge, where they pluck the comb
    c.fillStyle = '#e8e0c8'; for (let x = X0 + 20; x < X1 - 10; x += 12) if (r() < 0.55) { c.fillRect(x - 1.2, Y1 - 1, 2.4, 6); }
    // the comb: a slanted steel base, tines rising to the drum (long bass tines on the left)
    const baseY = (x) => 392 - ((x - 190) / 650) * 64;
    const base = (q) => { q.beginPath(); q.moveTo(184, baseY(184) - 8); q.lineTo(846, baseY(846) - 8); q.lineTo(846, baseY(846) + 34); q.lineTo(184, baseY(184) + 34); q.closePath(); };
    let ti = 0;
    for (let x = 196; x < 836; x += 13.5, ti++) {
      const yb = baseY(x) - 4, yt = Y1 + 7, w = 10.5;
      const tine = (q) => { q.beginPath(); q.moveTo(x - w / 2, yb); q.lineTo(x - w / 2 + 1.2, yt + 3); q.quadraticCurveTo(x, yt - 1, x + w / 2 - 1.2, yt + 3); q.lineTo(x + w / 2, yb); q.closePath(); };
      tine(c); const hg = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.35, '#c4ccd8'); hg.addColorStop(1, '#3a4250'); c.fillStyle = hg; c.fill();
      c.strokeStyle = '#141820'; c.lineWidth = 1.4; c.stroke();
      if (ti < 9) form(c, (q) => rr(q, x - 5, yb - 26, 10, 18, 3), [x - 5, yb - 26, x + 5, yb - 8], { base: '#5a5e6a', light: '#a0a8b8', shadow: '#10121a', bounce: null, ow: 1.2, seed: 'lead' + ti }); // lead tuning weights
    }
    form(c, base, [184, baseY(846) - 8, 846, baseY(184) + 34], { ...STEEL, ow: 3, seed: 'combb', tex: (q, rr2) => { grain(q, rr2, [184, 320, 846, 430], 600, 0.08); q.strokeStyle = 'rgba(255,255,255,0.35)'; q.lineWidth = 2; q.beginPath(); q.moveTo(186, baseY(186) - 4); q.lineTo(844, baseY(844) - 4); q.stroke(); } });
    for (const x of [230, 420, 610, 800]) screw(c, x, baseY(x) + 14, 8, 0.4 + x * 0.003);
    // the governor at the right: an endless screw and a little butterfly fan
    taperLine(c, [[944, 404], [944, 110]], 9, 7, INK); taperLine(c, [[944, 404], [944, 110]], 6, 4.5, '#c8ccd6');
    for (let y = 300; y < 380; y += 7) { c.strokeStyle = '#6a7080'; c.lineWidth = 2; c.beginPath(); c.moveTo(936, y); c.lineTo(952, y + 4); c.stroke(); }
    for (const d of [-1, 1]) form(c, (q) => { q.beginPath(); q.moveTo(944, 120); q.lineTo(944 + d * 52, 96); q.lineTo(944 + d * 56, 156); q.lineTo(944, 150); q.closePath(); }, [d < 0 ? 888 : 944, 96, d < 0 ? 944 : 1000, 156], { ...STEEL, base: '#b8c0cc', ow: 2, seed: 'fan' + d });
    form(c, (q) => ell(q, 944, 132, 8, 8), [936, 124, 952, 140], { ...BR, ow: 1.4, seed: 'fanhub' });
  });

  // ====================================================================
  // THE GIANT MUSIC BOX'S SIDE (512x320, painted at 1024x640 and halved)
  // ====================================================================
  R('nur_musicbox_big', 512, 320, (c) => {
    c.scale(0.5, 0.5);
    const r = rng('mbbig');
    const woodTex = (x0, y0, x1, y1) => (q, rr2) => { for (let i = 0; i < 90; i++) { const x = x0 + rr2() * (x1 - x0); q.strokeStyle = rr2() < 0.5 ? 'rgba(255,190,200,0.06)' : 'rgba(0,0,0,0.14)'; q.lineWidth = 1 + rr2() * 3; q.beginPath(); q.moveTo(x, y0); q.bezierCurveTo(x + (rr2() - 0.5) * 30, y0 + (y1 - y0) * 0.3, x + (rr2() - 0.5) * 30, y0 + (y1 - y0) * 0.7, x + (rr2() - 0.5) * 20, y1); q.stroke(); } grain(q, rr2, [x0, y0, x1, y1], 900, 0.06); };
    // bun feet and plinth
    for (const x of [96, 928]) form(c, (q) => { q.beginPath(); q.ellipse(x, 606, 50, 30, 0, 0, Math.PI * 2); }, [x - 50, 576, x + 50, 636], { ...ROSE, ow: 3, seed: 'foot' + x });
    form(c, (q) => rr(q, 24, 556, 976, 44, 10), [24, 556, 1000, 600], { ...ROSE, base: '#4a1826', ow: 3, seed: 'plinth', tex: woodTex(24, 556, 1000, 600) });
    // body
    form(c, (q) => rr(q, 36, 82, 952, 484, 14), [36, 82, 988, 566], { ...ROSE, ow: 3.5, seed: 'body', tex: woodTex(36, 82, 988, 566) });
    // lid, overhanging, with a moulded edge
    form(c, (q) => rr(q, 6, 26, 1012, 66, 16), [6, 26, 1018, 92], { ...ROSE, base: '#6a2838', ow: 3.5, seed: 'lid', tex: woodTex(6, 26, 1018, 92) });
    c.strokeStyle = 'rgba(255,200,210,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(24, 40); c.lineTo(1000, 40); c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(16, 74); c.lineTo(1008, 74); c.stroke();
    c.strokeStyle = '#c89a48'; c.lineWidth = 4; c.beginPath(); c.moveTo(16, 84); c.lineTo(1008, 84); c.stroke();
    // gilt frame
    c.lineJoin = 'round';
    c.strokeStyle = INK; c.lineWidth = 16; rr(c, 76, 124, 872, 410, 18); c.stroke();
    const gg = c.createLinearGradient(0, 124, 0, 534); gg.addColorStop(0, '#fff0b8'); gg.addColorStop(0.5, '#c89a48'); gg.addColorStop(1, '#6a4a18');
    c.strokeStyle = gg; c.lineWidth = 11; rr(c, 76, 124, 872, 410, 18); c.stroke();
    for (let i = 0; i < 60; i++) { const t = i / 60, x = 80 + t * 864; c.fillStyle = 'rgba(255,250,220,0.8)'; ell(c, x, 124, 2, 2); c.fill(); ell(c, x, 534, 2, 2); c.fill(); }
    // satinwood panel
    form(c, (q) => rr(q, 92, 140, 840, 378, 12), [92, 140, 932, 518], { base: '#b88a58', light: '#ffe0b0', shadow: '#4a2a10', bounce: null, ow: 2, seed: 'panel', tex: (q, rr2) => { for (let i = 0; i < 140; i++) { const y = 140 + rr2() * 378; q.strokeStyle = rr2() < 0.5 ? 'rgba(255,240,210,0.12)' : 'rgba(90,50,20,0.14)'; q.lineWidth = 1 + rr2() * 2; q.beginPath(); q.moveTo(92, y); q.bezierCurveTo(360, y + (rr2() - 0.5) * 16, 660, y + (rr2() - 0.5) * 16, 932, y + (rr2() - 0.5) * 10); q.stroke(); } } });
    c.strokeStyle = 'rgba(40,16,8,0.7)'; c.lineWidth = 3; rr(c, 108, 156, 808, 346, 8); c.stroke();
    c.strokeStyle = 'rgba(255,236,200,0.6)'; c.lineWidth = 1.5; rr(c, 114, 162, 796, 334, 6); c.stroke();
    // marquetry vines on both sides of the cartouche (dark rosewood inlay, mirrored)
    for (const d of [-1, 1]) {
      c.save(); c.translate(512, 0); c.scale(d, 1);
      const stem = curve([[150, 470], [210, 330], [330, 380], [380, 240], [300, 190]], 30);
      taperLine(c, stem, 7, 3, '#4a1c1a');
      const leaves = [6, 10, 14, 18, 22, 26];
      leaves.forEach((i, k) => {
        const [x, y] = stem[i], [nx, ny] = stem[i + 1], a = Math.atan2(ny - y, nx - x) + (k % 2 ? 1 : -1) * 0.9;
        c.save(); c.translate(x, y); c.rotate(a);
        c.fillStyle = '#5a2620'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(18, -12, 38, 0); c.quadraticCurveTo(18, 12, 0, 0); c.fill();
        c.strokeStyle = 'rgba(255,220,180,0.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(2, 0); c.lineTo(34, 0); c.stroke();
        c.restore();
      });
      // flowers: five-petal rosettes in pale holly and a brass pin at the centre
      for (const [x, y, s] of [[300, 190, 1], [210, 330, 0.8], [380, 240, 0.7], [150, 470, 0.9]]) {
        for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2; c.fillStyle = '#f0e2c8'; ell(c, x + Math.cos(a) * 11 * s, y + Math.sin(a) * 11 * s, 9 * s, 6 * s, a); c.fill(); c.strokeStyle = 'rgba(90,40,20,0.6)'; c.lineWidth = 1; c.stroke(); }
        c.fillStyle = '#c89a48'; ell(c, x, y, 5 * s, 5 * s); c.fill();
      }
      // a brass quaver set into the veneer
      c.fillStyle = '#c89a48'; c.strokeStyle = '#c89a48'; c.lineWidth = 4; ell(c, 400, 450, 11, 8, -0.4); c.fill(); c.beginPath(); c.moveTo(410, 448); c.lineTo(410, 396); c.quadraticCurveTo(426, 410, 432, 426); c.stroke();
      // corner mounts
      c.save(); c.translate(408, 168);
      for (const [sx, sy] of [[1, 1]]) { c.scale(sx, sy); c.strokeStyle = '#d8aa58'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 60); c.quadraticCurveTo(0, 0, 60, 0); c.stroke(); c.beginPath(); c.arc(22, 22, 12, Math.PI, Math.PI * 2.4); c.stroke(); }
      c.restore();
      c.restore();
    }
    // the cartouche: a night-blue oval with a porcelain dancer on a little stage
    const OX = 512, OY = 330, ORX = 160, ORY = 140;
    const oval = (q) => ell(q, OX, OY, ORX, ORY);
    clipTo(c, oval, () => {
      const sky = c.createLinearGradient(0, OY - ORY, 0, OY + ORY); sky.addColorStop(0, '#0e1838'); sky.addColorStop(0.7, '#2a3a70'); sky.addColorStop(1, '#4a3a6a');
      c.fillStyle = sky; c.fillRect(OX - ORX, OY - ORY, ORX * 2, ORY * 2);
      for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(255,244,210,${0.3 + r() * 0.6})`; ell(c, OX - ORX + r() * ORX * 2, OY - ORY + r() * ORY * 1.3, 1 + r() * 1.8, 1 + r() * 1.8); c.fill(); }
      glow(c, OX, OY + 10, 120, '#ffd9a0', 0.35);
      // stage boards and red swagged curtains
      form(c, (q) => { q.beginPath(); q.ellipse(OX, OY + 112, 140, 34, 0, 0, Math.PI * 2); }, [OX - 140, OY + 78, OX + 140, OY + 146], { base: '#7a4a2a', light: '#e0a070', shadow: '#1a0804', bounce: null, ow: 2, seed: 'stage' });
      for (const d of [-1, 1]) form(c, (q) => { q.beginPath(); q.moveTo(OX + d * 170, OY - 150); q.lineTo(OX + d * 30, OY - 150); q.quadraticCurveTo(OX + d * 80, OY - 80, OX + d * 120, OY - 40); q.quadraticCurveTo(OX + d * 130, OY + 40, OX + d * 150, OY + 130); q.lineTo(OX + d * 180, OY + 130); q.closePath(); }, [OX - 180, OY - 150, OX + 180, OY + 130], { base: '#a01e30', light: '#ff8a90', shadow: '#2a0208', bounce: null, lx: d * -0.4, ow: 2, seed: 'cur' + d, tex: (q) => { q.strokeStyle = 'rgba(40,0,8,0.35)'; q.lineWidth = 3; for (let k = 0; k < 4; k++) { q.beginPath(); q.moveTo(OX + d * (160 - k * 26), OY - 150); q.quadraticCurveTo(OX + d * (120 - k * 10), OY, OX + d * (170 - k * 6), OY + 130); q.stroke(); } } });
      // the dancer: arms in a ring above her head, one leg lifted behind
      const fx = OX, fy = OY + 104; // toe on the stage
      const sk = { base: PORC, light: '#ffffff', shadow: '#8a7a88', bounce: '#9a9ad0', rim: '#ffffff', ow: 1.8 };
      taperLine(c, [[fx, fy], [fx - 2, fy - 40], [fx - 4, fy - 74]], 7, 10, INK); taperLine(c, [[fx, fy - 1], [fx - 2, fy - 40], [fx - 4, fy - 74]], 4.5, 7.5, '#f4dede'); // standing leg
      taperLine(c, curve([[fx - 2, fy - 74], [fx + 30, fy - 70], [fx + 46, fy - 52]], 8), 9, 5, INK); taperLine(c, curve([[fx - 2, fy - 74], [fx + 30, fy - 70], [fx + 46, fy - 52]], 8), 6.5, 3.5, '#f4dede'); // lifted leg
      form(c, (q) => { q.beginPath(); q.ellipse(fx - 4, fy - 78, 44, 11, -0.08, 0, Math.PI * 2); }, [fx - 48, fy - 89, fx + 40, fy - 67], { base: '#f2a8c0', light: '#ffe8f0', shadow: '#8a3a5a', bounce: null, ow: 1.6, seed: 'tutu', tex: (q) => { q.strokeStyle = 'rgba(140,50,80,0.35)'; q.lineWidth = 1; for (let k = -40; k < 40; k += 6) { q.beginPath(); q.moveTo(fx - 4 + k, fy - 82); q.lineTo(fx - 4 + k * 1.1, fy - 70); q.stroke(); } } });
      form(c, (q) => blobPath(q, [[fx - 12, fy - 82], [fx - 9, fy - 112], [fx + 1, fy - 118], [fx + 7, fy - 110], [fx + 6, fy - 82]]), [fx - 12, fy - 118, fx + 7, fy - 82], { ...sk, base: '#f2a8c0', light: '#ffe8f0', shadow: '#8a3a5a', seed: 'bodice' });
      for (const d of [-1, 1]) taperLine(c, curve([[fx - 2 + d * 6, fy - 112], [fx + d * 30, fy - 140], [fx + d * 8, fy - 166]], 10), 5, 3, '#f4dede');
      form(c, (q) => ell(q, fx - 1, fy - 128, 9, 10), [fx - 10, fy - 138, fx + 8, fy - 118], { ...sk, seed: 'dhead' });
      form(c, (q) => ell(q, fx - 2, fy - 139, 6, 4.5), [fx - 8, fy - 143, fx + 4, fy - 135], { base: '#3a2420', light: '#8a6050', shadow: '#0a0404', bounce: null, ow: 1.2, seed: 'bun' });
    });
    c.strokeStyle = INK; c.lineWidth = 18; oval(c); c.stroke();
    const og = c.createLinearGradient(0, OY - ORY, 0, OY + ORY); og.addColorStop(0, '#fff2c0'); og.addColorStop(0.5, '#c89a48'); og.addColorStop(1, '#5a3a10');
    c.strokeStyle = og; c.lineWidth = 12; oval(c); c.stroke();
    for (let k = 0; k < 48; k++) { const a = (k / 48) * Math.PI * 2; c.fillStyle = 'rgba(255,250,220,0.85)'; ell(c, OX + Math.cos(a) * ORX, OY + Math.sin(a) * ORY, 2.4, 2.4); c.fill(); }
    // escutcheon and keyhole
    form(c, (q) => { q.beginPath(); q.moveTo(512, 492); q.quadraticCurveTo(540, 506, 532, 540); q.quadraticCurveTo(512, 556, 492, 540); q.quadraticCurveTo(484, 506, 512, 492); q.closePath(); }, [484, 492, 540, 556], { ...BR, ow: 2.4, seed: 'esc', spec: 0.5 });
    c.fillStyle = '#12040a'; ell(c, 512, 516, 6, 6); c.fill(); poly(c, [[508, 518], [516, 518], [519, 538], [505, 538]]); c.fill();
  });

  // ====================================================================
  // THE LITTLE MUSIC BOX (160x140, origin bottom-centre) and its crank (40x16, pivot at x=8)
  // ====================================================================
  R('musicbox', 160, 140, (c) => {
    // the open lid standing behind, a mirror inside it
    form(c, (q) => { q.beginPath(); q.moveTo(28, 10); q.lineTo(132, 10); q.lineTo(140, 84); q.lineTo(20, 84); q.closePath(); }, [20, 10, 140, 84], { ...ROSE, ow: 2, seed: 'lid' });
    const mir = (q) => { q.beginPath(); q.moveTo(36, 18); q.lineTo(124, 18); q.lineTo(130, 78); q.lineTo(30, 78); q.closePath(); };
    mir(c); const mg = c.createLinearGradient(30, 18, 130, 78); mg.addColorStop(0, '#d8e4f8'); mg.addColorStop(0.45, '#5a6a90'); mg.addColorStop(0.55, '#8a9ac0'); mg.addColorStop(1, '#2a3050'); c.fillStyle = mg; c.fill();
    clipTo(c, mir, () => { c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 6; c.beginPath(); c.moveTo(40, 70); c.lineTo(70, 22); c.moveTo(56, 74); c.lineTo(80, 36); c.stroke(); });
    c.strokeStyle = '#c89a48'; c.lineWidth = 2.4; mir(c); c.stroke();
    glow(c, 80, 56, 46, '#ffd9a0', 0.45);
    // velvet well along the top of the box
    form(c, (q) => rr(q, 18, 80, 124, 10, 3), [18, 80, 142, 90], { base: '#8a1a2a', light: '#ff7a8a', shadow: '#20040a', bounce: null, ow: 1.4, seed: 'velv' });
    // the dancer on her spinning post
    form(c, (q) => rr(q, 75, 70, 10, 14, 2), [75, 70, 85, 84], { ...BR, ow: 1.2, seed: 'post' });
    const sk = { base: PORC, light: '#ffffff', shadow: '#8a7a88', bounce: '#9a9ad0', rim: '#ffffff', ow: 1 };
    taperLine(c, [[80, 70], [79, 58]], 2.6, 3.2, '#f4dede'); // leg on the post
    taperLine(c, curve([[79, 58], [88, 58], [92, 64]], 5), 3, 2, '#f4dede'); // the other, lifted
    form(c, (q) => { q.beginPath(); q.ellipse(80, 56, 14, 3.6, 0, 0, Math.PI * 2); }, [66, 52, 94, 60], { base: '#f2a8c0', light: '#ffe8f0', shadow: '#8a3a5a', bounce: null, ow: 1, seed: 'stutu' });
    form(c, (q) => blobPath(q, [[76, 55], [77, 45], [80, 42], [83, 45], [84, 55]]), [76, 42, 84, 55], { ...sk, base: '#f2a8c0', light: '#ffe8f0', shadow: '#8a3a5a', seed: 'sbod' });
    for (const d of [-1, 1]) taperLine(c, curve([[80 + d * 3, 45], [80 + d * 11, 36], [80 + d * 3, 28]], 6), 2.2, 1.4, '#f4dede');
    form(c, (q) => ell(q, 80, 38, 3.6, 4), [76, 34, 84, 42], { ...sk, seed: 'shead' });
    c.fillStyle = '#3a2420'; ell(c, 80, 34, 2.4, 1.8); c.fill();
    // the box: rosewood, gilt edging, a keyhole, a painted band of hearts
    form(c, (q) => rr(q, 14, 88, 132, 42, 6), [14, 88, 146, 130], { ...ROSE, ow: 2, seed: 'mbody', tex: (q, rr2) => grain(q, rr2, [14, 88, 146, 130], 260, 0.07) });
    c.strokeStyle = '#c89a48'; c.lineWidth = 2.2; rr(c, 20, 94, 120, 30, 4); c.stroke();
    c.strokeStyle = 'rgba(255,240,200,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(16, 90.5); c.lineTo(144, 90.5); c.stroke();
    for (let x = 34; x < 128; x += 14) { if (Math.abs(x - 80) < 8) continue; c.fillStyle = '#f2a8c0'; const hx = x, hy = 109; c.beginPath(); c.moveTo(hx, hy + 3); c.bezierCurveTo(hx - 5, hy - 1, hx - 2, hy - 5, hx, hy - 2); c.bezierCurveTo(hx + 2, hy - 5, hx + 5, hy - 1, hx, hy + 3); c.fill(); }
    form(c, (q) => ell(q, 80, 109, 5, 6), [75, 103, 85, 115], { ...BR, ow: 1, seed: 'esc' });
    c.fillStyle = '#12040a'; ell(c, 80, 107.5, 1.4, 1.4); c.fill(); c.fillRect(79.3, 108, 1.4, 4);
    // bun feet
    for (const x of [26, 134]) form(c, (q) => ell(q, x, 132, 9, 6), [17, 126, x + 9, 138], { ...BR, ow: 1.2, seed: 'ft' + x });
    // the bushing the crank turns in, on the right side
    form(c, (q) => ell(q, 145, 106, 5, 6), [140, 100, 150, 112], { ...BR, ow: 1.2, seed: 'bush' });
  });
  R('mb_crank', 40, 16, (c) => {
    form(c, (q) => { q.beginPath(); q.moveTo(5, 6); q.lineTo(28, 6.5); q.lineTo(28, 9.5); q.lineTo(5, 10); q.closePath(); }, [5, 6, 28, 10], { ...BR, ow: 1, bounce: null, seed: 'arm' });
    form(c, (q) => ell(q, 8, 8, 3.6, 3.6), [4.4, 4.4, 11.6, 11.6], { ...BR, ow: 1, bounce: null, seed: 'boss' });
    form(c, (q) => ell(q, 31, 8, 5.4, 6), [25.6, 2, 36.4, 14], { base: '#f0e2c8', light: '#ffffff', shadow: '#6a5a40', bounce: null, ow: 1, spec: 0.7, seed: 'knob' });
  });

  // ====================================================================
  // DUNK: a classic rubber duck, sitting high in the water (rig: rigs.ts duckRig)
  // ====================================================================
  const DUCK = { base: '#f2c030', light: '#fffad0', shadow: '#9a5a04', bounce: '#e0a060', rim: '#fffbe8', ow: 1.6, bounceA: 0.3 };
  R('duck_body', 64, 40, (c) => {
    // tail flicked up at the back, a dip behind the neck, a round chest, a flat bottom that floats
    const b = (q) => { q.beginPath(); q.moveTo(3, 7); q.quadraticCurveTo(10, 10, 14, 15); q.quadraticCurveTo(26, 13, 40, 10); q.quadraticCurveTo(54, 6, 60, 16); q.quadraticCurveTo(64, 28, 54, 35); q.quadraticCurveTo(34, 39, 14, 35); q.quadraticCurveTo(4, 30, 4, 20); q.quadraticCurveTo(3, 12, 3, 7); q.closePath(); };
    form(c, b, [3, 6, 63, 38], { ...DUCK, seed: 'dkb2', lx: -0.3, ly: -0.8, spec: 0.35 });
    clipTo(c, b, () => { c.fillStyle = 'rgba(255,255,255,0.5)'; ell(c, 30, 16, 12, 2.4, -0.1); c.fill(); });
  });
  R('duck_wing', 26, 18, (c) => {
    const w = (q) => { q.beginPath(); q.moveTo(2, 5); q.quadraticCurveTo(14, 1, 24, 6); q.quadraticCurveTo(22, 11, 17, 14); q.quadraticCurveTo(14, 17, 10, 14); q.quadraticCurveTo(6, 15, 4, 11); q.closePath(); };
    form(c, w, [2, 1, 25, 16], { ...DUCK, base: '#e8b020', seed: 'dkw2' });
    c.strokeStyle = 'rgba(130,70,4,0.6)'; c.lineWidth = 0.9; for (const [x, y] of [[9, 12], [14, 13], [19, 10]]) { c.beginPath(); c.moveTo(x - 4, y - 5); c.quadraticCurveTo(x, y - 1, x, y + 1); c.stroke(); }
  });
  R('duck_head', 34, 34, (c) => {
    const h = (q) => { q.beginPath(); q.ellipse(17, 17, 13.5, 13, 0, 0, Math.PI * 2); };
    form(c, h, [3.5, 4, 30.5, 30], { ...DUCK, seed: 'dkh2', spec: 0.6 });
    // a little curl on top, an eye with a shine, a pink cheek
    c.strokeStyle = '#e8a818'; c.lineWidth = 2.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(13, 5); c.quadraticCurveTo(12, 0.8, 16.5, 1.5); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 0.8; c.beginPath(); c.moveTo(13, 5); c.quadraticCurveTo(12, 0.8, 16.5, 1.5); c.stroke();
    c.fillStyle = '#10080c'; ell(c, 21.5, 13.5, 2.8, 3.3); c.fill(); c.fillStyle = '#ffffff'; ell(c, 22.4, 12.3, 1, 1.1); c.fill(); ell(c, 20.8, 15.2, 0.4, 0.4); c.fill();
    c.fillStyle = 'rgba(255,130,110,0.45)'; ell(c, 22, 21.5, 3.6, 2.2); c.fill();
  });
  R('duck_beak', 20, 12, (c) => {
    const top = (q) => { q.beginPath(); q.moveTo(1, 2.5); q.quadraticCurveTo(12, 0.5, 19, 4.5); q.quadraticCurveTo(12, 6.5, 1, 6.5); q.closePath(); };
    const bot = (q) => { q.beginPath(); q.moveTo(1, 6.3); q.quadraticCurveTo(10, 6.6, 16, 6.2); q.quadraticCurveTo(10, 10.5, 1, 9.5); q.closePath(); };
    form(c, bot, [1, 6, 16, 10.5], { base: '#d8601c', light: '#ffb070', shadow: '#5a1804', bounce: null, ow: 1, seed: 'bk2' });
    form(c, top, [1, 0.5, 19, 6.5], { base: '#f58a2c', light: '#ffd0a0', shadow: '#6a2008', bounce: null, ow: 1, seed: 'bk1', spec: 0.5 });
    c.fillStyle = 'rgba(90,30,8,0.7)'; ell(c, 6, 3.2, 0.8, 0.5); c.fill();
  });

  // ====================================================================
  // NIB: a travelling mouse in a waistcoat (rig: rigs.ts mouseRig)
  // ====================================================================
  const FUR = { base: '#857470', light: '#e0d0c8', shadow: '#2a2020', bounce: '#7a7aa0', rim: '#f8e8e0', ow: 1.6 };
  R('mouse_body', 48, 40, (c) => {
    const b = (q) => { q.beginPath(); q.moveTo(8, 38); q.quadraticCurveTo(2, 26, 9, 15); q.quadraticCurveTo(18, 4, 32, 3); q.quadraticCurveTo(43, 4, 44, 14); q.quadraticCurveTo(47, 28, 40, 37); q.quadraticCurveTo(24, 40, 8, 38); q.closePath(); };
    form(c, b, [2, 3, 47, 39], { ...FUR, seed: 'nibb', tex: (q, r) => { q.strokeStyle = 'rgba(255,240,230,0.12)'; q.lineWidth = 0.8; for (let i = 0; i < 40; i++) { const x = 6 + r() * 38, y = 6 + r() * 30; q.beginPath(); q.moveTo(x, y); q.lineTo(x + 1.5, y + 2.5); q.stroke(); } } });
    clipTo(c, b, () => {
      // cream belly fur showing at the front
      c.fillStyle = 'rgba(240,226,210,0.9)'; ell(c, 41, 26, 7, 11); c.fill();
      // a patched teal waistcoat that follows the body, open at the front
      const vest = (q) => { q.beginPath(); q.moveTo(14, 12); q.quadraticCurveTo(24, 5, 36, 6); q.lineTo(38, 18); q.quadraticCurveTo(36, 30, 39, 40); q.lineTo(10, 40); q.quadraticCurveTo(6, 26, 14, 12); q.closePath(); };
      form(c, vest, [6, 5, 39, 40], { base: '#2e5a64', light: '#8ac0c8', shadow: '#08161c', bounce: null, rim: '#c8f0f0', ow: 1.2, seed: 'vest' });
      form(c, (q) => rr(q, 17, 22, 8, 8, 1.5), [17, 22, 25, 30], { base: '#a86a3a', light: '#f0c08a', shadow: '#3a1a08', bounce: null, ow: 0.8, seed: 'patch' });
      c.strokeStyle = 'rgba(255,240,200,0.7)'; c.lineWidth = 0.6; c.setLineDash([1.2, 1.2]); rr(c, 18, 23, 6, 6, 1); c.stroke(); c.setLineDash([]);
      for (const y of [16, 24, 32]) form(c, (q) => ell(q, 36.5, y, 1.7, 1.7), [34.8, y - 1.7, 38.2, y + 1.7], { ...BR, ow: 0.6, bounce: null, seed: 'vb' + y });
    });
    // a little arm holding the pack strap, and feet
    taperLine(c, curve([[30, 14], [27, 24], [33, 29]], 6), 5.5, 4, INK); taperLine(c, curve([[30, 14], [27, 24], [33, 29]], 6), 3.8, 2.6, '#857470');
    c.fillStyle = '#e8b0b4'; ell(c, 34, 29, 2.2, 1.8); c.fill();
    for (const x of [16, 33]) form(c, (q) => ell(q, x, 37.5, 5.5, 2.3), [x - 5.5, 35, x + 5.5, 40], { base: '#e8a8b0', light: '#fff0f0', shadow: '#6a3038', bounce: null, ow: 1, seed: 'ft' + x });
  });
  R('mouse_head', 40, 36, (c) => {
    // skull at the back, tapering to a long snout; the pivot (12,25) sits on the shoulders
    const h = (q) => { q.beginPath(); q.moveTo(5, 24); q.quadraticCurveTo(2, 10, 14, 6); q.quadraticCurveTo(24, 3, 30, 12); q.quadraticCurveTo(35, 17, 38, 21); q.quadraticCurveTo(36, 26, 28, 27); q.quadraticCurveTo(18, 32, 5, 24); q.closePath(); };
    form(c, h, [2, 3, 38, 31], { ...FUR, seed: 'nibh', spec: 0.15 });
    clipTo(c, h, () => { c.fillStyle = 'rgba(240,226,210,0.85)'; ell(c, 26, 26, 10, 4, -0.2); c.fill(); });
    c.fillStyle = '#e88a98'; ell(c, 37.5, 21, 2.6, 2.3); c.fill(); c.strokeStyle = INK; c.lineWidth = 0.8; ell(c, 37.5, 21, 2.6, 2.3); c.stroke();
    c.fillStyle = '#fff'; ell(c, 37, 20.2, 0.7, 0.5); c.fill();
    c.fillStyle = '#100c10'; ell(c, 24, 14, 2.8, 3.2); c.fill(); c.fillStyle = '#ffffff'; ell(c, 25, 12.8, 1, 1.1); c.fill();
    c.strokeStyle = 'rgba(30,20,20,0.6)'; c.lineWidth = 0.9; c.beginPath(); c.arc(24, 14, 4.2, Math.PI * 1.1, Math.PI * 1.6); c.stroke(); // brow
    c.fillStyle = 'rgba(240,140,150,0.4)'; ell(c, 28, 21, 3, 1.8); c.fill();
    c.strokeStyle = 'rgba(255,245,240,0.6)'; c.lineWidth = 0.6; for (const d of [-3, 0, 3]) { c.beginPath(); c.moveTo(34, 22); c.quadraticCurveTo(37, 22 + d * 0.5, 40, 21 + d); c.stroke(); }
  });
  R('mouse_ear', 20, 20, (c) => {
    form(c, (q) => ell(q, 10, 10, 8.5, 8.5), [1.5, 1.5, 18.5, 18.5], { ...FUR, ow: 1.2, seed: 'nibe' });
    c.fillStyle = 'rgba(236,150,162,0.85)'; ell(c, 10.5, 10.5, 5.2, 5.4); c.fill();
    c.fillStyle = 'rgba(120,40,50,0.3)'; ell(c, 11.5, 11.5, 3, 3.4); c.fill();
  });
  R('mouse_tail', 40, 16, (c) => {
    const pts = curve([[39, 4], [26, 16], [14, 0], [2, 9]], 18);
    taperLine(c, pts, 3.6, 1.6, INK); taperLine(c, pts, 2.4, 0.8, '#d8a0a8');
  });

  // ====================================================================
  // SHELF DOLLS' DRESSES (36x44; the head sits on top)
  // ====================================================================
  R('doll_body', 36, 44, (c) => {
    const LAV = { base: '#8a6aa0', light: '#e8d0f8', shadow: '#24102e', bounce: '#7a7ab8', rim: '#f8ecff', ow: 1.4 };
    // skirt: flares out to a ruffled hem
    const skirt = (q) => { q.beginPath(); q.moveTo(11, 16); q.lineTo(25, 16); q.quadraticCurveTo(31, 28, 34, 39); q.quadraticCurveTo(18, 43, 2, 39); q.quadraticCurveTo(5, 28, 11, 16); q.closePath(); };
    form(c, skirt, [2, 16, 34, 43], { ...LAV, seed: 'skirt', tex: (q) => { q.strokeStyle = 'rgba(30,10,40,0.3)'; q.lineWidth = 1; for (const x of [8, 14, 22, 28]) { q.beginPath(); q.moveTo(18 + (x - 18) * 0.4, 18); q.lineTo(x, 41); q.stroke(); } } });
    // lace hem
    c.fillStyle = '#f6eef2'; for (let x = 3; x < 34; x += 3.4) { ell(c, x, 40 + Math.sin(x) * 0.4, 2, 1.8); c.fill(); }
    c.strokeStyle = 'rgba(120,90,110,0.6)'; c.lineWidth = 0.6; for (let x = 3; x < 34; x += 3.4) { ell(c, x, 40, 2, 1.8); c.stroke(); }
    // bodice, puff sleeves, a lace collar and a sash with a bow
    form(c, (q) => rr(q, 11, 4, 14, 14, 4), [11, 4, 25, 18], { ...LAV, seed: 'bod' });
    for (const d of [-1, 1]) form(c, (q) => ell(q, 18 + d * 9, 8, 5, 4.5), [18 + d * 9 - 5, 3.5, 18 + d * 9 + 5, 12.5], { ...LAV, base: '#9a7ab0', seed: 'puff' + d });
    form(c, (q) => { q.beginPath(); q.moveTo(10, 3); q.quadraticCurveTo(18, 9, 26, 3); q.quadraticCurveTo(18, 1, 10, 3); q.closePath(); }, [10, 1, 26, 9], { base: '#f6eef2', light: '#ffffff', shadow: '#8a7a88', bounce: null, ow: 0.9, seed: 'col' });
    form(c, (q) => rr(q, 10.5, 15, 15, 3.4, 1.4), [10.5, 15, 25.5, 18.4], { base: '#c84a6a', light: '#ff9ab0', shadow: '#3a0818', bounce: null, ow: 0.8, seed: 'sash' });
    for (const d of [-1, 1]) { c.fillStyle = '#c84a6a'; poly(c, [[25, 16.5], [25 + 4, 16.5 + d * 3], [25 + 4, 16.5 - d * 0.4]]); c.fill(); }
    // porcelain hands at her sides
    for (const d of [-1, 1]) { taperLine(c, [[18 + d * 11, 11], [18 + d * 12, 20]], 3.2, 2.6, '#9a7ab0'); form(c, (q) => ell(q, 18 + d * 12, 22, 2.3, 2.6), [18 + d * 12 - 2.3, 19.4, 18 + d * 12 + 2.3, 24.6], { base: PORC, light: '#ffffff', shadow: '#8a7a88', bounce: null, ow: 0.8, seed: 'hd' + d }); }
  });

  // ====================================================================
  // THE WIND-UP MOUSE (tin; 46x28), and TALLOW'S LOST SLIPPER (44x24)
  // ====================================================================
  R('wm_body', 46, 28, (c) => {
    const TIN = { base: '#a8b0bc', light: '#ffffff', shadow: '#2a3040', bounce: '#7a86b0', rim: '#ffffff', ow: 1.4 };
    const b = (q) => { q.beginPath(); q.moveTo(2, 23); q.quadraticCurveTo(3, 9, 16, 5); q.quadraticCurveTo(30, 2, 38, 10); q.quadraticCurveTo(44, 15, 45, 19); q.quadraticCurveTo(42, 23, 34, 24); q.lineTo(2, 24); q.closePath(); };
    form(c, b, [2, 3, 45, 24], { ...TIN, seed: 'wmb2', spec: 0.55 });
    clipTo(c, b, () => {
      // lithographed stripes and a pressed seam with rivets
      c.fillStyle = 'rgba(200,50,60,0.75)'; c.beginPath(); c.moveTo(12, 0); c.lineTo(17, 0); c.lineTo(15, 28); c.lineTo(10, 28); c.fill(); c.beginPath(); c.moveTo(21, 0); c.lineTo(24, 0); c.lineTo(22, 28); c.lineTo(19, 28); c.fill();
      c.strokeStyle = 'rgba(30,36,50,0.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(3, 17); c.quadraticCurveTo(24, 12, 44, 18); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.8)'; for (const x of [7, 28, 36]) { ell(c, x, 15.6 - (x - 24) * 0.04, 0.9, 0.9); c.fill(); }
    });
    c.fillStyle = '#e88a98'; ell(c, 44.5, 18.5, 2, 1.9); c.fill(); c.strokeStyle = INK; c.lineWidth = 0.7; ell(c, 44.5, 18.5, 2, 1.9); c.stroke();
    c.fillStyle = '#10141c'; ell(c, 36, 12, 2, 2.2); c.fill(); c.fillStyle = '#ffffff'; ell(c, 36.6, 11.2, 0.7, 0.7); c.fill();
    c.strokeStyle = 'rgba(30,30,40,0.8)'; c.lineWidth = 0.6; for (const d of [-2, 0, 2]) { c.beginPath(); c.moveTo(42, 19); c.lineTo(46, 18 + d); c.stroke(); }
  });
  R('slipper', 44, 24, (c) => {
    // a fluffy pink slipper seen from the side: rubber sole, plush upper, open at the heel, a pompom
    form(c, (q) => { q.beginPath(); q.moveTo(2, 19); q.quadraticCurveTo(20, 21, 40, 18); q.quadraticCurveTo(44, 19, 42, 22); q.quadraticCurveTo(22, 24.5, 3, 22.5); q.closePath(); }, [2, 18, 44, 24], { base: '#e8dccc', light: '#ffffff', shadow: '#6a5a4a', bounce: null, ow: 1, seed: 'sole' });
    const up = (q) => { q.beginPath(); q.moveTo(3, 19.5); q.quadraticCurveTo(2, 12, 8, 10); q.quadraticCurveTo(12, 14, 18, 12); q.quadraticCurveTo(26, 5, 36, 9); q.quadraticCurveTo(43, 13, 40, 18.5); q.quadraticCurveTo(22, 20.5, 3, 19.5); q.closePath(); };
    form(c, up, [2, 5, 43, 20.5], { base: '#e88aa0', light: '#ffe0e8', shadow: '#7a3044', bounce: '#9a7ab8', rim: '#ffffff', ow: 1.2, seed: 'plush', tex: (q, r) => { for (let i = 0; i < 70; i++) { q.fillStyle = r() < 0.5 ? 'rgba(255,240,245,0.35)' : 'rgba(120,40,60,0.2)'; ell(q, 3 + r() * 40, 6 + r() * 14, 0.8, 0.8); q.fill(); } } });
    // the opening at the heel
    form(c, (q) => { q.beginPath(); q.ellipse(10, 11.5, 5.5, 2.2, -0.15, 0, Math.PI * 2); }, [4.5, 9, 15.5, 14], { base: '#5a1a2a', light: '#a04a60', shadow: '#1a0208', bounce: null, ow: 0.8, seed: 'hole' });
    form(c, (q) => ell(q, 30, 7.5, 5, 4.2), [25, 3.3, 35, 11.7], { base: '#ffffff', light: '#ffffff', shadow: '#a8a0b8', bounce: null, ow: 1, seed: 'pom', tex: (q, r) => { for (let i = 0; i < 20; i++) { q.strokeStyle = 'rgba(150,140,170,0.35)'; q.lineWidth = 0.5; const a = r() * 6.3; q.beginPath(); q.moveTo(30, 7.5); q.lineTo(30 + Math.cos(a) * 5, 7.5 + Math.sin(a) * 4.2); q.stroke(); } } });
    c.fillStyle = 'rgba(70,50,40,0.45)'; blobPath(c, [[4, 19], [14, 20], [24, 21.5], [10, 21.8]]); c.fill(); // mud
  });
})();

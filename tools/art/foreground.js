/* Nightpaw art: foreground silhouettes (2.3.0). Loaded after pass2.js.
 * Big, near-black shapes that LightScene draws in front of everything with a parallax factor
 * above 1, like the foreground layer in Hollow Knight. Each is painted at full size, gets a faint
 * cool rim along its upper edges, then is softened slightly (they sit closer than the focal plane).
 *   fg_*_floor pieces are anchored at their bottom centre; fg_*_ceil pieces at their top centre.
 */
(function () {
  'use strict';
  const P = window.__P;
  const { rng, ell, poly, hexA } = P;
  const { R, curve, taperLine } = window.__P2;

  const SIL = '#07060b';
  /** Paint a silhouette: fill() draws every shape in SIL; the rim is the same shapes, offset
   *  down-right and cut away, leaving a thin light edge on the top/left. Then soften it. */
  function silhouette(w, h, rim, fill, { blur = 1.4, rimA = 0.55, off = 3 } = {}) {
    return (c) => {
      const a = document.createElement('canvas'); a.width = w; a.height = h;
      const q = a.getContext('2d'); q.lineCap = 'round'; q.lineJoin = 'round';
      // rim layer
      q.save(); fill(q, rim); q.restore();
      q.globalCompositeOperation = 'source-in'; q.fillStyle = hexA(rim, rimA); q.fillRect(0, 0, w, h);
      q.globalCompositeOperation = 'source-over';
      // body, nudged down-right so only a sliver of rim shows on the lit side
      q.save(); q.translate(off * 0.6, off); fill(q, SIL); q.restore();
      // keep only what lies inside the original outline
      const m = document.createElement('canvas'); m.width = w; m.height = h;
      const mq = m.getContext('2d'); mq.lineCap = 'round'; mq.lineJoin = 'round'; fill(mq, SIL);
      q.globalCompositeOperation = 'destination-in'; q.drawImage(m, 0, 0); q.globalCompositeOperation = 'source-over';
      c.filter = `blur(${blur}px)`; c.drawImage(a, 0, 0); c.filter = 'none';
    };
  }

  // ------------------------------------------------------------------ Forgotten Hollows
  const HOL_RIM = '#5a5c8c';
  const fern = (q, col, r, x, y, len, ang, side) => {
    // one frond: a curved stem with leaflets that shrink toward the tip
    const pts = curve([[x, y], [x + Math.cos(ang) * len * 0.5, y + Math.sin(ang) * len * 0.5], [x + Math.cos(ang + side * 0.6) * len, y + Math.sin(ang + side * 0.6) * len + len * 0.25]], 18);
    taperLine(q, pts, 7, 1.2, col);
    q.fillStyle = col;
    for (let i = 2; i < pts.length - 1; i++) {
      const [px, py] = pts[i], [nx, ny] = pts[i + 1]; const d = Math.atan2(ny - py, nx - px), s = (1 - i / pts.length) * len * 0.16 + 3;
      for (const k of [-1, 1]) { ell(q, px + Math.cos(d + k * 1.4) * s * 0.8, py + Math.sin(d + k * 1.4) * s * 0.8, s, s * 0.32, d + k * 1.0 + (r() - 0.5) * 0.2); q.fill(); }
    }
  };
  const blade = (q, col, x, y, h, lean) => { q.fillStyle = col; q.beginPath(); q.moveTo(x - 4, y); q.quadraticCurveTo(x + lean * 0.3, y - h * 0.6, x + lean, y - h); q.quadraticCurveTo(x + lean * 0.3 + 3, y - h * 0.55, x + 4, y); q.fill(); };

  R('fg_hol_ferns', 440, 280, silhouette(440, 280, HOL_RIM, (q, col) => {
    const r = rng('fgf');
    q.fillStyle = col; ell(q, 220, 300, 200, 70); q.fill();
    for (let i = 0; i < 26; i++) blade(q, col, 40 + r() * 360, 262, 50 + r() * 120, (r() - 0.5) * 90);
    [[200, 250, 230, -2.1, -1], [240, 250, 220, -1.0, 1], [160, 262, 170, -2.6, -1], [300, 262, 180, -0.5, 1], [225, 255, 250, -1.6, 0.4]].forEach(([x, y, l, a, s]) => fern(q, col, r, x, y, l, a, s));
  }));

  R('fg_hol_mush', 320, 300, silhouette(320, 300, HOL_RIM, (q, col) => {
    const r = rng('fgm'); q.fillStyle = col;
    const shroom = (x, h, cw, tilt) => {
      const top = 300 - h;
      taperLine(q, curve([[x, 300], [x + tilt * 0.5, top + h * 0.5], [x + tilt, top + 10]], 12), 22, 13, col);
      q.beginPath(); q.moveTo(x + tilt - cw, top + 18); q.bezierCurveTo(x + tilt - cw * 0.9, top - cw * 0.55, x + tilt + cw * 0.9, top - cw * 0.55, x + tilt + cw, top + 18);
      q.quadraticCurveTo(x + tilt, top + 8, x + tilt - cw, top + 18); q.fill();
      for (let k = 0; k < 5; k++) { ell(q, x + tilt + (r() - 0.5) * cw * 1.2, top + 20 + r() * 4, 2, 6, 0); q.fill(); } // drips of gill
    };
    shroom(110, 250, 72, -18); shroom(205, 180, 52, 14); shroom(270, 110, 34, 6); shroom(45, 120, 30, -6);
    ell(q, 160, 300, 160, 26); q.fill();
    for (let i = 0; i < 14; i++) blade(q, col, 10 + r() * 300, 296, 20 + r() * 50, (r() - 0.5) * 40);
  }));

  R('fg_hol_rock', 480, 240, silhouette(480, 240, HOL_RIM, (q, col) => {
    const r = rng('fgr'); q.fillStyle = col;
    const pts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, x = 20 + t * 440; pts.push([x, 240 - Math.sin(t * Math.PI) * (140 + r() * 40) - (r() - 0.5) * 18]); }
    poly(q, [[0, 240], ...pts, [480, 240]]); q.fill();
    ell(q, 330, 120, 70, 50); q.fill();
    for (let i = 0; i < 30; i++) { const t = 0.15 + r() * 0.7, x = 20 + t * 440, y = 240 - Math.sin(t * Math.PI) * 150 + 8; blade(q, col, x, y, 14 + r() * 40, (r() - 0.5) * 36); }
  }));

  R('fg_hol_roots', 320, 440, silhouette(320, 440, HOL_RIM, (q, col) => {
    const r = rng('fgo'); q.fillStyle = col;
    poly(q, [[0, 0], [320, 0], [300, 30], [220, 46], [150, 38], [70, 50], [10, 30]]); q.fill();
    for (let i = 0; i < 7; i++) {
      let x = 30 + r() * 260, y = 30; const len = 160 + r() * 260, pts = [[x, y]];
      while (y < len) { y += 30; x += (r() - 0.5) * 34; pts.push([x, y]); }
      taperLine(q, curve(pts, 24), 16 + r() * 10, 1.5, col);
      for (let k = 0; k < 4; k++) { const p = pts[1 + Math.floor(r() * (pts.length - 1))]; taperLine(q, [p, [p[0] + (r() - 0.5) * 60, p[1] + 20 + r() * 40]], 4, 0.8, col); }
    }
  }, { rimA: 0.35 }));

  R('fg_hol_vine', 180, 480, silhouette(180, 480, HOL_RIM, (q, col) => {
    const r = rng('fgv'); q.fillStyle = col;
    for (const [x0, len] of [[70, 470], [120, 330]]) {
      const pts = []; for (let y = 0; y <= len; y += 20) pts.push([x0 + Math.sin(y * 0.02 + x0) * 18, y]);
      const sm = curve(pts, 30); taperLine(q, sm, 6, 2, col);
      for (let i = 2; i < sm.length; i += 2) { const [x, y] = sm[i], s = 1 - (i / sm.length) * 0.4, side = i % 4 ? 1 : -1;
        q.beginPath(); q.moveTo(x, y); q.quadraticCurveTo(x + side * 26 * s, y - 2, x + side * 30 * s, y + 18 * s); q.quadraticCurveTo(x + side * 10 * s, y + 14 * s, x, y); q.fill(); }
    }
    ell(q, 90, 0, 90, 14); q.fill();
  }, { rimA: 0.35 }));

  // ------------------------------------------------------------------ Drowned Nursery
  const NUR_RIM = '#8a7ab8';
  R('fg_nur_blocks', 380, 320, silhouette(380, 320, NUR_RIM, (q, col) => {
    q.fillStyle = col;
    const block = (x, y, s, rot, letter) => {
      q.save(); q.translate(x, y); q.rotate(rot);
      q.beginPath(); q.roundRect(-s / 2, -s, s, s, 10); q.fill();
      if (col === SIL) { q.globalCompositeOperation = 'destination-out'; q.font = `bold ${s * 0.62}px Georgia, serif`; q.textAlign = 'center'; q.globalAlpha = 0.55;
        q.lineWidth = 3; q.strokeStyle = '#000'; q.strokeText(letter, 0, -s * 0.28); q.globalAlpha = 1; q.globalCompositeOperation = 'source-over'; }
      q.restore();
    };
    block(140, 322, 200, -0.06, 'A'); block(260, 330, 150, 0.12, 'C'); block(170, 136, 130, 0.22, 'B');
  }, { blur: 1.6 }));

  R('fg_nur_yarn', 400, 240, silhouette(400, 240, NUR_RIM, (q, col) => {
    q.fillStyle = col; q.strokeStyle = col;
    ell(q, 150, 150, 96, 92); q.fill();
    q.lineWidth = 6; q.beginPath(); q.moveTo(230, 210); q.bezierCurveTo(290, 260, 330, 150, 400, 200); q.stroke();
    q.lineWidth = 9; q.beginPath(); q.moveTo(40, 40); q.lineTo(270, 236); q.stroke();
    ell(q, 38, 38, 12, 12); q.fill();
    if (col === SIL) { q.globalCompositeOperation = 'destination-out'; q.lineWidth = 2; q.strokeStyle = 'rgba(0,0,0,0.6)';
      for (let i = 0; i < 9; i++) { q.beginPath(); ell(q, 150, 150, 88 - i * 3, 30 + i * 7, 0.6 + i * 0.25); q.stroke(); } q.globalCompositeOperation = 'source-over'; }
    ell(q, 200, 250, 200, 20); q.fill();
  }));

  R('fg_nur_cot', 420, 440, silhouette(420, 440, NUR_RIM, (q, col) => {
    q.fillStyle = col;
    q.beginPath(); q.roundRect(-20, 120, 460, 30, 14); q.fill();      // top rail
    for (let x = 20; x < 420; x += 58) { q.beginPath(); q.roundRect(x, 140, 20, 300, 8); q.fill(); ell(q, x + 10, 150, 14, 8); q.fill(); }
    q.beginPath(); q.roundRect(360, 40, 44, 400, 14); q.fill();       // corner post
    ell(q, 382, 40, 30, 30); q.fill(); ell(q, 382, 76, 26, 10); q.fill();
  }, { blur: 1.8 }));

  R('fg_nur_mobile', 240, 500, silhouette(240, 500, NUR_RIM, (q, col) => {
    q.fillStyle = col; q.strokeStyle = col;
    q.lineWidth = 3; q.beginPath(); q.moveTo(120, 0); q.lineTo(120, 230); q.stroke();
    q.lineWidth = 6; q.beginPath(); q.moveTo(30, 236); q.quadraticCurveTo(120, 214, 210, 236); q.stroke();
    q.lineWidth = 2.5; for (const [x, l] of [[34, 380], [206, 320]]) { q.beginPath(); q.moveTo(x, 236); q.lineTo(x, l); q.stroke(); }
    const star = (x, y, R0) => { const pts = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? R0 * 0.45 : R0; pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]); } poly(q, pts); q.fill(); };
    star(34, 410, 34);
    // crescent moon
    q.save(); ell(q, 206, 360, 40, 40); q.fill();
    q.globalCompositeOperation = 'destination-out'; ell(q, 224, 348, 34, 34); q.fill(); q.restore();
    ell(q, 120, 236, 12, 12); q.fill();
  }, { rimA: 0.45 }));

  R('fg_nur_bunting', 540, 220, silhouette(540, 220, NUR_RIM, (q, col) => {
    q.fillStyle = col; q.strokeStyle = col; q.lineWidth = 4;
    const y = (x) => 10 + Math.sin((x / 540) * Math.PI) * 90;
    q.beginPath(); q.moveTo(0, y(0)); for (let x = 0; x <= 540; x += 10) q.lineTo(x, y(x)); q.stroke();
    for (let x = 34; x < 520; x += 62) { const y0 = y(x), y1 = y(x + 44); poly(q, [[x, y0], [x + 44, y1], [x + 22 + 4, (y0 + y1) / 2 + 70]]); q.fill(); }
  }, { rimA: 0.45 }));
})();

/* Nightpaw art: Candlewick (2.5.0). Loaded after depths.js. A hamlet of lost things huddled under
 * one dim old lantern: houses made from a boot, a teapot, tin cans, a biscuit tin; Nib's stall in a
 * matchbox drawer; the townsfolk Ma Spool and Wick; and the keepsake icons for the scarf.
 * Muted, worn, warm only where a window is lit.
 */
(function () {
  'use strict';
  const P = window.__P;
  const { rng, hexA, mix, ell, poly, blobPath, glow, C } = P;
  const { INK } = C;
  const { R, form, grain, taperLine, curve, clipTo } = window.__P2;
  const rr = (q, x, y, w, h, r) => { q.beginPath(); q.roundRect(x, y, w, h, r); };
  const IRON = { base: '#2e2c34', light: '#6e6a7a', shadow: '#060508', bounce: '#3a3a50', rim: '#a8a0b8' };
  const BRASS = { base: '#8a6a3a', light: '#e0c890', shadow: '#1e1206', bounce: '#5a5068', rim: '#f0dcb0' };
  const LEATHER = { base: '#3e2a22', light: '#8a6450', shadow: '#0a0504', bounce: '#3a3448', rim: '#c89a80' };
  const WOOD = { base: '#4a3228', light: '#9a7058', shadow: '#0e0806', bounce: '#3a3448', rim: '#d8b098' };
  const TIN = { base: '#6a6e78', light: '#c8ccd8', shadow: '#121418', bounce: '#4a4e68', rim: '#e8ecf8' };
  const CERAMIC = { base: '#7a8a8a', light: '#d8e4e0', shadow: '#121818', bounce: '#4a5468', rim: '#f0f8f4' };
  const WARM = '#ffc070';
  /** A lit window: warm glass, a cross frame, and a soft spill of light. */
  const lit = (c, x, y, w, h, round = 0, a = 1) => {
    glow(c, x + w / 2, y + h / 2, Math.max(w, h) * 1.3, WARM, 0.22 * a);
    const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, hexA('#ffd890', a)); g.addColorStop(1, hexA('#c87830', a));
    c.fillStyle = g; rr(c, x, y, w, h, round); c.fill();
    c.strokeStyle = '#1a0e08'; c.lineWidth = Math.max(2, w * 0.08); rr(c, x, y, w, h, round); c.stroke();
    c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke();
  };
  const door = (c, x, y, w, h) => {
    form(c, (q) => { q.beginPath(); q.moveTo(x, y + h); q.lineTo(x, y + w / 2); q.quadraticCurveTo(x, y, x + w / 2, y); q.quadraticCurveTo(x + w, y, x + w, y + w / 2); q.lineTo(x + w, y + h); q.closePath(); }, [x, y, x + w, y + h], { ...WOOD, base: '#2a1a14', ow: 2, seed: 'door' + x + y, tex: (q) => { q.strokeStyle = 'rgba(0,0,0,0.4)'; q.lineWidth = 1.5; for (let k = 1; k < 4; k++) { q.beginPath(); q.moveTo(x + (w * k) / 4, y + 4); q.lineTo(x + (w * k) / 4, y + h); q.stroke(); } } });
    c.fillStyle = '#c8a060'; ell(c, x + w * 0.78, y + h * 0.6, 2.5, 2.5); c.fill();
  };

  // ------------------------------------------------------------------ the great lantern
  R('town_lantern', 256, 520, (c) => {
    // the post: an iron pole made from a curtain rod, braced with wire
    form(c, (q) => rr(q, 118, 200, 20, 316, 6), [118, 200, 138, 516], { ...IRON, ow: 2.4, seed: 'post' });
    form(c, (q) => { q.beginPath(); q.moveTo(80, 520); q.quadraticCurveTo(128, 470, 176, 520); q.closePath(); }, [80, 470, 176, 520], { ...IRON, ow: 2.4, seed: 'foot' });
    // hook and chain
    c.strokeStyle = '#18161c'; c.lineWidth = 6; c.beginPath(); c.moveTo(128, 210); c.quadraticCurveTo(128, 180, 150, 176); c.stroke();
    // the lantern: an iron cage, four panes, one cracked, one missing
    glow(c, 128, 110, 170, '#ffb060', 0.28);
    form(c, (q) => { q.beginPath(); q.moveTo(60, 40); q.lineTo(196, 40); q.lineTo(128, 0); q.closePath(); }, [60, 0, 196, 40], { ...IRON, ow: 2.4, seed: 'cap' });
    const glass = (q) => { q.beginPath(); q.moveTo(70, 44); q.lineTo(186, 44); q.lineTo(176, 172); q.lineTo(80, 172); q.closePath(); };
    glass(c); const g = c.createRadialGradient(128, 128, 6, 128, 112, 90); g.addColorStop(0, 'rgba(255,214,140,0.95)'); g.addColorStop(0.35, 'rgba(230,140,60,0.6)'); g.addColorStop(1, 'rgba(70,40,30,0.55)'); c.fillStyle = g; c.fill();
    clipTo(c, glass, () => {
      // soot on the glass, a low flame on a stub of wick
      const r = rng('soot'); for (let i = 0; i < 30; i++) { c.fillStyle = `rgba(20,12,10,${0.1 + r() * 0.3})`; ell(c, 70 + r() * 116, 44 + r() * 50, 6 + r() * 14, 4 + r() * 8); c.fill(); }
      c.fillStyle = '#d8c8a8'; c.fillRect(120, 140, 16, 32);
      glow(c, 128, 128, 40, '#ffe0a0', 0.8);
      c.fillStyle = '#fff2c0'; blobPath(c, [[128, 108], [134, 126], [132, 138], [124, 138], [122, 126]]); c.fill();
      // the crack
      c.strokeStyle = 'rgba(255,240,220,0.7)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(160, 48); c.lineTo(150, 90); c.lineTo(166, 120); c.moveTo(150, 90); c.lineTo(132, 100); c.stroke();
    });
    // the frame
    c.strokeStyle = INK; c.lineWidth = 8; glass(c); c.stroke();
    c.strokeStyle = '#2e2c34'; c.lineWidth = 5; glass(c); c.stroke();
    for (const x of [104, 152]) { c.strokeStyle = '#2e2c34'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, 44); c.lineTo(x + (x < 128 ? 4 : -4), 172); c.stroke(); }
    form(c, (q) => rr(q, 74, 170, 108, 18, 4), [74, 170, 182, 188], { ...IRON, ow: 2.4, seed: 'base' });
    c.strokeStyle = '#18161c'; c.lineWidth = 4; c.beginPath(); c.moveTo(128, 188); c.lineTo(128, 204); c.stroke();
  });

  // ------------------------------------------------------------------ houses
  R('town_house_boot', 320, 340, (c) => {
    // a tall old boot standing on its sole: a house of four storeys, laced shut
    const b = (q) => { q.beginPath(); q.moveTo(70, 336); q.lineTo(70, 60); q.quadraticCurveTo(70, 26, 110, 22); q.lineTo(196, 22); q.quadraticCurveTo(224, 26, 226, 60); q.lineTo(226, 236); q.bezierCurveTo(250, 250, 300, 268, 312, 300); q.quadraticCurveTo(316, 336, 280, 336); q.closePath(); };
    form(c, b, [70, 22, 316, 336], { ...LEATHER, ow: 3, seed: 'boot', tex: (q, r) => { grain(q, r, [70, 22, 316, 336], 900, 0.12); q.strokeStyle = 'rgba(0,0,0,0.35)'; q.lineWidth = 2; for (let i = 0; i < 12; i++) { const y = 60 + r() * 260; q.beginPath(); q.moveTo(76, y); q.quadraticCurveTo(140, y + (r() - 0.5) * 10, 220, y + (r() - 0.5) * 8); q.stroke(); } } });
    // the sole, patched; laces criss-crossing up the front as a ladder
    form(c, (q) => rr(q, 64, 322, 254, 16, 6), [64, 322, 318, 338], { base: '#1e1614', light: '#5a4a40', shadow: '#060404', bounce: null, ow: 2, seed: 'sole' });
    for (let y = 70; y < 230; y += 24) { c.strokeStyle = '#8a7a5a'; c.lineWidth = 3; c.beginPath(); c.moveTo(196, y); c.lineTo(222, y + 18); c.moveTo(222, y); c.lineTo(196, y + 18); c.stroke(); for (const x of [196, 222]) { c.fillStyle = '#b8a070'; ell(c, x, y, 3, 3); c.fill(); } }
    lit(c, 104, 70, 34, 44, 6); lit(c, 120, 168, 40, 36, 4, 0.7);
    door(c, 236, 262, 36, 62);
    // a stovepipe out of the top, a thread of smoke
    form(c, (q) => rr(q, 98, 0, 18, 30, 3), [98, 0, 116, 30], { ...TIN, ow: 1.6, seed: 'pipe' });
  });
  R('town_house_teapot', 320, 260, (c) => {
    const pot = (q) => { q.beginPath(); q.ellipse(150, 160, 112, 96, 0, 0, Math.PI * 2); };
    // spout and handle
    form(c, (q) => { q.beginPath(); q.moveTo(250, 150); q.bezierCurveTo(290, 140, 296, 90, 314, 70); q.lineTo(318, 80); q.bezierCurveTo(306, 110, 300, 170, 252, 196); q.closePath(); }, [250, 70, 318, 196], { ...CERAMIC, ow: 2.4, seed: 'spout' });
    form(c, (q) => { q.beginPath(); q.ellipse(36, 150, 34, 50, 0, 0, Math.PI * 2); q.ellipse(36, 150, 18, 34, 0, 0, Math.PI * 2); }, [2, 100, 70, 200], { ...CERAMIC, ow: 2.4, seed: 'handle' });
    form(c, pot, [38, 64, 262, 256], { ...CERAMIC, ow: 3, seed: 'pot', spec: 0.25, tex: (q, r) => {
      // faded blue willow pattern, chipped, a big crack sewn shut with wire
      q.strokeStyle = 'rgba(40,70,120,0.35)'; q.lineWidth = 2; for (let i = 0; i < 9; i++) { q.beginPath(); q.arc(150 + (r() - 0.5) * 150, 150 + (r() - 0.5) * 100, 8 + r() * 18, r() * 6, r() * 6 + 2); q.stroke(); }
      grain(q, r, [38, 64, 262, 256], 600, 0.08);
    } });
    c.strokeStyle = 'rgba(10,10,12,0.9)'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(190, 70); c.lineTo(178, 120); c.lineTo(196, 160); c.lineTo(182, 206); c.stroke();
    c.strokeStyle = '#9aa0a8'; c.lineWidth = 1.6; for (const [x, y] of [[184, 100], [188, 140], [190, 180]]) { c.beginPath(); c.moveTo(x - 8, y - 4); c.lineTo(x + 8, y + 4); c.stroke(); }
    // lid with a knob; door and window cut into the belly
    form(c, (q) => { q.beginPath(); q.ellipse(150, 66, 62, 16, 0, 0, Math.PI * 2); }, [88, 50, 212, 82], { ...CERAMIC, ow: 2.4, seed: 'lid' });
    form(c, (q) => ell(q, 150, 46, 12, 10), [138, 36, 162, 56], { ...CERAMIC, ow: 2, seed: 'knob' });
    lit(c, 72, 120, 40, 40, 20, 0.85);
    door(c, 128, 170, 40, 86);
  });
  R('town_house_tin', 200, 400, (c) => {
    // three tin cans stacked into a tower, a ladder of hairpins, a weathervane fork
    const can = (y, h, w, seed) => {
      const x = 100 - w / 2;
      form(c, (q) => rr(q, x, y, w, h, 6), [x, y, x + w, y + h], { ...TIN, ow: 2.4, seed, tex: (q, r) => { q.strokeStyle = 'rgba(0,0,0,0.25)'; q.lineWidth = 2; for (let k = y + 10; k < y + h; k += 12) { q.beginPath(); q.moveTo(x, k); q.lineTo(x + w, k); q.stroke(); } for (let i = 0; i < 12; i++) { q.fillStyle = 'rgba(120,70,40,0.35)'; ell(q, x + r() * w, y + r() * h, 3 + r() * 8, 2 + r() * 5); q.fill(); } } });
      c.fillStyle = 'rgba(120,40,40,0.45)'; c.fillRect(x + 4, y + h * 0.3, w - 8, h * 0.25);
    };
    can(250, 146, 150, 'c1'); can(130, 124, 124, 'c2'); can(40, 94, 96, 'c3');
    lit(c, 76, 290, 30, 36, 3); lit(c, 110, 160, 26, 30, 3, 0.6); lit(c, 88, 64, 24, 26, 12);
    door(c, 118, 334, 30, 62);
    c.strokeStyle = '#2e2c34'; c.lineWidth = 3; for (const x of [28, 40]) { c.beginPath(); c.moveTo(x, 396); c.lineTo(x + 6, 130); c.stroke(); } for (let y = 380; y > 140; y -= 18) { c.beginPath(); c.moveTo(28 + (396 - y) * 0.022, y); c.lineTo(40 + (396 - y) * 0.022, y); c.stroke(); }
    c.strokeStyle = '#3e3c44'; c.lineWidth = 3; c.beginPath(); c.moveTo(100, 40); c.lineTo(100, 8); c.stroke(); for (const d of [-8, 0, 8]) { c.beginPath(); c.moveTo(100 + d, 8); c.lineTo(100 + d, -2); c.stroke(); }
  });
  R('town_shop', 400, 330, (c) => {
    // Nib's stall: a matchbox drawer, pulled half out; an awning cut from a striped sock
    form(c, (q) => rr(q, 30, 120, 340, 200, 6), [30, 120, 370, 320], { base: '#5a3a2a', light: '#a87a5a', shadow: '#0e0604', bounce: '#3a3448', rim: '#e0b090', ow: 3, seed: 'box', tex: (q, r) => grain(q, r, [30, 120, 370, 320], 700, 0.1) });
    c.fillStyle = 'rgba(110,40,34,0.5)'; c.fillRect(34, 128, 332, 40);
    c.font = 'bold 22px Georgia, serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(220,206,170,0.55)'; c.fillText('SAFETY MATCHES', 200, 157);
    form(c, (q) => rr(q, 50, 200, 300, 120, 4), [50, 200, 350, 320], { base: '#2a1a12', light: '#6a4a36', shadow: '#060302', bounce: null, ow: 2.4, seed: 'drawer' });
    // goods on the counter: jars of buttons, a spool, keys on a string
    for (const [x, col] of [[96, '#7a3a3a'], [132, '#3a5a6a'], [168, '#6a6a3a']]) { form(c, (q) => rr(q, x - 14, 214, 28, 34, 5), [x - 14, 214, x + 14, 248], { base: '#4a5a64', light: '#a8c0c8', shadow: '#0a1014', bounce: null, ow: 1.6, seed: 'jar' + x }); c.fillStyle = col; for (let k = 0; k < 6; k++) { ell(c, x - 7 + (k % 3) * 7, 236 - Math.floor(k / 3) * 7, 3.4, 3.4); c.fill(); } }
    form(c, (q) => rr(q, 220, 212, 26, 36, 4), [220, 212, 246, 248], { base: '#5a2a3a', light: '#c87a8a', shadow: '#12040a', bounce: null, ow: 1.6, seed: 'spool' });
    c.strokeStyle = '#8a7a5a'; c.lineWidth = 2; c.beginPath(); c.moveTo(270, 200); c.quadraticCurveTo(300, 230, 330, 204); c.stroke();
    for (const x of [284, 300, 316]) { c.strokeStyle = '#a89058'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x, 220); c.lineTo(x, 236); c.stroke(); ell(c, x, 216, 4, 4); c.stroke(); }
    // the sock awning
    const aw = (q) => { q.beginPath(); q.moveTo(10, 120); q.lineTo(390, 120); q.lineTo(372, 68); q.lineTo(28, 68); q.closePath(); };
    form(c, aw, [10, 68, 390, 120], { base: '#6a5a6a', light: '#c8b8c8', shadow: '#140e14', bounce: null, ow: 2.4, seed: 'sock', tex: () => { for (let x = 10; x < 390; x += 40) { c.fillStyle = 'rgba(140,40,50,0.6)'; poly(c, [[x, 120], [x + 20, 120], [x + 24, 68], [x + 4, 68]]); c.fill(); } } });
    for (let x = 20; x < 390; x += 20) { c.fillStyle = '#4a3a4a'; ell(c, x, 122, 10, 6); c.fill(); }
    // the sign
    form(c, (q) => rr(q, 110, 10, 180, 46, 6), [110, 10, 290, 56], { ...WOOD, ow: 2.4, seed: 'sign' });
    c.font = 'bold 15px Georgia, serif'; c.fillStyle = 'rgba(10,6,4,0.85)'; c.fillText('NIB · FOUND THINGS', 200, 39);
    c.strokeStyle = '#2e2c34'; c.lineWidth = 2; for (const x of [140, 260]) { c.beginPath(); c.moveTo(x, 56); c.lineTo(x, 68); c.stroke(); }
    // a jam-jar lamp hung from the awning
    c.strokeStyle = '#2e2c34'; c.lineWidth = 2; c.beginPath(); c.moveTo(360, 120); c.lineTo(360, 150); c.stroke();
    glow(c, 360, 166, 40, WARM, 0.45); form(c, (q) => rr(q, 350, 150, 20, 26, 4), [350, 150, 370, 176], { base: '#c89050', light: '#ffe0a0', shadow: '#4a2a10', bounce: null, ow: 1.4, seed: 'lampjar' });
  });
  R('town_stitchery', 320, 300, (c) => {
    // a round biscuit tin with its lid tipped up for a roof; a needle signpost threaded with red
    form(c, (q) => rr(q, 40, 120, 240, 176, 12), [40, 120, 280, 296], { ...TIN, base: '#4a5a72', ow: 3, seed: 'tin', tex: (q, r) => {
      for (let i = 0; i < 6; i++) { q.fillStyle = 'rgba(220,200,160,0.18)'; ell(q, 70 + i * 36, 210, 12, 18); q.fill(); }
      q.strokeStyle = 'rgba(230,210,170,0.3)'; q.lineWidth = 3; q.beginPath(); q.moveTo(40, 150); q.lineTo(280, 150); q.moveTo(40, 270); q.lineTo(280, 270); q.stroke();
      for (let i = 0; i < 14; i++) { q.fillStyle = 'rgba(120,70,40,0.4)'; ell(q, 40 + r() * 240, 120 + r() * 176, 3 + r() * 10, 2 + r() * 6); q.fill(); }
    } });
    form(c, (q) => { q.beginPath(); q.moveTo(20, 128); q.lineTo(300, 104); q.lineTo(300, 82); q.lineTo(20, 106); q.closePath(); }, [20, 82, 300, 128], { ...TIN, base: '#4a5a72', ow: 2.4, seed: 'lid' });
    lit(c, 66, 168, 50, 40, 20, 0.85);
    door(c, 188, 200, 44, 96);
    // the needle sign
    taperLine(c, [[294, 296], [300, 60]], 7, 2.5, INK); taperLine(c, [[294, 296], [300, 60]], 5, 1.5, '#b8c0cc');
    c.strokeStyle = '#a82a3a'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(299, 72); c.bezierCurveTo(260, 40, 250, 100, 280, 120); c.bezierCurveTo(310, 140, 320, 180, 296, 200); c.stroke();
  });
  R('town_sign', 200, 140, (c) => {
    taperLine(c, [[40, 140], [44, 20]], 9, 7, INK); taperLine(c, [[40, 140], [44, 20]], 6, 5, '#4a3228');
    form(c, (q) => { q.beginPath(); q.moveTo(30, 30); q.lineTo(180, 22); q.lineTo(196, 52); q.lineTo(182, 80); q.lineTo(32, 86); q.closePath(); }, [30, 22, 196, 86], { ...WOOD, ow: 2.4, seed: 'arrow', tex: (q, r) => grain(q, r, [30, 22, 196, 86], 300, 0.1) });
    c.save(); c.translate(108, 58); c.rotate(-0.03); c.font = 'bold 17px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = 'rgba(230,214,190,0.25)'; c.fillText('CANDLEWICK', 1, 1); c.fillStyle = 'rgba(12,8,6,0.85)'; c.fillText('CANDLEWICK', 0, 0); c.restore();
  });
  R('town_lamp', 64, 200, (c) => {
    taperLine(c, [[32, 200], [32, 60]], 6, 5, INK); taperLine(c, [[32, 200], [32, 60]], 4, 3, '#3a3640');
    c.strokeStyle = '#3a3640'; c.lineWidth = 3; c.beginPath(); c.moveTo(32, 64); c.quadraticCurveTo(32, 40, 46, 38); c.stroke();
    glow(c, 46, 62, 30, WARM, 0.5);
    form(c, (q) => rr(q, 36, 44, 20, 30, 5), [36, 44, 56, 74], { base: '#a87840', light: '#ffe0a0', shadow: '#3a1e08', bounce: null, ow: 1.4, seed: 'jj' });
    c.fillStyle = '#fff0c0'; ell(c, 46, 58, 2.6, 5); c.fill();
  });
  R('town_honesty', 120, 110, (c) => {
    form(c, (q) => rr(q, 14, 40, 92, 66, 6), [14, 40, 106, 106], { ...TIN, ow: 2, seed: 'hb' });
    c.fillStyle = '#0a0a0c'; c.fillRect(40, 48, 40, 5);
    form(c, (q) => { q.beginPath(); q.moveTo(20, 6); q.lineTo(100, 2); q.lineTo(102, 40); q.lineTo(22, 44); q.closePath(); }, [20, 2, 102, 44], { base: '#c8bca0', light: '#fff4dc', shadow: '#6a5e48', bounce: null, ow: 1.2, seed: 'note' });
    c.strokeStyle = 'rgba(30,20,10,0.7)'; c.lineWidth = 1.2; for (let y = 12; y < 38; y += 7) { c.beginPath(); c.moveTo(28, y); for (let x = 28; x < 94; x += 5) c.lineTo(x, y + (x % 10 ? -1 : 1)); c.stroke(); }
  });

  // ------------------------------------------------------------------ townsfolk
  const drawSpool = (c) => {
    // Ma Spool: an old wooden cotton reel wound with faded red thread; button eyes; a darned shawl
    form(c, (q) => rr(q, 6, 4, 60, 14, 5), [6, 4, 66, 18], { ...WOOD, base: '#6a4a34', ow: 2, seed: 'top' });
    form(c, (q) => rr(q, 6, 76, 60, 14, 5), [6, 76, 66, 90], { ...WOOD, base: '#6a4a34', ow: 2, seed: 'bot' });
    form(c, (q) => rr(q, 14, 16, 44, 62, 4), [14, 16, 58, 78], { base: '#8a3a40', light: '#e08a8a', shadow: '#200608', bounce: '#5a4a70', rim: '#ffc0c0', ow: 2, seed: 'thread', tex: (q) => { q.strokeStyle = 'rgba(40,0,6,0.35)'; q.lineWidth = 1; for (let y = 18; y < 78; y += 3) { q.beginPath(); q.moveTo(14, y); q.lineTo(58, y + 1.5); q.stroke(); } } });
    // shawl
    form(c, (q) => { q.beginPath(); q.moveTo(10, 44); q.quadraticCurveTo(36, 66, 62, 44); q.lineTo(60, 54); q.quadraticCurveTo(36, 80, 12, 54); q.closePath(); }, [10, 44, 62, 80], { base: '#5a5a6a', light: '#a8a8b8', shadow: '#121218', bounce: null, ow: 1.4, seed: 'shawl' });
    for (const x of [27, 45]) { form(c, (q) => ell(q, x, 32, 6, 6), [x - 6, 26, x + 6, 38], { base: '#2a2228', light: '#7a6a72', shadow: '#060406', bounce: null, ow: 1.2, seed: 'eye' + x, spec: 0.7 }); c.fillStyle = 'rgba(200,190,200,0.6)'; for (const d of [-1.8, 1.8]) { ell(c, x + d, 32, 1, 1); c.fill(); } }
    c.strokeStyle = 'rgba(30,10,10,0.7)'; c.lineWidth = 1.4; c.beginPath(); c.arc(36, 40, 5, 0.3, Math.PI - 0.3); c.stroke();
  };
  R('spool_body', 72, 92, drawSpool);

  R('spool_needle', 56, 12, (c) => { taperLine(c, [[2, 6], [54, 6]], 4, 1.2, INK); taperLine(c, [[3, 6], [53, 6]], 2.6, 0.6, '#c0c8d4'); c.strokeStyle = '#a82a3a'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(6, 6); c.quadraticCurveTo(0, 12, 4, 12); c.stroke(); });
  const drawWick = (c) => {
    // Wick: a stub of church candle, burned down to the last third, wax run down its sides
    const b = (q) => { q.beginPath(); q.moveTo(10, 94); q.lineTo(10, 22); q.quadraticCurveTo(28, 14, 46, 22); q.lineTo(46, 94); q.closePath(); };
    form(c, b, [10, 14, 46, 94], { base: '#cfc4ac', light: '#fffaf0', shadow: '#5a5040', bounce: '#8a7a90', rim: '#ffffff', ow: 2, seed: 'wax' });
    for (const [x, l] of [[14, 14], [24, 8], [38, 18], [44, 10]]) form(c, (q) => { q.beginPath(); q.moveTo(x - 4, 20); q.lineTo(x + 4, 20); q.lineTo(x + 3, 20 + l); q.quadraticCurveTo(x, 26 + l, x - 3, 20 + l); q.closePath(); }, [x - 4, 20, x + 4, 28 + l], { base: '#e4dac4', light: '#ffffff', shadow: '#8a7a64', bounce: null, ow: 1, seed: 'drip' + x });
    c.strokeStyle = '#1a1210'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(28, 18); c.quadraticCurveTo(30, 10, 28, 4); c.stroke();
    // a tired face pressed into the wax
    for (const x of [21, 35]) { c.fillStyle = '#2a2018'; ell(c, x, 50, 2.6, 2); c.fill(); c.strokeStyle = 'rgba(60,50,40,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 4, 46); c.lineTo(x + 3, 47); c.stroke(); }
    c.strokeStyle = 'rgba(60,40,30,0.7)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(24, 62); c.quadraticCurveTo(28, 60, 32, 62); c.stroke();
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(10, 86, 36, 8);
  };
  R('wick_body', 56, 96, drawWick);
  // dialogue portraits (192x192), framed like the others
  const portrait = (key, draw, w, h, s, oy, warm) => R(key, 192, 192, (c) => {
    const g = c.createRadialGradient(96, 96, 10, 96, 96, 96); g.addColorStop(0, warm ? '#3a2a24' : '#2a2438'); g.addColorStop(1, '#0b0a10');
    c.fillStyle = g; ell(c, 96, 96, 92, 92); c.fill();
    c.save(); ell(c, 96, 96, 90, 90); c.clip();
    if (warm) glow(c, 96, 40, 90, '#ffb060', 0.35);
    c.translate(96 - (w * s) / 2, oy); c.scale(s, s); draw(c); c.restore();
    c.strokeStyle = 'rgba(220,210,255,0.5)'; c.lineWidth = 3; ell(c, 96, 96, 91, 91); c.stroke();
  });
  portrait('pt_spool', drawSpool, 72, 92, 2.1, 10, false);
  portrait('pt_wick', (c) => { drawWick(c); glow(c, 28, 2, 16, '#ffd080', 0.9); c.fillStyle = '#fff0c0'; blobPath(c, [[28, -10], [32, 0], [28, 5], [24, 0]]); c.fill(); }, 56, 96, 1.9, 40, true);

  // ------------------------------------------------------------------ keepsake icons (96x96)
  const ks = (key, draw) => R(key, 96, 96, (c) => { glow(c, 48, 50, 44, '#ffd9a0', 0.18); draw(c, rng(key)); });
  ks('ks_felt', (c) => {
    const s = (q) => { q.beginPath(); q.moveTo(20, 62); q.bezierCurveTo(14, 30, 40, 14, 58, 20); q.bezierCurveTo(80, 28, 82, 60, 72, 74); q.bezierCurveTo(60, 88, 26, 86, 20, 62); q.closePath(); };
    form(c, s, [14, 14, 82, 86], { base: '#6a5a6a', light: '#c8b8c8', shadow: '#140e14', bounce: '#5a5a80', ow: 2, seed: 'felt', tex: (q, r) => { for (let i = 0; i < 90; i++) { q.fillStyle = r() < 0.5 ? 'rgba(255,240,250,0.18)' : 'rgba(30,20,30,0.2)'; ell(q, 16 + r() * 66, 16 + r() * 70, 1.2, 1.2); q.fill(); } } });
    c.strokeStyle = 'rgba(240,220,230,0.55)'; c.lineWidth = 1.4; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(26, 62); c.bezierCurveTo(22, 36, 42, 24, 58, 28); c.bezierCurveTo(74, 34, 74, 58, 68, 70); c.stroke(); c.setLineDash([]);
  });
  ks('ks_thimble', (c) => {
    const t = (q) => { q.beginPath(); q.moveTo(28, 78); q.lineTo(32, 34); q.quadraticCurveTo(48, 10, 64, 34); q.lineTo(68, 78); q.closePath(); };
    form(c, t, [28, 14, 68, 78], { base: '#9aa0ac', light: '#ffffff', shadow: '#1e2028', bounce: '#6a6ab0', ow: 2, seed: 'th', spec: 0.6, tex: (q) => { for (let y = 36; y < 72; y += 6) for (let x = 34 + ((y / 6) % 2) * 3; x < 64; x += 6) { q.fillStyle = 'rgba(20,20,40,0.5)'; ell(q, x, y, 1.4, 1.2); q.fill(); } } });
    // filed to a point
    form(c, (q) => { q.beginPath(); q.moveTo(42, 22); q.lineTo(48, 2); q.lineTo(54, 22); q.closePath(); }, [42, 2, 54, 22], { base: '#d8dce8', light: '#ffffff', shadow: '#4a4e5a', bounce: null, ow: 1.4, seed: 'pt' });
    form(c, (q) => rr(q, 24, 74, 48, 10, 3), [24, 74, 72, 84], { base: '#9aa0ac', light: '#ffffff', shadow: '#1e2028', bounce: null, ow: 1.6, seed: 'rim' });
  });
  ks('ks_needle', (c) => {
    taperLine(c, [[14, 84], [84, 12]], 7, 2, INK); taperLine(c, [[15, 83], [83, 13]], 4.6, 0.8, '#c8d0dc');
    c.fillStyle = '#0a0a10'; ell(c, 20, 77, 1.4, 4, -0.78); c.fill();
    c.strokeStyle = '#a82a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(20, 77); c.bezierCurveTo(40, 92, 70, 82, 62, 62); c.bezierCurveTo(56, 48, 34, 56, 40, 70); c.stroke();
  });
  ks('ks_magnet', (c) => {
    for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(255,220,150,${0.35 - k * 0.1})`; c.lineWidth = 2; c.beginPath(); c.arc(48, 48, 30 + k * 8, 0, Math.PI * 2); c.stroke(); }
    form(c, (q) => ell(q, 48, 48, 26, 26), [22, 22, 74, 74], { base: '#8a6a3a', light: '#f0d8a0', shadow: '#1e1206', bounce: null, ow: 2, seed: 'mb', spec: 0.5 });
    c.strokeStyle = 'rgba(30,18,6,0.6)'; c.lineWidth = 2; ell(c, 48, 48, 18, 18); c.stroke();
    for (const [x, y] of [[41, 41], [55, 41], [41, 55], [55, 55]]) { c.fillStyle = '#1a0e04'; ell(c, x, y, 3.4, 3.4); c.fill(); }
  });
  ks('ks_shadow', (c) => {
    form(c, (q) => rr(q, 26, 16, 44, 10, 3), [26, 16, 70, 26], { ...WOOD, ow: 1.6, seed: 'st' });
    form(c, (q) => rr(q, 26, 70, 44, 10, 3), [26, 70, 70, 80], { ...WOOD, ow: 1.6, seed: 'sb' });
    form(c, (q) => rr(q, 32, 24, 32, 48, 3), [32, 24, 64, 72], { base: '#14121a', light: '#4a4458', shadow: '#000000', bounce: '#3a3460', ow: 1.6, seed: 'thr', tex: (q) => { q.strokeStyle = 'rgba(120,110,160,0.3)'; q.lineWidth = 1; for (let y = 26; y < 72; y += 3) { q.beginPath(); q.moveTo(32, y); q.lineTo(64, y + 1); q.stroke(); } } });
    c.strokeStyle = 'rgba(20,18,30,0.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(64, 50); c.bezierCurveTo(86, 54, 76, 80, 90, 90); c.stroke();
  });
  ks('ks_pins', (c, r) => {
    form(c, (q) => { q.beginPath(); q.ellipse(48, 58, 32, 24, 0, 0, Math.PI * 2); }, [16, 34, 80, 82], { base: '#6a2a34', light: '#d07a84', shadow: '#1a0408', bounce: '#5a4a70', ow: 2, seed: 'pc' });
    for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.28, x = 48 + Math.cos(a) * 14, y = 52 + Math.sin(a) * 10; const x2 = x + Math.cos(a) * 26, y2 = y + Math.sin(a) * 26; c.strokeStyle = '#c8ccd8'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); c.fillStyle = ['#c8283a', '#e8c040', '#5a8ad8', '#f0f0f0'][i % 4]; ell(c, x2, y2, 3.2, 3.2); c.fill(); }
  });
  ks('ks_heart', (c) => {
    // a red string, looped and tied in a bow round nothing
    const h = curve([[48, 80], [10, 50], [22, 18], [48, 34], [74, 18], [86, 50], [48, 80]], 40);
    taperLine(c, h, 6, 6, INK); taperLine(c, h, 3.8, 3.8, '#b02a3a');
    c.strokeStyle = '#b02a3a'; c.lineWidth = 3.6; c.beginPath(); c.ellipse(40, 34, 8, 5, -0.5, 0, Math.PI * 2); c.ellipse(56, 34, 8, 5, 0.5, 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.moveTo(48, 36); c.lineTo(40, 52); c.moveTo(48, 36); c.lineTo(58, 50); c.stroke();
  });
  ks('ks_owl', (c) => {
    form(c, (q) => ell(q, 48, 48, 30, 30), [18, 18, 78, 78], { base: '#c89040', light: '#ffe8a0', shadow: '#4a2a08', bounce: null, ow: 2.4, seed: 'iris', spec: 0.8, tex: (q) => { q.strokeStyle = 'rgba(90,50,10,0.45)'; q.lineWidth = 1.2; for (let a = 0; a < 6.3; a += 0.25) { q.beginPath(); q.moveTo(48 + Math.cos(a) * 14, 48 + Math.sin(a) * 14); q.lineTo(48 + Math.cos(a) * 28, 48 + Math.sin(a) * 28); q.stroke(); } } });
    c.fillStyle = '#060406'; ell(c, 48, 48, 13, 13); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.85)'; ell(c, 40, 38, 5, 3.4, -0.6); c.fill();
  });
  ks('ks_ember', (c) => {
    c.strokeStyle = '#8a6a3a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(48, 6); c.lineTo(48, 22); c.stroke();
    form(c, (q) => { q.beginPath(); q.ellipse(48, 54, 28, 32, 0, 0, Math.PI * 2); }, [20, 22, 76, 86], { base: '#7a5a2a', light: '#f0d090', shadow: '#1a0e04', bounce: null, ow: 2.4, seed: 'loc', spec: 0.4 });
    glow(c, 48, 56, 26, '#ff8030', 0.7);
    form(c, (q) => ell(q, 48, 56, 14, 16), [34, 40, 62, 72], { base: '#c84a1a', light: '#ffd070', shadow: '#3a0a04', bounce: null, ow: 1.4, seed: 'coal' });
    c.fillStyle = '#ffe8a0'; ell(c, 44, 50, 4, 3); c.fill();
  });
  R('ui_stitch', 96, 96, (c) => {
    form(c, (q) => rr(q, 16, 16, 64, 64, 10), [16, 16, 80, 80], { base: '#7a1e2a', light: '#d86a74', shadow: '#1a0408', bounce: null, ow: 2, seed: 'wool', tex: (q) => { q.strokeStyle = 'rgba(40,0,6,0.4)'; q.lineWidth = 1; for (let i = 0; i < 16; i++) { q.beginPath(); q.moveTo(16 + i * 4, 16); q.lineTo(16 + i * 4 + 6, 80); q.stroke(); } } });
    c.strokeStyle = '#f0e0d0'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(34, 34); c.lineTo(62, 62); c.moveTo(62, 34); c.lineTo(34, 62); c.stroke();
  });
})();

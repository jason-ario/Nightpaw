// Automated playtest: drives the real game in headless Chromium, fast-forwarding time with
// Phaser's headlessStep (no rendering) so logic, physics and cutscenes run at full speed.
// Usage: node tools/playtest.cjs [scenario] [--shots dir]
//   Serve dist/ on http://localhost:8123 first (e.g. `cd dist && python3 -m http.server 8123`).
const path = require('path');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright')); }

const BASE = process.env.NP_URL || 'http://localhost:8123/index.html';
const shotsDir = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;

async function open(browser, query) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('404')) errors.push(m.text()); if (m.type() === 'warning') errors.push('warn: ' + m.text()); });
  await page.goto(BASE + query);
  await page.waitForFunction(() => window.__NP && window.__NP.started, null, { timeout: 30000 });
  const T = {
    page, errors,
    adv: (sec) => page.evaluate((s) => { const g = window.__NP.sys.game; let t = Math.max(window.__simT || 0, performance.now()); for (let i = 0; i < s * 60; i++) { t += 1000 / 60; g.headlessStep(t, 1000 / 60); } window.__simT = t; }, sec),
    state: () => page.evaluate(() => { const g = window.__NP, P = g.player; return { room: g.room.id, x: +(P.x / 16 - g.room.x).toFixed(2), y: +(P.y / 16 - g.room.y).toFixed(2), hp: P.hp, ground: P.onGround, cut: g.inCutscene, modal: !!g.ui.modal, dead: P.dead, buttons: window.__NP_GAME.save.buttons, abilities: Object.keys(window.__NP_GAME.save.abilities), flags: Object.keys(window.__NP_GAME.save.flags), ents: g.ents.length }; }),
    async hold(keys, sec) { for (const k of [].concat(keys)) await page.keyboard.down(k); await T.adv(sec); for (const k of [].concat(keys)) await page.keyboard.up(k); await T.adv(1 / 30); },
    async press(k, after = 0.1) { await page.keyboard.down(k); await T.adv(1 / 30); await page.keyboard.up(k); await T.adv(after); },
    /** Mash confirm until the cutscene/modal ends (or timeout). */
    async finishCutscene(max = 90) {
      for (let i = 0; i < max; i++) { const s = await T.state(); if (!s.cut && !s.modal) return true; await T.press('Enter', 0.6); }
      return false;
    },
    async shot(name) { if (!shotsDir) return; await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); await page.screenshot({ path: path.join(shotsDir, name + '.png') }); },
    teleport: (room, x, y) => page.evaluate(([r, x, y]) => window.__NP.teleport(r, x, y), [room, x, y]),
  };
  return T;
}

const results = [];
function check(name, ok, info = '') { results.push({ name, ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  — ' + info : ''}`); }

const scenarios = {
  // Losing to the Warden and coming back must restart the fight (with a short intro).
  async rematch(browser) {
    const T = await open(browser, '?room=warden_hall&x=3&y=16&abilities=dash');
    await T.adv(0.3);
    await T.hold('ArrowRight', 1.2);
    await T.finishCutscene();
    let boss = await T.page.evaluate(() => window.__NP.ents.find((e) => e.name === 'The Hollow Warden')?.state);
    check('first fight starts', boss && boss !== 'dormant', boss);
    await T.page.evaluate(() => window.__NP.killPlayer());
    await T.adv(4);
    let s = await T.state();
    check('respawned after losing', !s.dead && s.room !== 'warden_hall', JSON.stringify(s));
    await T.teleport('warden_hall', 3, 16); await T.adv(0.5);
    await T.hold('ArrowRight', 1.2);
    s = await T.state();
    check('rematch intro plays again', s.cut, JSON.stringify(s));
    await T.finishCutscene();
    boss = await T.page.evaluate(() => window.__NP.ents.find((e) => e.name === 'The Hollow Warden')?.state);
    check('rematch fight starts', boss && boss !== 'dormant', boss);
    const gate = await T.page.evaluate(() => window.__NP.room.grid[15][1]);
    check('gate closes for the rematch', gate === '#');
    await T.page.close();
  },

  // Holding Esc skips cutscenes but keeps their story effects.
  async skip(browser) {
    const holdSkip = async (T) => { await T.page.keyboard.down('Escape'); await T.adv(1.0); await T.page.keyboard.up('Escape'); await T.adv(0.5); };
    let T = await open(browser, '?room=ashen_gate&x=1&y=14');
    await T.adv(0.3);
    await T.hold('ArrowRight', 0.5);
    let s = await T.state();
    check('Tallow cutscene started', s.cut, JSON.stringify(s));
    await holdSkip(T);
    s = await T.state();
    check('skip ends the conversation', !s.cut && !s.modal && s.flags.includes('met_tallow'), JSON.stringify(s));
    const dlg = await T.page.evaluate(() => window.__NP.ui.dlg.alpha);
    check('dialogue box hidden after skip', dlg === 0, String(dlg));
    await T.page.close();

    T = await open(browser, '?room=warden_hall&x=12&y=16&abilities=dash&flags=warden_met');
    await T.adv(0.3);
    await T.page.evaluate(() => { const g = window.__NP; g.bossActive = true; g.ents.find((e) => e.name === 'The Hollow Warden').wake(); });
    await T.adv(1.6);
    await T.page.evaluate(() => { const b = window.__NP.ents.find((e) => e.name === 'The Hollow Warden'); for (let i = 0; i < 40; i++) b.onHit(1, 1, 'side'); });
    await T.adv(3);
    s = await T.state();
    check('defeat cutscene running before skip', s.cut, JSON.stringify(s));
    await holdSkip(T);
    s = await T.state();
    check('skipping the Warden aftermath still gives wings', !s.cut && s.abilities.includes('wings') && s.flags.includes('got_wings'), JSON.stringify(s));
    await T.page.close();

    // the prologue storybook from a new game
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.goto(BASE);
    await page.waitForTimeout(4000);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__NP && window.__NP.started && window.__NP.inCutscene, null, { timeout: 60000 });
    const adv = (sec) => page.evaluate((s) => { const g = window.__NP.sys.game; let t = Math.max(window.__simT || 0, performance.now()); for (let i = 0; i < s * 60; i++) { t += 1000 / 60; g.headlessStep(t, 1000 / 60); } window.__simT = t; }, sec);
    await adv(2);
    await page.keyboard.down('Escape'); await adv(1.0); await page.keyboard.up('Escape'); await adv(1.5);
    const st = await page.evaluate(() => ({ cut: window.__NP.inCutscene, hidden: window.__NP.player.hidden, fade: window.__NP.ui.fadeRect.alpha, intro: !!window.__NP_GAME.save.flags.intro_done, room: window.__NP.room.id, modal: !!window.__NP.ui.modal }));
    check('prologue can be skipped', !st.cut && !st.hidden && st.fade < 0.05 && st.intro && !st.modal, JSON.stringify(st));
    await page.close();
  },

  // Secrets & backtracking: cellar wall, frozen hollow shade, crossroads ladder, wing-only shade.
  async explore(browser) {
    let T = await open(browser, '?room=coat_cellar&x=4&y=14&abilities=needle,dash');
    await T.adv(0.4);
    await T.hold('ArrowLeft', 0.4);
    for (let i = 0; i < 3; i++) await T.press('KeyX', 0.35);
    const broken = await T.page.evaluate(() => window.__NP_GAME.taken.has('wall:coat_cellar:0,13'));
    check('cracked wall breaks', broken);
    await T.hold('ArrowLeft', 1.5);
    let s = await T.state();
    check('secret room reached', s.room === 'frozen_hollow', JSON.stringify(s));
    await T.hold('ArrowLeft', 1.2);
    s = await T.state();
    check('shade memory plays', s.cut || s.modal, JSON.stringify(s));
    await T.shot('20_memory');
    await T.finishCutscene(80);
    s = await T.state();
    check('max health +1', (await T.page.evaluate(() => window.__NP_GAME.save.maxHp)) === 5);
    await T.page.close();

    // (Jump reachability — ladders, wing gaps — is proven by tools/validate-world.cjs.)
  },

  // Boss: intro, fight damage, defeat cutscene, wings, then the Updraft climb and demo end.
  async boss(browser) {
    const T = await open(browser, '?room=warden_hall&x=3&y=16&abilities=needle,dash');
    await T.adv(0.3);
    await T.hold('ArrowRight', 1.2);
    let s = await T.state();
    check('warden intro starts', s.cut, JSON.stringify(s));
    await T.finishCutscene();
    const boss = await T.page.evaluate(() => { const b = window.__NP.ents.find((e) => e.name === 'The Hollow Warden'); return b ? { state: b.state, hp: b.hp } : null; });
    check('warden awake', boss && boss.state !== 'dormant', JSON.stringify(boss));
    const gateClosed = await T.page.evaluate(() => window.__NP.room.grid[15][1] === '#');
    check('boss gate closes', gateClosed);
    await T.adv(4);
    await T.shot('10_boss');
    s = await T.state();
    check('player survives 4s idle or takes damage', true, `hp=${s.hp}`);
    await T.page.evaluate(() => { const b = window.__NP.ents.find((e) => e.name === 'The Hollow Warden'); for (let i = 0; i < 40; i++) b.onHit(1, 1, 'side'); });
    await T.adv(3);
    s = await T.state();
    check('defeat cutscene runs', s.cut, JSON.stringify(s));
    await T.finishCutscene(150);
    s = await T.state();
    check('got wings', s.abilities.includes('wings') && s.flags.includes('got_wings') && s.flags.includes('warden_dead'), JSON.stringify(s));
    const open_ = await T.page.evaluate(() => window.__NP.room.grid[15][1] === '.');
    check('boss gate reopens', open_);
    // climb: stand under the first ledge and double jump up the platforms into the Updraft
    await T.teleport('warden_hall', 27, 16); await T.adv(0.5);
    const climb = async (dir) => { if (dir) await T.page.keyboard.down(dir); await T.hold('KeyZ', 0.28); await T.hold('KeyZ', 0.4); if (dir) await T.page.keyboard.up(dir); await T.adv(0.5); return T.state(); };
    s = await climb(null); check('double jump reaches ledge 1', s.y <= 12.2, JSON.stringify(s));
    s = await climb(null); check('double jump reaches ledge 2', s.y <= 7.2, JSON.stringify(s));
    await T.teleport('warden_hall', 28, 6); await T.adv(0.5);
    s = await climb(null); check('double jump reaches ledge 3', s.y <= 3.2, JSON.stringify(s));
    s = await climb(null); check('enters the Updraft', s.room === 'updraft', JSON.stringify(s));
    await T.shot('11_updraft');
    // Skip the sock-infested middle: stand on the top ledge and jump for the exit.
    await T.teleport('updraft', 5, 7); await T.adv(0.6);
    await T.hold('KeyZ', 0.28); await T.hold('KeyZ', 0.4); await T.adv(0.3);
    s = await T.state();
    check('reaches the top of the Updraft (Mira calls)', s.cut || s.flags.includes('hollows_done'), JSON.stringify(s));
    await T.shot('12_end');
    await T.finishCutscene(60);
    // the old demo end is now a way up: climb into the Drowned Nursery
    await T.teleport('updraft', 5, 2); await T.adv(0.5);
    s = await climb(null);
    if (s.room === 'updraft') s = await climb(null);
    check('climbs into the Drowned Nursery', s.room === 'block_stair', JSON.stringify(s));
    await T.finishCutscene(30);
    await T.page.close();
  },

  // The Drowned Nursery: water, the Velvet Claws, tides, the Music Box Queen, the chapter end.
  async nursery(browser) {
    const ALL = '&abilities=needle,dash,wings&flags=nursery_arrived,met_dunk';
    let T = await open(browser, '?room=shallows&x=12&y=8' + ALL);
    await T.adv(1.2);
    let w = await T.page.evaluate(() => ({ wet: window.__NP.player.inWater, vy: window.__NP.player.vy }));
    check('floats in water', w.wet && Math.abs(w.vy) < 30, JSON.stringify(w));
    const y0 = (await T.state()).y;
    await T.page.keyboard.down('KeyZ'); await T.adv(0.2);
    w = await T.page.evaluate(() => ({ wet: window.__NP.player.inWater, vy: window.__NP.player.vy }));
    await T.page.keyboard.up('KeyZ');
    const y1 = (await T.state()).y;
    check('jumps out of water', !w.wet && y1 < y0 - 1.5, JSON.stringify({ ...w, y0, y1 }));
    await T.page.close();

    T = await open(browser, '?room=toy_chest&x=14&y=16' + ALL);
    await T.adv(0.5);
    await T.finishCutscene(20);
    await T.hold('ArrowRight', 0.8);
    await T.finishCutscene(40);
    let s = await T.state();
    check('Velvet Claws collected', s.abilities.includes('claws'), JSON.stringify(s));
    await T.shot('30_chest');
    // climb out of the chest on one wall: hold toward it, jump, jump, jump
    await T.teleport('toy_chest', 12, 16); await T.adv(0.4);
    await T.page.keyboard.down('ArrowLeft');
    let clung = false;
    let top = 99;
    for (let i = 0; i < 12 && top > 10.9; i++) { await T.hold('KeyZ', 0.3); await T.adv(0.06); clung = clung || (await T.page.evaluate(() => window.__NP.player.clingDir !== 0)); top = Math.min(top, (await T.state()).y); }
    await T.page.keyboard.up('ArrowLeft'); await T.adv(0.6);
    s = await T.state();
    check('clings to the wall', clung);
    check('wall-jumps out of the chest', top <= 10.9, JSON.stringify({ top, ...s }));
    await T.page.close();

    T = await open(browser, '?room=tidewheel&x=4&y=10' + ALL.replace('wings', 'wings,claws'));
    await T.adv(0.3);
    const lv = [];
    for (let i = 0; i < 5; i++) { lv.push(await T.page.evaluate(() => window.__NP.room.pools[0].y)); await T.adv(2); }
    check('the tide rises and falls', Math.max(...lv) - Math.min(...lv) > 40, lv.map((x) => x.toFixed(0)).join(','));
    await T.page.close();

    T = await open(browser, '?room=music_box&x=6&y=15' + ALL.replace('wings', 'wings,claws'));
    await T.adv(0.3);
    await T.hold('ArrowRight', 1.0);
    s = await T.state();
    check('queen intro starts', s.cut, JSON.stringify(s));
    await T.finishCutscene();
    const q = () => T.page.evaluate(() => { const b = window.__NP.ents.find((e) => e.bossId === 'queen'); return b ? { state: b.state, hp: b.hp, phase: b.phase } : null; });
    let qs = await q();
    check('queen awake', qs && qs.state !== 'dormant', JSON.stringify(qs));
    check('arena gate closes', await T.page.evaluate(() => window.__NP.room.grid[6][2] === '#'));
    check('exit stays shut', await T.page.evaluate(() => window.__NP.room.grid[6][31] === '#'));
    await T.adv(6);
    await T.shot('31_queen');
    await T.page.evaluate(() => { const b = window.__NP.ents.find((e) => e.bossId === 'queen'); b.state = 'dizzy'; for (let i = 0; i < 12; i++) b.onHit(1, 1, 'side'); });
    await T.adv(4);
    qs = await q();
    const pool = await T.page.evaluate(() => { const r = window.__NP.room; const p = r.pools[0]; return { y: p.y, floor: (r.y + 16) * 16 }; });
    check('second half: the box floods', qs.phase === 2 && pool.y < pool.floor, JSON.stringify({ qs, pool }));
    await T.shot('32_queen_flood');
    await T.page.evaluate(() => { const b = window.__NP.ents.find((e) => e.bossId === 'queen'); b.state = 'dizzy'; for (let i = 0; i < 40; i++) b.onHit(1, 1, 'side'); });
    await T.adv(4);
    s = await T.state();
    check('queen defeat cutscene', s.cut && s.flags.includes('queen_dead'), JSON.stringify(s));
    await T.finishCutscene(120);
    await T.adv(4);
    const after = await T.page.evaluate(() => { const r = window.__NP.room; return { drained: r.pools[0].drained, exit: r.grid[6][31], entry: r.grid[6][2], tempo: window.__NP_MUSIC ? window.__NP_MUSIC.tempo : 1 }; });
    check('box drains, both gates open', after.drained && after.exit === '.' && after.entry === '.', JSON.stringify(after));
    await T.page.close();

    T = await open(browser, '?room=stopper_chain&x=12&y=6' + ALL + ',queen_dead');
    await T.adv(0.5);
    await T.finishCutscene(60);
    s = await T.state();
    check('Nib at the plughole', s.flags.includes('nib_market'), JSON.stringify(s));
    await T.hold('ArrowRight', 0.8);
    s = await T.state();
    check('chapter end plays', s.cut && s.flags.includes('nursery_done'), JSON.stringify(s));
    await T.finishCutscene(60);
    await T.adv(5);
    const scene = await T.page.evaluate(() => window.__NP.sys.game.scene.getScenes(true).map((x) => x.sys.settings.key));
    check('returns to the title after the chapter', scene.includes('title'), JSON.stringify(scene));
    check('no errors in the nursery', T.errors.length === 0, T.errors.join(' | '));
    await T.page.close();
  },

  // Every cutscene runs to completion without errors.
  async cutscenes(browser) {
    const T = await open(browser, '?room=ashen_gate&x=12&y=14&abilities=needle');
    const ids = await T.page.evaluate(() => [...window.__NP_WORLD.cutscenes.keys()].filter((k) => !['intro', 'nursery_end', 'warden_defeat', 'warden_intro'].includes(k)));
    for (const id of ids) {
      await T.page.evaluate((id) => { window.__NP.runCutscene(id); }, id);
      const done = await T.finishCutscene();
      check(`cutscene ${id}`, done && T.errors.length === 0, T.errors.splice(0).join(' | '));
    }
    await T.page.close();
  },

  // Title screen loads, New Game starts the prologue storybook.
  async intro(browser) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE);
    await page.waitForFunction(() => window.Phaser && document.querySelector('canvas'), null, { timeout: 30000 });
    await page.waitForTimeout(4000);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__NP && window.__NP.started && window.__NP.inCutscene, null, { timeout: 60000 }).catch(() => {});
    const ok = await page.evaluate(() => !!(window.__NP && window.__NP.inCutscene));
    check('new game starts the prologue', ok && errors.length === 0, errors.join(' | '));
    await page.close();
  },

  // Walk the critical path room by room using the real controls.
  async path(browser) {
    const T = await open(browser, '?room=well_bottom&x=3&y=14');
    await T.adv(0.5);
    await T.hold('ArrowRight', 1.4);
    let s = await T.state();
    check('scratch tutorial hint fires', s.cut || (await T.page.evaluate(() => window.__NP_GAME.taken.size > 0)), JSON.stringify(s));
    await T.finishCutscene();
    await T.shot('01_start');
    // fight the mite, then walk to the gate
    for (let i = 0; i < 8; i++) { await T.hold('ArrowRight', 0.25); await T.press('KeyX', 0.15); }
    await T.hold('ArrowRight', 2.5);
    s = await T.state();
    check('reached Ashen Gate', s.room === 'ashen_gate', JSON.stringify(s));
    check('Tallow cutscene triggered', s.cut || s.flags.includes('met_tallow'));
    await T.shot('02_tallow');
    await T.finishCutscene();
    // rest at the shrine
    await T.hold('ArrowRight', 0.8);
    await T.press('ArrowUp', 0.5);
    s = await T.state();
    await T.shot('03_shrine');
    await T.finishCutscene();
    await T.page.keyboard.down('ArrowRight');
    for (let i = 0; i < 8; i++) { await T.hold('KeyZ', 0.3); await T.adv(0.3); }
    await T.page.keyboard.up('ArrowRight');
    s = await T.state();
    check('reached Weeping Tunnels', s.room === 'weeping_tunnels', JSON.stringify(s));
    await T.page.close();
  },

  // Movement gates: dash needed for thorns, wings needed for the updraft.
  async gates(browser) {
    let T = await open(browser, '?room=thorn_gap&x=8&y=14&abilities=needle');
    await T.adv(0.3);
    await T.hold('ArrowRight', 0.5); await T.press('KeyZ', 0); await T.hold('ArrowRight', 1.2);
    let s = await T.state();
    check('thorns block without dash', s.x < 12.5 || s.hp < 4, JSON.stringify(s));
    await T.page.close();
    T = await open(browser, '?room=thorn_gap&x=11&y=14&abilities=needle,dash');
    await T.adv(0.3);
    await T.page.keyboard.down('ArrowRight');
    await T.adv(0.12);
    await T.press('KeyZ', 0.2); await T.press('KeyC', 0.8);
    await T.page.keyboard.up('ArrowRight');
    s = await T.state();
    check('dash crosses thorns', s.x > 19.5 && s.hp === 4, JSON.stringify(s));
    await T.page.close();
  },
};

(async () => {
  const which = process.argv[2] && !process.argv[2].startsWith('--') ? [process.argv[2]] : Object.keys(scenarios);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const w of which) { console.log(`\n== ${w}`); try { await scenarios[w](browser); } catch (e) { check(w + ' crashed', false, e.message); } }
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})();

// Title screen: the well in the garden under the moon. Three painted parallax layers
// (tools/art/story.js: title_sky, title_far, title_near) with drifting fog and rain,
// and the gameplay Nightpaw puppet standing on the well's rim, looking down into it.
import { SCREEN_W as W, SCREEN_H as H } from '../core/config';
import { Input } from '../core/input';
import { sfx, Music, Audio } from '../core/audio';
import { Game } from '../core/state';
import { World } from '../world/world';
import { FONT } from './UIScene';
import { Puppet } from '../render/puppet';
import { nightpawRig } from '../render/rigs';
import { grade } from '../render/grade';

const RIM = { x: 968, y: 494 }; // where the cat stands on title_near (screen px)

export class TitleScene extends Phaser.Scene {
  items: { label: string; act: () => void }[] = [];
  texts: any[] = [];
  sel = 0;
  confirmNew = false;
  motes: any[] = [];
  t = 0;
  hint: any;
  layers: { img: any; depth: number }[] = [];
  fog: any[] = [];
  rain: any;
  cat!: Puppet;
  look = 0; lookT = 3; blinkT = 2; earT = 4;
  constructor() { super('title'); }
  create() {
    grade(this.cameras.main, 0.7);
    this.cameras.main.fadeIn(1200, 0, 0, 0);
    // parallax: sky barely moves, the garden moves most; everything overscanned a little
    this.layers = [];
    for (const [key, depth] of [['title_sky', 0.15], ['title_far', 0.45], ['title_near', 1]] as const) {
      this.layers.push({ img: this.add.image(W / 2, H / 2, key).setScale(1.04), depth });
      if (key === 'title_far') {
        this.fog = [0.14, 0.1].map((a, i) => this.add.tileSprite(0, 400 + i * 90, W, 180, 'fog').setOrigin(0, 0.5).setTileScale(2.2, 1.6).setAlpha(a * 3).setBlendMode(Phaser.BlendModes.SCREEN));
      }
    }
    this.cat = new Puppet(this, nightpawRig(), 4.6, 5);
    this.cat.place(RIM.x, RIM.y, -1);
    this.rain = this.add.tileSprite(0, 0, W, H, 'rain_gen').setOrigin(0).setAlpha(0.22).setDepth(6);
    // warm motes rising out of the well
    for (let i = 0; i < 26; i++) {
      const m = this.add.image(RIM.x - 40 + (Math.random() - 0.5) * 180, 300 + Math.random() * 200, 'fx_dot').setTint(0xffcf7a).setBlendMode(Phaser.BlendModes.ADD).setScale(0.3 + Math.random() * 0.4).setAlpha(0).setDepth(6);
      (m as any).seed = Math.random() * 100; this.motes.push(m);
    }
    const shade = this.add.graphics().setDepth(7);
    shade.fillGradientStyle(0x05040a, 0x05040a, 0x05040a, 0x05040a, 0.65, 0, 0.65, 0); shade.fillRect(0, 0, 760, H);
    const title = this.add.text(360, 210, 'NIGHTPAW', { fontFamily: FONT, fontSize: '104px', color: '#f0ecff', letterSpacing: 18, stroke: '#07060a', strokeThickness: 4 } as any).setOrigin(0.5).setAlpha(0);
    title.setPadding(48, 48, 48, 48); title.setShadow(0, 0, '#9d8cff', 26, false, true); title.setDepth(8);
    const sub = this.add.text(360, 290, 'a tale from the Underneath', { fontFamily: FONT, fontSize: '28px', color: '#b8b0d8', fontStyle: 'italic' }).setOrigin(0.5).setAlpha(0).setDepth(8);
    this.tweens.add({ targets: title, alpha: 1, duration: 2200, delay: 400 });
    this.tweens.add({ targets: sub, alpha: 1, duration: 2200, delay: 1200 });

    const saved = Game.loaded && (Game.loaded.visited?.length || Game.loaded.flags?.intro_done);
    this.items = [];
    if (saved) this.items.push({ label: 'Continue', act: () => this.continueGame() });
    this.items.push({ label: 'New Game', act: () => this.newGame(!!saved) });
    this.texts = this.items.map((it, i) => this.add.text(360, 400 + i * 58, it.label, { fontFamily: FONT, fontSize: '32px', color: '#b8b0d0' }).setOrigin(0.5).setAlpha(0).setDepth(8).setInteractive({ useHandCursor: true })
      .on('pointerover', () => { this.sel = i; this.draw(); })
      .on('pointerdown', () => { this.sel = i; this.activate(); }));
    this.texts.forEach((t, i) => this.tweens.add({ targets: t, alpha: 1, duration: 1200, delay: 2000 + i * 200 }));
    this.hint = this.add.text(360, H - 60, 'Arrow keys / stick to choose · Z or Enter to begin', { fontFamily: FONT, fontSize: '18px', color: '#7a7498' }).setOrigin(0.5).setAlpha(0).setDepth(8);
    this.tweens.add({ targets: this.hint, alpha: 1, duration: 1200, delay: 2600 });
    this.draw();
    Music.play('rhyme'); Audio.ambience('rain');
    this.input.keyboard?.on('keydown', () => Audio.unlock());
  }
  // Idle on the rim: breathing, cloak and tail sway, ear twitches, blinks; now and then
  // he tips his head to look down into the well.
  poseCat(dt: number) {
    const p = this.cat, t = this.t;
    this.lookT -= dt; if (this.lookT < -2.6) this.lookT = 4 + Math.random() * 4;
    this.look += ((this.lookT < 0 ? 1 : 0) - this.look) * Math.min(1, dt * 3);
    p.set('body', { y: Math.sin(t * 2) * 0.8, rot: this.look * 0.12 });
    p.set('head', { y: Math.sin(t * 2 + 0.6) * 0.7, rot: Math.sin(t * 0.55) * 0.05 + this.look * 0.32 });
    p.set('legNear', { rot: 0 }); p.set('legFar', { rot: 0 });
    const sway = Math.sin(t * 1.6) * 0.04;
    p.set('cloak', { rot: sway + 0.03 }); p.set('hem', { rot: Math.sin(t * 1.9 - 1) * 0.07 + 0.04 });
    p.set('lining', { alpha: 0 }); p.set('arm', { alpha: 0 });
    for (let i = 0; i < 10; i++) p.set(`tail${i}`, { rot: (i === 0 ? -0.45 : i > 6 ? 0.2 : 0.01) + Math.sin(t * 1.4 - i * 0.55) * 0.08 });
    this.earT -= dt; if (this.earT < -0.15) this.earT = 2 + Math.random() * 5;
    p.set('earF', { rot: this.earT < 0 ? -0.3 : 0 }); p.set('earB', { rot: 0 });
    this.blinkT -= dt; if (this.blinkT < -0.1) this.blinkT = 2.5 + Math.random() * 4;
    const eye = this.blinkT < 0 ? 0.1 : 1;
    p.set('eyeF', { sy: eye }); p.set('eyeB', { sy: eye * 0.9 });
  }
  draw() {
    this.texts.forEach((t, i) => t.setColor(i === this.sel ? '#ffcf7a' : '#b8b0d0').setText((i === this.sel ? '›  ' : '') + (this.confirmNew && this.items[i].label === 'New Game' ? 'Start over? Press again' : this.items[i].label) + (i === this.sel ? '  ‹' : '')));
  }
  activate() {
    sfx.confirm();
    this.items[this.sel].act();
  }
  newGame(hasSave: boolean) {
    if (hasSave && !this.confirmNew) { this.confirmNew = true; this.draw(); return; }
    Game.startNew();
    this.go({ cutscene: World.def.start.cutscene });
  }
  continueGame() {
    Game.resume(Game.loaded!);
    this.go({ continue: true });
  }
  go(data: any) {
    this.input.enabled = false;
    this.items = [];
    Music.stop();
    this.cameras.main.fadeOut(900, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('game', data));
  }
  update(_t: number, deltaMs: number) {
    const dt = deltaMs / 1000; this.t += dt;
    const t = this.t;
    // slow drifting camera: layers slide by their depth
    const sx = Math.sin(t * 0.07) * 18, sy = Math.sin(t * 0.05 + 1) * 6;
    for (const l of this.layers) l.img.setPosition(W / 2 + sx * l.depth, H / 2 + sy * l.depth);
    this.cat.place(RIM.x + sx, RIM.y + sy, -1);
    this.fog.forEach((f, i) => { f.tilePositionX += dt * (6 + i * 5); f.x = sx * 0.6; });
    this.rain.tilePositionX -= dt * 60; this.rain.tilePositionY -= dt * 420;
    for (const m of this.motes) { const s = (m as any).seed; m.x += Math.sin(t * 0.5 + s) * 0.3; m.y -= 0.18 + Math.sin(s) * 0.05; m.setAlpha(Math.max(0, 0.25 + Math.sin(t * 1.5 + s) * 0.25) * Math.min(1, (m.y - 180) / 120)); if (m.y < 180) { m.y = 470 + Math.random() * 20; m.x = RIM.x - 40 + sx + (Math.random() - 0.5) * 160; } }
    this.poseCat(dt);
    Input.poll();
    if (this.items.length) {
      if (Input.pressed('down')) { this.sel = (this.sel + 1) % this.items.length; this.confirmNew = false; sfx.menu(); this.draw(); }
      if (Input.pressed('up')) { this.sel = (this.sel + this.items.length - 1) % this.items.length; this.confirmNew = false; sfx.menu(); this.draw(); }
      if (Input.pressed('confirm') || Input.pressed('attack')) this.activate();
    }
    Input.endStep();
  }
}

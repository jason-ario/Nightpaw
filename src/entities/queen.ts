// The Music Box Queen: boss of the Drowned Nursery. A porcelain wind-up ballerina who has
// danced for sixty years for a child who never came back to wind her.
//  - Pirouette: spins across the box; can't be hurt while spinning, dizzy when she stops.
//  - Grand jeté: leaps at you and lands on pointe, sending ripples both ways.
//  - Notes: flings glowing notes in arcs (they can be knocked back into her).
//  - Second half: the tune winds tighter, her box floods and drains in time with it.
import { PH, DEPTH, INV_ART, T } from '../core/config';
import { rand, clamp, damp } from '../core/util';
import { sfx, Music, Audio } from '../core/audio';
import { Game } from '../core/state';
import { moveBody, tileAt, isSolid } from '../world/world';
import { Puppet } from '../render/puppet';
import { queenRig } from '../render/rigs';
import { Entity, register, Ctx } from './entity';
import type { EntityDef } from '../content/types';

type State = 'dormant' | 'intro' | 'idle' | 'glide' | 'windSpin' | 'spin' | 'dizzy' | 'windLeap' | 'leap' | 'land' | 'notes' | 'curtsy' | 'dying' | 'gone';

export class Queen extends Entity {
  isBoss = true; bossId = 'queen'; music = 'queen'; ambience = 'nursery';
  puppet: Puppet;
  state: State = 'dormant';
  st = 0; spinT = 0; spinA = 0; phase = 1; lastAttack = ''; noteN = 0; bounces = 0;
  floorRow = 0;
  constructor(g: Ctx, d: EntityDef, x: number, y: number) {
    super(g, d, x, y);
    this.w = 18; this.h = 40; this.hp = this.maxHp = 34; this.face = -1; this.name = 'The Music Box Queen';
    this.puppet = new Puppet(g.scene, queenRig(), 0.9, DEPTH.enemy);
    this.hittable = true;
    this.floorRow = Math.floor((y + this.h) / T) - g.room.y;
  }
  static get defeated() { return !!Game.flag('queen_dead'); }
  wake() { if (this.state === 'dormant') this.set('intro'); }
  set(s: State) { this.state = s; this.st = 0; }
  pool() { return this.g.room.pools.find((p) => p.def.id === 'box') ?? null; }

  onHit(dmg: number, dir: number, _kind: string) {
    if (['dormant', 'intro', 'dying', 'gone', 'curtsy'].includes(this.state)) return false;
    if (this.state === 'spin') { // porcelain skirts: the claw skids off
      sfx.clink(); this.g.burst(this.cx - dir * 6, this.cy, 6, 0xffe0f0, { spd: 120, life: 0.3, size: 1.3, glow: true });
      return false;
    }
    this.hp -= this.state === 'dizzy' ? dmg * 1.5 : dmg; this.flashT = 0.1;
    if (this.hp <= 0) { this.die(); return true; }
    if (this.phase === 1 && this.hp < this.maxHp * 0.5) { this.phase = 2; this.set('curtsy'); }
    return true;
  }
  die() {
    this.set('dying'); this.harm = 0; this.g.hitstop(0.35); this.g.shake(10);
    sfx.windDown(); Music.stop(); Music.tempo = 1; Audio.ambience('nursery');
    const p = this.pool(); if (p) p.target = null;
  }

  update(dt: number) {
    this.st += dt;
    const P = this.g.player, pcx = P.cx, bcx = this.cx;
    if (this.state === 'dormant' || this.state === 'gone') return;
    if (this.state === 'dying') {
      this.vx = 0; this.spinA += dt * Math.max(0, 6 - this.st * 3);
      if (Math.random() < 0.3) this.g.burst(this.x + rand(0, this.w), this.y + rand(0, this.h), 2, 0xffe0f0, { spd: 60, life: 0.8, size: 1.6, glow: true, grav: -30 });
      if (this.st > 2.4) {
        this.set('gone'); this.g.bossBar(null);
        this.g.burst(bcx, this.cy, 40, 0xf4e8ec, { spd: 160, life: 1.2, size: 2.5, grav: 200 });
        this.g.dropCoins(bcx, this.cy, 34);
        Game.setFlag('queen_dead'); Game.achieve('queen');
        this.g.runCutscene('queen_defeat', { entity: this });
      }
      return;
    }
    const m = this.phase === 2 ? 1.25 : 1;
    Music.tempo = this.phase === 2 ? 1.35 : 1;
    // second half: her box floods and drains with the music
    const pool = this.pool();
    if (pool && this.phase === 2 && this.state !== 'intro') {
      const k = (Math.sin(this.g.scene.time_ * 1.05) + 1) / 2;
      pool.target = (this.g.room.y + this.floorRow - 0.2 - k * 2.6) * T + 4;
    }
    this.harm = ['intro', 'curtsy', 'dizzy'].includes(this.state) ? 0 : 1;
    this.vy = Math.min(PH.MAXFALL, this.vy + PH.G * dt);
    const toward = () => { this.face = pcx < bcx ? -1 : 1; };
    switch (this.state) {
      case 'intro': this.vx = 0; if (this.st > 1.6) this.set('idle'); break;
      case 'curtsy': this.vx = 0; if (this.st > 1.4) { sfx.twirl(); this.set('idle'); } break;
      case 'idle': {
        this.vx = 0; toward();
        if (this.st > 0.7 / m && !P.dead) {
          const d = Math.abs(pcx - bcx), r = Math.random();
          let pick: State = d > 110 ? (r < 0.45 ? 'windSpin' : r < 0.75 ? 'notes' : 'windLeap') : r < 0.35 ? 'windLeap' : r < 0.7 ? 'windSpin' : r < 0.85 ? 'notes' : 'glide';
          if (pick === this.lastAttack && Math.random() < 0.6) pick = pick === 'notes' ? 'windSpin' : 'notes';
          this.lastAttack = pick; this.set(pick);
        }
        break;
      }
      case 'glide': toward(); this.vx = -this.face * 70; if (this.st > 0.7 || this.hitX) this.set('idle'); break;
      case 'windSpin': this.vx = 0; toward(); this.spinA += dt * 8; if (this.st > 0.55 / m) { this.set('spin'); sfx.twirl(); this.bounces = 0; } break;
      case 'spin':
        this.spinA += dt * 30; this.vx = this.face * 200 * m;
        if (Math.random() < 0.6) this.g.burst(bcx, this.y + this.h - 2, 1, 0xffd0e8, { spd: 60, life: 0.5, size: 1.4, grav: -20, glow: true });
        if (this.st > 1.8) this.set('dizzy');
        break;
      case 'dizzy': this.vx = 0; this.spinA += dt * Math.max(0, 10 - this.st * 10); if (this.st > 1.1 / m) this.set('idle'); break;
      case 'windLeap': this.vx = 0; if (this.st > 0.5 / m) { this.set('leap'); this.vy = -440; this.vx = clamp((pcx - bcx) / 0.78, -260, 260); this.onGround = false; sfx.wing(); } break;
      case 'leap':
        if (this.onGround && this.st > 0.1) {
          this.set('land'); sfx.slam(); this.g.shake(9);
          const fy = this.y + this.h - 12;
          this.g.spawn(new Ripple(this.g, { type: 'ripple' }, this.x - 14, fy, -170 * m));
          this.g.spawn(new Ripple(this.g, { type: 'ripple' }, this.x + this.w, fy, 170 * m));
        }
        break;
      case 'land': this.vx = 0; if (this.st > 0.6 / m) this.set('idle'); break;
      case 'notes': {
        this.vx = 0; toward();
        const n = this.phase === 2 ? 7 : 5;
        if (this.st > 0.4 + this.noteN * 0.16 && this.noteN < n) {
          const a = -Math.PI / 2 + this.face * (0.25 + (this.noteN / (n - 1)) * 0.9);
          const sp = rand(170, 230);
          this.g.spawn(new Note(this.g, { type: 'note' }, bcx, this.y + 4, Math.cos(a) * sp, Math.sin(a) * sp));
          sfx.note(); this.noteN++;
        }
        if (this.st > 0.4 + n * 0.16 + 0.5) { this.noteN = 0; this.set('idle'); }
        break;
      }
      default: break;
    }
    moveBody(this, dt);
    if (this.state === 'spin' && this.hitX) {
      this.bounces++; this.face *= -1; this.g.shake(4); sfx.clink();
      if (this.bounces > (this.phase === 2 ? 1 : 0)) this.set('dizzy');
    }
  }

  render(dt: number) {
    this.t += dt;
    const p = this.puppet, s = this.state, t = this.t;
    this.flashT = Math.max(0, this.flashT - dt);
    p.flash(this.flashT > 0);
    p.setVisible(s !== 'gone');
    // a pirouette reads as the whole figure squeezing and flipping around its axis
    const spinning = s === 'spin' || s === 'windSpin' || s === 'dizzy' || s === 'dying';
    const spinFace = spinning ? (Math.cos(this.spinA) >= 0 ? 1 : -1) : this.face;
    p.place(this.cx, this.y + this.h + 1, spinFace);
    const sq = spinning ? 0.55 + Math.abs(Math.cos(this.spinA)) * 0.45 : 1;
    let hips = 0, head = Math.sin(t * 1.4) * 0.06, armF = -0.5, armB = 0.5, foreF = -0.4, foreB = 0.4, legB = 0, legF = 0, lift = 0, sy = 1;
    if (s === 'dormant') { head = 0.6; armF = 0.2; armB = -0.2; foreF = 0.1; foreB = -0.1; sy = 0.9; hips = 0.15; }
    if (s === 'intro' || s === 'curtsy') { const k = Math.min(1, this.st * 1.5); head = 0.4 * Math.sin(k * Math.PI); armF = -2.4 * k; armB = 2.4 * k; foreF = -0.3; foreB = 0.3; legB = 0.5 * Math.sin(k * Math.PI); sy = 1 - 0.12 * Math.sin(k * Math.PI); }
    if (s === 'idle' || s === 'glide') { armF = -1.2 + Math.sin(t * 2) * 0.15; armB = 1.2 - Math.sin(t * 2) * 0.15; legB = 0.25; }
    if (s === 'windSpin' || s === 'spin') { armF = -2.8; armB = 2.8; foreF = -0.2; foreB = 0.2; legB = 1.2; lift = 10; }
    if (s === 'dizzy') { head = Math.sin(t * 9) * 0.3; armF = 0.3; armB = -0.3; foreF = 0.6; foreB = -0.6; hips = Math.sin(t * 5) * 0.12; }
    if (s === 'windLeap') { sy = 0.86; armF = -0.6; armB = 0.6; }
    if (s === 'leap') { armF = -2.6; armB = 1.6; legB = -1.3; legF = 1.1; }
    if (s === 'land') { sy = 0.9; armF = -1.8; armB = 1.8; head = 0.3; }
    if (s === 'notes') { const k = Math.sin(this.st * 12); armF = -2.2 + k * 0.6; armB = 2.2 - k * 0.6; foreF = -0.6; head = -0.2; }
    if (s === 'dying') { head = 0.9 * Math.min(1, this.st); armF = 0.4; armB = -0.4; foreF = 0.8; foreB = -0.8; sy = 1 - Math.min(0.25, this.st * 0.1); hips = Math.min(0.4, this.st * 0.15); }
    p.squash(damp(p.inner.scaleX, sq, 20, dt), damp(p.inner.scaleY, sy, 10, dt));
    p.set('hips', { rot: hips, y: -lift }); p.set('head', { rot: head });
    p.set('armF', { rot: armF }); p.set('armB', { rot: armB }); p.set('foreF', { rot: foreF }); p.set('foreB', { rot: foreB });
    p.set('legB', { rot: legB, y: -lift }); p.set('legF', { rot: legF, y: -lift });
    p.set('key', { sx: Math.cos(t * (s === 'dormant' ? 0.3 : 3)) });
    p.set('tutu', { sx: 1 + (spinning ? 0.12 : 0) + Math.sin(t * 3) * 0.02 });
  }
  light() { return this.state === 'gone' ? null : { x: this.cx, y: this.y + 10, r: 70, color: 0xffd6ec, a: this.state === 'dormant' ? 0.2 : 0.45 }; }
  destroy() { this.puppet.destroy(); Music.tempo = 1; }
}

/** A glowing note flung in an arc. Knock it back with a scratch and it hits her. */
class Note extends Entity {
  img: any; life = 4; deflected = false;
  constructor(g: Ctx, d: EntityDef, x: number, y: number, vx: number, vy: number) {
    super(g, d, x - 5, y - 5); this.w = 10; this.h = 10; this.vx = vx; this.vy = vy; this.harm = 1; this.hittable = true;
    this.img = g.scene.add.image(x, y, 'q_note').setScale(INV_ART * 0.4).setDepth(DEPTH.fx).setBlendMode(Phaser.BlendModes.ADD);
  }
  onHit(_d: number, dir: number) { this.vx = dir * 260; this.vy = -120; this.harm = 0; this.deflected = true; sfx.note(); return true; }
  update(dt: number) {
    this.life -= dt; this.vy += 380 * dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    if (this.life <= 0 || isSolid(tileAt(Math.floor(this.cx / T), Math.floor(this.cy / T)))) { this.dead = true; this.g.burst(this.cx, this.cy, 8, 0xffc0e0, { spd: 80, life: 0.4, size: 1.4, glow: true }); }
    if (this.deflected) for (const e of this.g.ents) if (e instanceof Queen && !e.dead && Math.abs(e.cx - this.cx) < 14 && Math.abs(e.cy - this.cy) < 24) { e.onHit(1, Math.sign(this.vx), 'side'); this.dead = true; }
  }
  render(dt: number) { this.t += dt; this.img.setPosition(this.cx, this.cy).setRotation(Math.sin(this.t * 8) * 0.3); }
  light() { return { x: this.cx, y: this.cy, r: 20, color: 0xffb0d8, a: 0.55 }; }
  destroy() { this.img.destroy(); }
}

/** A ripple of light that runs along the floor when she lands. */
class Ripple extends Entity {
  img: any; life = 2.2;
  constructor(g: Ctx, d: EntityDef, x: number, y: number, vx: number) {
    super(g, d, x, y); this.w = 14; this.h = 12; this.vx = vx; this.harm = 1;
    this.img = g.scene.add.image(x, y, 'fx_wave').setScale(INV_ART * 0.4).setDepth(DEPTH.fx).setBlendMode(Phaser.BlendModes.ADD).setOrigin(0.5, 1).setTint(0xffb0e0);
  }
  update(dt: number) {
    this.x += this.vx * dt; this.life -= dt;
    if (this.life <= 0 || isSolid(tileAt(Math.floor((this.vx > 0 ? this.x + this.w : this.x) / T), Math.floor((this.y + 6) / T)))) { this.dead = true; }
    if (Math.random() < 0.5) this.g.burst(this.x + rand(0, this.w), this.y + this.h, 1, 0xffc8e8, { spd: 50, life: 0.4, size: 1.4, grav: -150, glow: true });
  }
  render() { this.img.setPosition(this.cx, this.y + this.h).setScale(INV_ART * 0.4 * (0.9 + Math.sin(this.life * 30) * 0.1)); }
  light() { return { x: this.cx, y: this.cy, r: 22, color: 0xff9ad0, a: 0.45 }; }
  destroy() { this.img.destroy(); }
}

register('queen', (g, d, x, y) => (Queen.defeated ? null : new Queen(g, d, x - 2, y - 24)));

// Enemies and props of the Drowned Nursery. Every enemy was somebody's toy.
import { PH, T, DEPTH, INV_ART } from '../core/config';
import { rand, damp, overlap } from '../core/util';
import { sfx } from '../core/audio';
import { moveBody, tileAt, isSolid, waterSurface, waterAt } from '../world/world';
import { Puppet } from '../render/puppet';
import { windupRig, jackRig, fishRig, dollRig } from '../render/rigs';
import { Entity, register, Ctx } from './entity';
import { Enemy } from './enemies';
import type { EntityDef } from '../content/types';

/** Patrols; when it sees you it winds its key, then charges. Dizzy for a moment afterwards. */
class WindupMouse extends Enemy {
  dir = Math.random() < 0.5 ? -1 : 1;
  state: 'patrol' | 'wind' | 'charge' | 'dizzy' = 'patrol';
  st = 0; keySpin = 0;
  constructor(g: Ctx, d: EntityDef, x: number, y: number) {
    super(g, d, x, y); this.w = 14; this.h = 10; this.hp = this.maxHp = 3; this.name = 'Wind-up Mouse';
    this.puppet = new Puppet(g.scene, windupRig(), 1.0, DEPTH.enemy);
    this.deathColor = 0xb8a890; this.coins = 4;
  }
  set(s: WindupMouse['state']) { this.state = s; this.st = 0; }
  ledgeAhead() {
    const ax = this.dir > 0 ? this.x + this.w + 1 : this.x - 1;
    const tx = Math.floor(ax / T);
    const below = tileAt(tx, Math.floor((this.y + this.h + 2) / T));
    return !(isSolid(below) || below === '=') || tileAt(tx, Math.floor((this.y + this.h - 2) / T)) === '^';
  }
  update(dt: number) {
    this.st += dt;
    const P = this.g.player;
    this.vy = Math.min(PH.MAXFALL, this.vy + PH.G * dt);
    const wet = waterAt(this.cx, this.y + this.h - 1) !== null ? 0.5 : 1;
    if (this.kbT > 0) { this.kbT -= dt; this.vx = this.kbDir * 110; }
    else switch (this.state) {
      case 'patrol': {
        this.vx = this.dir * 30 * wet;
        const dx = P.cx - this.cx;
        if (!P.dead && !this.g.inCutscene && Math.abs(dx) < 130 && Math.abs(P.cy - this.cy) < 36 && Math.sign(dx) === this.dir && this.st > 0.6) { this.set('wind'); sfx.windup(); }
        break;
      }
      case 'wind': this.vx = 0; this.keySpin += dt * 30; if (this.st > 0.55) { this.set('charge'); sfx.dash(); } break;
      case 'charge':
        this.vx = this.dir * 190 * wet;
        if (Math.random() < 0.5) this.g.burst(this.cx - this.dir * 6, this.y + this.h, 1, 0x3a3448, { spd: 40, life: 0.3, size: 2, grav: 60, key: 'fx_dust' });
        if (this.st > 1.3) this.set('dizzy');
        break;
      case 'dizzy': this.vx = 0; if (this.st > 0.9) this.set('patrol'); break;
    }
    moveBody(this, dt);
    if (this.kbT <= 0 && this.onGround) {
      if (this.hitX || this.ledgeAhead()) {
        if (this.state === 'charge') { this.set('dizzy'); this.g.shake(2); sfx.clink(); }
        this.dir *= -1;
      }
    }
    this.face = this.dir;
    this.keySpin += dt * (this.state === 'charge' ? 18 : 4);
  }
  render(dt: number) {
    this.t += dt;
    const p = this.puppet, t = this.t;
    p.place(this.cx, this.y + this.h, this.face);
    const roll = this.x * 0.5 * this.face;
    p.set('wheelF', { rot: roll }); p.set('wheelB', { rot: roll });
    p.set('key', { sx: Math.cos(this.keySpin), rot: 0 });
    const jit = this.state === 'wind' ? Math.sin(t * 60) * 0.05 : 0;
    p.set('body', { rot: this.state === 'charge' ? 0.08 : this.state === 'dizzy' ? Math.sin(t * 12) * 0.12 : jit, y: this.state === 'patrol' ? Math.abs(Math.sin(t * 10)) * -1 : 0 });
    p.set('tail', { rot: Math.sin(t * 8) * 0.3 });
    p.set('ear', { rot: this.state === 'charge' ? -0.5 : Math.sin(t * 2) * 0.1 });
    this.renderCommon(dt);
    if (this.state === 'dizzy' && Math.random() < 0.2) this.g.burst(this.cx + rand(-4, 4), this.y - 2, 1, 0xffe9a8, { spd: 20, life: 0.4, size: 1.2, grav: -20, glow: true });
  }
}

/** Sits shut until you come close, then springs out and punches. The head is its weak point. */
class JackInBox extends Enemy {
  state: 'shut' | 'pop' | 'out' | 'retract' = 'shut';
  st = 0; ext = 0; cool = 0; punch = 0;
  bx: number; by: number;
  constructor(g: Ctx, d: EntityDef, x: number, y: number) {
    super(g, d, x, y); this.w = 14; this.h = 14; this.hp = this.maxHp = 4; this.name = 'Jack-in-the-Box';
    this.bx = x; this.by = y;
    this.puppet = new Puppet(g.scene, jackRig(), 0.85, DEPTH.enemy);
    this.deathColor = 0xc84a5a; this.coins = 5; this.harm = 0;
    this.face = d.face ?? -1;
  }
  set(s: JackInBox['state']) { this.state = s; this.st = 0; }
  headBox() { const h = 11, hy = this.by + 14 - 12 - this.ext * 26; return { x: this.bx + this.w / 2 - 7, y: hy - h, w: 14, h }; }
  onHit(dmg: number, dir: number, kind: string) {
    if (this.state === 'shut' || this.ext < 0.5) { sfx.clink(); this.g.burst(this.cx, this.by, 5, 0xffe9a8, { spd: 100, life: 0.25, size: 1.2, glow: true }); return false; }
    this.hp -= dmg; this.flashT = 0.12;
    if (this.hp <= 0) this.kill();
    else if (this.state === 'out') { this.set('retract'); void dir; void kind; }
    return true;
  }
  update(dt: number) {
    this.st += dt; this.cool -= dt;
    const P = this.g.player;
    const near = !P.dead && !this.g.inCutscene && Math.abs(P.cx - (this.bx + this.w / 2)) < 60 && P.cy > this.by - 70 && P.cy < this.by + 30;
    switch (this.state) {
      case 'shut': this.ext = damp(this.ext, 0, 14, dt); if (near && this.cool <= 0) { this.set('pop'); sfx.spring(); this.g.shake(2); } break;
      case 'pop': this.ext = Math.min(1, this.ext + dt * 9); this.face = P.cx > this.cx ? 1 : -1; if (this.st > 0.25) { this.set('out'); this.punch = 1; sfx.pop(); } break;
      case 'out': this.ext = 1; this.punch = damp(this.punch, 0, 5, dt); if (this.st > 1.3) this.set('retract'); break;
      case 'retract': this.ext = Math.max(0, this.ext - dt * 4); if (this.ext <= 0) { this.set('shut'); this.cool = 1.1; } break;
    }
    // hit box grows to include the head while it's out, so the claw can reach it
    const hb = this.headBox();
    if (this.ext > 0.3) { this.y = hb.y; this.h = this.by + 14 - hb.y; } else { this.y = this.by; this.h = 14; }
    // the head and fist hurt; the shut box doesn't
    if (this.ext > 0.4 && !P.dead) {
      const fist = { x: this.face > 0 ? hb.x + hb.w : hb.x - 12 - this.punch * 8, y: hb.y + 2, w: 12 + this.punch * 8, h: 8 };
      if (overlap(P, hb) || (this.punch > 0.2 && overlap(P, fist))) this.g.hurtPlayer(1, this.cx);
    }
  }
  render(dt: number) {
    this.t += dt;
    const p = this.puppet, e = this.ext;
    p.place(this.bx + this.w / 2, this.by + 14, this.face);
    p.set('lid', { rot: -e * 2.1 });
    p.set('spring', { sy: 0.1 + e * 3.0, sx: 1 + Math.sin(this.t * 20) * 0.05 * e, alpha: e > 0.05 ? 1 : 0 });
    p.set('head', { y: -e * 122 + (this.state === 'out' ? Math.sin(this.t * 10) * 4 : 0), rot: this.state === 'out' ? Math.sin(this.t * 6) * 0.2 : 0, alpha: e > 0.05 ? 1 : 0 });
    p.set('fist', { x: this.punch * 26, rot: -this.punch * 0.2 });
    this.renderCommon(dt);
  }
  light() { return this.ext > 0.3 ? { x: this.cx, y: this.y + 6, r: 22, color: 0xff9ab0, a: 0.3 } : null; }
}

/** A tin bath fish: cruises under the surface and leaps at you in an arc. */
class TinFish extends Enemy {
  hx: number; dir = 1; state: 'swim' | 'leap' | 'flop' = 'swim'; st = 0; cool = rand(0.5, 1.5);
  constructor(g: Ctx, d: EntityDef, x: number, y: number) {
    super(g, d, x, y); this.w = 14; this.h = 8; this.hp = this.maxHp = 2; this.name = 'Tin Fish';
    this.hx = x;
    this.puppet = new Puppet(g.scene, fishRig(), 0.9, DEPTH.player + 2);
    this.deathColor = 0x9ab8c8; this.coins = 3;
  }
  update(dt: number) {
    this.st += dt; this.cool -= dt;
    const P = this.g.player;
    const surf = waterSurface(this.cx);
    if (surf === null || surf > this.g.room.py + this.g.room.ph - 8) { // drained: flop about
      this.state = 'flop'; this.vy = Math.min(PH.MAXFALL, this.vy + PH.G * dt);
      if (this.onGround && Math.random() < dt * 2) { this.vy = -120; this.vx = rand(-40, 40); }
      moveBody(this, dt); this.harm = 0; return;
    }
    if (this.state === 'swim') {
      this.harm = 0;
      const depthY = surf + 10;
      this.y += (depthY - this.y) * Math.min(1, dt * 3);
      this.vx = this.dir * 34;
      if (Math.abs(this.x - this.hx) > 48 || isSolid(tileAt(Math.floor((this.dir > 0 ? this.x + this.w + 2 : this.x - 2) / T), Math.floor(this.cy / T)))) this.dir *= -1;
      this.x += this.vx * dt;
      const dx = P.cx - this.cx;
      if (this.cool <= 0 && !P.dead && !this.g.inCutscene && Math.abs(dx) < 80 && P.cy < surf + 2 && P.cy > surf - 110) {
        this.state = 'leap'; this.st = 0; this.dir = Math.sign(dx) || 1;
        this.vy = -Math.min(380, 190 + (surf - P.cy) * 1.8); this.vx = dx * 1.2;
        sfx.fishLeap(); this.g.burst(this.cx, surf, 10, 0xcfeeff, { spd: 120, life: 0.5, size: 1.5, grav: 400, glow: true });
      }
    } else if (this.state === 'leap') {
      this.harm = 1;
      this.vy += PH.G * 0.8 * dt;
      this.x += this.vx * dt; this.y += this.vy * dt;
      if (this.vy > 0 && this.y > surf) {
        this.state = 'swim'; this.cool = rand(1.2, 2); this.hx = this.x;
        sfx.splash(0.5); this.g.burst(this.cx, surf, 8, 0xcfeeff, { spd: 100, life: 0.5, size: 1.4, grav: 400, glow: true });
      }
    }
    this.face = this.state === 'leap' ? Math.sign(this.vx) || 1 : this.dir;
  }
  render(dt: number) {
    this.t += dt;
    const p = this.puppet, t = this.t;
    p.place(this.cx, this.y + this.h, this.face);
    p.set('tail', { rot: Math.sin(t * (this.state === 'leap' ? 20 : 8)) * 0.35 });
    p.set('fin', { rot: Math.sin(t * 4) * 0.1 });
    p.set('key', { sx: Math.cos(t * 6) });
    const ang = this.state === 'leap' ? Math.atan2(this.vy, Math.abs(this.vx) + 1) * 0.8 : this.state === 'flop' ? Math.sin(t * 14) * 0.5 : Math.sin(t * 3) * 0.05;
    p.set('body', { rot: ang }); p.setAlpha(this.state === 'swim' ? 0.55 : 1);
    this.renderCommon(dt);
  }
  light() { return this.state === 'leap' ? { x: this.cx, y: this.cy, r: 18, color: 0xbfe6ff, a: 0.35 } : null; }
}

/** A doll on a shelf. Its head turns to follow you. It never does anything else. Probably. */
class DollWatcher extends Entity {
  puppet: Puppet; look = 0;
  constructor(g: Ctx, d: EntityDef, x: number, y: number) {
    super(g, d, x, y); this.w = 10; this.h = 14;
    this.puppet = new Puppet(g.scene, dollRig(), d.scale ?? 0.8, d.layer === 'bg' ? DEPTH.bgDecor + 1 : DEPTH.decor);
    this.face = d.face ?? 1;
    if (d.tint) this.puppet.tint(Number(d.tint));
  }
  update(dt: number) {
    const P = this.g.player;
    const dx = P.cx - (this.x + T / 2), dy = P.cy - (this.y + 4);
    const target = Math.max(-0.7, Math.min(0.7, Math.atan2(dy, Math.abs(dx) + 20) * 0.6)) * (dx * this.face > 0 ? 1 : -1);
    const still = Math.abs(P.vx) < 1 && Math.abs(dx) < 90;
    this.look = damp(this.look, target, still ? 12 : 1.2, dt);
  }
  render(dt: number) {
    this.t += dt;
    this.puppet.place(this.x + T / 2, this.y + T, this.face);
    this.puppet.set('head', { rot: this.look + Math.sin(this.t * 0.7) * 0.02 });
  }
  destroy() { this.puppet.destroy(); }
}

/** A little music box that keeps playing by itself. */
class MusicBox extends Entity {
  img: any; crank: any; cool = rand(0, 2);
  constructor(g: Ctx, d: EntityDef, x: number, y: number) {
    super(g, d, x, y); this.w = 14; this.h = 12;
    const s = g.scene, sc = d.scale ?? 0.4;
    this.img = s.add.image(x + T / 2, y + T, 'musicbox').setOrigin(0.5, 1).setScale(INV_ART * sc).setDepth(DEPTH.props);
    // the crank turns in the bushing on the box's side (art px 145,106 of the 160x140 box)
    const cx = (145 - 80) * INV_ART * sc, cy = (140 - 106) * INV_ART * sc;
    this.crank = s.add.image(x + T / 2 + cx, y + T - cy, 'mb_crank').setScale(INV_ART * sc).setDepth(DEPTH.props + 1).setOrigin(0.2, 0.5);
    if (d.flip) { this.img.setFlipX(true); this.crank.setX(x + T / 2 - cx).setFlipX(true).setOrigin(0.8, 0.5); }
  }
  update(dt: number) {
    this.cool -= dt;
    const P = this.g.player;
    if (this.cool <= 0 && Math.abs(P.cx - this.cx) < 110 && Math.abs(P.cy - this.cy) < 70) { this.cool = rand(2.5, 4); sfx.tinkle(); this.g.burst(this.cx, this.y, 3, 0xffe0a0, { spd: 20, life: 1.4, size: 1.3, grav: -25, glow: true }); }
  }
  render(dt: number) { this.t += dt; this.crank.setRotation(this.t * 1.5); }
  light() { return { x: this.cx, y: this.y + 2, r: 34 + Math.sin(this.t * 4) * 3, color: 0xffd9a0, a: 0.55 }; }
  destroy() { this.img.destroy(); this.crank.destroy(); }
}

/** A slowly turning paddle-wheel (decor that says "this room's water is moving"). */
class Wheel extends Entity {
  img: any;
  constructor(g: Ctx, d: EntityDef, x: number, y: number) {
    super(g, d, x, y);
    this.img = g.scene.add.image(x + T / 2, y + T / 2, 'nur_wheel').setScale(INV_ART * (d.scale ?? 0.6)).setDepth(d.layer === 'fg' ? DEPTH.fgDecor : DEPTH.bgDecor + 2);
    if (d.alpha !== undefined) this.img.setAlpha(d.alpha);
  }
  render(dt: number) { this.t += dt; this.img.setRotation(this.t * (this.def.speed ?? 0.25)); }
  destroy() { this.img.destroy(); }
}

register('windup', (g, d, x, y) => new WindupMouse(g, d, x + 1, y + 6));
register('jackbox', (g, d, x, y) => new JackInBox(g, d, x + 1, y + 2));
register('tinfish', (g, d, x, y) => new TinFish(g, d, x, y));
register('doll', (g, d, x, y) => new DollWatcher(g, d, x, y));
register('musicbox', (g, d, x, y) => new MusicBox(g, d, x, y));
register('wheel', (g, d, x, y) => new Wheel(g, d, x, y));

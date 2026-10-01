// Foreground parallax layer (in the spirit of Hollow Knight): big, near-black silhouettes that
// sit between the camera and the play plane, drawn by LightScene in screen space above the darkness.
// They hug the bottom and top edges of the screen (rising from below the frame, hanging into it) and
// slide sideways faster than the world (parallax factor > 1), so they read as close to the lens.
// Vertically they only sink a little further out of frame as the camera climbs or drops, never into
// the middle of the screen. Pieces are placed along each room from a seed.
// Configure per area in content/areas/<area>.json:
//   "decor": { "foreground": { "floor": ["fg_hol_ferns", ...], "ceil": ["fg_hol_roots", ...], "density": 1 } }
import { ZOOM, SCREEN_W, SCREEN_H, VIEW_W, VIEW_H } from '../core/config';
import { seeded, damp } from '../core/util';
import type { Room } from '../world/world';

interface Piece { img: any; wx: number; p: number; ceil: boolean; sink: number; a: number; fade: number }

const BOSSES = new Set(['warden', 'queen']);

export class Foreground {
  pieces: Piece[] = [];
  roomId = '';
  constructor(public scene: any, public layer: any) {}

  clear() { for (const q of this.pieces) q.img.destroy(); this.pieces = []; this.roomId = ''; }

  build(r: Room) {
    this.clear(); this.roomId = r.id;
    const cfg = r.area.decor?.foreground;
    if (!cfg || (r as any).noForeground) return;
    const has = (k: string) => this.scene.textures.exists(k);
    const floor = (cfg.floor ?? []).filter(has), ceil = (cfg.ceil ?? []).filter(has);
    const R = seeded(`fg-${r.id}`);
    // Boss arenas keep the screen clear: fewer pieces, and only hanging ones.
    const boss = r.spawns.some((s) => BOSSES.has(s.type));
    const density = (cfg.density ?? 1) * (boss ? 0.5 : 1);
    const add = (key: string, wx: number, isCeil: boolean) => {
      const p = 1.35 + R() * 0.35;            // parallax: 1 = play plane; bigger = closer to the lens
      const src = this.scene.textures.get(key).getSourceImage();
      // Sized by screen height so a piece never reaches far into the frame.
      const hT = SCREEN_H * (isCeil ? 0.3 + R() * 0.18 : 0.28 + R() * 0.16);
      const sc = Math.min(hT / src.height, (SCREEN_W * 0.45) / src.width);
      const img = this.scene.add.image(0, 0, key).setOrigin(0.5, isCeil ? 0 : 1).setScale(sc).setFlipX(R() < 0.5);
      const a = 0.88 + R() * 0.12;
      img.setAlpha(a);
      this.layer.add(img);
      this.pieces.push({ img, wx, p, ceil: isCeil, sink: 0.02 + R() * 0.14, a, fade: 1 });
    };
    // Spread along the stretch of the room the camera can actually show (it is clamped to the room).
    const x0 = r.px + VIEW_W / 2 - 110, x1 = r.px + Math.max(r.pw, VIEW_W) - VIEW_W / 2 + 110;
    const scatter = (keys: string[], isCeil: boolean, rate: number) => {
      if (!keys.length) return;
      let x = x0 + R() * 60;
      while (x < x1) {
        if (R() < rate * density) add(keys[Math.floor(R() * keys.length)], x, isCeil);
        x += 110 + R() * 150; // world units; times ZOOM x parallax this is roughly 0.6 to 1.4 screens apart
      }
    };
    if (!boss) scatter(floor, false, 0.75);
    scatter(ceil, true, 0.55);
  }

  /** Position every piece for the current camera centre (mx, my in world units). */
  update(r: Room | undefined, mx: number, my: number, player: any, dt: number) {
    if (!r) { if (this.pieces.length) this.clear(); return; }
    if (r.id !== this.roomId) this.build(r);
    const px = player ? (player.cx - mx) * ZOOM + SCREEN_W / 2 : -9999;
    const py = player ? (player.cy - my) * ZOOM + SCREEN_H / 2 : -9999;
    // The camera's lowest and highest positions in this room: at the bottom of a room the floor
    // pieces stand fully in frame; as the camera climbs they sink out a little (and the reverse for
    // hanging pieces), which keeps a sense of depth without ever floating mid-screen.
    const lowY = r.py + Math.max(r.ph, VIEW_H) - VIEW_H / 2, highY = r.py + VIEW_H / 2;
    for (const q of this.pieces) {
      const sx = (q.wx - mx) * ZOOM * q.p + SCREEN_W / 2;
      const h0 = q.img.displayHeight;
      const drift = (q.ceil ? my - highY : lowY - my) * ZOOM * (q.p - 1) * 0.5;
      const off = Math.min(Math.max(drift, 0), h0 * 0.45) + h0 * q.sink;
      const sy = q.ceil ? -off : SCREEN_H + off;
      const w = q.img.displayWidth, h = q.img.displayHeight;
      const top = q.ceil ? sy : sy - h, bottom = q.ceil ? sy + h : sy;
      const on = sx + w / 2 > 0 && sx - w / 2 < SCREEN_W && bottom > 0 && top < SCREEN_H;
      q.img.setVisible(on);
      if (!on) continue;
      q.img.setPosition(sx, sy);
      // Thin out when a piece passes in front of Nightpaw, so the player is never lost behind it.
      const over = px > sx - w * 0.42 && px < sx + w * 0.42 && py > top + h * 0.1 && py < bottom;
      q.fade = damp(q.fade, over ? 0.28 : 1, 8, dt);
      q.img.setAlpha(q.a * q.fade);
    }
  }
}

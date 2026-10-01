// Keepsakes: small lost things Nightpaw pins to his scarf. Like charms: each costs stitches
// (the scarf's slots) and is changed at a candle shrine. Effects are read by the code that
// needs them through Keep.on(id): player movement, attacks, coins, hurt, kills, light.
import { Game } from './state';

export interface KeepsakeDef { id: string; name: string; stitches: number; price?: number; desc: string; flavor: string }

export const KEEPSAKES: KeepsakeDef[] = [
  { id: 'felt', name: 'Felt Soles', stitches: 1, price: 0, desc: 'Run a little faster.', flavor: 'Cut from the bottom of a slipper. Somebody padded about the house in them for years.' },
  { id: 'thimble', name: 'Sharpened Thimble', stitches: 2, price: 180, desc: 'Your scratches hit harder.', flavor: 'Filed to a point on a doorstep by someone who meant it.' },
  { id: 'needle', name: 'Long Needle', stitches: 2, price: 150, desc: 'Your scratches reach further.', flavor: 'A darning needle, long as a whisker and nearly as bent.' },
  { id: 'magnet', name: 'Magnet Button', stitches: 1, price: 90, desc: 'Defeated things drop half again as many buttons.', flavor: 'A button that other buttons follow home.' },
  { id: 'shadow', name: 'Shadow Thread', stitches: 1, price: 120, desc: 'Your dash recovers twice as fast.', flavor: 'Black thread that is never quite where you left it.' },
  { id: 'pins', name: 'Pincushion Lining', stitches: 2, price: 200, desc: 'When you are hurt, pins burst out and hurt everything around you.', flavor: 'Sewn into the cloak. Hug at your own risk.' },
  { id: 'heart', name: 'Spare Heartstring', stitches: 2, price: 260, desc: 'One more paw of health.', flavor: 'A red string tied round a finger, so as not to forget. It did not work, but it held.' },
  { id: 'owl', name: "Owl's Eye", stitches: 1, desc: 'The dark presses less close around you.', flavor: 'A glass eye from a stuffed owl. It has seen a great deal in the dark.' },
  { id: 'ember', name: 'Ember Locket', stitches: 3, desc: 'Every 10 hollow things you put to rest, recover a paw.', flavor: 'A locket with a coal inside, still warm. Whose picture was in it is anybody’s guess.' },
];
export const KS = Object.fromEntries(KEEPSAKES.map((k) => [k.id, k])) as Record<string, KeepsakeDef>;

export const Keep = {
  owned(): string[] { return Game.save.keepsakes ?? []; },
  worn(): string[] { return Game.save.equipped ?? []; },
  has(id: string) { return this.owned().includes(id); },
  on(id: string) { return this.worn().includes(id); },
  capacity() { return Game.save.stitches ?? 3; },
  used() { return this.worn().reduce((n, id) => n + (KS[id]?.stitches ?? 0), 0); },
  give(id: string) {
    if (!Game.save.keepsakes) Game.save.keepsakes = [];
    if (!this.has(id)) Game.save.keepsakes.push(id);
    Game.achieve('first_keepsake');
    if (KEEPSAKES.every((k) => this.has(k.id))) Game.achieve('all_keepsakes');
  },
  /** Toggle wearing a keepsake. Returns false if there aren't enough free stitches. */
  toggle(id: string): boolean {
    const w = [...this.worn()];
    const i = w.indexOf(id);
    if (i >= 0) { w.splice(i, 1); this.apply(id, false); }
    else {
      if (this.used() + KS[id].stitches > this.capacity()) return false;
      w.push(id); this.apply(id, true);
    }
    Game.save.equipped = w;
    if (this.used() >= this.capacity() && w.length >= 3) Game.achieve('full_scarf');
    return true;
  },
  /** Keepsakes that change saved stats apply when worn or taken off. */
  apply(id: string, on: boolean) {
    if (id === 'heart') { Game.save.maxHp += on ? 1 : -1; Game.save.hp = Math.min(Game.save.hp, Game.save.maxHp); }
  },
};

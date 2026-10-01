// Content schema. Areas, rooms, cutscenes and speakers are JSON files under content/.
// See README "Adding content" for how to extend the map.

/** An entity placed in a room. Positions are in tiles, relative to the room's top-left. */
export interface EntityDef {
  type: string;
  x?: number;
  y?: number;
  id?: string; // unique id for one-shot things (pickups, npcs); auto-generated if missing
  [prop: string]: any;
}

export interface RoomDef {
  id: string;
  name?: string; // shown on the map
  x: number; // world position in tiles
  y: number;
  rows: string[]; // tile map. '#' rock, '=' one-way platform, '^' thorns, 'X' cracked wall, '.' air; other chars = legend entities
  legend?: Record<string, EntityDef>; // per-room legend, merged over the area + default legend
  entities?: EntityDef[]; // extra entities with explicit tile coords
  dark?: number; // 0..1 darkness override
  music?: string;
  ambience?: string;
  onEnter?: string; // cutscene id, runs once per visit when condition passes
  onEnterIf?: string;
  decor?: number; // amount of automatic decoration (0 = none, 1 = default)
  camera?: { lockY?: boolean };
  water?: WaterDef[]; // pools of water (see WaterDef)
}

/**
 * A body of water in a room. `level` is the row the surface sits in (room-local tiles).
 * With `low`/`high` it is a tide that rises and falls between those rows every `period`
 * seconds. `drainIf` (a condition) empties it; a boss can also drive `level` directly.
 */
export interface WaterDef {
  x?: number; w?: number; // horizontal span in tiles (default: whole room)
  level: number;
  low?: number; high?: number; period?: number; phase?: number;
  drainIf?: string;
  id?: string;
}

export interface AreaDef {
  id: string;
  name: string;
  subtitle?: string;
  tileset: string; // art prefix, e.g. "hol" → hol_rock, hol_top, ...
  backdrop: { far: string; mid: string; fg?: string; tint?: number; midTint?: number; fog?: boolean; fogTint?: number };
  dark: number; // default darkness 0..1
  music?: string;
  ambience?: string;
  legend?: Record<string, EntityDef>;
  rooms: RoomDef[];
  /** Automatic room decoration: painted parts scattered on floors / hung from ceilings. */
  decor?: { floor?: string[]; ceil?: string[]; glow?: Record<string, [number, number]>; organic?: boolean; density?: number };
  water?: { tint: number; surface: number; alpha?: number };
  endCard?: { title: string; lines: string[] };
}

export interface WorldDef {
  title: string;
  areas: string[]; // files in content/areas/
  cutscenes: string[]; // files in content/cutscenes/
  start: { room: string; x: number; y: number; cutscene?: string };
  demoEndFlag?: string;
}

export type Step = { do: string; [k: string]: any };
export interface CutsceneDef { id: string; steps: Step[]; skippable?: boolean }

export interface SpeakerDef { name: string; portrait?: string; pitch: number; voice?: 'soft' | 'squeak' | 'deep' | 'echo'; color?: string; italic?: boolean }

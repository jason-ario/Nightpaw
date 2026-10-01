#!/usr/bin/env python3
"""Builds content/areas/candlewick.json: Candlewick, the hamlet of lost things (2.5).

It sits in a cave above Nib's Nook. The only way up (a shaft from the nook's high alcove) is
choked by a rockfall until the Sunken Belfry's bell shakes it loose (flag bell_rung; the edits to
nib_nook are in hollows_expansion.py). Rooms: the Lantern Stair, Candlewick, the Leaning Houses.
Usage: python3 tools/levels/candlewick.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from carve import R  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
rooms = []


def tag(id):
    return dict(type='pickup', kind='nametag', id=id, cutscene=id)


# --------------------------------------------------------------------------- the Lantern Stair
# Up from Nib's alcove (global x 232..234) to a grate in Candlewick's floor.
r = R('lantern_stair', 'The Lantern Stair', 228, -14, 14, 14, dark=0.66)
r.carve(2, 0, 11, 13)
r.carve(4, 13, 6, 13)
r.fill(2, 13, 3, 13); r.fill(7, 13, 11, 13)
for x0, x1, y in [(4, 6, 13), (7, 10, 11), (3, 6, 9), (7, 10, 7), (3, 6, 5), (7, 10, 3), (4, 6, 1)]:
    r.plat(x0, x1, y)
r.decal('town_lamp', 9, 9, 0.45, glow=34, glowColor='0xffb060')
r.decal('deco_roots', 6, 0, 0.4, layer='bg', originY=0, oy=-1, alpha=0.5)
rooms.append(r)

# --------------------------------------------------------------------------- Candlewick
r = R('candlewick', 'Candlewick', 196, -39, 58, 25, music='town', onEnter='town_enter', onEnterIf='!town_seen')
r.carve(2, 3, 55, 20)
r.carve(0, 16, 1, 20)              # ← the Leaning Houses
r.carve(36, 21, 38, 24)            # ↓ the Lantern Stair
r.plat(36, 38, 23); r.plat(36, 38, 21)   # the grate (and a step under it)
r.fill(2, 3, 55, 4)                # the cave roof, low and lumpy
r.fill(2, 5, 10, 5); r.fill(46, 5, 55, 6)
r.fill(48, 19, 55, 20)             # the shop's raised boardwalk
r.plat(44, 47, 19)
# rooftops to climb: the tin tower, the boot, the teapot; a high ledge over the town
r.plat(4, 9, 14); r.plat(12, 16, 15); r.plat(19, 24, 16)
r.plat(2, 5, 11)
r.fill(2, 8, 7, 8)
r.put(4, 7, '1', tag('name_doorstop'))
r.put(6, 7, 'g')
r.put(27, 20, 'S')
r.put(43, 20, 'n', dict(type='npc', rig='mouse', npcId='nib', speaker='nib', face=1, hideIf='queen_dead', talk=[
    dict(**{'if': '!nib_town'}, cutscene='nib_town'),
    dict(cutscene='nib_town_idle')]))
r.put(51, 18, 'p', dict(type='npc', rig='spool', npcId='spool', speaker='spool', face=-1, talk=[
    dict(**{'if': '!spool_met'}, cutscene='spool_first'),
    dict(cutscene='spool_idle')]))
r.put(33, 20, 'k', dict(type='npc', rig='candle', npcId='wick', speaker='wick', face=-1, talk=[
    dict(**{'if': '!wick_met'}, cutscene='wick_first'),
    dict(**{'if': 'queen_dead'}, cutscene='wick_late'),
    dict(**{'if': 'has:wings'}, cutscene='wick_mid'),
    dict(cutscene='wick_idle')]))
# the houses (background), the lantern, the street lamps
r.decal('town_house_tin', 7, 20, 1.0, layer='bg')
r.decal('town_house_boot', 15, 20, 0.95, layer='bg')
r.decal('town_house_teapot', 22, 20, 0.85, layer='bg')
r.decal('town_lantern', 30, 20, 0.95, layer='bg', glow=110, glowColor='0xffb060')
r.decal('town_shop', 42, 20, 0.9, layer='bg')
r.decal('town_stitchery', 51, 18, 0.8, layer='bg')
for x in (11, 36, 47):
    r.decal('town_lamp', x, 20 if x != 47 else 18, 0.5, glow=30, glowColor='0xffb060')
r.decal('town_sign', 3, 20, 0.5, flip=True)
r.decal('town_honesty', 41, 20, 0.35, **{'if': 'queen_dead'}, read='honesty_box', label='Shop', w=2, h=2)
r.decal('deco_umbrella', 25, 20, 0.35, flip=True)
r.decal('nur_bear', 19, 20, 0.28, alpha=0.9)
rooms.append(r)

# --------------------------------------------------------------------------- the Leaning Houses
# West of the square: crooked houses propped against each other. Climb the roofs.
r = R('leaning_houses', 'The Leaning Houses', 164, -39, 32, 25, dark=0.6)
r.carve(2, 2, 29, 20)
r.carve(30, 16, 31, 20)            # → Candlewick
r.plat(22, 27, 17); r.plat(14, 19, 14); r.plat(6, 11, 11); r.plat(15, 20, 8); r.plat(24, 28, 5)
r.fill(2, 5, 6, 6)
r.put(4, 4, 'K', dict(type='pickup', kind='keepsake', keepsake='owl', id='ks_owl', cutscene='get_ks_owl'))
r.put(17, 13, '1', tag('name_umbrella'))
r.put(26, 4, 'g')
r.put(10, 18, 'w'); r.put(20, 6, 'w'); r.put(24, 20, 'c'); r.put(12, 20, 't')
r.decal('town_house_tin', 26, 20, 0.9, layer='bg', rot=-0.12, alpha=0.85)
r.decal('town_house_boot', 16, 20, 1.0, layer='bg', rot=0.1, alpha=0.8)
r.decal('town_house_teapot', 7, 20, 0.8, layer='bg', rot=-0.18, alpha=0.75)
r.decal('town_lamp', 22, 17, 0.45, glow=26, glowColor='0xffb060')
rooms.append(r)

area = {
    'id': 'candlewick',
    'name': 'Candlewick',
    'subtitle': 'Where the lost keep a light on',
    'tileset': 'hol',
    'backdrop': {'far': 'hol_bg_far', 'mid': 'hol_bg_mid', 'fg': 'hol_fg', 'tint': 0x6a5a68, 'midTint': 0x4a3e4a, 'fog': True, 'fogTint': 0xffd8b0},
    'dark': 0.46,
    'music': 'town',
    'ambience': 'hollows',
    'decor': {'organic': True, 'density': 0.8,
              'floor': ['deco_pebbles', 'deco_spool', 'deco_key', 'deco_teacup', 'deco_specs'], 'ceil': ['deco_roots'],
              'foreground': {'floor': ['fg_hol_rock', 'fg_hol_ferns'], 'ceil': ['fg_hol_roots'], 'density': 0.6}},
    'rooms': [x.json() for x in rooms],
}
path = os.path.join(ROOT, 'content/areas/candlewick.json')
with open(path, 'w') as f:
    json.dump(area, f, indent=1)
print('wrote', path, len(rooms), 'rooms')

#!/usr/bin/env python3
"""The Hollows, expanded (2.4): new rooms carved around the original twelve, plus the edits to the
original rooms that open the way into them. Idempotent: re-running replaces the new rooms by id and
re-applies the same tile edits. content/areas/hollows.json stays the real content.

Main path (new loop): Nib's floor drops into the Hanging Way -> the Long Dark -> the Sunken Belfry,
where ringing the bell (flag bell_rung) lifts the bars in the Warden's Approach and the grate into
the Old Sluice, which climbs back up behind the bars.
Optional: the Quiet Graves (cracked wall in the Frozen Hollow), the Well Shaft (above where you
landed; needs claws), the Warden's Hoard (above the Approach; needs wings).
Usage: python3 tools/levels/hollows_expansion.py
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from carve import R  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PATH = os.path.join(ROOT, 'content/areas/hollows.json')
area = json.load(open(PATH))
rooms = {r['id']: r for r in area['rooms']}


def tag(id):
    return dict(type='pickup', kind='nametag', id=id, cutscene=id)


# ------------------------------------------------------------------ edits to the original rooms
def set_tiles(rid, x0, y0, x1, y1, ch):
    rows = [list(r) for r in rooms[rid]['rows']]
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            rows[y][x] = ch
    rooms[rid]['rows'] = [''.join(r) for r in rows]


def add_ent(rid, e):
    ents = rooms[rid].setdefault('entities', [])
    key = e.get('id') or f"{e['type']}:{e['x']},{e['y']}"
    ents[:] = [x for x in ents if (x.get('id') or f"{x['type']}:{x['x']},{x['y']}") != key]
    ents.append(e)


# Nib's floor: a jump-through grate over the drop into the Hanging Way (press down to drop).
set_tiles('nib_nook', 19, 16, 21, 16, '=')
set_tiles('nib_nook', 19, 17, 21, 17, '.')
add_ent('nib_nook', dict(type='decal', art='deco_roots', x=20, y=16, scale=0.35, layer='bg', alpha=0.6, rot=3.14, originY=0, oy=1))
# The Warden's Approach: bars until the bell rings, a hint in front of them, the drop from the sluice,
# and a climb of ledges up into the Hoard (needs wings).
add_ent('warden_approach', dict(type='gate', id='bell_bars', mode='flag', flag='bell_rung', x=37, y=11, h=5))
add_ent('warden_approach', dict(type='trigger', id='bars_hint', x=34, y=15, w=1, h=5, cutscene='bars_hint', **{'if': '!bell_rung'}, once=False))
set_tiles('warden_approach', 31, 16, 34, 16, '=')
set_tiles('warden_approach', 31, 17, 34, 17, '.')
set_tiles('warden_approach', 14, 0, 17, 1, '.')
set_tiles('warden_approach', 14, 0, 17, 0, '=')
set_tiles('warden_approach', 14, 2, 17, 2, '=')
set_tiles('warden_approach', 11, 5, 14, 5, '=')
# Ledges up the side of the well, so the Well Shaft's mouth can be reached (the climb needs claws).
set_tiles('well_bottom', 2, 12, 4, 12, '=')
set_tiles('well_bottom', 4, 9, 7, 9, '=')
set_tiles('well_bottom', 6, 6, 9, 6, '=')
set_tiles('well_bottom', 5, 3, 8, 3, '=')
# The Frozen Hollow's west wall is cracked: behind it, the Quiet Graves.
set_tiles('frozen_hollow', 0, 6, 1, 9, 'X')

# A few more hollow things on the original path (2.4): it was too easy a walk.
for rid, x, y, ch in [('ashen_gate', 33, 15, 'c'), ('weeping_tunnels', 20, 15, 't'), ('weeping_tunnels', 12, 6, 'w'),
                      ('crossroads', 19, 29, 't'), ('crossroads', 8, 20, 'w'), ('coat_cellar', 22, 15, 'c'),
                      ('thorn_gap', 33, 15, 't'), ('thorn_gap', 9, 7, 'w'), ('sock_drift', 9, 21, 'c'), ('sock_drift', 28, 21, 'c'),
                      ('warden_approach', 14, 15, 'c'), ('nib_nook', 4, 8, 'w')]:
    set_tiles(rid, x, y, x, y, ch)

# Nib's Nook (2.5): ledges up to the high alcove, whose roof opens on the Lantern Stair to
# Candlewick. A rockfall chokes it until the bell shakes it loose. Nib waits in the nook until then.
for x0, x1, y in [(9, 12, 13), (5, 8, 11), (9, 12, 9), (5, 8, 7), (9, 13, 5), (10, 12, 3), (10, 12, 1)]:
    set_tiles('nib_nook', x0, y, x1, y, '=')
set_tiles('nib_nook', 10, 0, 12, 0, '.')
add_ent('nib_nook', dict(type='gate', id='town_rockfall', mode='flag', flag='bell_rung', x=10, y=0, w=3, h=1, art='deco_rockfall'))
add_ent('nib_nook', dict(type='trigger', id='rockfall_hint', x=9, y=3, w=5, h=1, cutscene='rockfall_hint', once=False, **{'if': '!bell_rung'}))
for v in rooms['nib_nook'].get('legend', {}).values():
    if v.get('npcId') == 'nib':
        v['if'] = '!bell_rung'   # he goes up to open his shop
# The Warden's Hoard keeps an Ember Locket.
add_ent('warden_hoard', dict(type='pickup', kind='keepsake', keepsake='ember', id='ks_ember', cutscene='get_ks_ember', x=12, y=17))

new = []

# ------------------------------------------------------------------ The Hanging Way (main path)
# A long drop under Nib's floor (global x 241..243), ledges to steer onto, out east at the bottom.
r = R('hanging_way', 'The Hanging Way', 228, 18, 20, 32)
r.carve(2, 2, 17, 29)
r.carve(13, 0, 15, 1)               # the drop from Nib's Nook
r.carve(18, 25, 19, 29)             # → the Long Dark
r.fill(2, 14, 5, 15)                # left ledge with a jar
r.fill(15, 21, 17, 22)              # right ledge with a lost name
r.fill(2, 26, 3, 29)
r.put(3, 13, 'g')
r.put(16, 20, '1', tag('name_scouts'))
r.put(8, 9, 'w'); r.put(11, 19, 'w')
r.decal('bell_rope', 8, 2, 1.6, layer='bg', originY=0, oy=-1, alpha=0.7, sway=0.015, swaySpeed=0.5)
r.decal('deco_roots', 4, 2, 0.6, layer='bg', originY=0, oy=-1)
r.decal('deco_roots', 16, 2, 0.5, layer='bg', originY=0, oy=-1, flip=True)
r.decal('deco_bones', 6, 29, 0.4)
new.append(r)

# ------------------------------------------------------------------ The Long Dark (main path)
# A low, black corridor of thorn pits (dash or pogo across). Above it, behind bars that only the
# bell lifts, the way up into the Old Sluice. A cracked wall at the far end hides a lost name.
r = R('long_dark', 'The Long Dark', 248, 30, 52, 20, dark=0.86, onEnter='long_dark_enter', onEnterIf='!long_dark_seen')
r.carve(0, 13, 1, 17)               # ← the Hanging Way
r.carve(1, 8, 50, 17)               # the corridor
r.carve(26, 3, 42, 7)               # the upper gallery
r.fill(37, 3, 37, 7)                # wall between the sluice landing and the east gallery
r.fill(31, 8, 36, 8)                # the sluice landing's floor
r.carve(31, 0, 34, 2)               # ↑ the Old Sluice
r.plat(31, 34, 2); r.plat(32, 33, 5)
r.carve(51, 13, 51, 17)             # → the Sunken Belfry
r.pins(9, 14, 17); r.pins(24, 29, 17); r.pins(38, 41, 17)
r.fill(15, 15, 22, 17)              # a hump of rock between the first pits
r.fill(1, 8, 6, 12)                 # low ceiling at the start
r.plat(21, 24, 14); r.plat(24, 27, 11); r.plat(26, 29, 8)
r.plat(38, 41, 11); r.plat(42, 45, 14); r.plat(39, 42, 8)
r.carve(43, 3, 49, 7); r.fill(43, 7, 49, 7)
r.carve(43, 3, 43, 6, 'X'); r.carve(44, 3, 44, 6, 'X')   # cracked wall → the hidden niche
r.put(47, 6, '1', tag('name_scissors'))
r.put(49, 6, 'g')
r.put(19, 14, 'c'); r.put(33, 17, 't'); r.put(46, 17, 's'); r.put(3, 17, 'c')
r.ent('gate', 30, 3, id='sluice_bars', mode='flag', flag='bell_rung', h=5)
for x, s in [(8, 0.4), (23, 0.35), (36, 0.45), (48, 0.4)]:
    r.decal('deco_mushroom', x, 17, s, glow=26, glowColor='0x9ad8ff')
r.decal('deco_rockfall', 12, 7, 0.4, layer='bg', alpha=0.5)
new.append(r)

# ------------------------------------------------------------------ The Old Sluice (main path, back up)
r = R('sluice', 'The Old Sluice', 274, 18, 14, 12)
r.carve(3, 1, 10, 10)
r.carve(5, 0, 8, 0); r.carve(5, 11, 8, 11)
r.plat(5, 8, 11); r.plat(3, 6, 8); r.plat(7, 10, 5); r.plat(3, 6, 2); r.plat(5, 8, 0)
r.decal('deco_roots', 9, 1, 0.4, layer='bg', originY=0, oy=-1)
new.append(r)

# ------------------------------------------------------------------ The Sunken Belfry (main path)
# A bell bigger than a house, hung in the dark, with a rope you can reach. Ring it.
r = R('sunken_belfry', 'The Sunken Belfry', 300, 22, 30, 30, onEnter='belfry_enter', onEnterIf='!belfry_seen')
r.carve(2, 3, 27, 25)
r.carve(0, 21, 1, 25)               # ← the Long Dark
r.fill(2, 10, 6, 11)                # the high ledge (a lost name)
r.plat(2, 5, 22); r.plat(6, 9, 19); r.plat(2, 5, 16); r.plat(6, 9, 13)
r.put(4, 9, '1', tag('name_ada'))
r.put(23, 25, 'S')
r.put(26, 25, 'g')
r.decal('bell_big', 15, 3, 2.4, originY=0, oy=-1, layer='bg', sway=0.01, swaySpeed=0.4)
r.decal('bell_rope', 15, 25, 1.6, w=2, h=4, read='ring_bell', label='Pull')
r.decal('deco_bones', 9, 25, 0.45)
r.decal('deco_umbrella', 20, 25, 0.4, flip=True)
new.append(r)

# ------------------------------------------------------------------ The Quiet Graves (secret)
# Behind the Frozen Hollow's cracked wall: rows of little graves for lost things.
r = R('quiet_graves', 'The Quiet Graves', 22, 22, 36, 18, onEnter='graves_enter', onEnterIf='!graves_seen', dark=0.62)
r.carve(8, 4, 34, 11)
r.carve(35, 8, 35, 11)              # → the Frozen Hollow (its cracked wall)
r.carve(2, 5, 6, 8)                 # the crypt
r.carve(7, 6, 7, 8, 'X')            # its cracked door
r.fill(8, 9, 12, 11)                # terrace
r.fill(21, 9, 22, 11)               # a stepping stone
r.fill(24, 5, 26, 11)               # the tall stone (needs wings from the step)
r.put(4, 8, '1', tag('name_buttons'))
r.put(25, 4, '2', tag('name_biscuit'))
r.put(10, 8, 'g')
r.put(16, 11, 'c'); r.put(31, 11, 'c'); r.put(19, 11, 't')
stones = [(13, 'gr_stone1', 'epitaph_mitten'), (15, 'gr_stone2', None), (18, 'gr_stone3', 'epitaph_key'),
          (28, 'gr_stone2', None), (30, 'gr_stone1', 'epitaph_keeper'), (33, 'gr_stone3', None)]
for x, art, read in stones:
    kw = dict(read=read, label='Read', w=1, h=2) if read else {}
    r.decal(art, x, 11, 0.6, layer='bg', flip=(x % 2 == 0), **kw)
r.decal('gr_stone2', 9, 8, 0.55, layer='bg')
r.decal('gr_stone1', 3, 8, 0.6, layer='bg', alpha=0.8)
r.decal('candle', 5, 8, 0.4, glow=30)
r.carve(18, 1, 30, 3)               # headroom over the tall stone
new.append(r)

# ------------------------------------------------------------------ The Well Shaft (secret, claws)
# Straight up from where you landed. Smooth walls: climb them.
r = R('well_shaft', 'The Well Shaft', 0, -40, 16, 40, dark=0.5)
r.carve(5, 8, 9, 39)                # the shaft
r.carve(2, 2, 13, 7)                # the top: under the grate
r.carve(10, 20, 13, 23)             # a niche halfway up
r.put(12, 23, '1', tag('name_pip'))
r.put(12, 7, 'W', dict(type='pickup', kind='whetstone', id='whet_hollows', cutscene='get_whet_hollows'))
r.put(10, 7, 'Y', dict(type='trigger', w=3, h=3, cutscene='well_top'))
r.put(7, 16, 'w')
r.decal('well_grate', 7, 2, 0.9, originY=0, oy=-1, glow=70, glowColor='0xb8c8ff')
r.decal('well_bucket', 3, 7, 0.45)
r.decal('scratch_mira', 2, 6, 0.5, layer='bg', read='read_mira_scratch', label='Read', w=2, h=2)
new.append(r)

# ------------------------------------------------------------------ The Warden's Hoard (secret, wings)
r = R('warden_hoard', "The Warden's Hoard", 254, -22, 26, 22, onEnter='hoard_enter', onEnterIf='!hoard_seen', dark=0.6)
r.carve(2, 4, 23, 17)
r.carve(8, 18, 11, 21)              # ↓ the Warden's Approach
r.plat(8, 11, 18)
r.plat(16, 19, 14); r.plat(19, 22, 11)
r.put(4, 17, '1', tag('name_henry'))
r.put(21, 10, '2', tag('name_chair'))
r.put(6, 17, 'g'); r.put(17, 17, 'g')
r.put(14, 8, 'w')
r.decal('hoard_pile', 13, 17, 0.9, layer='bg')
r.decal('scratch_tally', 3, 12, 0.6, layer='bg', read='read_tally', label='Read', w=2, h=3)
r.decal('deco_umbrella', 21, 17, 0.45)
r.decal('deco_key', 10, 17, 0.4)
new.append(r)

for x in new:
    rooms[x.d['id']] = x.json()
order = [r['id'] for r in area['rooms']]
for x in new:
    if x.d['id'] not in order:
        order.append(x.d['id'])
area['rooms'] = [rooms[i] for i in order]
with open(PATH, 'w') as f:
    json.dump(area, f, indent=1)
print('wrote', PATH, len(area['rooms']), 'rooms')

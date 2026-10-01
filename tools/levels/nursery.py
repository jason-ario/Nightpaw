#!/usr/bin/env python3
"""Builds content/areas/nursery.json (The Drowned Nursery).

Rooms are carved out of solid rock with small helpers so openings line up across rooms;
the JSON it writes is the real content (edit either, but re-running this overwrites the JSON).
Usage: python3 tools/levels/nursery.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from carve import R  # noqa: E402


rooms = []

# --------------------------------------------------------------------------- 1. The Block Stair
# Entry from the Updraft through the floor (global x 313..323). Shrine, chalk, a stair of blocks.
r = R('block_stair', 'The Block Stair', 300, -58, 40, 18, onEnter='nursery_arrive', onEnterIf='!nursery_arrived')
r.carve(1, 1, 38, 14)
r.carve(13, 15, 23, 17)            # the hole up from the Updraft
r.plat(15, 20, 15)                 # jump-through lip over the hole
r.fill(27, 12, 29, 14)             # toy blocks
r.fill(31, 9, 33, 14)
r.fill(35, 7, 38, 14)
r.carve(39, 4, 39, 6)              # exit → Shallows
r.fill(1, 1, 38, 2)                # low ceiling
r.fill(1, 3, 6, 4)
r.plat(2, 6, 10)
r.put(4, 9, 'g')
r.put(6, 14, 'S')
r.put(25, 14, 'm')
r.put(20, 6, 'w')
r.put(36, 6, 'M')
r.decal('chalk_nursery', 10, 13, 0.6, layer='bg', read='read_wet', label='Read')
r.decal('nur_block', 28, 11, 0.45)
r.decal('nur_block', 32, 8, 0.4, flip=True)
r.decal('nur_block', 37, 6, 0.42)
r.decal('nur_rattle', 3, 9, 0.4)
rooms.append(r)

# --------------------------------------------------------------------------- 2. The Shallows
# First water. Two block islands, Tin Fish, a sunken rattle.
r = R('shallows', 'The Shallows', 340, -60, 44, 18)
r.carve(0, 5, 7, 8)                # entry corridor (floor row 9)
r.carve(1, 2, 42, 8)
r.carve(8, 9, 35, 14)              # the basin
r.fill(17, 9, 19, 14)              # islands
r.fill(26, 10, 28, 14)
r.carve(36, 5, 43, 8)              # exit → Cot
r.carve(3, 9, 6, 9, 'X')           # cracked floor by the door → the Sump (2.4)
r.carve(3, 10, 6, 17)
r.pool(x=8, w=28, level=10)
r.plat(11, 14, 5)
r.put(12, 4, 'o'); r.put(13, 4, 'o')
r.put(13, 11, 'f'); r.put(23, 11, 'f'); r.put(32, 11, 'f')
r.put(30, 4, 'w')
r.decal('nur_boat', 11, 9, 0.35)
r.decal('nur_boat', 31, 9, 0.3, flip=True)
r.decal('nur_rattle', 22, 14, 0.5, rot=1.2, alpha=0.6)
r.decal('nur_bear', 40, 8, 0.4)
rooms.append(r)

# --------------------------------------------------------------------------- 3. The Cot (hub)
# A drowned nursery under a mobile of tin moons. Dunk, Tallow, the ribbon, the claws shaft up.
r = R('cot', 'The Cot', 384, -66, 48, 24, music='nursery')
r.carve(0, 11, 7, 14)              # entry corridor from the Shallows (floor row 15)
r.carve(2, 0, 5, 10)               # the tall shaft up to the Tidewheel (needs claws)
r.carve(8, 3, 41, 20)              # the hall
r.pool(x=8, w=34, level=17)
r.plat(20, 29, 15)                 # the cot's mattress
r.plat(11, 15, 10)
r.plat(33, 37, 10)
r.fill(42, 15, 47, 23)             # right ledge (shrine)
r.carve(42, 11, 47, 14)            # exit → Toy Chest
r.fill(42, 3, 47, 10)
r.put(46, 14, 'S')
r.put(12, 9, 'o'); r.put(14, 9, 'o')
r.put(35, 9, 'g')
r.put(13, 16, 'D', dict(type='npc', rig='duck', npcId='dunk', speaker='dunk', face=1, float='water', talk=[
    dict(**{'if': '!met_dunk'}, cutscene='meet_dunk'),
    dict(**{'if': 'has:claws & !dunk_claws'}, cutscene='dunk_claws'),
    dict(**{'if': 'queen_dead'}, cutscene='dunk_after'),
    dict(cutscene='dunk_idle')]))
r.put(43, 14, 'T', dict(type='npc', rig='moth', npcId='tallow', speaker='tallow', face=-1, talk=[
    dict(**{'if': '!tallow_nursery'}, cutscene='tallow_nursery'),
    dict(cutscene='tallow_nursery_idle')]))
r.put(25, 14, 'r', dict(type='pickup', kind='ribbon', id='mira_ribbon', cutscene='find_ribbon'))
r.put(10, 16, 'Y', dict(type='trigger', w=3, h=4, cutscene='meet_dunk', **{'if': '!met_dunk'}))
r.decal('nur_cot', 25, 17, 1.0, layer='bg')
r.decal('nur_mobile', 25, 3, 0.5, originY=0, oy=-1, sway=0.05, swaySpeed=0.6, glow=40, glowColor='0xcfe0ff')
r.decal('nur_horse', 36, 20, 0.5, layer='bg', alpha=0.85)
r.decal('chalk_up', 4, 10, 0.45, layer='bg')
rooms.append(r)

# --------------------------------------------------------------------------- 4. The Toy Chest
# Jack-in-the-Boxes on the lid; the Velvet Claws at the bottom of the chest. Climb out.
r = R('toy_chest', 'The Toy Chest', 432, -62, 34, 20)
r.carve(0, 7, 11, 10)              # entry (floor row 11)
r.carve(1, 2, 32, 10)
r.carve(12, 11, 21, 17)            # the chest: 7 deep, needs claws to leave
r.carve(33, 7, 33, 10)             # → the Drowned Hall (2.4)
r.plat(26, 30, 6)
r.put(8, 10, 'J'); r.put(25, 10, 'J', dict(type='jackbox', face=-1))
r.put(28, 5, 'g')
r.put(31, 10, 'o')
r.put(17, 17, 'k', dict(type='pickup', kind='claws', id='velvet_claws', cutscene='get_claws'))
r.put(13, 17, 'Y', dict(type='trigger', w=9, h=3, cutscene='chest_look', **{'if': '!has:claws'}))
r.decal('nur_chest', 17, 17, 1.0, layer='bg')
r.decal('nur_block', 4, 10, 0.4)
rooms.append(r)

# --------------------------------------------------------------------------- 5. The Tidewheel
# A music box turns a paddle-wheel; the water rises and falls. Ride the high tide to the door.
r = R('tidewheel', 'The Tidewheel', 380, -90, 40, 24)
r.carve(6, 12, 9, 23)              # shaft up from the Cot
r.carve(1, 2, 10, 11)              # left ledge room (floor row 12)
r.carve(0, 8, 0, 11)               # exit → Cold Hearth
r.carve(11, 2, 33, 20)             # the basin (floor row 21)
r.carve(27, 2, 38, 7)              # the upper shelf and door
r.fill(27, 8, 38, 9)
r.carve(39, 4, 39, 7)              # exit → Bathtub Sea
r.carve(34, 2, 38, 3)
r.pool(id='tide', x=11, w=23, level=20, low=20, high=12, period=9)
r.put(3, 11, 'M')
r.put(19, 5, 'w'); r.put(24, 16, 'f')
r.put(36, 7, 'o')
r.ent('wheel', 22, 12, scale=0.75, speed=0.35, alpha=0.9)
r.decal('nur_bear', 8, 11, 0.35)
r.put(8, 11, 'Y', dict(type='trigger', w=3, h=3, cutscene='tide_hint'))
rooms.append(r)

# --------------------------------------------------------------------------- 6. The Cold Hearth
# A dead fireplace. The chimney climbs to Shade 3: The Fireworks Night.
r = R('cold_hearth', 'The Cold Hearth', 356, -98, 24, 26, dark=0.52)
r.carve(1, 12, 22, 19)             # the hall (floor row 20)
r.carve(23, 16, 23, 19)            # exit → Tidewheel
r.carve(3, 2, 6, 11)               # the chimney
r.carve(3, 1, 14, 4)               # the chimney-top nook
r.plat(2, 7, 16)                   # the mantel: a step up into the chimney
r.carve(5, 0, 8, 0)                # ↑ the Attic (2.4)
r.plat(5, 8, 2)
r.put(12, 4, '3', dict(type='pickup', kind='shade', id='shade_fireworks', cutscene='shade_fireworks'))
r.put(17, 19, 'g'); r.put(14, 14, 'w')
r.put(20, 19, 'm')
r.decal('nur_hearth', 5, 19, 1.0, layer='bg')
r.decal('chalk_fire', 16, 16, 0.45, layer='bg')
rooms.append(r)

# --------------------------------------------------------------------------- 7. The Bathtub Sea
# A bath the size of a lake. Float across, climb the tall end, then dash + wings over the pins.
r = R('bathtub', 'The Bathtub Sea', 420, -100, 56, 22)
r.carve(0, 14, 4, 17)              # entry (floor row 18)
r.carve(1, 2, 54, 17)
r.carve(5, 18, 38, 20)             # the tub (floor row 21)
r.fill(39, 5, 42, 21)              # the tall tub end / faucet
r.carve(43, 18, 50, 20)
r.pins(43, 50, 20)
r.carve(46, 20, 49, 21)            # the drain → the Drain (2.4)
r.fill(51, 9, 55, 21)              # exit ledge
r.carve(55, 5, 55, 8)              # exit → Doll Shelf
r.carve(51, 2, 54, 8)
r.pool(x=5, w=34, level=19)
r.plat(12, 14, 15); r.plat(23, 25, 14); r.plat(31, 33, 15)
r.put(9, 19, 'f'); r.put(19, 19, 'f'); r.put(28, 19, 'f'); r.put(35, 19, 'f')
r.put(24, 13, 'o')
r.put(47, 6, 'w')
r.put(17, 18, 'q', dict(type='npc', rig='duck', face=-1, float='water', watch=False))
r.put(30, 18, 'u', dict(type='npc', rig='duck', face=1, float='water', watch=False))
r.decal('nur_faucet', 41, 4, 0.6)
r.put(40, 4, 'Y', dict(type='trigger', w=2, h=2, cutscene='pins_hint'))
r.ent('gate', 55, 5, id='nursery_door', mode='flag', flag='nursery_key', h=4, art='nur_door')
r.ent('trigger', 53, 8, id='door_hint', w=1, h=4, cutscene='door_hint', once=False, **{'if': '!nursery_key'})
rooms.append(r)

# --------------------------------------------------------------------------- 8. The Doll Shelf
# Shelves of dolls that watch you. An echo of Mira singing. A cracked wall hides a cupboard.
r = R('doll_shelf', 'The Doll Shelf', 476, -104, 32, 24)
r.carve(0, 9, 5, 12)               # entry (floor row 13)
r.carve(6, 3, 29, 21)              # the hall (floor row 22)
r.carve(8, 0, 11, 2)               # chute up to the Pincushion
r.fill(26, 17, 30, 21)             # right ledge in front of the cupboard
r.carve(30, 3, 30, 16)
r.put(31, 15, 'X'); r.put(31, 16, 'X')
r.plat(6, 12, 13)
r.plat(18, 24, 17)
r.plat(21, 27, 12)
r.plat(13, 18, 9)
r.plat(6, 13, 5)
for (x, y) in [(20, 16), (22, 16), (24, 11), (26, 11), (15, 8), (17, 8), (7, 4), (12, 4)]:
    r.put(x, y, 'd')
r.put(10, 21, 'm'); r.put(27, 7, 'w')
r.put(23, 21, 'Y', dict(type='trigger', w=4, h=4, cutscene='doll_echo'))
r.decal('chalk_sings', 16, 21, 0.55, layer='bg', read='read_sings', label='Read')
r.decal('nur_shelf', 22, 18, 0.6, layer='bg')
r.decal('nur_shelf', 17, 10, 0.55, layer='bg', flip=True)
rooms.append(r)

# --------------------------------------------------------------------------- 9. The Button Cupboard (secret)
r = R('button_cupboard', 'Button Cupboard', 508, -94, 14, 9)
r.carve(0, 5, 0, 6)
r.carve(1, 1, 12, 6)
r.put(10, 6, 'p', dict(type='pickup', kind='drawing', id='mira_drawing', cutscene='find_drawing'))
for x in (3, 4, 5, 6):
    r.put(x, 6, 'o')
r.put(8, 6, 'g')
r.decal('nur_block', 12, 6, 0.4)
rooms.append(r)

# --------------------------------------------------------------------------- 10. The Pincushion
# A wall-jump climb between walls bristling with pins.
r = R('pincushion', 'The Pincushion', 480, -134, 16, 30, dark=0.48)
r.carve(4, 28, 7, 29)              # chute from the Doll Shelf
r.carve(2, 1, 13, 27)
r.pins(9, 13, 27)
r.fill(7, 9, 8, 21)                # central pillar
r.fill(2, 17, 3, 18); r.pins(2, 3, 16)
r.fill(12, 12, 13, 13); r.pins(12, 13, 11)
r.fill(2, 7, 4, 8); r.pins(2, 4, 6)
r.fill(2, 0, 9, 0)
r.carve(10, 0, 13, 0)              # exit → Winding Stair
r.put(5, 27, 'o'); r.put(11, 4, 'w')
r.decal('nur_pincushion', 11, 27, 0.5, layer='bg')
rooms.append(r)

# --------------------------------------------------------------------------- 11. The Winding Stair
# The outside of a giant music box. Mothmother passes overhead. Shrine.
r = R('winding_stair', 'The Winding Stair', 474, -152, 40, 18)
r.carve(1, 2, 38, 15)
r.carve(16, 16, 19, 17)            # up from the Pincushion
r.plat(16, 19, 16)
r.plat(23, 27, 13)
r.plat(29, 32, 10)
r.fill(34, 7, 38, 15)              # the stair's top
r.carve(39, 4, 39, 6)              # exit → Music Box
r.put(5, 15, 'S')
r.put(12, 15, 'm'); r.put(25, 12, 'J', dict(type='jackbox', face=1))
r.put(30, 5, 'w')
r.put(20, 15, 'Y', dict(type='trigger', w=6, h=6, cutscene='mothmother_pass'))
r.decal('nur_musicbox_big', 22, 15, 2.0, layer='bg', alpha=0.9)
rooms.append(r)

# --------------------------------------------------------------------------- 12. The Music Box (boss)
r = R('music_box', 'The Music Box', 514, -154, 34, 20, music='none')
r.carve(0, 6, 3, 8)                # entry (ledge row 9)
r.carve(4, 2, 29, 15)              # the arena (floor row 16)
r.carve(30, 6, 33, 8)              # exit → Stopper Chain (ledge row 9)
r.plat(8, 11, 12); r.plat(22, 25, 12)
r.put(2, 6, 'G')
r.put(31, 6, 'H', dict(type='gate', mode='flag', flag='queen_dead'))
r.put(17, 15, 'Q', dict(type='queen'))
r.put(12, 15, 'Y', dict(type='trigger', w=10, h=4, cutscene='queen_intro', once=False, **{'if': '!queen_dead'}))
r.pool(id='box', x=4, w=26, level=20, drainIf='queen_dead')
r.decal('nur_comb', 17, 11, 1.2, layer='bg', alpha=0.75)
rooms.append(r)

# --------------------------------------------------------------------------- 13. The Stopper Chain
# The bath chain leads up to the plughole — and Mousewick Market. Nib is packing.
r = R('stopper_chain', 'The Stopper Chain', 548, -176, 20, 32)
r.carve(0, 28, 3, 30)              # entry (floor row 31)
r.carve(1, 2, 18, 30)
for i, y in enumerate([28, 25, 22, 19, 16, 13, 10]):
    x0 = 5 if i % 2 == 0 else 10
    r.plat(x0, x0 + 3, y)
r.fill(12, 7, 18, 8)               # the top ledge by the plughole
r.carve(12, 2, 18, 6)
r.put(14, 6, 'n', dict(type='npc', rig='mouse', npcId='nib', speaker='nib', face=-1, talk=[
    dict(**{'if': '!nib_market'}, cutscene='nib_market'),
    dict(cutscene='nib_market_idle')]))
r.put(12, 6, 'Y', dict(type='trigger', w=1, h=3, cutscene='nib_market', **{'if': '!nib_market'}))
r.put(17, 6, 'E', dict(type='trigger', w=2, h=3, cutscene='nursery_end'))
r.decal('nur_chain', 9, 29, 2.0, layer='bg', originY=1)
r.decal('nur_plughole', 16, 1, 0.55, originY=0, oy=-1, glow=60, glowColor='0xffd9a0')
rooms.append(r)

# =========================================================================== 2.4: the expansion
def tag(id):
    return dict(type='pickup', kind='nametag', id=id, cutscene=id)

# --------------------------------------------------------------------------- The Drain
# Down the plughole in the Bathtub's pit; climb back with claws.
r = R('the_drain', 'The Drain', 464, -78, 12, 14, dark=0.6)
r.carve(2, 0, 5, 12)
r.carve(3, 13, 5, 13)
r.carve(6, 5, 9, 7)                # a niche off the pipe
r.put(8, 7, '1', tag('name_baby'))
r.decal('deco_roots', 4, 0, 0.4, layer='bg', originY=0, oy=-1, alpha=0.5)
rooms.append(r)

# --------------------------------------------------------------------------- The Drowned Hall
# The house's old upstairs hall, flooded to the knee. Portraits with their faces rubbed out.
r = R('drowned_hall', 'The Drowned Hall', 466, -64, 50, 22, dark=0.5, onEnter='hall_enter', onEnterIf='!hall_seen')
r.carve(1, 0, 3, 2)                # ↑ the Drain
r.carve(1, 3, 48, 18)
r.carve(0, 9, 0, 12)               # ← the Toy Chest
r.carve(49, 9, 49, 14)             # → Nanny's Room
r.fill(1, 13, 4, 18)               # landing under the Toy Chest door
r.fill(45, 15, 48, 18)             # landing at the far door
r.pool(x=5, w=40, level=15)
r.plat(9, 12, 12); r.plat(18, 21, 11); r.plat(27, 30, 12); r.plat(36, 39, 11)
r.plat(22, 25, 7)
r.put(23, 6, '1', tag('name_dolly'))
r.put(12, 16, 'f'); r.put(24, 16, 'f'); r.put(34, 16, 'f')
r.put(20, 10, 'w'); r.put(40, 10, 'J', dict(type='jackbox', face=-1))
for x in (8, 17, 31, 42):
    r.decal('nur_portrait', x, 8, 0.5, layer='bg', flip=(x % 2 == 0))
r.decal('nur_portrait', 26, 4, 0.4, layer='bg', read='read_portrait', label='Look', w=2, h=2)
rooms.append(r)

# --------------------------------------------------------------------------- Nanny's Room
# An empty rocking chair that still rocks. The lamb key hangs high on its hook.
r = R('nanny_room', "Nanny's Room", 516, -76, 36, 34, dark=0.55, onEnter='nanny_enter', onEnterIf='!nanny_seen')
r.carve(0, 21, 1, 26)              # ← the Drowned Hall
r.carve(2, 3, 33, 28)
r.fill(2, 27, 33, 28)              # floor (row 27 top)
r.carve(0, 27, 1, 28)
r.fill(0, 27, 1, 28)
r.plat(22, 26, 23); r.plat(27, 31, 19); r.plat(21, 25, 15); r.plat(27, 31, 11); r.plat(22, 26, 7)
r.fill(29, 5, 33, 6)               # the hook's ledge
r.put(31, 4, 'K', dict(type='pickup', kind='key', id='nursery_key', cutscene='get_nursery_key'))
r.put(13, 26, '1', tag('name_nanny'))
r.put(4, 26, 'S')
r.put(17, 26, 'm'); r.put(28, 18, 'J', dict(type='jackbox', face=-1)); r.put(24, 10, 'w')
r.decal('nur_rocker', 10, 26, 0.7, layer='bg', sway=0.09, swaySpeed=1.1)
r.decal('nur_basket', 14, 26, 0.45, layer='bg')
r.decal('nur_portrait', 8, 18, 0.7, layer='bg', read='read_nanny_portrait', label='Look', w=2, h=3)
rooms.append(r)

# --------------------------------------------------------------------------- The Sump
# Under the Shallows' cracked floor: pipes, black water, things that sank.
r = R('sump', 'The Sump', 340, -42, 44, 16, dark=0.7)
r.carve(3, 0, 6, 1)                # ↑ the Shallows
r.carve(1, 2, 42, 12)
r.pool(x=1, w=42, level=9)
r.plat(19, 26, 5); r.plat(4, 6, 2)
r.plat(5, 9, 7); r.plat(34, 38, 7)
r.fill(1, 5, 3, 12)
r.put(2, 4, '1', tag('name_rosalind'))
r.decal('chalk_up', 5, 4, 0.3, layer='bg', alpha=0.5)
r.put(37, 6, 'g')
r.put(12, 11, 'f'); r.put(30, 11, 'f')
r.decal('nur_boat', 15, 9, 0.3, rot=2.6, alpha=0.5)
r.decal('nur_bear', 28, 12, 0.35, rot=1.4, alpha=0.4)
rooms.append(r)

# --------------------------------------------------------------------------- The Attic
# Up the Cold Hearth's chimney: everything that was put away "for now", under sheets.
r = R('attic', 'The Attic', 356, -120, 64, 22, dark=0.58, onEnter='attic_enter', onEnterIf='!attic_seen')
r.carve(1, 2, 62, 19)
r.carve(5, 20, 8, 21)              # ↓ the Cold Hearth's chimney
r.plat(5, 8, 20)
r.fill(14, 15, 18, 19)             # boxes
r.fill(30, 14, 34, 19)
r.plat(20, 24, 12); r.plat(26, 29, 9); r.plat(36, 40, 11); r.plat(44, 48, 14)
r.fill(1, 2, 62, 3)                # rafters
r.plat(10, 13, 7)
r.fill(55, 2, 62, 11)              # the chimney stack
r.carve(57, 12, 62, 19)            # behind the stack: a hidden corner
r.carve(56, 12, 56, 19, 'X')
r.put(60, 19, 'W', dict(type='pickup', kind='whetstone', id='whet_nursery', cutscene='get_whet_nursery'))
r.put(27, 8, '1', tag('name_lamb'))
r.put(32, 13, '2', tag('name_m'))
r.put(16, 14, 'g')
r.put(24, 19, 'm'); r.put(42, 19, 'm'); r.put(38, 8, 'w'); r.put(50, 19, 'J')
for x, s in [(11, 0.8), (23, 0.7), (40, 0.9), (48, 0.75)]:
    r.decal('nur_sheet', x, 19, s, layer='bg', flip=(x % 2 == 0))
r.decal('nur_mirror', 52, 19, 0.7, layer='bg', read='read_mirror', label='Look', w=2, h=3)
r.decal('nur_horse', 26, 19, 0.45, layer='bg', alpha=0.7)
r.decal('nur_mobile', 34, 4, 0.4, originY=0, oy=-1, sway=0.03, swaySpeed=0.3, alpha=0.6)
rooms.append(r)

# A few more hollow toys on the original path (2.4).
byid = {x.d['id']: x for x in rooms}
for rid, x, y, ch in [('bathtub', 53, 8, 'J'), ('doll_shelf', 16, 21, 'm'), ('tidewheel', 28, 4, 'w'), ('cot', 22, 14, 'm')]:
    byid[rid].g[y][x] = ch

area = {
    'id': 'nursery',
    'name': 'The Drowned Nursery',
    'subtitle': 'Where the music box plays by itself',
    'tileset': 'nur',
    'backdrop': {'far': 'nur_bg_far', 'mid': 'nur_bg_mid', 'fg': 'nur_fg', 'tint': 0x6a6890, 'midTint': 0x48506c, 'fog': True, 'fogTint': 0xcfe6ff},
    'dark': 0.5,
    'music': 'nursery',
    'ambience': 'nursery',
    'legend': {
        'm': {'type': 'windup'},
        'J': {'type': 'jackbox'},
        'f': {'type': 'tinfish'},
        'd': {'type': 'doll', 'layer': 'bg'},
        'M': {'type': 'musicbox'},
    },
    'decor': {'floor': ['nur_block_small', 'nur_marble', 'nur_thimble', 'nur_bead'], 'ceil': ['nur_bunting'],
              'glow': {'nur_marble': [0xbfe6ff, 20]},
              'foreground': {'floor': ['fg_nur_blocks', 'fg_nur_yarn', 'fg_nur_cot'], 'ceil': ['fg_nur_mobile', 'fg_nur_bunting'], 'density': 1}},
    'water': {'tint': 0x2a6a88, 'surface': 0xcfeeff, 'alpha': 0.45},
    'endCard': {'title': 'End of Chapter Two', 'lines': [
        'Up through the plughole, the lights of Mousewick Market.',
        'Nightpaw has remembered three of his lives.',
        'Mousewick Market is coming soon.']},
    'rooms': [x.json() for x in rooms],
}

path = os.path.join(ROOT, 'content/areas/nursery.json')
with open(path, 'w') as f:
    json.dump(area, f, indent=1)
print('wrote', path, len(rooms), 'rooms')

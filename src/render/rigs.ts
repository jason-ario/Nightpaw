// Rig definitions: which painted parts make up each character, where their pivots are
// and how they nest. Coordinates are art px (4 px = 1 world unit), origin at the feet,
// facing right. Change pivots here if an artist repaints parts at different sizes.
import { PartDef, chain } from './puppet';

export function catRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [{
      name: 'body', key: 'cat_body', x: 0, y: -27, ox: 0.5, oy: 0.55,
      behind: [
        { name: 'legFB', key: 'cat_leg_back', x: -14, y: 4, ox: 0.5, oy: 0.12 },
        { name: 'legFF', key: 'cat_leg_back', x: 16, y: 4, ox: 0.5, oy: 0.12 },
        { name: 'tailRoot', x: -24, y: -6, rot: -2.4, front: [chain('tail', 'cat_tail', 6, 7, 1, 0.55)] },
        { name: 'needle', key: 'needle', x: -6, y: -12, ox: 0.25, oy: 0.5, rot: -0.3, sx: 0.8, sy: 0.8 },
      ],
      front: [
        { name: 'legNB', key: 'cat_leg', x: -11, y: 6, ox: 0.5, oy: 0.12 },
        { name: 'legNF', key: 'cat_leg', x: 18, y: 6, ox: 0.5, oy: 0.12 },
        {
          name: 'head', x: 21, y: -8,
          behind: [
            { name: 'earB', key: 'cat_ear', x: -3, y: -13, ox: 0.5, oy: 0.9, rot: -0.3 },
            { name: 'rib1', key: 'cat_ribbon', x: -8, y: 12, ox: 0.5, oy: 0.05, rot: 0.9 },
            { name: 'rib2', key: 'cat_ribbon', x: -6, y: 12, ox: 0.5, oy: 0.05, rot: 1.3, sx: 0.85, sy: 0.85 },
          ],
          key: 'cat_head', ox: 0.42, oy: 0.6,
          front: [
            { name: 'earF', key: 'cat_ear', x: 8, y: -15, ox: 0.5, oy: 0.9, rot: 0.15 },
            { name: 'eyeB', key: 'cat_eye', x: 9, y: -2, sx: 0.72, sy: 0.8 },
            { name: 'eyeF', key: 'cat_eye', x: 16, y: -2, sx: 0.82, sy: 0.9 },
            { name: 'bow', key: 'cat_bow', x: -7, y: 11, sx: 0.9, sy: 0.9 },
          ],
        },
      ],
    }],
  };
}

export function miteRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'legs', x: 0, y: -10, behind: [
        { name: 'l0', key: 'mite_leg', x: -18, y: 0, ox: 0.5, oy: 0.1 }, { name: 'l1', key: 'mite_leg', x: -6, y: 0, ox: 0.5, oy: 0.1 },
        { name: 'l2', key: 'mite_leg', x: 6, y: 0, ox: 0.5, oy: 0.1 }, { name: 'l3', key: 'mite_leg', x: 18, y: 0, ox: 0.5, oy: 0.1 },
      ] },
      { name: 'shell', key: 'mite_shell', x: 0, y: -12, ox: 0.5, oy: 0.85, rot: 0.25, front: [
        { name: 'face', key: 'mite_face', x: 22, y: 2, sx: 0.7, sy: 0.7 },
      ] },
    ],
  };
}

export function sockRig(): PartDef {
  // the cuff sits in front; the leg and foot hang behind it so the seams tuck under
  return {
    name: 'root', x: 0, y: 0,
    front: [{
      name: 'cuff', key: 'sock_cuff', x: 0, y: -42, rot: 0,
      behind: [
        { name: 'mid', key: 'sock_mid', x: 0, y: 6, ox: 0.5, oy: 0, behind: [
          { name: 'foot', key: 'sock_foot', x: -6, y: 26, ox: 0.2, oy: 0.2 },
        ] },
      ],
      front: [
        { name: 'eyes', key: 'sock_eyes', x: 0, y: -4.5, sx: 0.85, sy: 0.85 },
      ],
    }],
  };
}

export function snailRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'body', key: 'snail_body', x: 4, y: -12, front: [
        { name: 'stalk1', key: 'snail_stalk', x: 24, y: -10, ox: 0.5, oy: 1, rot: 0.2 },
        { name: 'stalk2', key: 'snail_stalk', x: 28, y: -8, ox: 0.5, oy: 1, rot: 0.5 },
      ] },
      { name: 'shell', key: 'snail_shell', x: -6, y: -30 },
    ],
  };
}

export function toadRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'legB', key: 'toad_leg', x: -18, y: -8, ox: 0.2, oy: 0.3 },
      { name: 'body', key: 'toad_body', x: 0, y: -22, oy: 0.55, front: [
        { name: 'eye', key: 'toad_eye', x: 15, y: -8, sx: 0.85, sy: 0.85 },
      ] },
      { name: 'legF', key: 'toad_leg', x: 14, y: -8, ox: 0.2, oy: 0.3, sx: 0.8, sy: 0.8 },
    ],
  };
}

export function wardenRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [{
      name: 'coat', key: 'warden_coat', x: 0, y: -84, oy: 0.5,
      behind: [
        { name: 'armB', key: 'warden_arm', x: -34, y: -60, ox: 0.5, oy: 0.05, rot: 0.15 },
      ],
      front: [
        { name: 'head', key: 'warden_head', x: 0, y: -96, oy: 0.8, front: [
          { name: 'eyeL', key: 'warden_eye', x: -9, y: -26, add: true },
          { name: 'eyeR', key: 'warden_eye', x: 9, y: -26, add: true },
        ] },
        { name: 'armF', key: 'warden_arm', x: 36, y: -60, ox: 0.5, oy: 0.05, rot: -0.15 },
      ],
    }],
  };
}

export function mothRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [{
      name: 'body', key: 'moth_body', x: 0, y: -30, rot: 0.25,
      behind: [
        { name: 'wingB', key: 'moth_wing', x: -2, y: -10, ox: 0.1, oy: 0.85, rot: -1.45, alpha: 0.8 },
        { name: 'antB', key: 'moth_antenna', x: 6, y: -24, ox: 0.1, oy: 0.95, rot: -0.2 },
      ],
      front: [
        { name: 'wingF', key: 'moth_wing', x: 0, y: -6, ox: 0.1, oy: 0.85, rot: -1.05 },
        { name: 'antF', key: 'moth_antenna', x: 8, y: -24, ox: 0.1, oy: 0.95, rot: 0.1 },
        { name: 'candle', key: 'candle', x: 16, y: 12, sx: 0.8, sy: 0.8, front: [{ name: 'flame', key: 'flame', x: 0, y: -24, add: true }] },
      ],
    }],
  };
}

export function mouseRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'tail', key: 'mouse_tail', x: -22, y: -10, ox: 1, oy: 0.3 },
      { name: 'body', key: 'mouse_body', x: 0, y: -20, behind: [
        { name: 'pack', key: 'mouse_pack', x: -14, y: -6 },
      ], front: [
        { name: 'head', key: 'mouse_head', x: 14, y: -18, ox: 0.3, oy: 0.7, behind: [
          { name: 'earB', key: 'mouse_ear', x: 2, y: -16 },
        ], front: [
          { name: 'earF', key: 'mouse_ear', x: 10, y: -14 },
        ] },
      ] },
    ],
  };
}

/** Gameplay Nightpaw (from Jason's sketch): big head, scarf over the muzzle, a bell-shaped
 *  cloak covering the body, thin legs underneath, tail up behind. A paw slips out to scratch. */
export function nightpawRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'tailRoot', x: -22, y: -18, rot: 1.3, front: [chain('tail', 'np_tail', 10, 6.5, 1.05, 0.6)] },
      { name: 'legFar', key: 'np_leg', x: -5, y: -21, ox: 0.5, oy: 0.05 },
      { name: 'legNear', key: 'np_leg', x: 6, y: -21, ox: 0.5, oy: 0.05 },
      {
        name: 'body', x: 0, y: -16,
        behind: [{ name: 'lining', key: 'np_lining', x: 0, y: -38, ox: 0.5, oy: 0.02, sx: 0.9, sy: 0.8, alpha: 0 }],
        front: [
          { name: 'cloak', key: 'np_cloak', x: 0, y: -40, ox: 0.5, oy: 0.02, sy: 0.85, front: [
            { name: 'hem', key: 'np_hem', x: 0, y: 32, ox: 0.5, oy: 0.05 },
          ] },
          { name: 'arm', key: 'np_arm', x: 7, y: -30, ox: 0.5, oy: 0.06, alpha: 0, front: [
            { name: 'claws', key: 'np_claws', x: 1, y: 24, ox: 0.5, oy: 0 },
          ] },
          {
            name: 'head', x: 2, y: -42,
            behind: [{ name: 'earB', key: 'np_ear', x: -13, y: -28, ox: 0.5, oy: 0.95, rot: -0.28 }],
            key: 'np_head', ox: 0.5, oy: 0.75,
            front: [
              { name: 'earF', key: 'np_ear', x: 13, y: -29, ox: 0.5, oy: 0.95, rot: 0.26 },
              { name: 'eyeB', key: 'np_eye', x: -6, y: -13, sx: 0.88, sy: 0.9 },
              { name: 'eyeF', key: 'np_eye', x: 11, y: -13 },
              { name: 'whiskers', key: 'np_whiskers', x: 3, y: -8, sx: 0.9, sy: 0.9 },
              { name: 'mask', key: 'np_mask', x: 4, y: 3, sy: 0.72, sx: 0.95 },
            ],
          },
        ],
      },
    ],
  };
}

// ====================================================================
// The Drowned Nursery
// ====================================================================

/** Wind-up mouse: a tin mouse on wheels with a big key in its back. */
export function windupRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'wheelB', key: 'wm_wheel', x: -12, y: -7 },
      { name: 'tail', key: 'wm_tail', x: -24, y: -12, ox: 0.95, oy: 0.5 },
      { name: 'key', key: 'wm_key', x: -6, y: -30, ox: 0.5, oy: 0.95 },
      { name: 'body', key: 'wm_body', x: 0, y: -21, front: [
        { name: 'ear', key: 'wm_ear', x: 11, y: -8, ox: 0.5, oy: 0.9 },
      ] },
      { name: 'wheelF', key: 'wm_wheel', x: 13, y: -7 },
    ],
  };
}

/** Jack-in-the-box: the spring and head rise out of the box; the lid flips open. */
export function jackRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'spring', key: 'jb_spring', x: 0, y: -52, ox: 0.5, oy: 1 },
      { name: 'head', key: 'jb_head', x: 0, y: -52, ox: 0.5, oy: 0.85, front: [
        { name: 'fist', key: 'jb_fist', x: 18, y: -6, ox: 0.1, oy: 0.5 },
      ] },
      { name: 'box', key: 'jb_box', x: 0, y: -30 },
      { name: 'lid', key: 'jb_lid', x: -32, y: -58, ox: 0.03, oy: 0.5 },
    ],
  };
}

/** Tin fish: a wind-up bath toy. */
export function fishRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'tail', key: 'tf_tail', x: -24, y: -15, ox: 0.9, oy: 0.5 },
      { name: 'fin', key: 'tf_fin', x: -2, y: -26, ox: 0.4, oy: 0.95 },
      { name: 'body', key: 'tf_body', x: 0, y: -15, front: [
        { name: 'key', key: 'tf_key', x: -8, y: 6, ox: 0.5, oy: 0.1 },
      ] },
    ],
  };
}

/** Dunk the rubber duck. */
export function duckRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [{
      name: 'body', key: 'duck_body', x: 0, y: -22, oy: 0.6,
      front: [
        { name: 'wing', key: 'duck_wing', x: -6, y: -4, ox: 0.2, oy: 0.3 },
        { name: 'head', key: 'duck_head', x: 13, y: -13, ox: 0.5, oy: 0.85, front: [
          { name: 'beak', key: 'duck_beak', x: 11, y: -13, ox: 0.1, oy: 0.5 },
        ] },
      ],
    }],
  };
}

/** A doll on a shelf. Only its head moves. */
export function dollRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'body', key: 'doll_body', x: 0, y: -26 },
      { name: 'head', key: 'doll_head', x: 0, y: -48, ox: 0.5, oy: 0.85 },
    ],
  };
}

/** The Music Box Queen: a porcelain wind-up ballerina. Pivot 'hips' carries the body. */
export function queenRig(): PartDef {
  return {
    name: 'root', x: 0, y: 0,
    front: [
      { name: 'legB', key: 'q_leg', x: -5, y: -76, ox: 0.5, oy: 0.03 },
      { name: 'legF', key: 'q_leg', x: 5, y: -76, ox: 0.5, oy: 0.03 },
      {
        name: 'hips', x: 0, y: -78,
        behind: [
          { name: 'key', key: 'q_key', x: -20, y: -26, ox: 0.9, oy: 0.5 },
          { name: 'armB', key: 'q_arm_u', x: -15, y: -44, ox: 0.5, oy: 0.08, rot: 0.4, front: [{ name: 'foreB', key: 'q_arm_l', x: 0, y: 30, ox: 0.5, oy: 0.08, rot: 0.3 }] },
        ],
        front: [
          { name: 'torso', key: 'q_torso', x: 0, y: 2, ox: 0.5, oy: 0.95 },
          { name: 'tutu', key: 'q_tutu', x: 0, y: 2, ox: 0.5, oy: 0.4 },
          { name: 'head', key: 'q_head', x: 0, y: -50, ox: 0.5, oy: 0.9 },
          { name: 'armF', key: 'q_arm_u', x: 15, y: -44, ox: 0.5, oy: 0.08, rot: -0.4, front: [{ name: 'foreF', key: 'q_arm_l', x: 0, y: 30, ox: 0.5, oy: 0.08, rot: -0.3 }] },
        ],
      },
    ],
  };
}

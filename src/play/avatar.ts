import * as THREE from 'three';

/**
 * Pixel-art skin for the play-mode avatar — drawn from scratch here, 16 px per
 * head face. Edit the palette or the pixel rows to change the look.
 *
 * Legend: H hair · h hair highlight · S skin · s skin shadow · B brow
 *         W eye white · I iris · i iris highlight · N nose shade · M lips · . transparent
 */
export const PAL: Record<string, string> = {
  H: '#1b1512',
  h: '#33281f',
  S: '#e7b995', // skin — light wheatish
  s: '#d3a07a',
  B: '#2a1f18',
  W: '#f6f3ef',
  I: '#3a2616',
  i: '#7a5236',
  N: '#cf9670',
  M: '#b86f62',
  m: '#c98474',
  // clothes
  T: '#26272d', // tee
  t: '#1c1d22',
  L: '#c8ff2e', // lime stripe
  J: '#394e77', // jeans
  j: '#2e3f62',
  K: '#eceef2', // sneakers
  k: '#9aa0aa',
};

const FACE = [
  'HHHHHHHHHHHHHHHH',
  'HHHhHHHHHHHhHHHH',
  'HHHHHHhHHHHHHHhH',
  'HHHHHHHHHHHHHHHH',
  'HHSSHHHHSSSHHHHH',
  'HSSSSSSSSSSSSSSH',
  'SSBBBBSSSSBBBBSS',
  'SSSSSSSSSSSSSSSS',
  'SSWIIWSSSSWIIWSS',
  'SSWIiWSSSSWIiWSS',
  'SSSSSSSNNSSSSSSS',
  'sSSSSSSNNSSSSSSs',
  'sSSSSSSSSSSSSSSs',
  'sSSSSMMMMMMSSSSs',
  'ssSSSSSmmSSSSSss',
  'sssSSSSSSSSSSsss',
];

// head side, face towards the LEFT edge
const SIDE = [
  'HHHHHHHHHHHHHHHH',
  'HHHHhHHHHHHHhHHH',
  'HHHHHHHHHHHHHHHH',
  'HHHHHHHHHHHHHHHH',
  'SHHHHHHHHHHHHHHH',
  'SSSSSHHHHHHHHHHH',
  'SSSSSSSHHHHHHHHH',
  'SSSSSSSSHHHHHHHH',
  'SSSSSSssSHHHHHHH',
  'SSSSSsNsSHHHHHHH',
  'SSSSSSssSSHHHHHH',
  'SSSSSSSSSSSHHHHH',
  'sSSSSSSSSSSSHHHH',
  'sSSSSSSSSSSSSHHH',
  'ssSSSSSSSSSSSSSs',
  'sssSSSSSSSSSSsss',
];

const BACK = [
  'HHHHHHHHHHHHHHHH',
  'HHhHHHHHHHHHHhHH',
  'HHHHHHHhHHHHHHHH',
  'HHHHHHHHHHHHHHHH',
  'HHHHhHHHHHHHHHHH',
  'HHHHHHHHHHhHHHHH',
  'HHHHHHHHHHHHHHHH',
  'HHHHHHHHHHHHHHHH',
  'HHHHHHHHHHHHHHHH',
  'HHHHHHHhHHHHHHHH',
  'HHHHHHHHHHHHHHHH',
  'HHHHHHHHHHHHHHHH',
  'sHHHHHHHHHHHHHHs',
  'sSHHHHHHHHHHHHSs',
  'sSSSSSSSSSSSSSSs',
  'ssSSSSSSSSSSSSss',
];

const TOP = Array.from({ length: 16 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => ((x * 3 + y * 5) % 7 === 0 ? 'h' : 'H')).join(''),
);

// torso 16×24 (front); a round neck, a lime stripe across the chest
const TORSO = Array.from({ length: 24 }, (_, y) =>
  Array.from({ length: 16 }, (_, x) => {
    if (y < 2 && x >= 6 && x <= 9) return 'S';
    if (y === 2 && x >= 5 && x <= 10) return 't';
    if (y >= 8 && y <= 9) return 'L';
    if (y === 23) return 't';
    if ((x === 4 || x === 11) && y > 12 && y < 22 && y % 3 === 0) return 't'; // fabric folds
    return 'T';
  }).join(''),
);
const TORSO_BACK = TORSO.map((r, y) => (y < 2 ? r.replace(/S/g, 'T') : r));
const TORSO_SIDE = Array.from({ length: 24 }, (_, y) => (y >= 8 && y <= 9 ? 'LLLLLLLL' : y === 23 ? 'tttttttt' : 'TTTTTTTT'));

// arm 8×24: sleeve, then skin, then a slightly darker hand
const ARM = Array.from({ length: 24 }, (_, y) => (y < 8 ? (y === 7 ? 'tttttttt' : 'TTTTTTTT') : y < 21 ? 'SSSSSSSS' : 'ssssssss'));

// leg 8×24: jeans with a seam, sneakers
const LEG = Array.from({ length: 24 }, (_, y) => {
  if (y >= 22) return 'kkkkkkkk';
  if (y >= 19) return 'KKKKKKKK';
  return Array.from({ length: 8 }, (_, x) => (x === 3 && y % 2 ? 'j' : y === 0 ? 'j' : 'J')).join('');
});

function tex(rows: string[], flip = false) {
  const w = rows[0].length;
  const h = rows.length;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const col = PAL[ch];
      if (!col) return;
      g.fillStyle = col;
      g.fillRect(flip ? w - 1 - x : x, y, 1, 1);
    }),
  );
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const mat = (t: THREE.Texture) => new THREE.MeshLambertMaterial({ map: t });

let cached: ReturnType<typeof build> | null = null;
function build() {
  const skinShade = new THREE.MeshLambertMaterial({ color: PAL.s });
  const hair = mat(tex(TOP));
  const tee = mat(tex(TORSO_SIDE.map((r) => r.replace(/L/g, 'T'))));
  // BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back)
  // +x is the avatar's left side: seen from outside, the face is on the LEFT → no flip
  return {
    head: [mat(tex(SIDE)), mat(tex(SIDE, true)), hair, skinShade, mat(tex(FACE)), mat(tex(BACK))],
    torso: [mat(tex(TORSO_SIDE)), mat(tex(TORSO_SIDE)), tee, tee, mat(tex(TORSO)), mat(tex(TORSO_BACK))],
    arm: (() => {
      const side = mat(tex(ARM));
      return [side, side, tee, skinShade, side, side];
    })(),
    leg: (() => {
      const side = mat(tex(LEG));
      const sole = new THREE.MeshLambertMaterial({ color: PAL.k });
      const top = new THREE.MeshLambertMaterial({ color: PAL.J });
      return [side, side, top, sole, side, side];
    })(),
    lid: new THREE.MeshLambertMaterial({ color: PAL.S }),
  };
}

/** Materials for each body part (created once, shared). */
export const avatarMaterials = () => (cached ??= build());

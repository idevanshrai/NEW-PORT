/**
 * Hand-drawn pixel icons. Each icon is a grid of characters; each character
 * maps to a colour in its palette ('.' = transparent).
 */
type Icon = { rows: string[]; pal: Record<string, string> };

export const ICONS: Record<string, Icon> = {
  face: {
    rows: ['..hhhhhh..', '.hhhhhhhh.', '.hssssssh.', '.sssssss s'.replace(' ', 's'), '.swkssw ks'.replace(' ', 's'), '.ssssssss.', '.sssmmsss.', '..ssssss..', '...cccc...', '..cccccc..'],
    pal: { h: '#1b1512', s: '#e7b995', w: '#f6f3ef', k: '#3a2616', m: '#b86f62', c: '#c8ff2e' },
  },
  chip: {
    rows: ['.p.p..p.p.', 'pggggggggp', '.gddddddg.', 'pgdllllgdp'.replace('gdp', 'ddp'), '.gdlkkldg.', '.gdlkkldg.', 'pgdllllddp', '.gddddddg.', 'pggggggggp', '.p.p..p.p.'],
    pal: { p: '#c9c9c9', g: '#2f7a3a', d: '#1d4d25', l: '#c8ff2e', k: '#0d0d0b' },
  },
  chest: {
    rows: ['..........', '.bbbbbbbb.', 'bwwwwwwwwb', 'bwwwwwwwwb', 'bbbbggbbbb', 'bwwwgywwwb', 'bwwwwwwwwb', 'bwwwwwwwwb', 'bbbbbbbbbb', '..........'],
    pal: { b: '#4a3219', w: '#a2743f', g: '#8f8f8f', y: '#ffd24a' },
  },
  compass: {
    rows: ['...gggg...', '..gwwwwg..', '.gwwrwwwg.', 'gwwwrrwwwg', 'gwwwrkwwwg', 'gwwwkbwwwg', 'gwwwbbwwwg', '.gwwwbwwg.', '..gwwwwg..', '...gggg...'],
    pal: { g: '#8f8f8f', w: '#e9e2cf', r: '#d23a3a', b: '#3a5ad2', k: '#2a2a2a' },
  },
  trophy: {
    rows: ['..........', 'yyyyyyyyyy', 'y.yyyyyy.y', 'y.yyyoyy.y', '.yyyyyyyy.', '..yyyyyy..', '....yy....', '....yy....', '..oooooo..', '..........'],
    pal: { y: '#ffcf3a', o: '#b8860b' },
  },
  scroll: {
    rows: ['..........', '.bpppppppb', '.bpkkkkpp.', '..pppppp..', '..pkkkkp..', '..pppppp..', '..pkkkpp..', '.bpppppppb', '..........', '..........'],
    pal: { b: '#a47a47', p: '#f1e6c8', k: '#8a7a5a' },
  },
  clock: {
    rows: ['...yyyy...', '..ywwwwy..', '.ywwkwwwy.', 'ywwwkwwwwy', 'ywwwkkkwwy', 'ywwwwwwwwy', 'ywwwwwwwwy', '.ywwwwwwy.', '..ywwwwy..', '...yyyy...'],
    pal: { y: '#ffcf3a', w: '#fbf6e6', k: '#2a2a2a' },
  },
  mail: {
    rows: ['..........', 'wwwwwwwwww', 'wkwwwwwwkw', 'wwkwwwwkww', 'wwwkwwkwww', 'wwwwkkwwww', 'wwwwwwwwww', 'wwwwwwwwww', 'wwwwwwwwww', '..........'],
    pal: { w: '#f2f2f2', k: '#9aa0a8' },
  },
  gear: {
    rows: ['....gg....', '.g.gggg.g.', '..gggggg..', '.ggg..ggg.', 'gggg..gggg', 'gggg..gggg', '.ggg..ggg.', '..gggggg..', '.g.gggg.g.', '....gg....'],
    pal: { g: '#b9bec7' },
  },
  heart: {
    rows: ['.rr..rr.', 'rwrrrrrr', 'rrrrrrrr', 'rrrrrrrr', '.rrrrrr.', '..rrrr..', '...rr...', '........'],
    pal: { r: '#e0323a', w: '#ffb4b8' },
  },
  // item icons for the projects chest
  window: {
    rows: ['bbbbbbbbbb', 'brybwwwwwb', 'bbbbbbbbbb', 'bwwwwwwwwb', 'bwllwwwwwb', 'bwwwwwwwwb', 'bwllllwwwb', 'bwwwwwwwwb', 'bbbbbbbbbb', '..........'],
    pal: { b: '#3b3f47', r: '#ff5f57', y: '#febc2e', w: '#e8ecf2', l: '#8fb4ff' },
  },
  plug: {
    rows: ['..g....g..', '..g....g..', '.gggggggg.', '.gllllllg.', '.gllllllg.', '..gllllg..', '...gggg...', '....kk....', '....kk....', '....kk....'],
    pal: { g: '#9aa0a8', l: '#c8ff2e', k: '#2a2a2a' },
  },
  wave: {
    rows: ['..........', '....l.....', '..l.l.l...', 'l.l.l.l.l.', 'lllllllll.', 'l.l.l.l.l.', '..l.l.l...', '....l.....', '..........', '..........'],
    pal: { l: '#39e1ff' },
  },
  brain: {
    rows: ['..pppppp..', '.pkpppppp.', 'pppppkppp.', 'pkppppppkp', 'ppppkppppp', 'pppppppkpp', '.pkppppp p'.replace(' ', 'p'), '..pppppp..', '....pp....', '....pp....'],
    pal: { p: '#f4a4c0', k: '#c86a92' },
  },
  globe: {
    rows: ['...bbbb...', '..bggbbb..', '.bgggbbbb.', 'bbggbbbggb', 'bbbgbbgggb', 'bbbbbbggbb', 'bgbbbbbgbb', '.bggbbbbb.', '..bbbbgb..', '...bbbb...'],
    pal: { b: '#3a7bd5', g: '#4caf50' },
  },
  robot: {
    rows: ['....a.....', '..gggggg..', '..gllgllg.'.replace('g.', 'g.'), '..gggggg..', '..gkkkkg..', '..gggggg..', '.gggggggg.', 'g.gggggg.g', '..gg..gg..', '..gg..gg..'],
    pal: { a: '#c8ff2e', g: '#b9bec7', l: '#39e1ff', k: '#2a2a2a' },
  },
  eye: {
    rows: ['..........', '...kkkk...', '.kkwwwwkk.', 'kwwwbbwwwk', 'kwwbkkbwwk', 'kwwbkkbwwk', 'kwwwbbwwwk', '.kkwwwwkk.', '...kkkk...', '..........'],
    pal: { k: '#2a2a2a', w: '#f2f2f2', b: '#3a7bd5' },
  },
  plane: {
    rows: ['....w.....', '....w.....', '...www....', '..wwwww...', 'wwwwwwwww.', '....w.....', '....w.....', '...www....', '..........', '..........'],
    pal: { w: '#e8ecf2' },
  },
};


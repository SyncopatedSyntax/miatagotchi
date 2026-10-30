/* Miatagotchi mock: LCD icons, emotes, props and backgrounds. */
(function (G) {
  'use strict';

  const ICONS = {
    fuel: ['.#####...', '.#...#.#.', '.#...#..#', '.#####..#', '.#####.##', '.#####.#.', '.#####.#.', '.#####...', '#######..'],
    drive: ['..#####..', '.#.....#.', '#.......#', '#.......#', '####.####', '#..###..#', '#...#...#', '.#..#..#.', '..#####..'],
    garage: ['....#....', '...###...', '..#####..', '.#######.', '#########', '.#.....#.', '.#######.', '.#.....#.', '.#######.'],
    fix: ['.....#.#.', '.....#.#.', '.....###.', '....###..', '...###...', '..###....', '.###.....', '###......', '##.......'],
    wash: ['....#....', '....#....', '...###...', '..#####..', '.###.###.', '.##.####.', '.#######.', '..#####..', '...###...'],
    gauge: ['.........', '..#####..', '.#.....#.', '#.....#.#', '#....#..#', '#...#...#', '#..###..#', '#########', '.........'],
    mods: ['...#.#...', '.#######.', '.##...##.', '##.....##', '.#..#..#.', '##.....##', '.##...##.', '.#######.', '...#.#...'],
    cel: ['.........', '..###....', '...#.....', '.#####.#.', '##....###', '#......#.', '##....##.', '.######..', '.........'],
  };
  // color accents per icon (color mode only)
  const ICON_TINT = { fuel: '%', drive: '#', garage: '&', fix: '=', wash: '&', gauge: '#', mods: '=', cel: '@' };
  const ICON_ORDER = ['fuel', 'drive', 'garage', 'fix', 'wash', 'gauge', 'mods', 'cel'];
  const ICON_LABEL = { fuel: 'FUEL', drive: 'DRIVE', garage: 'GARAGE', fix: 'FIX', wash: 'WASH', gauge: 'GAUGES', mods: 'MODS', cel: 'CHECK ENGINE' };

  const EMOTE = {
    heart: ['.XX.XX.', 'XxXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    note: ['..JJJ', '..J.J', '..J..', 'JJJ..', 'JJJ..'],
    note2: ['.jjjj', '.j..j', '.j..j', 'jj.jj', 'jj.jj'],
    sweat: ['..j..', '.jwj.', 'jjwjj', 'jjjjj', '.jjj.'],
    spark: ['...J...', '...J...', '..JJJ..', 'JJJ4JJJ', '..JJJ..', '...J...', '...J...'],
    tiny: ['.J.', 'J4J', '.J.'],
    angry: ['X.X.X', '.XXX.', 'XX.XX', '.XXX.', 'X.X.X'],
    smoke: ['.qqqq.', 'qQQQQq', 'qQQQQq', '.qqqq.'],
    puff: ['.qq.', 'qQQq', '.qq.'],
    drop: ['.j.', 'jwj', 'jjj'],
    oil: ['..ZZZ..', 'ZZZzZZZ', '.ZZZZZ.'],
    bubble: ['.qq.', 'q..q', 'q..q', '.qq.'],
    wrench: ['..#.#', '..###', '.##..', '##...', '#....'],
  };

  const PROPS = {
    pump: [
      '.KKKKKKK..', '.K~~~~~K..', '.K~KKK~K.K', '.K~KPK~K.K', '.K~KKK~K.K', '.K~~~~~KK.',
      '.K%%%%%K..', '.K%%%%%K..', '.K%PPP%K..', '.K%%%%%K..', '.K%%%%%K..', '.K%%%%%K..', 'KKKKKKKKK.',
    ],
    trophy: ['K333K', 'K343K', '.K3K.', '..3..', '.mmm.', 'KKKKK'],
    cone: ['..K..', '.KAK.', '.KPK.', 'KAAAK', 'KKKKK'],
  };

  // ---- backgrounds for the 96 x 64 play area (oy = top of play area) ----
  function background(b, mode, oy, t, night) {
    if (mode === 'lcd') {
      if (night) {
        for (let y = oy; y < oy + 64; y++) for (let x = 0; x < 96; x++) if ((x * 7 + y * 13) % 53 === 0) b.set(x, y, 'K');
        b.sprite(['.KK.', 'K...', 'K...', '.KK.'], 82, oy + 4);
      } else {
        b.sprite(['.K.K.', '..K..', 'KKOKK', '..K..', '.K.K.'], 84, oy + 3);
      }
      for (let x = 0; x < 96; x++) b.set(x, oy + 57, 'K');
      const o = (Math.floor(t / 2) * 2) % 12;
      for (let x = -o + 12; x < 96; x += 12) { b.set(x, oy + 60, 'K'); b.set(x + 1, oy + 60, 'K'); }
      return;
    }
    // color: sky, sun or moon, hills, verge, road
    for (let y = oy; y < oy + 64; y++) for (let x = 0; x < 96; x++) {
      const yy = y - oy;
      let k = night ? (yy < 20 ? 'I' : 'M') : (yy < 22 ? 'B' : 'b');
      b.set(x, y, k);
    }
    if (night) {
      [[8, 5], [23, 11], [40, 3], [61, 9], [74, 15], [90, 6], [52, 18], [15, 20]].forEach(([x, y], i) => b.set(x, oy + y, (t >> 3) % 3 === i % 3 ? 'u' : 'U'));
      b.sprite(['.UU.', 'UU..', 'UU..', '.UU.'], 80, oy + 5);
    } else {
      b.sprite(['..OOO..', '.OOOOO.', 'OOOOOOO', 'OOOOOOO', 'OOOOOOO', '.OOOOO.', '..OOO..'], 80, oy + 4);
      const cx = (Math.floor(t / 6) % 130) - 30;
      b.sprite(['...UUU....', '.UUUUUUU..', 'UUUUUuUUUU', '.uuuuuuuu.'], cx, oy + 9);
      b.sprite(['..UUU..', 'UUUUUUU', '.uuuuu.'], ((cx + 60) % 130) - 10, oy + 17);
    }
    for (let x = 0; x < 96; x++) {
      const h = 6 + Math.round(3 * Math.sin(x / 9) + 2 * Math.sin(x / 4 + 1));
      for (let y = oy + 46 - h; y < oy + 47; y++) b.set(x, y, night ? 'M' : ((x + y) % 7 === 0 ? 'f' : 'F'));
    }
    for (let y = oy + 47; y < oy + 52; y++) for (let x = 0; x < 96; x++) b.set(x, y, night ? 'I' : ((x * 3 + y) % 9 === 0 ? 'e' : 'E'));
    for (let y = oy + 52; y < oy + 64; y++) for (let x = 0; x < 96; x++) b.set(x, y, night ? 'M' : ((x + y * 3) % 13 === 0 ? 'n' : 'N'));
    const off = (Math.floor(t / 2) * 2) % 16;
    for (let x = -off; x < 96; x += 16) b.hline(x, x + 7, oy + 60, night ? '=' : 'Y');
  }

  // ---- coast road at sunset, for the 128 x 88 play area ----
  function coast(b, oy, t, night) {
    const W = 128;
    for (let y = 0; y < 34; y++) for (let x = 0; x < W; x++) {
      let k;
      if (night) k = y < 18 ? 'I' : ((y < 22 && (x + y) % 2) ? 'I' : 'M');
      else if (y < 11) k = '(';
      else if (y < 15) k = (x + y) % 2 ? '(' : ')';
      else if (y < 23) k = ')';
      else if (y < 26) k = (x + y) % 2 ? ')' : '[';
      else k = '[';
      b.set(x, oy + y, k);
    }
    if (night) {
      [[9, 4], [27, 10], [44, 3], [66, 8], [83, 14], [101, 5], [118, 11], [56, 17], [14, 19]].forEach(([x, y], i) => b.set(x, oy + y, (t >> 3) % 3 === i % 3 ? 'u' : 'U'));
      b.sprite(['.UUU.', 'UU...', 'UU...', 'UU...', '.UUU.'], 96, oy + 6);
    } else {
      for (let y = -9; y <= 0; y++) for (let x = -9; x <= 9; x++) if (x * x + y * y <= 81 && !(y > -5 && (y + 9) % 3 === 0)) b.set(94 + x, oy + 33 + y, ']');
      const cx = (Math.floor(t / 8) % 170) - 30;
      b.sprite(['...UUUU.....', '.UUUUUUUUU..', 'UUUUUUuUUUUU', '.uuuuuuuuuu.'], cx, oy + 6);
      b.sprite(['..UUU...', 'UUUUUUU.', '.uuuuuu.'], ((cx + 85) % 170) - 20, oy + 15);
    }
    for (let y = 34; y < 44; y++) for (let x = 0; x < W; x++) b.set(x, oy + y, night ? 'M' : '{');
    for (let i = 0; i < 9; i++) { const y = 35 + (i * 7) % 8, x = (i * 37 + (t >> 1) * (i % 2 ? 1 : -1)) % 140 - 6; b.hline(x, x + 3 + i % 3, oy + y, night ? '=' : '}'); }
    for (let y = 44; y < 48; y++) for (let x = 0; x < W; x++) b.set(x, oy + y, night ? 'I' : ((x * 7 + y * 3) % 11 === 0 ? 'y' : '_'));
    for (let y = 48; y < 88; y++) for (let x = 0; x < W; x++) b.set(x, oy + y, night ? 'M' : ((x * 5 + y * 3) % 17 === 0 ? 'n' : 'N'));
    b.hline(0, W - 1, oy + 49, night ? '=' : 'P');
    const off = (Math.floor(t / 2) * 3) % 20;
    for (let x = -off; x < W; x += 20) b.hline(x, x + 9, oy + 86, night ? '=' : 'Y');
    // palm tree
    const trunk = night ? 'K' : ':', leaf = night ? 'K' : ';', dark = night ? 'K' : '|';
    for (let y = 22; y < 50; y++) { const x = 118 - Math.round(Math.pow((y - 22) / 28, 2) * -3 + (y - 22) * 0.18); b.set(x, oy + y, trunk); b.set(x + 1, oy + y, trunk); if (y % 3 === 0) b.set(x, oy + y, dark); }
    const sway = (t >> 3) % 2;
    [[-1, 0], [1, 0], [-1, 1], [1, 1], [0, -1]].forEach(([dx, dy2], i) => {
      for (let s = 1; s <= 9; s++) {
        const x = 118 + dx * s + (dy2 < 0 ? (s % 2) : 0), y = oy + 22 + Math.round(dy2 * s * 0.7 + (s * s) / 14) - (dy2 < 0 ? s : 0) + (i < 2 ? sway : 0);
        b.set(x, y, s % 3 === 0 ? dark : leaf); b.set(x, y + 1, dark);
      }
    });
  }

  G.UI = { ICONS, ICON_TINT, ICON_ORDER, ICON_LABEL, EMOTE, PROPS, background, coast };
})(window);

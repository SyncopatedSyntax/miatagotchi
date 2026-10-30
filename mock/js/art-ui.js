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

  G.UI = { ICONS, ICON_TINT, ICON_ORDER, ICON_LABEL, EMOTE, PROPS, background };
})(window);

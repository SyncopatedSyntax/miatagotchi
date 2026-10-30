/* Miatagotchi mock: NA Miata side-view art, built pixel by pixel.
   Facing right. Body grid 64x24; wheels are separate sprites centered on cy=18. */
(function (G) {
  'use strict';
  const W = 64, H = 24;
  const REAR_CX = 16, FRONT_CX = 50, CY = 18;

  function grid() { const g = []; for (let y = 0; y < H; y++) g.push(new Array(W).fill('.')); return g; }
  function put(g, x, y, k) { if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = k; }
  function hl(g, x0, x1, y, k) { for (let x = x0; x <= x1; x++) put(g, x, y, k); }
  function rows(g) { return g.map(r => r.join('')); }

  // wheel-well (arch) span for a given row, relative to wheel center
  const WELL = { 12: 2, 13: 4, 14: 5, 15: 6, 16: 6, 17: 6, 18: 6 };
  function inWell(x, y) {
    const r = WELL[y];
    if (r === undefined) return false;
    return Math.abs(x - REAR_CX) <= r || Math.abs(x - FRONT_CX) <= r;
  }

  // top & bottom outline rows per column
  function topY(x) {
    if (x === 0) return 11;
    if (x === 1) return 10;
    if (x <= 49) return 9;
    if (x <= 55) return 10;
    if (x <= 58) return 11;
    if (x <= 60) return 12;
    if (x === 61) return 13;
    if (x === 62) return 14;
    return 15; // x = 63
  }
  function botY(x) {
    if (x === 0) return 16;
    if (x === 1) return 17;
    if (x <= 9) return 18;
    if (x <= 43) return 19;
    if (x <= 62) return 18;
    return 17;
  }

  // opts: { lights: 'up'|'down', top: 'down'|'soft'|'hard', rust: bool }
  function body(opts) {
    opts = opts || {};
    const g = grid();
    // paint fill + outline
    for (let x = 0; x < W; x++) {
      const t = topY(x), b = botY(x);
      for (let y = t; y <= b; y++) {
        let k;
        if (y === t || y === b) k = 'K';
        else if (y === t + 1 && x > 2 && x < 50) k = 'W';
        else if (y >= 16) k = 'r';
        else k = 'R';
        put(g, x, y, k);
      }
    }
    put(g, 63, 16, 'K'); put(g, 63, 17, 'K');
    // nose curve softening
    put(g, 62, 15, 'R'); put(g, 62, 16, 'R'); put(g, 62, 17, 'r');
    // wheel wells (cut the arches)
    for (let y = 12; y <= 18; y++) for (let x = 0; x < W; x++) if (inWell(x, y)) put(g, x, y, 'D');
    // clear below arches (open to the ground)
    for (let x = 0; x < W; x++) for (let y = 19; y < H; y++) if (inWell(x, 18)) put(g, x, y, '.');
    // arch lips: darken paint directly bordering the wells
    for (let y = 11; y <= 18; y++) for (let x = 1; x < W - 1; x++) {
      if (g[y][x] === 'D') continue;
      const near = (g[y][x - 1] === 'D' || g[y][x + 1] === 'D' || (y + 1 < H && g[y + 1][x] === 'D'));
      if (near && 'RrW'.includes(g[y][x])) put(g, x, y, 'k');
    }
    // door seams + handle
    for (let y = 10; y <= 18; y++) { put(g, 26, y, 'k'); put(g, 42, y, 'k'); }
    put(g, 28, 11, 'k'); put(g, 29, 11, 'k');
    // tail light + side markers
    put(g, 1, 11, 'L'); put(g, 1, 12, 'L');
    put(g, 2, 15, '9'); put(g, 3, 15, '9');
    put(g, 60, 15, 'A'); put(g, 61, 15, 'A');
    // front lower lip (black)
    hl(g, 57, 61, 18, 'M');

    const top = opts.top || 'down';
    if (top === 'down') {
      // folded top boot behind seats
      hl(g, 21, 24, 7, 'K');
      put(g, 20, 8, 'K'); hl(g, 21, 24, 8, opts.topColor === 'tan' ? 'a' : 'I'); put(g, 25, 8, 'K');
      // headrest
      hl(g, 29, 31, 5, 'K');
      put(g, 28, 6, 'K'); put(g, 29, 6, 'i'); put(g, 30, 6, 'I'); put(g, 31, 6, 'I'); put(g, 32, 6, 'K');
      for (let y = 7; y <= 8; y++) { put(g, 28, y, 'K'); hl(g, 29, 31, y, 'I'); put(g, 32, y, 'K'); }
      // steering wheel rim peeking over the door
      put(g, 36, 8, opts.wood ? '2' : 'M'); put(g, 37, 8, opts.wood ? '2' : 'M');
    } else {
      const tan = opts.topColor === 'tan';
      const fab = top === 'hard' ? 'R' : (tan ? 'a' : 'I'), fabHi = top === 'hard' ? 'W' : (tan ? 'p' : 'i');
      // roof line and rear slope
      hl(g, 27, 36, 3, 'K');
      const slope = [[26, 4], [25, 5], [24, 6], [23, 7], [22, 8]];
      slope.forEach(([x, y]) => put(g, x, y, 'K'));
      for (let y = 4; y <= 8; y++) {
        const x0 = slope[y - 4][0] + 1;
        for (let x = x0; x <= 30; x++) put(g, x, y, y === 4 ? fabHi : fab);
      }
      // side glass ahead of the B-line
      for (let y = 4; y <= 8; y++) for (let x = 31; x <= 33 + Math.floor((y - 3) * 0.7); x++) put(g, x, y, (x + y) % 5 === 0 ? 'g' : 'G');
      for (let y = 4; y <= 8; y++) put(g, 30, y, 'K');
      if (top === 'hard') { put(g, 24, 5, 'G'); put(g, 25, 4, 'G'); put(g, 24, 6, 'g'); }
    }

    // windshield (frame + glass), leaning back about 2:1
    hl(g, 35, 38, 3, 'K');
    const ws = [[35, 4], [36, 5], [36, 6], [37, 7], [37, 8]];
    ws.forEach(([x, y]) => { put(g, x, y, 'K'); put(g, x + 1, y, y === 5 ? 'g' : 'G'); put(g, x + 2, y, 'G'); put(g, x + 3, y, 'K'); });
    // mirror
    put(g, 41, 7, 'M'); put(g, 41, 8, 'M');

    // pop-up headlights
    if (opts.lights === 'up') {
      hl(g, 55, 58, 7, 'K');
      put(g, 54, 8, 'K'); put(g, 55, 8, 'W'); put(g, 56, 8, 'R'); put(g, 57, 8, 'R'); put(g, 58, 8, 'H'); put(g, 59, 8, 'K');
      put(g, 54, 9, 'K'); put(g, 55, 9, 'r'); put(g, 56, 9, 'r'); put(g, 57, 9, 'r'); put(g, 58, 9, 'H'); put(g, 59, 9, 'K');
      put(g, 56, 10, 'r'); put(g, 57, 10, 'r'); put(g, 58, 10, 'r'); put(g, 59, 10, 'K');
      put(g, 59, 11, 'K');
    } else {
      put(g, 54, 11, 'k'); // closed headlight seam
    }

    if (opts.rust) {
      [[7, 16], [8, 17], [9, 17], [8, 16], [23, 17], [24, 18], [35, 17], [36, 18], [37, 17], [59, 16], [60, 17], [3, 13]]
        .forEach(([x, y], i) => put(g, x, y, i % 2 ? 'v' : 'V'));
    }
    return rows(g);
  }

  // ---------- wheels (11x11 unless noted) ----------
  const WHEELS = {
    daisy: [[
      '...TTTTT...', '..TttTTTT..', '.TTTSSSTTT.', 'TTTSsSsSTTT', 'TTSSSSSSSTT', 'TTSsSKSsSTT',
      'TTSSSSSSSTT', 'TTTSsSsSTTT', '.TTTSSSTTT.', '..TTTTTTT..', '...TTTTT...',
    ], [
      '...TTTTT...', '..TttTTTT..', '.TTTSsSTTT.', 'TTTSSSSSTTT', 'TTSsSSSsSTT', 'TTSSSKSSSTT',
      'TTSsSSSsSTT', 'TTTSSSSSTTT', '.TTTSsSTTT.', '..TTTTTTT..', '...TTTTT...',
    ]],
    steel: [[
      '...TTTTT...', '..TttTTTT..', '.TTTcccTTT.', 'TTTcSSScTTT', 'TTcSSsSScTT', 'TTcSsKsScTT',
      'TTcSSsSScTT', 'TTTcSSScTTT', '.TTTcccTTT.', '..TTTTTTT..', '...TTTTT...',
    ]],
    race: [[
      '...TTTTT...', '..TttTTTT..', '.TTTdddTTT.', 'TTTdKdKdTTT', 'TTdKdldKdTT', 'TTddlKlddTT',
      'TTdKdldKdTT', 'TTTdKdKdTTT', '.TTTdddTTT.', '..TTTTTTT..', '...TTTTT...',
    ], [
      '...TTTTT...', '..TttTTTT..', '.TTTdKdTTT.', 'TTTddddKTTT', 'TTKdKldddTT', 'TTddlKlddTT',
      'TTdddldKdTT', 'TTTKddddTTT', '.TTTdKdTTT.', '..TTTTTTT..', '...TTTTT...',
    ]],
    dish: [[
      '...TTTTT...', '..TCCCCCT..', '.TC=====CT.', 'TC==K=K==CT', 'TC=K=S=K=CT', 'TC==SSS==CT',
      'TC=K=S=K=CT', 'TC==K=K==CT', '.TC=====CT.', '..TCCCCCT..', '...TTTTT...',
    ]],
    // 13x13 knobby all-terrain
    knobby: [[
      '...T.TTT.T...', '..TTTTTTTTT..', '.TTTttTTTTTT.', 'TTTTTSSSTTTTT', '.TTTSsSsSTTT.', 'TTTSSSSSSSTTT',
      'TTTSsSKSsSTTT', 'TTTSSSSSSSTTT', '.TTTSsSsSTTT.', 'TTTTTSSSTTTTT', '.TTTTTTTTTTT.', '..TTTTTTTTT..',
      '...T.TTT.T...',
    ], [
      '....TTTTT....', '.TTTTTTTTTTT.', 'TTTTttTTTTTTT', '.TTTTSSSTTTT.', 'TTTTSSsSSTTTT', '.TTSsSSSsSTT.',
      'TTTSSSKSSSTTT', '.TTSsSSSsSTT.', 'TTTTSSsSSTTTT', '.TTTTSSSTTTT.', 'TTTTTTTTTTTTT', '.TTTTTTTTTTT.',
      '....TTTTT....',
    ]],
  };

  WHEELS.mesh = WHEELS.race.map(f => f.map(r => r.replace(/d/g, 'S').replace(/l/g, 'C').replace(/K/g, 's')));

  G.CAR = { W, H, REAR_CX, FRONT_CX, CY, body, WHEELS };
})(window);

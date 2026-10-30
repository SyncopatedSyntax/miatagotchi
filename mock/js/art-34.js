/* Miatagotchi mock: the cute 3/4 front view (nose to the left).
   Built from simple shapes on an 84x44 grid, then outlined; eyes and mouth are hand-placed. */
(function (G) {
  'use strict';
  const W = 84, H = 44;

  function grid() { const g = []; for (let y = 0; y < H; y++) g.push(new Array(W).fill('.')); return g; }
  function put(g, x, y, k) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < W && y < H) g[y][x] = k; }
  function get(g, x, y) { return (x >= 0 && y >= 0 && x < W && y < H) ? g[y][x] : '.'; }
  function poly(g, pts, k, only) {
    const ys = pts.map(p => p[1]);
    for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
        if ((y1 <= yc && y2 > yc) || (y2 <= yc && y1 > yc)) xs.push(x1 + (yc - y1) * (x2 - x1) / (y2 - y1));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2)
        for (let x = Math.ceil(xs[i] - 0.5); x <= Math.floor(xs[i + 1] - 0.5); x++)
          if (!only || only(get(g, x, y))) put(g, x, y, k);
    }
  }
  function ellipse(g, cx, cy, rx, ry, k, only) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1 && (!only || only(get(g, x, y)))) put(g, x, y, k);
      }
  }
  function line(g, x0, y0, x1, y1, k, only) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
    for (let i = 0; i <= n; i++) {
      const x = Math.round(x0 + (x1 - x0) * i / n), y = Math.round(y0 + (y1 - y0) * i / n);
      if (!only || only(get(g, x, y))) put(g, x, y, k);
    }
  }
  const PAINT = k => 'RrWk'.includes(k);
  const isEmpty = k => k === '.';

  // ---- wheels: tire on the left, rim face on the right (we see the outer face) ----
  function wheel(g, cx, cy, rx, ry, type) {
    ellipse(g, cx, cy, rx, ry, 'T');
    ellipse(g, cx - rx * 0.45, cy - ry * 0.35, rx * 0.25, ry * 0.25, 't');
    const rcx = cx + rx * 0.22, rrx = rx * 0.6, rry = ry * 0.72;
    if (type === 'steel') {
      ellipse(g, rcx, cy, rrx, rry, 'c');
      ellipse(g, rcx, cy, rrx * 0.75, rry * 0.75, 'S');
      ellipse(g, rcx, cy, rrx * 0.25, rry * 0.2, 's');
      return;
    }
    if (type === 'dish') {
      ellipse(g, rcx, cy, rrx + 0.6, rry + 0.6, 'C');
      ellipse(g, rcx + 0.3, cy, rrx * 0.72, rry * 0.75, '=');
      for (let a = 0; a < 6; a++) { const t = a / 6 * Math.PI * 2; put(g, rcx + 0.3 + Math.cos(t) * rrx * 0.45, cy + Math.sin(t) * rry * 0.5, 'K'); }
      ellipse(g, rcx + 0.3, cy, 0.8, 1, 'S');
      return;
    }
    const race = type === 'race', mesh = type === 'mesh';
    const lip = race ? 'd' : 'S', dark = race ? 'K' : 's', spoke = race ? 'l' : mesh ? 'C' : 'S';
    ellipse(g, rcx, cy, rrx, rry, lip);
    ellipse(g, rcx, cy, rrx * 0.7, rry * 0.78, dark);
    const spokes = race || mesh ? 8 : 5;
    for (let a = 0; a < spokes; a++) {
      const t = (a + 0.25) / spokes * Math.PI * 2;
      line(g, rcx, cy, rcx + Math.cos(t) * rrx * 0.75, cy + Math.sin(t) * rry * 0.8, spoke);
    }
    ellipse(g, rcx, cy, 0.9, 1.1, type === 'race' ? 'd' : 'C');
  }

  function knobby(g, cx, cy, rx, ry) {
    ellipse(g, cx, cy, rx, ry, 'T');
    for (let a = 0; a < 18; a++) { const t = a / 18 * Math.PI * 2; if (Math.cos(t) < 0.35) put(g, cx + Math.cos(t) * (rx + 0.6), cy + Math.sin(t) * (ry + 0.6), a % 2 ? 'T' : 't'); }
    const rcx = cx + rx * 0.25;
    ellipse(g, rcx, cy, rx * 0.5, ry * 0.55, 'S'); ellipse(g, rcx, cy, rx * 0.32, ry * 0.36, 's'); ellipse(g, rcx, cy, 0.9, 1.1, 'C');
  }

  // ---- eyes (pop-up headlights) ----
  // pod: x,y = top-left of the dark front bezel; w,h bezel size
  function pod(g, x, y, w, h, state) {
    if (state === 'down') {
      // flush cover with a sleepy seam
      for (let i = 1; i < w - 1; i++) put(g, x + i, y + h - 2 + (i === 1 || i === w - 2 ? -1 : 0), 'k');
      return;
    }
    const lift = state === 'half' ? Math.ceil(h / 2) : 0;
    const top = y + lift;
    // top face and near-side face in paint
    for (let i = 0; i < w; i++) { put(g, x + i + 1, top - 2, 'K'); put(g, x + i + 1, top - 1, i < 2 ? 'R' : 'W'); }
    for (let j = top - 1; j < y + h; j++) { put(g, x + w, j, 'r'); put(g, x + w + 1, j, 'K'); }
    put(g, x, top - 1, 'K');
    // bezel
    for (let j = top; j < y + h; j++) for (let i = 0; i < w; i++) put(g, x + i, j, (i === 0 || j === y + h - 1) ? 'K' : 'M');
    const cx = x + w / 2 - 0.5, cy = y + h / 2;
    if (state === 'half') { for (let i = 1; i < w - 1; i++) put(g, x + i, top, 'K'); }
    const lens = (k, rr) => ellipse(g, cx, cy, rr, rr, k, (q) => q === 'M' || q === 'c' || q === 'C' || q === 'D');
    lens('c', 3.7); lens('D', 2.9);
    if (state === 'up' || state === 'half') { put(g, cx - 1, cy - 1, 'U'); put(g, cx - 2, cy - 1, 'U'); put(g, cx - 1, cy - 2, 'U'); put(g, cx + 1, cy + 1, 'w'); }
    if (state === 'happy') { ellipse(g, cx, cy, 2.9, 2.9, 'C', q => q === 'D'); put(g, cx - 2, cy + 1, 'K'); put(g, cx - 1, cy, 'K'); put(g, cx, cy - 1, 'K'); put(g, cx + 1, cy, 'K'); put(g, cx + 2, cy + 1, 'K'); }
    if (state === 'x') { ellipse(g, cx, cy, 2.9, 2.9, 'C', q => q === 'D'); for (let d = -2; d <= 2; d++) { put(g, cx + d, cy + d, 'K'); put(g, cx + d, cy - d, 'K'); } }
    if (state === 'half') for (let j = top; j < Math.round(cy) - 0; j++) for (let i = 1; i < w - 1; i++) if (get(g, x + i, j) !== 'K') put(g, x + i, j, 'M');
  }

  // spec: { eyes: 'up'|'down'|'blink'|'wink'|'happy'|'half'|'x', mouth: 'smile'|'open'|'flat', top: 'down'|'soft'|'hard',
  //         topColor, wheel, dy, rust, wood }
  function car(spec) {
    spec = spec || {};
    const g = grid();
    const dy = spec.dy || 0; // body offset vs wheels (+ = lower)
    const B = (pts) => pts.map(([x, y]) => [x, y + dy]);

    // ground shadow
    poly(g, [[3, 40.5], [50, 40.5], [79, 33], [82, 34.5], [56, 43.5], [5, 43.5]], '^');

    // far front tire peeking under the bumper
    ellipse(g, 9, 36.5, 5.5, 5.5, 'T');

    // cockpit: folded top boot / soft top, seats seen above the near side
    const top = spec.top || 'down', mods = spec.mods || [], has = m => mods.indexOf(m) >= 0;
    if (has('spare')) { ellipse(g, 75, 6.5 + dy, 3.4, 4.8, 'T'); ellipse(g, 75.8, 6.5 + dy, 1.8, 2.8, 'S'); ellipse(g, 75.8, 6.5 + dy, 0.8, 1, 's'); }
    if (top === 'down') {
      poly(g, B([[64, 11.4], [76, 10.8], [79.5, 12.3], [65, 13.5]]), spec.topColor === 'tan' ? 'a' : 'I');
      poly(g, B([[62.5, 9.5], [63.5, 8.6], [65.5, 8.6], [66.5, 9.5], [66.5, 13], [62.5, 13]]), 'I');
      put(g, 64, 9 + dy, 'i');
    }

    // body panels
    const hoodEdge = [[1.5, 21], [12, 22.3], [25, 23.1], [38, 23.7], [48, 23.7]];
    poly(g, B([[2.5, 19.6], [6, 18], [19.5, 13], [61.5, 13], ...hoodEdge.slice().reverse()]), 'R');      // hood
    poly(g, B([...hoodEdge, [49.3, 28], [49, 33], [47.5, 36.6], [45, 38.6], [30, 39], [15, 38.8], [8, 38.6],
      [4.5, 37.6], [2, 35.2], [0.5, 31.5], [0, 27], [0.5, 23.5]]), 'R');                                   // front face
    poly(g, B([[48, 23.7], [61.5, 13], [70, 12.6], [76, 12.2], [80, 12.6], [82.6, 14], [83.4, 17], [83.4, 27],
      [82, 30], [79, 31.8], [62, 36], [50, 38.6]]), 'r');                                                  // near side
    // rear deck lit band and shoulder highlight
    poly(g, B([[62, 13], [76, 12.2], [80, 12.6], [82.6, 14], [83.2, 16], [62, 16.5]]), 'R');
    line(g, 49, 23 + dy, 61, 14.5 + dy, 'W'); line(g, 62, 14.5 + dy, 81, 13.5 + dy, 'W');
    line(g, 50, 24 + dy, 61, 15.5 + dy, 'R');
    // hood highlights
    line(g, 13, 17 + dy, 22, 16 + dy, 'W'); line(g, 25, 15 + dy, 31, 15 + dy, 'W'); line(g, 5, 20 + dy, 9, 19.5 + dy, 'W');
    line(g, 44, 17 + dy, 53, 16 + dy, 'W');
    // bumper: lit top edge, darker chin
    line(g, 2, 22 + dy, 47, 24.4 + dy, 'k', PAINT);
    line(g, 2, 23 + dy, 47, 25.4 + dy, 'W', PAINT);
    poly(g, B([[0, 33], [48.5, 33], [45.5, 39], [6, 39], [0, 35]]), 'r', PAINT);
    // front corner crease between bumper face and near side
    line(g, 48, 24 + dy, 49, 33 + dy, 'k', PAINT);

    // wheel wells
    const fw = { cx: 53.5, cy: 33.5, rx: 6.2, ry: 8.4 }, rw = { cx: 76.5, cy: 27.5, rx: 3.9, ry: 6.3 };
    ellipse(g, fw.cx + 0.4, fw.cy - 0.6 + dy, fw.rx + 1.3, fw.ry + 1.2, 'D', PAINT);
    ellipse(g, rw.cx + 0.4, rw.cy - 0.6 + dy, rw.rx + 1.2, rw.ry + 1.1, 'D', PAINT);
    // door seams and handle
    line(g, 62, 16 + dy, 62, 33 + dy, 'k', PAINT); line(g, 71, 15 + dy, 71, 30 + dy, 'k', PAINT);
    put(g, 68, 19 + dy, 'k'); put(g, 69, 19 + dy, 'k');
    // side marker
    put(g, 51, 25 + dy, 'A'); put(g, 52, 25 + dy, 'A');

    // windshield: frame, glass, things seen through it
    poly(g, B([[30, 1], [59, 1], [62, 13.5], [19.5, 13.5]]), 'M');
    poly(g, B([[31.5, 3], [57.5, 3], [60, 12.2], [22.5, 12.2]]), 'G');
    const inGlass = k => k === 'G';
    line(g, 23, 12 + dy, 60, 12 + dy, 'I', inGlass);                                                        // dashboard
    [[27, 11], [28, 10], [29, 10], [30, 10], [31, 10], [32, 11], [33, 11]].forEach(([x, y]) => put(g, x, y + dy, spec.wood ? '2' : 'I')); // wheel rim
    poly(g, B([[38.5, 7.6], [39.5, 6.6], [42.5, 6.6], [43.5, 7.6], [43.5, 11.5], [38.5, 11.5]]), 'i', inGlass);   // far seat
    poly(g, B([[48.5, 7.6], [49.5, 6.6], [52.5, 6.6], [53.5, 7.6], [53.5, 11.5], [48.5, 11.5]]), 'i', inGlass);   // near seat
    put(g, 43, 3 + dy, 'M'); put(g, 44, 3 + dy, 'M'); put(g, 45, 3 + dy, 'M'); put(g, 44, 4 + dy, 'M'); // mirror
    line(g, 34, 12 + dy, 41, 3 + dy, 'w', k => k === 'G' || k === 'g'); line(g, 36, 12 + dy, 43, 3 + dy, 'w', k => k === 'G' || k === 'g');
    line(g, 55, 9 + dy, 57, 4 + dy, 'w', k => k === 'G' || k === 'g');
    if ((spec.mods || []).indexOf('banner') >= 0) poly(g, B([[31.5, 3], [57.5, 3], [58, 5], [30.6, 5]]), 'I', k => k === 'G' || k === 'g' || k === 'w' || k === 'i');
    // side mirrors
    poly(g, B([[15, 12], [19.5, 11.5], [20.5, 14.5], [16, 15]]), 'M');
    poly(g, B([[62, 10.5], [66.5, 10.5], [66.5, 13.5], [62.5, 14]]), 'M');

    if (top !== 'down') {
      const tan = spec.topColor === 'tan', hard = top === 'hard';
      const fab = hard ? 'R' : tan ? 'a' : 'I', hi = hard ? 'W' : tan ? 'p' : 'i';
      poly(g, B([[59, 0.5], [68, 1], [74.5, 3.6], [79.5, 9.5], [81.5, 13], [62, 13.5], [61.5, 1.5]]), fab);
      line(g, 60, 1 + dy, 68, 1.4 + dy, hi); line(g, 69, 2 + dy, 74, 4 + dy, hi);
      poly(g, B([[61, 2.6], [67.5, 2.6], [70.5, 12.4], [62.6, 12.6]]), 'G');
      line(g, 63, 11 + dy, 66, 4 + dy, 'w', k => k === 'G');
      if (hard) { line(g, 72, 4.5 + dy, 78, 11 + dy, 'k'); }
      poly(g, B([[30, 0], [59, 0], [59, 1.2], [30, 1.2]]), fab);
    }
    // turn signals
    poly(g, B([[1.5, 24], [6.5, 24], [6.5, 25.6], [1.5, 25.6]]), 'C');
    poly(g, B([[31, 25], [38.5, 25.3], [38.5, 27], [31, 26.8]]), 'C');

    // mouth (air intake)
    mouth(g, spec.mouth || 'smile', dy);

    // eyes
    const eyes = spec.eyes || 'up';
    const L = eyes === 'wink' || eyes === 'lazy' ? 'up' : eyes === 'blink' ? 'down' : eyes;
    const R = eyes === 'wink' || eyes === 'blink' ? 'down' : eyes === 'lazy' ? 'half' : eyes;
    pod(g, 0, 13 + dy, 10, 8, L);
    pod(g, 32, 14 + dy, 11, 9, R);

    if (spec.rust) [[3, 34], [4, 35], [44, 36], [45, 35], [57, 23], [79, 28], [80, 29], [66, 33], [12, 37]].forEach(([x, y], i) => { if (PAINT(get(g, x, y + dy))) put(g, x, y + dy, i % 2 ? 'v' : 'V'); });

    if (has('primerDoor')) for (let y = 14; y <= 34; y++) for (let x = 63; x <= 70; x++) {
      const k = get(g, x, y + dy); if (k === 'R' || k === 'W') put(g, x, y + dy, '~'); else if (k === 'r') put(g, x, y + dy, '=');
    }
    if (has('number')) {
      ellipse(g, 66.5, 23 + dy, 3.4, 4, 'K', PAINT); ellipse(g, 66.5, 23 + dy, 2.6, 3.2, 'P');
      ['###', '#..', '##.', '..#', '##.'].forEach((r, j) => [...r].forEach((c, i) => { if (c === '#') put(g, 65 + i, 21 + j + dy, 'K'); }));
    }
    if (has('stripes')) for (let o = 0; o < 2; o++) {
      line(g, 21 + o * 3, 22.8 + dy, 37 + o * 3, 13.6 + dy, 'P', PAINT); line(g, 22 + o * 3, 22.9 + dy, 38 + o * 3, 13.6 + dy, 'P', PAINT);
      line(g, 21.5 + o * 3, 25 + dy, 21.5 + o * 3, 29 + dy, 'P', PAINT); line(g, 21.5 + o * 3, 35 + dy, 21.5 + o * 3, 38 + dy, 'P', PAINT);
    }
    if (has('mud')) [[3, 36], [5, 37], [9, 37], [14, 38], [20, 37], [33, 37], [40, 36], [44, 37], [47, 35], [49, 31], [61, 34], [64, 33], [70, 31], [74, 30], [80, 29], [57, 26], [27, 38]]
      .forEach(([x, y], i) => { if (PAINT(get(g, x, y + dy))) put(g, x, y + dy, i % 3 ? 'V' : 'v'); });
    if (has('flares')) [[53.9, 32.9, 6.2, 8.4], [76.9, 26.9, 3.9, 6.3]].forEach(([cx, cy, rx, ry]) => {
      for (let y = Math.floor(cy - ry - 3); y <= cy; y++) for (let x = Math.floor(cx - rx - 3); x <= cx + rx + 3; x++) {
        const a = ((x + 0.5 - cx) / (rx + 2.6)) ** 2 + ((y + dy + 0.5 - cy - dy) / (ry + 2.4)) ** 2;
        if (a <= 1 && PAINT(get(g, x, y + dy))) put(g, x, y + dy, 'M');
      }
    });
    if (has('towhook')) { put(g, 1, 35 + dy, 'X'); put(g, 1, 36 + dy, 'X'); put(g, 2, 36 + dy, 'X'); }
    // outline: paint and glass pixels that touch empty space become outline
    const out = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = g[y][x];
      if (k === '.' || k === '^' || k === 'T' || k === 'D' || k === 'K') continue;
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => isEmpty(get(g, x + a, y + b)) || get(g, x + a, y + b) === '^')) out.push([x, y]);
    }
    out.forEach(([x, y]) => put(g, x, y, 'K'));

    // wheels last so tires sit in front of the wells; lowered cars tuck the tire under the fender
    const before = g.map(r => r.slice());
    const big = spec.wheel === 'knobby';
    [fw, rw].forEach(w => {
      const k = big ? 1.18 : 1, rx = w.rx * k, ry = w.ry * k, cy = w.cy + w.ry - ry;
      if (big) knobby(g, w.cx, cy, rx, ry); else wheel(g, w.cx, cy, rx, ry, spec.wheel || 'daisy');
      if (dy > 0) for (let y = Math.floor(cy - ry); y < cy - ry + dy + 2; y++) for (let x = Math.floor(w.cx - rx); x <= w.cx + rx; x++) {
        const b = before[y] && before[y][x];
        if (b && (PAINT(b) || b === 'K' || b === 'M')) g[y][x] = b;
      }
    });

    // thin parts drawn after the outline so they keep their color
    if (has('rollbar')) { line(g, 63, 13 + dy, 64, 4 + dy, '='); line(g, 64, 4 + dy, 70, 4 + dy, '='); line(g, 70, 4 + dy, 71, 12 + dy, '=');
      line(g, 71, 5 + dy, 77, 11 + dy, '='); put(g, 64, 3 + dy, 'K'); put(g, 70, 3 + dy, 'K'); }
    if (has('lightbar')) { line(g, 61, 2 + dy, 72, 2 + dy, 'M'); [62, 65, 68, 71].forEach(x => put(g, x, 2 + dy, 'J')); line(g, 61, 1 + dy, 72, 1 + dy, 'K'); }
    if (has('wing')) {
      poly(g, B([[66, 5], [83.5, 3.6], [83.5, 5.6], [66, 7]]), 'M'); line(g, 66, 5 + dy, 83, 3.6 + dy, 'K');
      line(g, 83, 2 + dy, 83, 8 + dy, 'K'); line(g, 72, 7 + dy, 72, 12 + dy, 'M'); line(g, 79, 6 + dy, 79, 12 + dy, 'M');
    }
    if (has('snorkel')) { line(g, 61, 22 + dy, 63, 14 + dy, 'M'); line(g, 63, 14 + dy, 63, 3 + dy, 'M'); put(g, 62, 3 + dy, 'M'); put(g, 61, 3 + dy, 'M'); put(g, 61, 4 + dy, 'M'); }
    if (has('rack')) { line(g, 66, 10 + dy, 80, 9 + dy, '1'); line(g, 67, 8 + dy, 79, 7.2 + dy, '1'); [67, 73, 79].forEach(x => line(g, x, 8 + dy - (x - 67) / 15, x, 11 + dy - (x - 67) / 15, '1')); }
    if (has('splitter') || has('lip')) line(g, 4, 39.6 + dy, 47, 39.6 + dy, 'M');
    if (has('skid')) { poly(g, B([[6, 38.6], [45, 38.6], [43, 40.6], [8, 40.6]]), '='); line(g, 6, 38.6 + dy, 45, 38.6 + dy, 'K'); }
    if (has('ring')) { put(g, 3, 39 + dy, 'K'); put(g, 3, 40 + dy, 'J'); put(g, 2, 41 + dy, 'J'); put(g, 4, 41 + dy, 'J'); put(g, 3, 42 + dy, 'J'); }
    if (has('sticker')) { put(g, 56, 10 + dy, 'X'); put(g, 57, 10 + dy, 'X'); put(g, 56, 11 + dy, 'j'); put(g, 57, 11 + dy, 'j'); }
    if (has('canard')) { line(g, 0, 30 + dy, 3, 29 + dy, 'M'); }
    return g.map(r => r.join(''));
  }

  function mouth(g, kind, dy) {
    if (kind === 'flat') { poly(g, [[11, 32 + dy], [30, 32 + dy], [30, 33.2 + dy], [11, 33.2 + dy]], 'D'); return; }
    if (kind === 'open') { ellipse(g, 20.5, 32.5 + dy, 9.5, 3.4, 'D'); ellipse(g, 20.5, 34 + dy, 5, 1.4, 'X'); return; }
    poly(g, [[8, 30 + dy], [32.5, 30 + dy], [33, 31.2 + dy], [30, 34.3 + dy], [12, 34.3 + dy], [7.5, 31.5 + dy]], 'D');
    line(g, 9, 29 + dy, 31, 29 + dy, 'W');
  }

  const BUILDS = {
    beater:    { label: 'Beater', wheel: 'steel', rust: true, eyes: 'lazy', mods: ['primerDoor'], paint: 'fadedRed' },
    daily:     { label: 'Daily', wheel: 'daisy' },
    project:   { label: 'Project', wheel: 'mesh', dy: 1, mods: ['sticker'] },
    race:      { label: 'Track', wheel: 'race', dy: 1, mods: ['rollbar', 'wing', 'number', 'splitter', 'towhook', 'stripes'], paint: 'classicRed' },
    stance:    { label: 'Stance', wheel: 'dish', dy: 2, mods: ['lip', 'ring', 'canard', 'banner'], paint: 'laguna' },
    offroad:   { label: 'Safari', wheel: 'knobby', dy: -3, mods: ['rollbar', 'lightbar', 'spare', 'snorkel', 'skid', 'flares', 'mud'], paint: 'sunburst' },
    collector: { label: 'Concours', wheel: 'daisy', topColor: 'tan', wood: true, mods: ['rack'], paint: 'brg' },
  };

  // the barn find: a lumpy tarp over the car's silhouette, wheels peeking out underneath
  function tarp(t) {
    const base = car({ eyes: 'down' }), g = grid();
    const solid = k => k !== '.' && k !== '^';
    const top = [], bot = [];
    for (let x = 0; x < W; x++) {
      top[x] = H; bot[x] = -1;
      for (let y = 0; y < H; y++) { const k = base[y][x]; if (k === '^') g[y][x] = '^'; if (solid(k)) { top[x] = Math.min(top[x], y); bot[x] = y; } }
    }
    const hull = [];
    for (let x = 0; x < W; x++) {
      let m = H; for (let i = -10; i <= 10; i++) if (top[x + i] !== undefined && top[x + i] < H) m = Math.min(m, top[x + i] + Math.abs(i) * 0.75);
      hull[x] = m >= H ? H : Math.round(m + 1 + Math.sin(x / 3.1 + (t || 0) * 0.6) * 0.6);
    }
    for (let x = 0; x < W; x++) {
      if (bot[x] < 0) continue;
      const hem = Math.min(bot[x], (x > 45 && x < 62) ? 34 : (x > 70 ? 28 : 37));
      for (let y = hull[x]; y <= hem; y++) {
        let k = (x * 2 + y * 3) % 13 === 0 || (x + y * 5) % 19 === 0 ? 'y' : 'a';
        if (y <= hull[x] + 1) k = 'p';
        if (y === hull[x] || y === hem || x === 0 || x === W - 1 || bot[x - 1] < 0 || bot[x + 1] < 0) k = 'K';
        g[y][x] = k;
      }
      for (let y = hem + 1; y <= bot[x]; y++) { const k = base[y][x]; if ('TtSsCc'.includes(k)) g[y][x] = k; }
    }
    [16, 58].forEach(rx => { for (let y = hull[rx] + 1; y < H; y++) { if (g[y][rx] === 'a' || g[y][rx] === 'y' || g[y][rx] === 'p') g[y][rx] = 'm'; } });
    return g.map(r => r.join(''));
  }

  G.CAR34 = { W, H, car, tarp, BUILDS, grid, poly, ellipse, line, put, get };
})(window);

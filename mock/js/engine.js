/* Miatagotchi mock: tiny palette-indexed pixel engine.
   Scenes are drawn into a buffer of single-char palette keys, then
   resolved per display mode: full color, or a 4-shade Game Boy style LCD. */
(function (G) {
  'use strict';

  // key: [color, lcd]   lcd: 0 paper, 1 ink, 2 dither 50%, 3 dither 25%, 4 ghost segment
  const BASE = {
    K: ['#1d1a24', 1], // outline
    D: ['#141218', 1], // wheel well
    M: ['#2a2830', 1], // black trim
    I: ['#2f2d37', 1], // interior / soft top
    i: ['#5d5a69', 2], // interior highlight
    G: ['#a9dcef', 0], // glass
    g: ['#6aa3bd', 3], // glass streak
    T: ['#2b2a31', 1], // tire
    t: ['#5a5864', 1], // tire highlight
    S: ['#d5dae1', 0], // rim
    s: ['#7e8692', 1], // rim holes
    C: ['#f2f6f8', 0], // chrome
    c: ['#9aa7b0', 2], // chrome shade
    H: ['#fff6c8', 0], // headlight lens
    h: ['#fff1a0', 3], // headlight beam
    A: ['#ffa425', 0], // amber marker
    L: ['#ff3b3b', 1], // tail light
    9: ['#e8323c', 0], // red side marker
    '^': ['#3d3f50', 2], // ground shadow
    '(': ['#9fdcc9', 0], // sky mint
    ')': ['#f4a9c4', 0], // sky pink
    '[': ['#ffc48e', 0], // sky peach
    ']': ['#ffe58a', 0], // sunset sun
    '{': ['#3f9fc4', 2], // sea
    '}': ['#c8f0ff', 0], // sea sparkle
    '_': ['#ecc98f', 0], // sand
    ':': ['#7a5236', 1], // palm trunk
    ';': ['#3cae5c', 2], // palm leaf
    '|': ['#23824a', 1], // palm leaf shade
    1: ['#e3eaee', 1], // chrome rail (visible on LCD)
    2: ['#9a5b2e', 1], // wood
    3: ['#f2c230', 1], // gold trophy
    4: ['#fff8d6', 0], // gold shine
    P: ['#f7f4ea', 0], // paper white (labels, number roundel)
    B: ['#8fd3ff', 0], // sky
    b: ['#c7ecff', 0], // sky haze
    U: ['#ffffff', 0], // cloud
    u: ['#d8eefa', 0], // cloud shade
    O: ['#ffd447', 0], // sun
    o: ['#ff9e2c', 1], // sun rim
    F: ['#86bfa4', 0], // far hills
    f: ['#679f86', 3], // hill shade
    E: ['#67b553', 0], // grass
    e: ['#468f3c', 3], // grass shade
    N: ['#545868', 0], // asphalt
    n: ['#43465a', 3], // asphalt dark
    Y: ['#ffe16b', 1], // road line
    X: ['#ff3d6e', 1], // heart / alert red
    x: ['#ffa0bb', 0], // heart shine
    Q: ['#eceaf2', 0], // smoke
    q: ['#9b99ab', 1], // smoke edge
    Z: ['#17161c', 1], // oil puddle
    z: ['#5b4f8f', 2], // oil sheen
    V: ['#7a5532', 1], // mud
    v: ['#a87d50', 2], // mud light
    J: ['#ffcf2e', 1], // yellow (notes, zzz, sparkles)
    j: ['#58b8ff', 1], // blue (water, notes)
    w: ['#d9f1ff', 0], // water light
    O2: null,
    '#': ['#1d1a24', 1], // icon ink
    '+': ['#c9c3d4', 4], // icon ghost (inactive LCD segment)
    '@': ['#ff9b1f', 1], // check-engine amber
    '%': ['#e23d3d', 1], // icon red accent
    '&': ['#3a8fe0', 1], // icon blue accent
    '$': ['#3fb35a', 1], // icon green accent
    '=': ['#8a8798', 2], // mid gray
    '~': ['#b8b4c4', 0], // light gray
    m: ['#8c6a3c', 1], // brown (tarp rope, wood)
    a: ['#c9a46a', 0], // tan (soft top, tarp)
    y: ['#a88954', 2], // tan shade
    p: ['#e9d2a3', 0], // tan light
    d: ['#cf9b45', 1], // bronze wheel
    l: ['#efc477', 0], // bronze light
  };
  delete BASE.O2;

  // NA factory-inspired paints: R body, r shadow, W highlight, k panel line
  const PAINTS = {
    classicRed:   { name: 'Classic Red',     R: '#d7303a', r: '#a3202d', W: '#f47b70', k: '#6c1522' },
    marinerBlue:  { name: 'Mariner Blue',    R: '#2f62b8', r: '#1f4282', W: '#78a3e6', k: '#132a5c' },
    crystalWhite: { name: 'Crystal White',   R: '#eceee9', r: '#c2c7c8', W: '#ffffff', k: '#7f878d' },
    silverStone:  { name: 'Silver Stone',    R: '#b7bcc4', r: '#878d97', W: '#e4e8ed', k: '#535a64' },
    brg:          { name: 'British Racing Green', R: '#1f5b3e', r: '#133d29', W: '#43906a', k: '#0a2416' },
    sunburst:     { name: 'Sunburst Yellow', R: '#f4c41a', r: '#c4950c', W: '#ffe56e', k: '#76570a' },
    brilliantBlack: { name: 'Brilliant Black', R: '#34333c', r: '#22212a', W: '#62606e', k: '#121117' },
    laguna:       { name: 'Laguna Blue',     R: '#2aa9c7', r: '#1a7d97', W: '#7fd6ea', k: '#0e4c5d' },
    merlot:       { name: 'Merlot Mica',     R: '#6e1f39', r: '#4b1327', W: '#a14466', k: '#2c0a17' },
    fadedRed:     { name: 'Sun-faded Red',   R: '#c9706b', r: '#9d5052', W: '#e7aaa2', k: '#5e2a2e' },
    montego:      { name: 'Montego Blue',    R: '#1d4c8f', r: '#123565', W: '#4f7fc4', k: '#0a1e3e' },
  };

  const LCD = { paper: '#d3dcb2', ink: '#252d27', ghost: 'rgba(37,45,39,0.09)', shadow: 'rgba(37,45,39,0.16)', grid: 'rgba(160,170,140,0.55)' };

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const LCD_PAPER = hexToRgb(LCD.paper), LCD_INK = hexToRgb(LCD.ink);
  const LCD_GHOST = [
    Math.round(LCD_PAPER[0] * 0.9 + LCD_INK[0] * 0.1),
    Math.round(LCD_PAPER[1] * 0.9 + LCD_INK[1] * 0.1),
    Math.round(LCD_PAPER[2] * 0.9 + LCD_INK[2] * 0.1),
  ];
  const rgbCache = {};
  function rgb(h) { return rgbCache[h] || (rgbCache[h] = hexToRgb(h)); }

  // ---------- buffer ----------
  function Buffer(w, h) {
    this.w = w; this.h = h;
    this.k = new Array(w * h).fill('');
  }
  Buffer.prototype.clear = function (key) { this.k.fill(key || ''); };
  Buffer.prototype.set = function (x, y, key) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !key || key === '.') return;
    this.k[y * this.w + x] = key;
  };
  Buffer.prototype.get = function (x, y) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return '';
    return this.k[y * this.w + x];
  };
  Buffer.prototype.rect = function (x, y, w, h, key) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, key);
  };
  Buffer.prototype.hline = function (x0, x1, y, key) { for (let x = x0; x <= x1; x++) this.set(x, y, key); };
  Buffer.prototype.vline = function (x, y0, y1, key) { for (let y = y0; y <= y1; y++) this.set(x, y, key); };
  // Draw a sprite (array of strings). opts: flip, map (key remap), only (fn(key)->bool)
  Buffer.prototype.sprite = function (spr, x, y, opts) {
    opts = opts || {};
    const rows = spr.rows || spr;
    const w = spr.w || Math.max.apply(null, rows.map(r => r.length));
    for (let j = 0; j < rows.length; j++) {
      const row = rows[j];
      for (let i = 0; i < row.length; i++) {
        let key = row[i];
        if (key === '.' || key === ' ') continue;
        if (opts.map && opts.map[key] !== undefined) key = opts.map[key];
        if (opts.only && !opts.only(key)) continue;
        const dx = opts.flip ? (w - 1 - i) : i;
        this.set(x + dx, y + j, key);
      }
    }
  };

  // ---------- 3x5 pixel font ----------
  const FONT_SRC = [
    'A .#./#.#/###/#.#/#.#', 'B ##./#.#/##./#.#/##.', 'C .##/#../#../#../.##', 'D ##./#.#/#.#/#.#/##.',
    'E ###/#../##./#../###', 'F ###/#../##./#../#..', 'G .##/#../#.#/#.#/.##', 'H #.#/#.#/###/#.#/#.#',
    'I ###/.#./.#./.#./###', 'J ..#/..#/..#/#.#/.#.', 'K #.#/#.#/##./#.#/#.#', 'L #../#../#../#../###',
    'M #.#/###/###/#.#/#.#', 'N ##./#.#/#.#/#.#/#.#', 'O .#./#.#/#.#/#.#/.#.', 'P ##./#.#/##./#../#..',
    'Q .#./#.#/#.#/##./.##', 'R ##./#.#/##./#.#/#.#', 'S .##/#../.#./..#/##.', 'T ###/.#./.#./.#./.#.',
    'U #.#/#.#/#.#/#.#/###', 'V #.#/#.#/#.#/#.#/.#.', 'W #.#/#.#/###/###/#.#', 'X #.#/#.#/.#./#.#/#.#',
    'Y #.#/#.#/.#./.#./.#.', 'Z ###/..#/.#./#../###',
    '0 ###/#.#/#.#/#.#/###', '1 .#./##./.#./.#./###', '2 ##./..#/.#./#../###', '3 ##./..#/.#./..#/##.',
    '4 #.#/#.#/###/..#/..#', '5 ###/#../##./..#/##.', '6 .##/#../###/#.#/###', '7 ###/..#/.#./.#./.#.',
    '8 ###/#.#/###/#.#/###', '9 ###/#.#/###/..#/##.',
    '! .#./.#./.#./.../.#.', '? ##./..#/.#./.../.#.', '. .../.../.../.../.#.', ': .../.#./.../.#./...',
    '- .../.../###/.../...', '+ .../.#./###/.#./...', '/ ..#/..#/.#./#../#..', '% #.#/..#/.#./#../#.#',
    "' .#./.#./.../.../...", ', .../.../.../.#./#..', '* .../#.#/###/###/.#.', '< ..#/.#./#../.#./..#',
    '> #../.#./..#/.#./#..', '# #.#/###/#.#/###/#.#', '= .../###/.../###/...', '( .#./#../#../#../.#.',
    ') .#./..#/..#/..#/.#.', '_ .../.../.../.../###',
  ];
  const FONT = { ' ': ['...', '...', '...', '...', '...'] };
  FONT_SRC.forEach(s => { FONT[s[0]] = s.slice(2).split('/'); });

  function textWidth(str) { return str.length ? str.length * 4 - 1 : 0; }
  Buffer.prototype.text = function (str, x, y, key) {
    str = String(str).toUpperCase();
    for (let n = 0; n < str.length; n++) {
      const g = FONT[str[n]] || FONT['?'];
      for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) if (g[r][c] === '#') this.set(x + n * 4 + c, y + r, key || 'K');
    }
  };

  // ---------- resolve + present ----------
  // mode: 'color' | 'lcd'. paint: PAINTS key. Returns ImageData-sized RGBA + LCD ink mask.
  const ALT = { 5: 'R', 6: 'r', 7: 'W', 8: 'k' };
  // 4-shade LCD, Game Boy style: 0 lightest .. 3 darkest
  const GB = ['#d3dcb2', '#99ad7e', '#57704f', '#1f3326'];
  const GB_RGB = GB.map(hexToRgb);
  const FROM_LCD = [0, 3, 2, 1, 1];
  const SHADE = {
    R: 1, r: 2, W: 0, k: 3, 5: 1, 6: 2, 7: 0, 8: 3, B: 0, b: 0, U: 0, u: 0, O: 1, F: 1, f: 1, E: 1, e: 2,
    N: 2, n: 2, Y: 0, I: 3, i: 2, G: 0, g: 1, T: 3, t: 2, S: 0, s: 2, c: 1, h: 1, A: 1, L: 2, 9: 2,
    Q: 0, q: 2, X: 3, x: 1, J: 2, j: 2, w: 0, '+': 1, '=': 2, '~': 1, a: 1, y: 2, p: 0, d: 2,
    1: 2, 3: 1, 4: 0, '^': 2, '(': 0, ')': 1, '[': 1, ']': 0, '{': 2, '}': 0, '_': 1, ':': 3, ';': 2, '|': 3, M: 3, D: 3, K: 3, P: 0, z: 2, V: 3, v: 2, '@': 3, '#': 3,
  };
  const shadeOf = (k) => SHADE[k] !== undefined ? SHADE[k] : FROM_LCD[(BASE[k] || [0, 0])[1]];
  function resolve(buf, mode, paintKey, bgColor, paint2Key) {
    const paint = PAINTS[paintKey] || PAINTS.classicRed;
    const paint2 = PAINTS[paint2Key] || paint;
    const out = new Uint8ClampedArray(buf.w * buf.h * 4);
    const ink = mode === 'lcd' ? new Uint8Array(buf.w * buf.h) : null;
    const bg = rgb(bgColor || '#ffffff');
    for (let y = 0; y < buf.h; y++) for (let x = 0; x < buf.w; x++) {
      const i = y * buf.w + x, o = i * 4;
      const key = buf.k[i];
      let c;
      if (mode === 'lcd') {
        const sh = key ? shadeOf(key) : 0;
        c = GB_RGB[sh];
        if (sh >= 2) ink[i] = 1;
      } else {
        if (!key) c = bg;
        else if (paint[key] && 'RrWk'.includes(key)) c = rgb(paint[key]);
        else if (ALT[key]) c = rgb(paint2[ALT[key]]);
        else c = rgb((BASE[key] || ['#ff00ff'])[0]);
      }
      out[o] = c[0]; out[o + 1] = c[1]; out[o + 2] = c[2]; out[o + 3] = 255;
    }
    return { data: out, ink: ink };
  }

  // Draw a buffer onto a display canvas at integer device-pixel scale, with LCD dressing in lcd mode.
  function present(canvas, buf, mode, paintKey, opts) {
    opts = opts || {};
    const scale = opts.scale || 4;
    const W = buf.w * scale, H = buf.h * scale;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const res = resolve(buf, mode, paintKey, opts.bg, opts.paint2);
    const small = present._small || (present._small = document.createElement('canvas'));
    small.width = buf.w; small.height = buf.h;
    const sctx = small.getContext('2d');
    sctx.putImageData(new ImageData(res.data, buf.w, buf.h), 0, 0);
    if (mode === 'lcd') {
      ctx.drawImage(small, 0, 0, W, H);
      // segment shadow cast onto the reflective backing
      const off = Math.max(1, Math.round(scale * 0.28));
      ctx.fillStyle = LCD.shadow;
      for (let y = 0; y < buf.h; y++) for (let x = 0; x < buf.w; x++) {
        if (res.ink[y * buf.w + x]) ctx.fillRect(x * scale + off, y * scale + off, scale, scale);
      }
      // dot-matrix gaps
      if (scale >= 4) {
        ctx.fillStyle = LCD.grid;
        const gw = Math.max(1, Math.round(scale / 7));
        for (let x = 1; x < buf.w; x++) ctx.fillRect(x * scale - gw / 2, 0, gw, H);
        for (let y = 1; y < buf.h; y++) ctx.fillRect(0, y * scale - gw / 2, W, gw);
      }
    } else {
      ctx.drawImage(small, 0, 0, W, H);
      if (opts.grid && scale >= 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (let x = 1; x < buf.w; x++) ctx.fillRect(x * scale, 0, 1, H);
        for (let y = 1; y < buf.h; y++) ctx.fillRect(0, y * scale, W, 1);
      }
    }
  }

  G.PX = { Buffer, BASE, PAINTS, LCD, FONT, textWidth, resolve, present };
})(window);

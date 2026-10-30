/* Miatagotchi mock: mods, build specs, barn-find tarp and the front "face". */
(function (G) {
  'use strict';
  const { REAR_CX, FRONT_CX, CY } = G.CAR;

  // ---- body-mounted mods (drawn in body space; caller adds dy) ----
  const MODS = {
    wing(b, x, y) {
      b.vline(x + 1, y + 4, y + 7, 'K');
      b.hline(x + 1, x + 13, y + 5, 'K');
      b.hline(x + 2, x + 12, y + 6, 'M'); b.set(x + 13, y + 6, 'K');
      b.vline(x + 5, y + 7, y + 8, 'K'); b.vline(x + 10, y + 7, y + 8, 'K');
    },
    rollbar(b, x, y) {
      b.vline(x + 27, y + 3, y + 8, '=');
      b.hline(x + 27, x + 28, y + 3, '=');
      [[26, 4], [25, 5], [24, 6], [23, 7]].forEach(([px, py]) => b.set(x + px, y + py, '='));
    },
    number(b, x, y, n) {
      b.sprite(['.KKKKK.', 'KPPPPPK', 'KPPPPPK', 'KPPPPPK', 'KPPPPPK', 'KPPPPPK', '.KKKKK.'], x + 31, y + 11);
      b.text(String(n || 5), x + 33, y + 12, 'K');
    },
    splitter(b, x, y) { b.hline(x + 55, x + 64, y + 19, 'M'); },
    towhook(b, x, y) { b.set(x + 64, y + 15, 'X'); b.set(x + 64, y + 16, 'X'); b.set(x + 65, y + 16, 'X'); },
    stripe(b, x, y) { for (let i = 2; i < 62; i++) if (b.get(x + i, y + 14) === 'R') b.set(x + i, y + 14, 'P'); },
    lip(b, x, y) { b.hline(x + 56, x + 63, y + 19, 'M'); b.hline(x + 3, x + 8, y + 19, 'M'); },
    banner(b, x, y) { b.hline(x + 36, x + 37, y + 4, 'M'); b.hline(x + 37, x + 38, y + 5, 'M'); },
    ring(b, x, y) { b.set(x + 3, y + 19, 'K'); b.set(x + 2, y + 20, 'J'); b.set(x + 4, y + 20, 'J'); b.set(x + 3, y + 21, 'J'); },
    canard(b, x, y) { b.hline(x + 61, x + 63, y + 15, 'M'); },
    lightbar(b, x, y) {
      b.hline(x + 24, x + 31, y + 1, 'M');
      [25, 27, 29, 31].forEach(px => b.set(x + px, y + 1, 'J'));
      b.vline(x + 27, y + 2, y + 2, 'M');
    },
    spare(b, x, y) {
      const t = ['..TTT..', '.TTTTT.', 'TTS=STT', 'TT=K=TT', 'TTS=STT', '.TTTTT.', '..TTT..'];
      b.sprite(t, x + 6, y + 2);
    },
    snorkel(b, x, y) { b.vline(x + 43, y + 4, y + 9, 'M'); b.hline(x + 43, x + 45, y + 4, 'M'); },
    skid(b, x, y) { b.hline(x + 54, x + 62, y + 19, '='); b.set(x + 63, y + 18, '='); },
    flaps(b, x, y) { b.vline(x + 8, y + 17, y + 21, 'M'); b.vline(x + 43, y + 17, y + 21, 'M'); },
    flares(b, x, y) {
      [REAR_CX, FRONT_CX].forEach(cx => {
        b.hline(x + cx - 3, x + cx + 3, y + 11, 'M');
        b.set(x + cx - 5, y + 12, 'M'); b.set(x + cx - 4, y + 12, 'M'); b.set(x + cx + 4, y + 12, 'M'); b.set(x + cx + 5, y + 12, 'M');
        b.vline(x + cx - 7, y + 13, y + 18, 'M'); b.vline(x + cx + 7, y + 13, y + 18, 'M');
        b.set(x + cx - 6, y + 13, 'M'); b.set(x + cx + 6, y + 13, 'M');
      });
    },
    mud(b, x, y) {
      const pts = [[5, 17], [6, 16], [9, 18], [24, 18], [25, 17], [29, 18], [33, 17], [38, 18], [41, 16], [46, 18], [58, 17], [60, 16], [12, 15], [22, 16]];
      pts.forEach(([px, py], i) => { const k = b.get(x + px, y + py); if ('RrWk'.includes(k) && k) b.set(x + px, y + py, i % 3 ? 'V' : 'v'); });
    },
    rack(b, x, y) {
      b.hline(x + 4, x + 15, y + 7, '1');
      b.vline(x + 5, y + 8, y + 8, '1'); b.vline(x + 14, y + 8, y + 8, '1');
      b.set(x + 9, y + 8, '1'); b.set(x + 10, y + 8, '1');
    },
    primerDoor(b, x, y) {
      for (let py = 10; py <= 18; py++) for (let px = 27; px <= 41; px++) {
        const k = b.get(x + px, y + py);
        if (k === 'R' || k === 'W') b.set(x + px, y + py, '~'); else if (k === 'r') b.set(x + px, y + py, '=');
      }
    },
    sticker(b, x, y) { b.set(x + 37, y + 7, 'X'); b.set(x + 38, y + 7, 'j'); },
    exhaust(b, x, y) { b.hline(x - 1, x + 1, y + 18, '='); },
  };

  // spec: { paint, lights, top, topColor, wood, rust, wheel, dy, mods: [], number }
  function drawCar(b, x, y, spec, t) {
    spec = spec || {};
    const dy = spec.dy || 0;
    const body = G.CAR.body(spec);
    const wset = G.CAR.WHEELS[spec.wheel || 'daisy'];
    const wh = wset[(t || 0) % wset.length];
    const big = wh.length === 13;
    const by = y + dy;
    const pre = (spec.mods || []).filter(m => m === 'rollbar' || m === 'lightbar' || m === 'spare');
    pre.forEach(m => MODS[m](b, x, by, spec.number));
    const map = spec.alt ? { R: '5', r: '6', W: '7', k: '8' } : undefined;
    b.sprite(body, x, by, { map });
    [REAR_CX, FRONT_CX].forEach(cx => {
      const off = big ? 6 : 5;
      b.sprite(wh, x + cx - off, y + CY - off - (big ? 1 : 0));
    });
    if (dy > 0) b.sprite(body, x, by, { map, only: k => k !== 'D' });
    (spec.mods || []).filter(m => pre.indexOf(m) < 0).forEach(m => MODS[m](b, x, by, spec.number));
  }

  // ---- builds: life stages and the four adult paths ----
  const BUILDS = {
    beater:    { label: 'Beater', wheel: 'steel', rust: true, paint: 'fadedRed', mods: ['primerDoor'] },
    daily:     { label: 'Daily', wheel: 'daisy', lights: 'up' },
    project:   { label: 'Project', wheel: 'mesh', dy: 1, lights: 'up', mods: ['sticker', 'exhaust'] },
    race:      { label: 'Track', wheel: 'race', dy: 1, lights: 'down', mods: ['rollbar', 'wing', 'number', 'splitter', 'towhook', 'stripe'], number: 5, paint: 'classicRed' },
    stance:    { label: 'Stance', wheel: 'dish', dy: 2, top: 'hard', lights: 'down', mods: ['lip', 'banner', 'ring', 'canard'], paint: 'laguna' },
    offroad:   { label: 'Safari', wheel: 'knobby', dy: -3, lights: 'up', mods: ['rollbar', 'lightbar', 'spare', 'snorkel', 'skid', 'flaps', 'flares', 'mud'], paint: 'sunburst' },
    collector: { label: 'Concours', wheel: 'daisy', top: 'soft', topColor: 'tan', wood: true, lights: 'down', mods: ['rack'], paint: 'brg' },
  };

  // ---- barn-find tarp (the "egg") ----
  function tarp(b, x, y, t) {
    const sway = (t || 0) % 2;
    const prof = [];
    for (let i = 0; i < 64; i++) {
      // follow the car silhouette, a little puffier around the windshield
      let top = 9;
      if (i < 2) top = 12 - i; else if (i > 48) top = 9 + Math.floor((i - 48) / 3);
      if (i >= 26 && i <= 40) top = 4 + Math.abs(i - 35) / 3;
      if (i >= 18 && i < 26) top = 8 - (i - 18) / 3;
      prof.push(Math.round(top));
    }
    for (let i = 0; i < 64; i++) {
      const top = prof[i] + (i > 30 && sway ? 0 : 0);
      for (let j = top; j <= 20; j++) {
        let k = 'a';
        if (j === top) k = 'K';
        else if ((i + j * 2) % 11 === 0 || (i * 3 + j) % 17 === 0) k = 'y';
        else if (j === top + 1) k = 'p';
        if (j === 20) k = (i % 3 === 0) ? 'K' : 'y';
        b.set(x + i, y + j, k);
      }
      b.set(x + i, y + 21, i % 4 === 1 ? 'K' : '');
    }
    b.vline(x, y + prof[0], y + 20, 'K'); b.vline(x + 63, y + prof[63], y + 20, 'K');
    // ropes
    [12, 46].forEach(rx => { for (let j = prof[rx]; j <= 20; j++) b.set(x + rx + (j % 2), y + j, 'm'); });
    // one tire peeking out
    b.sprite(['.TTTTT.', 'TTSSSTT', 'TSsKsST'], x + 47, y + 21);
  }

  // ---- front view face (40x27) ----
  // eyes: open | closed | wink | happy | sleepy | x ;  mouth: smile | open | flat
  function face(b, x, y, o) {
    o = o || {};
    const eyes = o.eyes || 'open', mouth = o.mouth || 'smile';
    const set = (px, py, k) => b.set(x + px, y + py, k);
    const sym = (px, py, k) => { set(px, py, k); set(39 - px, py, k); };
    // tires
    for (let py = 18; py <= 26; py++) for (let px = 1; px <= 7; px++) {
      const edge = (py === 26 && (px === 1 || px === 7));
      if (!edge) sym(px, py, (px === 2 && py < 24) ? 't' : 'T');
    }
    // windshield
    for (let py = 2; py <= 8; py++) {
      const half = 7 + Math.floor((py - 2) / 2);
      for (let px = 20 - half - 1; px <= 19; px++) {
        const k = (px === 20 - half - 1 || py === 2) ? 'K' : ((px + py) % 9 === 0 ? 'g' : 'G');
        sym(px, py, k);
      }
    }
    sym(19, 3, 'M'); sym(18, 3, 'M'); sym(19, 4, 'M');
    // mirrors
    sym(4, 7, 'K'); sym(5, 7, 'M'); sym(6, 7, 'M'); sym(5, 8, 'M'); sym(6, 8, 'K'); sym(7, 8, 'K');
    // body
    for (let py = 9; py <= 20; py++) for (let px = 1; px <= 19; px++) {
      let left = py === 9 ? 4 : py === 10 ? 2 : (py >= 19 ? 2 + (py - 19) : 1);
      if (px < left) continue;
      let k = 'R';
      if (px === left || py === 9 || py === 20) k = 'K';
      else if (py === 10) k = 'W';
      else if (py >= 17) k = 'r';
      sym(px, py, k);
    }
    // turn signals
    sym(3, 15, 'A'); sym(4, 15, 'A'); sym(3, 16, 'A'); sym(4, 16, 'A');
    // chin
    for (let px = 8; px <= 19; px++) sym(px, 21, 'M');
    // mouth (the NA's grinning air intake)
    const m = mouth === 'open' ? { y0: 14, y1: 19, w: 7 } : mouth === 'flat' ? { y0: 16, y1: 17, w: 6 } : { y0: 15, y1: 18, w: 7 };
    for (let py = m.y0; py <= m.y1; py++) {
      let w = m.w;
      if (py === m.y0) w -= 1;
      if (mouth === 'smile' && py === m.y1) w -= 2;
      if (mouth !== 'smile' && py === m.y1) w -= 1;
      for (let px = 20 - w; px <= 19; px++) sym(px, py, (py === m.y0 && px === 20 - w) ? 'k' : 'D');
    }
    if (mouth === 'smile') { sym(12, 14, 'k'); sym(13, 14, 'k'); }
    // pop-up headlights
    const eye = (side, state) => {
      const ex = side ? 39 - 10 : 4; // left edge of pod
      const P = (px, py, k) => set(ex + px, py, k);
      if (state === 'closed') {
        for (let px = 0; px <= 6; px++) P(px, 11, 'k');
        P(0, 10, 'k'); P(6, 10, 'k');
        return;
      }
      for (let px = 0; px <= 6; px++) { P(px, 3, 'K'); }
      for (let py = 4; py <= 9; py++) { P(0, py, 'K'); P(6, py, 'K'); }
      for (let px = 1; px <= 5; px++) P(px, 4, 'W');
      for (let py = 5; py <= 9; py++) for (let px = 1; px <= 5; px++) P(px, py, 'H');
      P(1, 5, 'M'); P(5, 5, 'M'); P(1, 9, 'M'); P(5, 9, 'M');
      const inward = side ? 0 : 1;
      if (state === 'open') { P(2 + inward, 6, 'K'); P(3 + inward, 6, 'K'); P(2 + inward, 7, 'K'); P(3 + inward, 7, 'K'); P(2 + inward, 6, 'U'); }
      if (state === 'happy') { P(1, 8, 'K'); P(2, 7, 'K'); P(3, 6, 'K'); P(4, 7, 'K'); P(5, 8, 'K'); }
      if (state === 'sleepy') { for (let px = 1; px <= 5; px++) { P(px, 5, 'R'); P(px, 6, 'R'); P(px, 7, 'k'); } P(3, 8, 'K'); }
      if (state === 'x') { P(1, 5, 'K'); P(5, 5, 'K'); P(2, 6, 'K'); P(4, 6, 'K'); P(3, 7, 'K'); P(2, 8, 'K'); P(4, 8, 'K'); P(1, 9, 'K'); P(5, 9, 'K'); }
    };
    const L = eyes === 'wink' ? 'open' : eyes, R = eyes === 'wink' ? 'closed' : eyes;
    eye(0, L); eye(1, R);
  }

  G.ART = { MODS, drawCar, BUILDS, tarp, face };
})(window);

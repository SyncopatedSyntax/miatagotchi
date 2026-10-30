/* Miatagotchi mock: main-screen state, animation loop and input. */
(function (G) {
  'use strict';
  const { Buffer, present } = G.PX;
  const { drawCar, BUILDS, tarp, face } = G.ART;
  const { ICONS, ICON_ORDER, ICON_LABEL, EMOTE, PROPS, background } = G.UI;

  const LW = 96, LH = 88, PY = 12, CAR_Y = PY + 33;
  const PARTS = {
    egg: ['TARP', 'FLAT TIRES', 'MOUSE NEST'],
    beater: ['STEEL WHEELS', 'PRIMER DOOR', 'RUST X5'],
    daily: ['14IN DAISIES', 'POP-UPS OK', 'FRESH OIL'],
    project: ['MESH WHEELS', 'BIG EXHAUST', 'CLUB DECAL', '-1IN DROP'],
    race: ['ROLL BAR', 'GT WING', 'SPLITTER', 'NO.5 ROUNDEL', 'TOW HOOK'],
    stance: ['AIR RIDE', 'DEEP DISH', 'HARDTOP', 'TSURIKAWA', 'CANARDS'],
    offroad: ['2IN LIFT', 'MUD TIRES', 'LIGHT BAR', 'SNORKEL', 'SPARE'],
    collector: ['TAN TOP', 'TRUNK RACK', 'WOOD WHEEL', 'OEM DAISIES'],
  };

  const S = {
    mode: 'color', paint: 'classicRed', build: 'daily', name: 'POPPY',
    sel: 0, screen: 'main', page: 0, t: 0,
    x: 16, dir: 1, pause: 0, action: null, asleep: false,
    puddles: [], cel: false, blink: 0, nextBlink: 18, msg: null,
    stats: { fuel: 3, mood: 2, clean: 3, health: 4 },
    path: { TRACK: 4, STANCE: 1, TRAIL: 2, CLASSIC: 3 },
    onChange: null,
  };

  const buf = new Buffer(LW, LH);
  const tmp = new Buffer(72, 30);

  function blit(src, x, y, flip) {
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
      const k = src.k[j * src.w + i];
      if (k) buf.set(x + (flip ? src.w - 1 - i : i), y + j, k);
    }
  }
  const emote = (name, x, y) => buf.sprite(EMOTE[name], x, y);
  const facingRight = () => S.dir > 0;

  function carSpec() {
    const base = BUILDS[S.build] || BUILDS.daily;
    const spec = Object.assign({}, base, { mods: (base.mods || []).slice() });
    const eyesOpen = !S.asleep && S.blink <= 0;
    spec.lights = eyesOpen ? 'up' : 'down';
    if (S.asleep && !spec.top) spec.top = 'soft';
    return spec;
  }

  function drawPet(px, py, frame) {
    tmp.clear('');
    if (S.build === 'egg') {
      tarp(tmp, 3, 4, frame);
    } else {
      const spec = carSpec();
      const bounce = (!S.asleep && !S.action && (S.t >> 1) % 6 === 0) ? -1 : 0;
      spec.dy = (spec.dy || 0) + bounce;
      drawCar(tmp, 3, 2, spec, frame);
    }
    blit(tmp, px - 3, py - 2, !facingRight());
  }

  // tailpipe position in screen space
  const tailX = () => facingRight() ? S.x - 2 : S.x + 65;

  function drawIcons() {
    const color = S.mode === 'color';
    if (color) { buf.rect(0, 0, LW, PY, 'P'); buf.rect(0, PY + 64, LW, LH - PY - 64, 'P'); }
    ICON_ORDER.forEach((name, i) => {
      const x = (i % 4) * 24 + 7, y = i < 4 ? 1 : PY + 66;
      let ink = '#';
      if (name === 'cel') ink = S.cel ? ((S.t >> 2) % 2 ? '@' : '+') : '+';
      if (i === S.sel) {
        buf.rect(x - 2, y - 1, 13, 11, color ? '~' : '#');
        if (!color) ink = 'P';
      }
      if (color && name === 'cel' && S.cel) ink = (S.t >> 2) % 2 ? '@' : 'X';
      buf.sprite(ICONS[name], x, y, { map: { '#': ink } });
    });
  }

  function heart(x, y, full) { buf.sprite(['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'], x, y, { map: { X: full ? 'X' : '+' } }); }
  function titleBar(txt) { buf.rect(0, PY, LW, 9, 'K'); buf.text(txt, 3, PY + 2, 'P'); }

  function drawGauges() {
    buf.rect(0, PY, LW, 64, 'P');
    const pages = ['METERS', 'CAR', 'PATH'];
    titleBar('GAUGES ' + (S.page + 1) + '/3 ' + pages[S.page]);
    if (S.page === 0) {
      [['FUEL', S.stats.fuel], ['MOOD', S.stats.mood], ['CLEAN', S.stats.clean], ['HEALTH', S.stats.health]].forEach(([l, v], r) => {
        buf.text(l, 4, PY + 14 + r * 12, 'K');
        for (let i = 0; i < 4; i++) heart(52 + i * 9, PY + 14 + r * 12, i < v);
      });
    } else if (S.page === 1) {
      [S.name + "  NA6CE '90", 'STAGE ' + (BUILDS[S.build] ? BUILDS[S.build].label : 'BARN FIND').toUpperCase(),
        'AGE   4 DAYS', 'ODO   41,250 MI', 'CURB  2,182 LB'].forEach((l, r) => buf.text(l, 4, PY + 13 + r * 10, 'K'));
    } else {
      Object.keys(S.path).forEach((k, r) => {
        buf.text(k, 4, PY + 14 + r * 12, 'K');
        for (let i = 0; i < 6; i++) buf.rect(48 + i * 7, PY + 14 + r * 12, 5, 5, i < S.path[k] ? 'K' : '+');
      });
    }
  }

  function drawMods() {
    buf.rect(0, PY, LW, 64, 'P');
    titleBar('MODS INSTALLED');
    (PARTS[S.build] || []).forEach((p, r) => buf.text('- ' + p, 4, PY + 13 + r * 9, 'K'));
    buf.text('NEXT: ???  IN 2D', 4, PY + 57, '=');
  }

  function drawMsg() {
    buf.rect(0, PY, LW, 64, 'P');
    titleBar(S.msg.title);
    S.msg.lines.forEach((l, r) => buf.text(l, 4, PY + 16 + r * 10, 'K'));
  }

  function drawMain() {
    const night = S.asleep;
    background(buf, S.mode, PY, S.action && S.action.type === 'drive' ? S.t * 3 : S.t, night);
    S.puddles.forEach(px => buf.sprite(EMOTE.oil, px, CAR_Y + 23));
    const a = S.action, f = a ? S.t - a.t0 : 0;
    let px = S.x;
    if (a && a.type === 'drive') {
      if (f >= 6 && f < 16) px = S.x + Math.round(Math.pow(f - 5, 2) * 1.2);
      else if (f >= 16 && f < 22) px = 200;
      else if (f >= 22) px = -64 + Math.round((S.x + 64) * Math.min(1, (f - 21) / 9));
    }
    if (px < 120) drawPet(px, CAR_Y, (S.moving || (a && a.type === 'drive')) ? (S.t % 2) : 0);
    // idle exhaust puff
    if (!S.asleep && S.build !== 'egg' && !a && S.t % 24 < 3) emote('puff', tailX() + (facingRight() ? -4 - (S.t % 24) : (S.t % 24)), CAR_Y + 15 - (S.t % 24));
    if (S.asleep) {
      for (let i = 0; i < 3; i++) {
        const k = (S.t + i * 8) % 24;
        buf.text('Z', S.x + 44 + i * 4 + (k >> 3), CAR_Y - 2 - k, S.mode === 'color' ? 'U' : 'K');
      }
    }
    if (!a) return;
    const ex = S.x + 40, ey = CAR_Y - 10;
    if (a.type === 'fuel') {
      buf.sprite(PROPS.pump, 1, CAR_Y + 10);
      const fx = S.x + 19, fy = CAR_Y + 11;
      for (let x = 10; x <= fx; x++) buf.set(x, Math.round(CAR_Y + 13 + Math.sin((x - 10) / (fx - 10) * Math.PI) * 4 - (x - 10) / (fx - 10) * 2), 'K');
      buf.set(fx, fy, 'K'); buf.set(fx + 1, fy, 'K');
      if (f < 16 && f % 4 < 2) buf.text('GLUG', 14, CAR_Y + 3, 'K');
      if (f >= 16) { emote('heart', ex, ey - (f - 16)); buf.text('+FUEL', 4, PY + 4, 'K'); }
    }
    if (a.type === 'drive') {
      if (f < 6) { emote('puff', tailX() - 4 - f * 2, CAR_Y + 14); emote('puff', tailX() - 8 - f, CAR_Y + 11); }
      if (f >= 6 && f < 22) for (let i = 0; i < 6; i++) { const y = PY + 6 + i * 9, x0 = (i * 37 + f * 11) % 120 - 20; buf.hline(x0, x0 + 9, y, S.mode === 'color' ? 'U' : 'K'); }
      if (f >= 14 && f < 24) buf.text('VROOM!', 30, PY + 22, 'K');
      if (f >= 26) { emote('note', ex, ey - (f - 26)); emote('note2', ex + 10, ey + 3 - (f - 26)); }
    }
    if (a.type === 'fix') {
      const wx = S.x + (facingRight() ? 50 : 8), wy = CAR_Y - 2 - (f % 4 < 2 ? 2 : 0);
      buf.sprite(EMOTE.wrench, wx, wy, { map: { '#': 'K' } });
      if (f % 3 === 0) emote('tiny', wx + 6, wy - 3);
      if (f >= 14) buf.text('+HEALTH', 4, PY + 4, 'K');
    }
    if (a.type === 'wash') {
      for (let i = 0; i < 14; i++) { const x = S.x + 2 + i * 5, y = PY + ((f * 3 + i * 7) % 40); if (f < 18) emote('drop', x, y); }
      if (f >= 6 && f < 22) for (let i = 0; i < 5; i++) emote('bubble', S.x + 6 + i * 13, CAR_Y + 4 + ((i * 5 + f) % 9));
      if (f >= 20) { emote('spark', S.x + 12, CAR_Y + 2); emote('spark', S.x + 44, CAR_Y + 6); emote('tiny', S.x + 30, CAR_Y); buf.text('+CLEAN', 4, PY + 4, 'K'); }
    }
  }

  function drawFace() {
    buf.rect(0, PY, LW, 64, S.mode === 'color' ? 'b' : '');
    const f = S.t - S.action.t0;
    const eyes = f < 5 ? 'open' : f < 9 ? 'wink' : 'happy';
    face(buf, 28, PY + 20, { eyes, mouth: f < 9 ? 'smile' : 'open' });
    for (let x = 22; x < 74; x++) buf.set(x, PY + 47, 'K');
    emote('heart', 44, PY + 9 - Math.min(4, f >> 1));
    if (f > 9) { emote('tiny', 22, PY + 14); emote('tiny', 70, PY + 18); }
  }

  function draw(canvas, scale) {
    buf.clear('');
    if (S.screen === 'gauges') drawGauges();
    else if (S.screen === 'mods') drawMods();
    else if (S.screen === 'msg') drawMsg();
    else if (S.action && S.action.type === 'pet') drawFace();
    else drawMain();
    drawIcons();
    present(canvas, buf, S.mode, S.build === 'beater' ? 'fadedRed' : S.paint, { scale: scale, bg: '#f4f6f8' });
  }

  const DUR = { fuel: 26, drive: 32, fix: 18, wash: 28, pet: 18 };

  function update() {
    S.t++;
    if (S.blink > 0) S.blink--;
    if (S.t >= S.nextBlink && !S.asleep) { S.blink = 2; S.nextBlink = S.t + 25 + Math.floor(Math.random() * 40); }
    if (S.msg && S.t > S.msg.until) { S.msg = null; S.screen = 'main'; }
    if (S.action) {
      const f = S.t - S.action.t0;
      if (f >= DUR[S.action.type]) finish(S.action.type);
      S.moving = false;
      return;
    }
    if (S.screen !== 'main' || S.asleep || S.build === 'egg') { S.moving = false; return; }
    if (S.pause > 0) { S.pause--; S.moving = false; }
    else if (S.t % 2 === 0) {
      S.x += S.dir; S.moving = true;
      if (S.x <= 3 || S.x >= 29) { S.dir *= -1; S.pause = 10; }
      else if (Math.random() < 0.02) S.pause = 8 + Math.floor(Math.random() * 12);
    }
    if (S.t % 260 === 120 && S.puddles.length < 2) {
      S.puddles.push(S.x + (facingRight() ? 50 : 8));
      S.cel = true; S.stats.clean = Math.max(0, S.stats.clean - 1);
      emit();
    }
  }

  function finish(type) {
    const st = S.stats;
    if (type === 'fuel') st.fuel = 4;
    if (type === 'drive') { st.mood = Math.min(4, st.mood + 2); st.fuel = Math.max(0, st.fuel - 1); S.path.TRACK = Math.min(6, S.path.TRACK + 1); }
    if (type === 'fix') { st.health = 4; if (!S.puddles.length) S.cel = false; }
    if (type === 'wash') { st.clean = 4; S.puddles = []; S.cel = false; S.path.CLASSIC = Math.min(6, S.path.CLASSIC + 1); }
    if (type === 'pet') st.mood = Math.min(4, st.mood + 1);
    S.action = null;
    emit();
  }

  function emit() { if (S.onChange) S.onChange(S); }

  function start(type) {
    if (S.build === 'egg') { showMsg('BARN FIND', ['STILL UNDER A TARP.', 'TAP B 3X TO PULL', 'IT OFF.']); return; }
    S.action = { type, t0: S.t };
    if (type === 'fuel') { S.dir = 1; S.x = Math.max(S.x, 14); }
    emit();
  }

  function showMsg(title, lines) { S.screen = 'msg'; S.msg = { title, lines, until: S.t + 28 }; emit(); }

  function activate(i) {
    const name = ICON_ORDER[i];
    if (S.action) return;
    if (S.screen === 'gauges' && name === 'gauge') { S.page = (S.page + 1) % 3; return emit(); }
    S.screen = 'main'; S.msg = null;
    if (name === 'garage') { S.asleep = !S.asleep; return emit(); }
    if (S.asleep && name !== 'gauge') { showMsg('SHHH...', [S.name + ' IS ASLEEP', 'IN THE GARAGE.', 'GARAGE = WAKE UP']); return; }
    if (name === 'gauge') { S.screen = 'gauges'; S.page = 0; return emit(); }
    if (name === 'mods') { S.screen = 'mods'; return emit(); }
    if (name === 'cel') {
      if (S.cel) showMsg('CHECK ENGINE', ['OIL DRIP UNDER ' + S.name + '!', 'WASH TO CLEAN IT,', 'FIX TO RESET.']);
      else showMsg('CHECK ENGINE', ['ALL GOOD.', 'NO CODES STORED.']);
      return;
    }
    start(name);
  }

  let eggTaps = 0;
  const api = {
    S, LW, LH,
    draw, update,
    press(btn) {
      if (btn === 'A') { S.sel = (S.sel + 1) % 8; if (S.screen === 'gauges') S.page = (S.page + 1) % 3; }
      if (btn === 'B') {
        if (S.build === 'egg') { if (++eggTaps >= 3) { eggTaps = 0; S.build = 'beater'; showMsg('UNCOVERED!', ["IT'S A 1990 NA6CE.", 'NEEDS SOME LOVE...']); } return emit(); }
        activate(S.sel);
      }
      if (btn === 'C') { S.screen = 'main'; S.msg = null; if (S.action && S.action.type !== 'drive') S.action = null; }
      emit();
    },
    tapIcon(i) { S.sel = i; activate(i); },
    tapPet() { if (S.screen === 'main' && !S.action && !S.asleep && S.build !== 'egg') start('pet'); if (S.build === 'egg') api.press('B'); },
    hit(lx, ly) {
      if (ly < PY) return { icon: Math.min(3, Math.floor(lx / 24)) };
      if (ly >= PY + 64) return { icon: 4 + Math.min(3, Math.floor(lx / 24)) };
      if (lx >= S.x - 2 && lx <= S.x + 66 && ly >= CAR_Y - 2 && ly <= CAR_Y + 24) return { pet: true };
      return {};
    },
    setMode(m) { S.mode = m; emit(); },
    setPaint(p) { S.paint = p; emit(); },
    setBuild(b) { S.build = b; S.asleep = false; S.action = null; S.screen = 'main'; S.msg = null; emit(); },
    label: (i) => ICON_LABEL[ICON_ORDER[i]],
  };
  G.GAME = api;
})(window);

/* Miatagotchi mock: main-screen state, animation loop and input.
   Screen: 128 x 112 (icon row, 128 x 88 play area, icon row). The pet is the 3/4 view car. */
(function (G) {
  'use strict';
  const { Buffer, present } = G.PX;
  const { car, tarp, BUILDS } = G.CAR34;
  const { ICONS, ICON_ORDER, ICON_LABEL, EMOTE, PROPS, coast } = G.UI;

  const LW = 128, PH = 88, PY = 12, LH = PY + PH + 12;
  const GROUND = PY + 82, CAR_Y = GROUND - 42, CAR_W = 84;
  const PARTS = {
    egg: ['TARP', 'FLAT TIRES', 'MOUSE NEST'],
    beater: ['STEEL WHEELS', 'PRIMER DOOR', 'LAZY POP-UP', 'RUST X9'],
    daily: ['14IN DAISIES', 'POP-UPS OK', 'FRESH OIL'],
    project: ['MESH WHEELS', 'CLUB DECAL', '-1IN DROP'],
    race: ['ROLL BAR', 'GT WING', 'SPLITTER', 'NO.5 ROUNDEL', 'TOW HOOK', 'STRIPES'],
    stance: ['AIR RIDE', 'DEEP DISH', 'BANNER', 'TSURIKAWA', 'CANARDS'],
    offroad: ['2IN LIFT', 'MUD TIRES', 'LIGHT BAR', 'SNORKEL', 'SPARE', 'FLARES'],
    collector: ['TAN BOOT', 'TRUNK RACK', 'WOOD WHEEL', 'OEM DAISIES'],
  };

  const S = {
    mode: 'color', paint: 'classicRed', build: 'daily', name: 'POPPY',
    sel: 0, screen: 'main', page: 0, t: 0,
    x: 22, dir: -1, pause: 0, moving: false, action: null, asleep: false,
    puddles: [], cel: false, blink: 0, nextBlink: 18, msg: null,
    stats: { fuel: 3, mood: 2, clean: 3, health: 4 },
    path: { TRACK: 4, STANCE: 1, SAFARI: 2, CONCOURS: 3 },
    onChange: null,
  };

  const buf = new Buffer(LW, LH);
  const tmp = new Buffer(CAR_W, 44);
  const facingLeft = () => S.dir < 0;

  function blit(src, x, y, flip) {
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
      const k = src.k[j * src.w + i];
      if (k) buf.set(x + (flip ? src.w - 1 - i : i), y + j, k);
    }
  }
  const emote = (name, x, y) => buf.sprite(EMOTE[name], x, y);

  function petSpec() {
    const base = BUILDS[S.build] || BUILDS.daily;
    const spec = Object.assign({}, base, { mods: (base.mods || []).slice() });
    const a = S.action, f = a ? S.t - a.t0 : 0;
    if (S.asleep) { spec.eyes = 'down'; spec.mouth = 'flat'; spec.top = 'soft'; }
    else if (a && a.type === 'pet') { spec.eyes = f < 5 ? 'wink' : 'happy'; spec.mouth = f < 5 ? 'smile' : 'open'; }
    else if (a && a.type === 'fix' && f < 10) { spec.eyes = 'half'; }
    else if (S.blink > 0) spec.eyes = 'blink';
    else if (S.cel && (S.t >> 4) % 2) spec.eyes = base.eyes === 'lazy' ? 'lazy' : 'half';
    if (!spec.eyes) spec.eyes = base.eyes || 'up';
    // a little suspension bounce while idling
    if (!S.asleep && !a && (S.t >> 1) % 7 === 0) spec.dy = (spec.dy || 0) - 1;
    return spec;
  }

  function drawPet(px) {
    tmp.clear('');
    tmp.sprite(S.build === 'egg' ? tarp(S.t >> 3) : car(petSpec()), 0, 0);
    blit(tmp, px, CAR_Y, !facingLeft());
  }

  function drawIcons() {
    const color = S.mode === 'color';
    if (color) { buf.rect(0, 0, LW, PY, 'P'); buf.rect(0, PY + PH, LW, LH - PY - PH, 'P'); }
    ICON_ORDER.forEach((name, i) => {
      const x = (i % 4) * 32 + 11, y = i < 4 ? 1 : PY + PH + 2;
      let ink = '#';
      if (name === 'cel') ink = S.cel ? ((S.t >> 2) % 2 ? '@' : (color ? 'X' : '+')) : '+';
      if (i === S.sel) { buf.rect(x - 3, y - 1, 15, 11, color ? '~' : '#'); if (!color) ink = 'P'; }
      buf.sprite(ICONS[name], x, y, { map: { '#': ink } });
    });
  }

  function heart(x, y, full) { buf.sprite(['.X.X.', 'XXXXX', 'XXXXX', '.XXX.', '..X..'], x, y, { map: { X: full ? 'X' : '+' } }); }
  function panel(title) { buf.rect(0, PY, LW, PH, 'P'); buf.rect(0, PY, LW, 10, 'K'); buf.text(title, 4, PY + 3, 'P'); }

  function drawGauges() {
    panel('GAUGES ' + (S.page + 1) + '/3  ' + ['METERS', 'CAR', 'PATH'][S.page]);
    if (S.page === 0) {
      [['FUEL', S.stats.fuel], ['MOOD', S.stats.mood], ['CLEAN', S.stats.clean], ['HEALTH', S.stats.health]].forEach(([l, v], r) => {
        buf.text(l, 8, PY + 20 + r * 15, 'K');
        for (let i = 0; i < 4; i++) heart(68 + i * 12, PY + 20 + r * 15, i < v);
      });
    } else if (S.page === 1) {
      [S.name + "   NA6CE '90", 'STAGE  ' + (BUILDS[S.build] ? BUILDS[S.build].label : 'Barn find').toUpperCase(),
        'TRAIT  SHOW-OFF', 'AGE    4 DAYS', 'ODO    41,250 MI', 'CURB   2,182 LB'].forEach((l, r) => buf.text(l, 8, PY + 17 + r * 11, 'K'));
    } else {
      Object.keys(S.path).forEach((k, r) => {
        buf.text(k, 8, PY + 20 + r * 15, 'K');
        for (let i = 0; i < 6; i++) buf.rect(64 + i * 9, PY + 20 + r * 15, 7, 5, i < S.path[k] ? 'K' : '+');
      });
    }
  }

  function drawMods() {
    panel('MODS INSTALLED');
    (PARTS[S.build] || []).forEach((p, r) => buf.text('- ' + p, 8, PY + 17 + r * 10, 'K'));
    buf.text('NEXT PART IN 2 DAYS', 8, PY + 78, '=');
  }

  function drawMsg() {
    panel(S.msg.title);
    S.msg.lines.forEach((l, r) => buf.text(l, 8, PY + 22 + r * 12, 'K'));
  }

  function drawMain() {
    const a = S.action, f = a ? S.t - a.t0 : 0;
    coast(buf, PY, a && a.type === 'drive' && f >= 6 && f < 24 ? S.t * 4 : S.t, S.asleep);
    let px = S.x;
    if (a && a.type === 'drive') {
      if (f >= 6 && f < 16) px = S.x - Math.round(Math.pow(f - 5, 2) * 1.6);
      else if (f >= 16 && f < 22) px = -200;
      else if (f >= 22) px = LW - Math.round((LW - S.x) * Math.min(1, (f - 21) / 9));
    }
    if (px > -CAR_W) drawPet(px);
    S.puddles.forEach(p => buf.sprite(EMOTE.oil, p, GROUND + 2));
    const tail = facingLeft() ? S.x + CAR_W : S.x - 4;
    if (!S.asleep && S.build !== 'egg' && !a && S.t % 26 < 4) emote('puff', tail + (facingLeft() ? (S.t % 26) * 2 : -(S.t % 26) * 2), GROUND - 14 - (S.t % 26));
    if (S.asleep) for (let i = 0; i < 3; i++) { const k = (S.t + i * 8) % 24; buf.text('Z', S.x + 60 + i * 5 + (k >> 3), CAR_Y - 2 - k, 'U'); }
    if (!a) return;
    const ex = S.x + 38, ey = CAR_Y - 12;
    if (a.type === 'fuel') {
      buf.sprite(PROPS.pump, 116, GROUND - 14);
      for (let x = S.x + 80; x <= 117; x++) buf.set(x, Math.round(GROUND - 10 + Math.sin((x - S.x - 80) / Math.max(1, 37 - S.x) * Math.PI) * 3), 'K');
      if (f < 16 && f % 4 < 2) buf.text('GLUG', 96, GROUND - 26, 'K');
      if (f >= 16) { emote('heart', ex, ey - (f - 16)); buf.text('+FUEL', 4, PY + 3, 'K'); }
    }
    if (a.type === 'drive') {
      if (f < 6) { emote('puff', tail + 2 + f * 2, GROUND - 12); emote('puff', tail + 6 + f, GROUND - 16); }
      if (f >= 6 && f < 22) for (let i = 0; i < 7; i++) { const y = PY + 50 + i * 5, x0 = LW - ((i * 41 + f * 13) % 150); buf.hline(x0, x0 + 11, y, S.mode === 'color' ? 'U' : 'q'); }
      if (f >= 14 && f < 24) buf.text('VROOM!', 50, PY + 56, 'P');
      if (f >= 26) { emote('note', ex, ey - (f - 26)); emote('note2', ex + 12, ey + 3 - (f - 26)); }
    }
    if (a.type === 'fix') {
      const wx = S.x + (facingLeft() ? 18 : CAR_W - 24), wy = CAR_Y + 4 - (f % 4 < 2 ? 3 : 0);
      buf.sprite(EMOTE.wrench, wx, wy, { map: { '#': 'K' } });
      if (f % 3 === 0) emote('tiny', wx + 7, wy - 3);
      if (f >= 12) buf.text('+HEALTH', 4, PY + 3, 'K');
    }
    if (a.type === 'wash') {
      for (let i = 0; i < 16; i++) { const x = S.x + 2 + i * 5, y = PY + 4 + ((f * 3 + i * 7) % 54); if (f < 18) emote('drop', x, y); }
      if (f >= 6 && f < 22) for (let i = 0; i < 6; i++) emote('bubble', S.x + 6 + i * 13, CAR_Y + 14 + ((i * 5 + f) % 14));
      if (f >= 20) { emote('spark', S.x + 14, CAR_Y + 12); emote('spark', S.x + 58, CAR_Y + 20); emote('tiny', S.x + 36, CAR_Y + 8); buf.text('+CLEAN', 4, PY + 3, 'K'); }
    }
    if (a.type === 'pet') {
      emote('heart', ex, ey - Math.min(5, f >> 1));
      if (f > 5) { emote('tiny', S.x + 4, CAR_Y + 4); emote('tiny', S.x + 74, CAR_Y + 2); }
    }
  }

  function draw(canvas, scale) {
    buf.clear('');
    if (S.screen === 'gauges') drawGauges();
    else if (S.screen === 'mods') drawMods();
    else if (S.screen === 'msg') drawMsg();
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
      if (S.t - S.action.t0 >= DUR[S.action.type]) finish(S.action.type);
      S.moving = false;
      return;
    }
    if (S.screen !== 'main' || S.asleep || S.build === 'egg') { S.moving = false; return; }
    if (S.pause > 0) { S.pause--; S.moving = false; }
    else if (S.t % 3 === 0) {
      S.x += S.dir; S.moving = true;
      if (S.x <= 10 || S.x >= 34) { S.dir *= -1; S.pause = 14; }
      else if (Math.random() < 0.03) S.pause = 10 + Math.floor(Math.random() * 16);
    }
    if (S.t % 260 === 120 && S.puddles.length < 2) {
      S.puddles.push(S.x + (facingLeft() ? 22 : CAR_W - 30));
      S.cel = true; S.stats.clean = Math.max(0, S.stats.clean - 1);
      emit();
    }
  }

  function finish(type) {
    const st = S.stats;
    if (type === 'fuel') st.fuel = 4;
    if (type === 'drive') { st.mood = Math.min(4, st.mood + 2); st.fuel = Math.max(0, st.fuel - 1); S.path.TRACK = Math.min(6, S.path.TRACK + 1); }
    if (type === 'fix') { st.health = 4; if (!S.puddles.length) S.cel = false; }
    if (type === 'wash') { st.clean = 4; S.puddles = []; S.cel = false; S.path.CONCOURS = Math.min(6, S.path.CONCOURS + 1); }
    if (type === 'pet') st.mood = Math.min(4, st.mood + 1);
    S.action = null;
    emit();
  }

  function emit() { if (S.onChange) S.onChange(S); }

  function start(type) {
    if (S.build === 'egg') { showMsg('BARN FIND', ['STILL UNDER A TARP.', 'PRESS B THREE TIMES', 'TO PULL IT OFF.']); return; }
    S.action = { type, t0: S.t };
    if (type === 'fuel' || type === 'drive') { S.dir = -1; S.x = Math.min(S.x, 26); }
    emit();
  }

  function showMsg(title, lines) { S.screen = 'msg'; S.msg = { title, lines, until: S.t + 30 }; emit(); }

  function activate(i) {
    const name = ICON_ORDER[i];
    if (S.action) return;
    if (S.screen === 'gauges' && name === 'gauge') { S.page = (S.page + 1) % 3; return emit(); }
    S.screen = 'main'; S.msg = null;
    if (name === 'garage') { S.asleep = !S.asleep; return emit(); }
    if (S.asleep && name !== 'gauge') { showMsg('SHHH...', [S.name + ' IS ASLEEP', 'IN THE GARAGE.', 'GARAGE AGAIN TO WAKE.']); return; }
    if (name === 'gauge') { S.screen = 'gauges'; S.page = 0; return emit(); }
    if (name === 'mods') { S.screen = 'mods'; return emit(); }
    if (name === 'cel') {
      if (S.cel) showMsg('CHECK ENGINE', ['CODE P0420: OIL DRIP', 'UNDER ' + S.name + '. WASH', 'TO CLEAN, FIX TO RESET.']);
      else showMsg('CHECK ENGINE', ['NO CODES STORED.', 'MIATA IS ALWAYS', 'THE ANSWER.']);
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
        if (S.build === 'egg') { if (++eggTaps >= 3) { eggTaps = 0; S.build = 'beater'; showMsg('UNCOVERED!', ["IT'S A 1990 NA6CE.", 'ONE POP-UP IS LAZY.', 'NEEDS SOME LOVE...']); } return emit(); }
        activate(S.sel);
      }
      if (btn === 'C') { S.screen = 'main'; S.msg = null; if (S.action && S.action.type !== 'drive') S.action = null; }
      emit();
    },
    tapIcon(i) { S.sel = i; activate(i); },
    tapPet() { if (S.build === 'egg') return api.press('B'); if (S.screen === 'main' && !S.action && !S.asleep) start('pet'); },
    hit(lx, ly) {
      if (ly < PY) return { icon: Math.min(3, Math.floor(lx / 32)) };
      if (ly >= PY + PH) return { icon: 4 + Math.min(3, Math.floor(lx / 32)) };
      if (lx >= S.x && lx <= S.x + CAR_W && ly >= CAR_Y && ly <= GROUND + 2) return { pet: true };
      return {};
    },
    setMode(m) { S.mode = m; emit(); },
    setPaint(p) { S.paint = p; emit(); },
    setBuild(b) { S.build = b; S.asleep = false; S.action = null; S.screen = 'main'; S.msg = null; emit(); },
    label: (i) => ICON_LABEL[ICON_ORDER[i]],
  };
  G.GAME = api;
})(window);

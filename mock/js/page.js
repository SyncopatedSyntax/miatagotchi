/* Miatagotchi mock: page wiring, device shell sync and sprite-sheet sections. */
(function () {
  'use strict';
  const { Buffer, PAINTS, present } = PX;
  const { drawCar, BUILDS } = ART;
  const S = GAME.S;
  const $ = (id) => document.getElementById(id);
  const dpr = () => window.devicePixelRatio || 1;

  // ---------- main screen ----------
  const lcd = $('lcd'), device = $('device');
  let scale = 4;
  function fitLcd() {
    const avail = lcd.parentElement.clientWidth - 24;
    scale = Math.max(2, Math.floor(avail * dpr() / GAME.LW));
    lcd.style.width = (GAME.LW * scale / dpr()) + 'px';
    lcd.style.height = (GAME.LH * scale / dpr()) + 'px';
  }

  function syncShell() {
    device.classList.toggle('asleep', S.asleep || S.build === 'egg');
    device.classList.toggle('blink', S.blink > 0 && !S.asleep);
    const sel = GAME.label(S.sel);
    $('hint').textContent = S.screen === 'gauges' ? 'GAUGES · A = NEXT PAGE' : sel;
  }
  function setPaintVars() {
    const p = PAINTS[S.paint];
    device.style.setProperty('--paint', p.R);
    device.style.setProperty('--paint-lo', p.r);
    device.style.setProperty('--paint-hi', p.W);
    $('paintName').textContent = p.name;
  }
  function readout() {
    const st = S.stats;
    $('readout').textContent = 'FUEL ' + st.fuel + '/4 · MOOD ' + st.mood + '/4 · CLEAN ' + st.clean + '/4 · HEALTH ' + st.health + '/4';
  }

  lcd.addEventListener('pointerdown', (e) => {
    const r = lcd.getBoundingClientRect();
    const hit = GAME.hit((e.clientX - r.left) / r.width * GAME.LW, (e.clientY - r.top) / r.height * GAME.LH);
    if (hit.icon !== undefined) GAME.tapIcon(hit.icon);
    else if (hit.pet) GAME.tapPet();
  });
  ['A', 'B', 'C'].forEach((k) => $('btn' + k).addEventListener('click', () => GAME.press(k)));
  document.addEventListener('keydown', (e) => {
    const k = e.key.toUpperCase();
    if ((k === 'A' || k === 'B' || k === 'C') && !e.metaKey && !e.ctrlKey && document.activeElement.tagName !== 'INPUT') GAME.press(k);
  });

  // ---------- controls ----------
  function setMode(m) {
    GAME.setMode(m);
    $('modeColor').setAttribute('aria-pressed', String(m === 'color'));
    $('modeLcd').setAttribute('aria-pressed', String(m === 'lcd'));
    renderSheets();
  }
  $('modeColor').addEventListener('click', () => setMode('color'));
  $('modeLcd').addEventListener('click', () => setMode('lcd'));

  const PAINT_ORDER = ['classicRed', 'marinerBlue', 'crystalWhite', 'silverStone', 'brg', 'sunburst', 'brilliantBlack', 'laguna', 'montego', 'merlot'];
  PAINT_ORDER.forEach((key) => {
    const b = document.createElement('button');
    b.className = 'swatch'; b.style.background = PAINTS[key].R;
    b.setAttribute('aria-label', PAINTS[key].name); b.title = PAINTS[key].name;
    b.setAttribute('aria-pressed', String(key === S.paint));
    b.addEventListener('click', () => {
      GAME.setPaint(key); setPaintVars();
      document.querySelectorAll('.swatch').forEach((s) => s.setAttribute('aria-pressed', String(s === b)));
      renderSheets();
    });
    $('swatches').appendChild(b);
  });

  const STAGES = [['egg', 'Barn find'], ['beater', 'Beater'], ['daily', 'Daily'], ['project', 'Project'], null,
    ['race', 'Track'], ['stance', 'Stance'], ['offroad', 'Safari'], ['collector', 'Concours']];
  STAGES.forEach((s) => {
    if (!s) { const sep = document.createElement('span'); sep.className = 'sep'; sep.textContent = '→'; $('stages').appendChild(sep); return; }
    const b = document.createElement('button');
    b.className = 'chip'; b.textContent = s[1]; b.dataset.k = s[0];
    b.setAttribute('aria-pressed', String(s[0] === S.build));
    b.addEventListener('click', () => GAME.setBuild(s[0]));
    $('stages').appendChild(b);
  });

  S.onChange = () => {
    readout();
    document.querySelectorAll('#stages .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.k === S.build)));
  };

  // ---------- static sprite sheets ----------
  function paintStatic(canvas, buf, mode, paint, extra) {
    const host = canvas.parentElement;
    const avail = Math.max(120, host.clientWidth - 2);
    const n = Math.max(1, Math.min(Math.floor(avail * dpr() / buf.w), Math.round(8 * dpr())));
    present(canvas, buf, mode, paint, Object.assign({ scale: n, bg: '#dcebf4' }, extra || {}));
    canvas.style.width = (buf.w * n / dpr()) + 'px';
    canvas.style.height = (buf.h * n / dpr()) + 'px';
  }
  function blit(dst, src, x, y, flip) {
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
      const k = src.k[j * src.w + i];
      if (k) dst.set(x + (flip ? src.w - 1 - i : i), y + j, k);
    }
  }
  function carBuf(spec, w, h) { const b = new Buffer(w || 72, h || 30); drawCar(b, 4, 4, spec, 0); return b; }

  function renderSheets() {
    const mode = S.mode;
    const big = new Buffer(CAR34.W + 4, CAR34.H + 2); big.sprite(CAR34.car({ eyes: 'up' }), 2, 1);
    paintStatic($('bigColor'), big, 'color', S.paint);
    paintStatic($('bigLcd'), big, 'lcd', S.paint);
    const side = Object.assign({}, BUILDS.daily, { lights: 'up' });
    paintStatic($('sideColor'), carBuf(side), 'color', S.paint);
    paintStatic($('sideLcd'), carBuf(side), 'lcd', S.paint);

    const faces = $('faces');
    if (!faces.children.length) {
      [['up', 'smile', 'awake'], ['down', 'flat', 'asleep'], ['wink', 'smile', 'wink'], ['happy', 'open', 'happy'], ['half', 'flat', 'sleepy'], ['x', 'flat', 'broke down']]
        .forEach(([e, m, l]) => {
          const f = document.createElement('figure');
          const c = document.createElement('canvas'); c.dataset.eyes = e; c.dataset.mouth = m;
          const cap = document.createElement('figcaption'); cap.textContent = l;
          f.appendChild(c); f.appendChild(cap); faces.appendChild(f);
        });
    }
    faces.querySelectorAll('canvas').forEach((c) => {
      const b = new Buffer(CAR34.W + 4, CAR34.H + 2);
      b.sprite(CAR34.car({ eyes: c.dataset.eyes, mouth: c.dataset.mouth, top: c.dataset.eyes === 'down' ? 'soft' : 'down' }), 2, 1);
      paintStatic(c, b, mode, S.paint);
    });

    const tl = $('timeline');
    if (!tl.children.length) {
      [['egg', 'Barn find', 'Hatches from under a tarp.'], ['beater', 'Beater', 'Steel wheels, rust, a primer door.'],
        ['daily', 'Daily', 'Cleaned up, pop-ups working.'], ['project', 'Project', 'First bolt-ons. Your habits pick the path.']]
        .forEach(([k, t, d]) => {
          const fr = document.createElement('div'); fr.className = 'frame';
          fr.innerHTML = '<canvas data-k="' + k + '"></canvas><h3>' + t + '</h3><p class="cap">' + d + '</p>';
          tl.appendChild(fr);
        });
      [['race', 'Track', 'Autocross wins, canyon runs, track days.', 'Roll bar, GT wing, stripes, splitter, number roundel, tow hook.'],
        ['stance', 'Stance', 'Car meets, photo shoots, polishing.', 'Air ride, deep-dish wheels, windshield banner, tsurikawa ring.'],
        ['offroad', 'Safari', 'Dirt roads, camping trips, getting muddy.', 'Lift, mud tires, flares, light bar, snorkel, spare on the trunk.'],
        ['collector', 'Concours', 'Washing, garage nights, keeping it original.', 'Tan boot, chrome trunk rack, wood wheel, factory wheels.']]
        .forEach(([k, t, earn, parts]) => {
          const fr = document.createElement('div'); fr.className = 'frame path';
          fr.innerHTML = '<canvas data-k="' + k + '"></canvas><h3>' + t + '</h3><p class="cap"><b>Parts:</b> ' + parts + '</p><p class="tag">GROWS FROM: ' + earn.toUpperCase() + '</p>';
          $('paths').appendChild(fr);
        });
    }
    document.querySelectorAll('#timeline canvas, #paths canvas').forEach((c) => {
      const k = c.dataset.k;
      const b = new Buffer(CAR34.W + 4, CAR34.H + 2);
      b.sprite(k === 'egg' ? CAR34.tarp(0) : CAR34.car(CAR34.BUILDS[k]), 2, 1);
      const paint = k === 'beater' ? 'fadedRed' : (CAR34.BUILDS[k] && CAR34.BUILDS[k].paint) || S.paint;
      paintStatic(c, b, mode, (k === 'daily' || k === 'project') ? S.paint : paint);
    });

    renderMeet($('meetColor'), 'color');
    renderMeet($('meetLcd'), 'lcd');
  }

  function bubble(b, x, y, emote) {
    const w = 13, h = 10;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const corner = (i === 0 || i === w - 1) && (j === 0 || j === h - 1);
      if (corner) continue;
      const edge = i === 0 || j === 0 || i === w - 1 || j === h - 1;
      b.set(x + i, y + j, edge ? 'K' : 'P');
    }
    b.set(x + 5, y + h, 'K'); b.set(x + 6, y + h, 'P'); b.set(x + 7, y + h, 'K'); b.set(x + 6, y + h + 1, 'K');
    b.sprite(UI.EMOTE[emote], x + 3, y + 2);
  }

  function renderMeet(canvas, mode) {
    const W = 150, H = 46, b = new Buffer(W, H);
    b.rect(0, 0, W, 34, 'b'); b.rect(0, 34, W, 12, 'N'); for (let x = 70; x < 80; x++) b.set(x, 41, 'Y');
    const left = new Buffer(72, 30), right = new Buffer(72, 30);
    drawCar(left, 4, 2, Object.assign({}, BUILDS.daily, { lights: 'up' }), 0);
    drawCar(right, 4, 2, Object.assign({}, BUILDS.stance, { lights: 'up', alt: true }), 0);
    blit(b, left, -3, 12, false);
    blit(b, right, W - 69, 12, true);
    bubble(b, 52, 1, 'heart');
    bubble(b, 86, 1, 'note');
    paintStatic(canvas, b, mode, S.paint, { paint2: 'laguna', bg: '#dcebf4' });
  }

  // ---------- boot ----------
  function frame() { GAME.update(); GAME.draw(lcd, scale); syncShell(); }
  fitLcd(); setPaintVars(); readout(); renderSheets();
  GAME.draw(lcd, scale);
  let timer = setInterval(frame, 125);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { fitLcd(); renderSheets(); }, 120); });
  document.addEventListener('visibilitychange', () => {
    clearInterval(timer);
    if (!document.hidden) timer = setInterval(frame, 125);
  });
})();

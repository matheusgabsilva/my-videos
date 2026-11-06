// sheets.js: Model sheets for Clawd and Treco, as standalone loops.
// Reference sheets for visual testing:
//   studio.html?loop=views
//   studio.html?loop=emotions
//   studio.html?loop=treco_views
//   studio.html?loop=treco_emotions
// Or render via render.mjs:
//   node render.mjs --loop=treco_emotions --sheet=1 --cols=1 --w=1920 --out=docs/treco_emotions.jpg
//   node render.mjs --loop=treco_views --sheet=1 --cols=1 --w=1920 --out=docs/treco_views.jpg

(() => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: 0.85 });
  const floor = (y, x0 = 0, x1 = W) => inkLine([[x0 + 40, y + 6], [W / 2, y + 4], [x1 - 40, y + 7]], 0.6, mixCol(PAL.paper, PAL.ink, 0.35), 'inkfine', 0.5);

  // ==========================================
  // CLAWD MODEL SHEETS
  // ==========================================

  // Every emotion in EMO for Clawd, alive.
  LOOPS.emotions = t => {
    const names = Object.keys(EMO), cols = 8, cw = W / cols, ch = H / 4;
    names.forEach((name, i) => {
      const cx = cw * (i % cols) + cw / 2, gy = ch * Math.floor(i / cols) + ch - 58;
      clawd(cx, gy, 11, feel(name, t, { seed: i }));
      label(name, cx, gy + 32);
    });
    for (let r = 0; r < 4; r++) floor(ch * r + ch - 58);
  };
  LOOPS.emotions.len = 4;

  // Views, motion helpers, hats for Clawd.
  LOOPS.views = t => {
    // row 1: the five key views (flip any of them to face left)
    const views = ['front', 'q', 'side', 'qback', 'back'];
    views.forEach((v, i) => {
      const x = 240 + i * 360;
      clawd(x, 420, 19, { ...feel('neutral', t, { seed: i }), view: v });
      label(v, x, 462, 24);
    });
    floor(420);

    // row 2: motion
    const y2 = 730, u2 = 13, row = [
      ['walk (side)', x => clawd(x, y2, u2, { ...move('walk', t), view: 'side' })],
      ['turn / spinView', x => clawd(x, y2, u2, { ...feel('happy', t), ...spinView(Math.floor(t * 2) / 8) })],
      ['smear', x => clawd(x, y2, u2, { ...feel('excited', t), view: 'side', smear: 0.8, smearDir: 1, dx: Math.sin(t * TAU / 2) * 0.3 })],
      ['jump', x => { const k = t % 1.5; clawd(x, y2, u2, { ...feel('happy', t), ...jump(k, 0.35, 0.95, 3) }); }],
      ['take', x => clawd(x, y2, u2, { ...feel('surprised', t), ...take(t % 2, 0.5, 1.2), emoteAge: (t % 2) - 0.5, emoteK: seg(t % 2, 0.5, 0.7) })],
      ['lid', x => clawd(x, y2, u2, { ...feel('laugh', t), mouth: null, lid: 0.35 + 0.3 * Math.abs(Math.sin(t * TAU * 1.5)) })],
    ];
    row.forEach(([name, f], i) => { const x = 180 + i * 312; f(x); label(name, x, y2 + 38); });
    floor(y2);

    // row 3: hats
    const hats = ['party', 'hard', 'crown', 'halo', 'wizard', 'top', 'fedora', 'band', 'beanie', 'bow', 'flower', 'headphones', 'cat', 'masq', 'bowtie'];
    hats.forEach((h, i) => {
      const x = 82 + i * 125.5;
      clawd(x, 985, 8, { ...feel('neutral', t, { seed: i }), hat: h });
      label(h, x, 1015, 17);
    });
    floor(985);
  };
  LOOPS.views.len = 4;

  // ==========================================
  // TRECO MODEL SHEETS ("O Cara do T.I")
  // ==========================================

  // All 31 emotions of Treco, floating and expressive.
  LOOPS.treco_emotions = t => {
    const names = Object.keys(TRECO_EMO), cols = 8, cw = W / cols, ch = H / 4;
    names.forEach((name, i) => {
      const cx = cw * (i % cols) + cw / 2;
      const gy = ch * Math.floor(i / cols) + ch - 54;
      treco(cx, gy, 10.5, trecoFeel(name, t, { seed: i }));
      label(name, cx, gy + 32, 19);
    });
    for (let r = 0; r < 4; r++) floor(ch * r + ch - 54);
  };
  LOOPS.treco_emotions.len = 4;

  // Views, floating motion helpers, and RJ45 cable mood thermometer for Treco.
  LOOPS.treco_views = t => {
    // Row 1: The 5 key 2D views of Treco (demonstrating floating, asymmetry, single tooth, cable)
    const views = ['front', 'q', 'side', 'qback', 'back'];
    views.forEach((v, i) => {
      const x = 240 + i * 360;
      treco(x, 410, 18, { ...trecoFeel('neutral', t, { seed: i }), view: v });
      label(`${v} view`, x, 458, 24);
    });
    floor(410);

    // Row 2: Floating motion & physics (without legs, clumsy hover dynamics)
    const y2 = 720, u2 = 12.5;
    const motionRow = [
      ['hover / idle', x => treco(x, y2, u2, { ...trecoMove('hover', t), view: 'front' })],
      ['glide (walk)', x => treco(x, y2, u2, { ...trecoMove('walk', t), view: 'side' })],
      ['turn / spinView', x => treco(x, y2, u2, { ...trecoFeel('happy', t), ...spinView(Math.floor(t * 2) / 8) })],
      ['smear', x => treco(x, y2, u2, { ...trecoFeel('excited', t), view: 'side', smear: 0.8, smearDir: 1, dx: Math.sin(t * TAU / 2) * 0.3 })],
      ['soar / hop', x => { const k = t % 1.5; treco(x, y2, u2, { ...trecoFeel('happy', t), ...jump(k, 0.35, 0.95, 3.2) }); }],
      ['take (bug shock)', x => treco(x, y2, u2, { ...trecoFeel('surprised', t), ...take(t % 2, 0.5, 1.2), emoteAge: (t % 2) - 0.5, emoteK: seg(t % 2, 0.5, 0.7) })],
    ];
    motionRow.forEach(([name, f], i) => {
      const x = 180 + i * 312;
      f(x);
      label(name, x, y2 + 38, 20);
    });
    floor(y2);

    // Row 3: RJ45 cable mood thermometer & T.I. reactions showcase
    const y3 = 985, u3 = 9.5;
    const moodRow = [
      ['RJ45: perk (idea)', x => treco(x, y3, u3, { ...trecoFeel('idea', t, { seed: 1 }), cableMood: 'perk' })],
      ['RJ45: droop (sad)', x => treco(x, y3, u3, { ...trecoFeel('sad', t, { seed: 2 }), cableMood: 'droop' })],
      ['RJ45: alert (query)', x => treco(x, y3, u3, { ...trecoFeel('thinking', t, { seed: 3 }), cableMood: 'alert' })],
      ['Single Tooth Grin', x => treco(x, y3, u3, { ...trecoFeel('happy', t, { seed: 4 }) })],
      ['Unequal Eyes (atrapalhado)', x => treco(x, y3, u3, { ...trecoFeel('confused', t, { seed: 5 }) })],
      ['Cool Shades', x => treco(x, y3, u3, { ...trecoFeel('cool', t, { seed: 6 }) })],
      ['Furious (server down)', x => treco(x, y3, u3, { ...trecoFeel('furious', t, { seed: 7 }) })],
      ['Bug Found?!', x => treco(x, y3, u3, { ...trecoFeel('scared', t, { seed: 8 }) })],
    ];
    moodRow.forEach(([name, f], i) => {
      const x = 120 + i * 240;
      f(x);
      label(name, x, y3 + 36, 15);
    });
    floor(y3);
  };
  LOOPS.treco_views.len = 4;
})();

// treco.js: Treco, o mascote de T.I. do canal "O Cara do T.I".
// Pintado em estilo 2D artesanal, com linhas que fervem (boil) a 12 fps e estética handmade.
// Características refinadas:
//   - Monstrinho azul escuro (#1E4FA8 / #153A7A / #0F2A5C), simpático e atrapalhado.
//   - Corpo mais gordinho (proporção ~1.3:1 largura:altura), cantos bem arredondados e formato bambo artesanal.
//   - SEM linha vertical divisória nas vistas Q e QBack (corpo contínuo de monstrinho).
//   - SEM PERNAS NEM PÉS: ele FLUTUA com suave balanço e 3 tracinhos curtos de sopro embaixo.
//   - Dois bracinhos expressivos em alturas assimétricas (no flanco do corpo na vista lateral).
//   - Olhos desiguais POR PADRÃO em todas as emoções: esquerdo ~1.5x maior que o direito, pupilas desalinhadas.
//   - Boca larga e torta VISÍVEL POR PADRÃO (inclusive no neutral/idle), com UM dente branco bem evidente.
//   - Cabo de rede grosso (#0F2A5C) em curva S na cabeça, terminando em um conector RJ45 grande (#F5A623)
//     com 5 contatos dourados (#C77F0A) na ponta e presilha na base (termômetro de humor).
//   - Sombra elíptica no chão separada do corpo, que varia com a flutuação.

let TRECO_N = 0;

// Paleta oficial do Treco
const TRECO_PAL = {
  body: '#1E4FA8',        // azul principal do corpo
  dark: '#153A7A',        // sombra inferior / profundidade
  light: '#285FBE',       // destaque suave difuso
  ink: '#0F2A5C',         // contorno e tinta do cabo
  rj45: '#F5A623',        // conector RJ45 (laranja vibrante)
  rj45Gold: '#C77F0A',    // contatos metálicos dourados
  rj45Clip: '#D4850E',    // trava/presilha do conector
  tooth: '#FFFFFF',       // dente branco solitário
  mouthDark: '#0A1835',   // cavidade da boca
  sopro: '#689EF8',       // tracinhos de sopro / sustentação
  cream: '#FFF5E2',       // brilho das pupilas
  blush: '#E27A92',       // rubor
  shadow: '#1F2550',      // sombra no chão
};

// ---------- Views 2D do Treco ----------
// Proporção gordinha (~1.3:1): largura ~10.4u, altura ~7.8u.
// Flutuação: corpo de y = -9.6u até y = -1.8u. Sombra no chão em y = 0.
const TRECO_VIEWS = {
  front: {
    L: -5.3, R: 5.1,
    face: { cx: 0, fw: 1, sides: [-1, 1], mx: 0.1, bx: 3.9 },
    cable: { x: -0.3, y: -9.6, dir: 1 },
    arms: [[-5.3, -1, 'L', 0, -5.4], [5.1, 1, 'R', 0, -4.3]],
  },
  q: {
    L: -5.2, R: 5.2,
    face: { cx: 1.3, fw: 0.8, sides: [-1, 1], mx: 0.8, bx: 3.7 },
    cable: { x: 0.5, y: -9.6, dir: 1 },
    arms: [[5.2, 1, 'R', 2, -4.2], [-5.0, -1, 'L', 1, -5.3]],
  },
  side: {
    L: -3.8, R: 3.8,
    face: { cx: 1.3, fw: 0.65, sides: [1], mx: 1.7, bx: 1.6 },
    cable: { x: -0.2, y: -9.7, dir: -1 },
    // Braço claramente no flanco do corpo, atrás do centro (x = -1.5u), evitando parecer nariz ou boca!
    arms: [[-1.5, 0, 'L', 1, -4.8]],
  },
  qback: {
    L: -5.2, R: 5.2,
    face: null,
    cable: { x: -0.4, y: -9.6, dir: -1 },
    arms: [[-5.1, -1, 'R', 2, -4.3], [5.0, 1, 'L', 1, -5.3]],
  },
  back: {
    L: -5.3, R: 5.1,
    face: null, back: true,
    cable: { x: 0.2, y: -9.6, dir: -1 },
    arms: [[-5.2, -1, 'R', 0, -4.3], [5.3, 1, 'L', 0, -5.4]],
  },
};

// Tints para alterações de humor
const TRECO_TINT = {
  pale: '#D4E2FA',
  flush: '#C23652',
  blue: '#4361EE',
  rosy: '#E27A92',
  green: '#5A9E72',
  gold: '#F0BE46',
  dark: '#0A1833',
};

function trecoTintCols(o) {
  const c = { col: o.col || TRECO_PAL.body, dk: o.dk || TRECO_PAL.dark, lt: o.lt || TRECO_PAL.light };
  const tc = o.tint && (TRECO_TINT[o.tint] || TINT[o.tint] || o.tint), k = clamp(o.tintK ?? 1);
  if (!tc || k <= 0) return c;
  return {
    col: mixCol(c.col, tc, 0.5 * k),
    dk: mixCol(c.dk, mixCol(tc, TRECO_PAL.ink, 0.4), 0.5 * k),
    lt: mixCol(c.lt, mixCol(tc, '#FFFFFF', 0.3), 0.4 * k),
  };
}

// ---------- Função Principal de Desenho do Treco ----------
function treco(x, y, u, o = {}) {
  const id = o.boilKey ?? ++TRECO_N;
  const rs = part => boilSeed(`treco ${id} ${part}`);
  x += (o.dx || 0) * u;

  const V = TRECO_VIEWS[o.view] || TRECO_VIEWS.front;
  const dy = (o.dy || 0) * u;
  const sq = (o.sq || 0) + (o.take || 0);
  const sm = clamp(o.smear || 0);
  const sw = clamp(u / 14, 0.5, 2.5) * (o.swMul || 1);
  const J = u * 0.08;
  const { col, dk, lt } = trecoTintCols(o);

  // Inclinação desajeitada característica (~ -4 graus) com balanço suave
  const baseRot = -0.07;
  const hoverWobble = Math.sin(T * 3.5 + id) * 0.035;
  const totalRot = (o.rot || 0) + baseRot + hoverWobble;

  // 1. Sombra elíptica no chão (SEPARADA do corpo)
  rs('shadow');
  if (!o.noShadow) {
    const heightFactor = clamp(1 + dy / (11 * u), 0.35, 1.35);
    const shadowW = ((V.R - V.L) * 0.54 * heightFactor) * u;
    const shadowH = (1.25 * heightFactor) * u;
    const shadowAlpha = Math.round(clamp(135 * heightFactor, 40, 175));

    paint(ellPts(x, y + u * 0.15, shadowW, shadowH, 22, J * 0.4), {
      wash: TRECO_PAL.shadow,
      washOp: shadowAlpha,
      ink: null,
    });
  }

  // 2. Pequenas nuvenzinhas / rajadas de ar curtas e mais grossas abaixo do corpo (afastadas da sombra)
  rs('sopro');
  const showSopro = o.sopro ?? true;
  if (showSopro && !o.noSopro) {
    const puffPhase = T * 7 + id;
    const puffOffsets = [-1.8, 0.0, 1.8];
    puffOffsets.forEach((ox, idx) => {
      const pPulse = Math.sin(puffPhase + idx * 1.7);
      const px = x + ox * u + (idx === 1 ? 0.15 : -0.15) * u;
      const py = y + dy - 1.35 * u + pPulse * 0.12 * u; // bem acima da sombra (afastado), logo abaixo do corpo
      const pw = (1.1 + 0.25 * pPulse) * u;
      const ph = (0.5 + 0.12 * pPulse) * u;
      // Nuvenzinha horizontal macia com leve contorno a tinta (claramente nuvem/rajada de ar, não perna)
      const puffPts = ellPts(px, py, pw, ph, 14, J * 0.3);
      paint(puffPts, {
        wash: '#A4C8FF',
        washOp: Math.round(clamp(150 + 60 * pPulse, 90, 220)),
        ink: TRECO_PAL.ink,
        sw: sw * 0.45,
      });
      // Detalhe interno de ar/vapor
      paint(ellPts(px - pw * 0.15, py - ph * 0.1, pw * 0.45, ph * 0.45, 10), {
        wash: '#FFFFFF',
        washOp: 160,
        ink: null,
      });
    });
  }

  // 3. Efeito smear para movimentos velozes
  if (sm > 0.05) {
    trecoSmear(x, y + dy, u, V, sm, o.smearDir ?? (o.flip ? -1 : 1), col);
  }

  // 4. Desenho do Corpo e Membros no Espaço Local
  push();
  translate(x, y + dy);
  if (totalRot) rotate(totalRot);
  scale(
    (o.flip ? -1 : 1) * (o.sx ?? 1) * (1 + sq * 0.45) * (1 + sm * 0.3),
    (o.sy ?? 1) * (1 - sq)
  );

  // Braços mais expressivos do Treco
  const drawArm = ([px, dir, which, layer, armY]) => {
    rs('arm' + which);
    const a = which === 'L' ? (o.aL ?? 0.2) : (o.aR ?? 0.2);
    const hook = which === 'L' ? o.armL : o.armR;

    push();
    translate(px * u, armY * u);

    if (dir === 0) {
      // Perfil (no flanco do corpo, bem atrás do centro, apontando para baixo/ao longo do corpo)
      rotate(1.1 - a * 0.8);
      const armW = 2.4 * u, armH = 1.15 * u;
      const armShape = rrPts(0, -armH / 2, armW, armH, 0.55 * u, J * 0.5);
      paint(armShape, { wash: col, washOp: 255, ink: TRECO_PAL.ink, sw: sw * 0.9 });
      if (hook) { translate(armW * 0.9, 0); hook(u, sw); }
    } else {
      rotate(dir < 0 ? a : -a);
      const armW = 2.8 * u, armH = 1.35 * u;
      const ax = dir < 0 ? -armW : 0;
      const armShape = rrPts(ax, -armH / 2, armW, armH, 0.65 * u, J * 0.5);
      paint(armShape, {
        wash: layer === 2 ? mixCol(col, dk, 0.35) : col,
        washOp: 255,
        ink: TRECO_PAL.ink,
        sw: sw * 0.9,
      });
      if (hook) { translate(dir * armW * 0.9, 0); if (dir < 0) scale(-1, 1); hook(u, sw); }
    }
    pop();
  };

  // Braços de trás (camada 0 e 2)
  V.arms.filter(a => a[3] !== 1).forEach(drawArm);

  // CORPO DO TRECO: Mais gordinho, proporção ~1.3:1, cantos bem arredondados e formato bambo artesanal
  rs('body');
  const L = V.L * u, R = V.R * u;
  const bodyW = R - L;
  const bodyH = 7.8 * u;
  const bodyTop = -9.6 * u;
  const radius = 2.8 * u;

  // Gerador de contorno de monstrinho com leves imperfeições artesanais ("bambo")
  const bodyPts = trecoBodyShape(L, bodyTop, bodyW, bodyH, radius, J);

  // Preenchimento base azul escuro #1E4FA8 (rápido e sem gargalo de iGPU)
  paint(bodyPts, { wash: col, washOp: 255, ink: null, curv: 0.35 });

  // Sombra suave na base do corpo (#153A7A)
  const shadowH = 2.4 * u;
  const shadowPts = rrPts(L + 0.3 * u, bodyTop + bodyH - shadowH - 0.2 * u, bodyW - 0.6 * u, shadowH, 2.0 * u, J * 0.5);
  paint(shadowPts, { wash: dk, washOp: 190, ink: null });

  // Destaque suave e difuso na parte superior (sem brilho liso tipo cápsula)
  const lightPts = ellPts((L + R) * 0.5 - 0.6 * u, bodyTop + 1.4 * u, bodyW * 0.32, 0.9 * u, 16, J * 0.6, -0.05);
  paint(lightPts, { wash: lt, washOp: 70, ink: null });

  // NOTA: SEM NENHUMA LINHA VERTICAL OU SEAM NAS VISTAS Q E QBACK! O corpo do Treco é contínuo e orgânico.

  // Contorno a tinta do monstrinho (#0F2A5C)
  paint(bodyPts, { ink: TRECO_PAL.ink, sw, curv: 0.35 });

  // Rosto do Treco
  if (V.face) {
    const F = V.face;
    push();
    translate(F.cx * u, 0);
    scale(F.fw, 1);

    // Rubor
    if (o.blush) {
      trecoBlush(u, sw, F, o.blush === true ? 1 : o.blush);
    }

    // Olhos desiguais por padrão (esquerdo ~1.5x maior que o direito)
    rs('eyes');
    trecoEyes(u, o, sw, F.sides, sm);

    // Boca com dente solitário (visível por padrão inclusive no idle/neutral!)
    rs('mouth');
    push();
    translate(F.mx * u, 0);
    const currentMouth = o.mouth || 'default';
    trecoMouth(u, currentMouth, sw);
    pop();

    pop();
  }

  // Cabo de Rede Grosso + Conector RJ45 Grande com 5 Contatos
  rs('cable');
  drawRj45Cable(u, sw, V, o);

  // Braços da frente (camada 1)
  V.arms.filter(a => a[3] === 1).forEach(drawArm);

  // Custom draw hook
  rs('draw');
  if (o.draw) o.draw(u, sw);

  pop();

  // Emotes no topo da cabeça
  rs('emote');
  if (o.emote) {
    const top = EMOTE_TOP.includes(o.emote), dir = o.flip ? -1 : 1;
    const ex = top ? x + dir * (V.cable?.x || 0) * u : x + dir * (V.R + 0.6) * u;
    const ey = y + dy + (top ? -14.0 : -9.6) * u * (1 - sq);
    emote(o.emote, ex, ey, u * 0.9, o.emoteK ?? 1, o.emoteAge ?? T);
  }
  rs('after');
}

// Gera o contorno com proporção ~1.3:1 e leve assimetria orgânica ("bambo")
function trecoBodyShape(x, y, w, h, r, j = 0) {
  const p = [];
  const seg = 5;
  // Cantos arredondados com leve assimetria artesanal
  const addCorner = (cx, cy, rX, rY, a0) => {
    for (let i = 0; i <= seg; i++) {
      const a = a0 + (i / seg) * (Math.PI / 2);
      p.push([cx + Math.cos(a) * rX + jit(j), cy + Math.sin(a) * rY + jit(j)]);
    }
  };

  // Topo-direito
  addCorner(x + w - r, y + r, r * 0.96, r * 0.96, -Math.PI / 2);
  // Base-direita (barriguinha suavemente mais estufada)
  addCorner(x + w - r + 0.2 * (w / 10), y + h - r, r * 1.05, r * 1.05, 0);
  // Base-esquerda
  addCorner(x + r, y + h - r, r * 1.02, r * 1.02, Math.PI / 2);
  // Topo-esquerdo
  addCorner(x + r, y + r, r * 0.95, r * 0.95, Math.PI);

  return p;
}

// ---------- OLHOS DESIGUAIS POR PADRÃO (Esquerdo ~1.5x Maior) ----------
function trecoEyes(u, o, sw, sides, smear = 0) {
  const kinds = Array.isArray(o.eyes)
    ? o.eyes
    : o.eyes === 'wink'
    ? ['happy', 'normal']
    : [o.eyes || 'normal', o.eyes || 'normal'];

  const sqz = clamp(o.squint || 0);

  if (smear > 0.5) {
    for (const s of sides) {
      const isLeft = s < 0;
      const ex = isLeft ? -2.3 * u : 2.2 * u;
      const lineLen = isLeft ? 1.4 * u : 0.95 * u;
      inkLine([[ex - lineLen, -6.6 * u], [ex + lineLen, -6.6 * u]], sw * 1.4, TRECO_PAL.ink, 'ink', 0);
    }
    return;
  }

  if (sqz > 0.8) {
    for (const s of sides) {
      const isLeft = s < 0;
      const ex = isLeft ? -2.3 * u : 2.2 * u;
      const lineLen = isLeft ? 1.2 * u : 0.8 * u;
      inkLine([[ex - lineLen, -6.6 * u], [ex + lineLen, -6.6 * u]], sw * 1.1, TRECO_PAL.ink, 'ink', 0);
    }
    return;
  }

  if (kinds[0] === 'shades') {
    trecoShades(u, sw, sides);
    return;
  }

  for (const s of sides) {
    const isLeft = s < 0;
    // O olho esquerdo fica em -2.3u, e o direito em +2.2u
    const cx = isLeft ? -2.3 * u : 2.2 * u;
    const cy = isLeft ? -6.7 * u : -6.5 * u;
    const kind = kinds[isLeft ? 0 : 1];

    push();
    translate(cx, cy);
    trecoSingleEye(kind, isLeft, u, o, sw);
    pop();
  }
}

// Desenha o olho individual mantendo a assimetria exata de ~1.5x
function trecoSingleEye(kind, isLeft, u, o, sw) {
  const lookX = (o.lookX || 0) * u * 0.45;
  const lookY = (o.lookY || 0) * u * 0.4;

  // Dimensões do olho: esquerdo ~1.5x maior que o direito!
  // Esquerdo: 1.65u x 2.25u | Direito: 1.1u x 1.5u
  const rw = isLeft ? 1.65 * u : 1.1 * u;
  const rh = isLeft ? 2.25 * u : 1.5 * u;

  // Sobrancelha: ângulos bem diferentes
  const browY = -rh * 0.65 - 0.25 * u;
  const browW = rw * 0.65;
  const browAngle = isLeft ? 0.22 : -0.38;

  push();
  translate(0, browY);
  rotate(browAngle + (o.browTilt || 0));
  inkLine([[-browW, 0], [browW, -0.15 * u]], sw * 0.75, TRECO_PAL.ink, 'ink', 0.2);
  pop();

  // Piscar automático
  const blink = ['normal', 'look', 'wide'].includes(kind) && ((T * 0.85 + (o.seed || 0) * 1.6) % 3.4) < 0.12;
  if (blink) {
    inkLine([[-rw * 0.55, 0], [rw * 0.55, 0]], sw * 1.1, TRECO_PAL.ink, 'ink', 0);
    return;
  }

  switch (kind) {
    case 'happy':
      inkLine([[-rw * 0.55, rh * 0.25], [0, -rh * 0.35], [rw * 0.55, rh * 0.25]], sw * 1.25, TRECO_PAL.ink, 'ink', 0.3);
      break;

    case 'closed':
      inkLine([[-rw * 0.55, 0], [0, rh * 0.3], [rw * 0.55, 0]], sw * 1.15, TRECO_PAL.ink, 'ink', 0.3);
      break;

    case 'sleepy':
      paint(ellPts(0, 0, rw * 0.92, rh * 0.88, 14), { wash: TRECO_PAL.cream, ink: TRECO_PAL.ink, sw: sw * 0.6 });
      paint(ellPts(lookX * 0.6, lookY * 0.5 + 0.15 * u, rw * 0.45, rh * 0.45, 10), { wash: TRECO_PAL.ink, ink: null });
      inkLine([[-rw * 0.6, -rh * 0.1], [rw * 0.6, rh * 0.1]], sw * 1.1, TRECO_PAL.ink, 'ink', 0);
      break;

    case 'squeeze':
      const sgn = isLeft ? 1 : -1;
      inkLine([[-rw * 0.45 * sgn, -rh * 0.4], [rw * 0.45 * sgn, 0], [-rw * 0.45 * sgn, rh * 0.4]], sw * 1.2, TRECO_PAL.ink, 'ink', 0);
      break;

    case 'angry':
    case 'determined': {
      paint(ellPts(0, 0, rw * 0.95, rh * 0.95, 14), { wash: TRECO_PAL.cream, ink: TRECO_PAL.ink, sw: sw * 0.6 });
      paint(ellPts(lookX * 0.6, lookY * 0.6, rw * 0.48, rh * 0.48, 10), { wash: TRECO_PAL.ink, ink: null });
      const slant = isLeft ? 0.35 : -0.35;
      push(); rotate(slant);
      paint(rectPts(-rw * 0.6, -rh * 0.7, rw * 1.2, rh * 0.6, 0.1 * u), { wash: TRECO_PAL.body, ink: TRECO_PAL.ink, sw: sw * 0.6 });
      pop();
      break;
    }

    case 'sad':
    case 'teary': {
      paint(ellPts(0, 0, rw * 0.95, rh * 0.95, 14), { wash: TRECO_PAL.cream, ink: TRECO_PAL.ink, sw: sw * 0.6 });
      paint(ellPts(lookX * 0.5, lookY * 0.5 + 0.1 * u, rw * 0.45, rh * 0.45, 10), { wash: TRECO_PAL.ink, ink: null });
      const slant = isLeft ? -0.3 : 0.3;
      push(); rotate(slant);
      paint(rectPts(-rw * 0.6, -rh * 0.7, rw * 1.2, rh * 0.5, 0.1 * u), { wash: TRECO_PAL.body, ink: TRECO_PAL.ink, sw: sw * 0.5 });
      pop();
      if (kind === 'teary') {
        paint(ellPts(0, rh * 0.5, rw * 0.5, rh * 0.22, 10), { wash: PAL.sky, washOp: 220, ink: TRECO_PAL.ink, sw: sw * 0.4 });
      }
      break;
    }

    case 'cry': {
      inkLine([[-rw * 0.5, -0.1 * u], [rw * 0.5, 0.1 * u]], sw * 1.1, TRECO_PAL.ink, 'ink', 0);
      const tearY = (0.2 + frac(T * 1.8 + (isLeft ? 0 : 0.3)) * 1.6) * u;
      paint(ellPts(0, tearY, 0.35 * u, 0.5 * u, 10), { wash: PAL.sky, washOp: 230, ink: TRECO_PAL.ink, sw: sw * 0.4 });
      break;
    }

    case 'shine':
      // Olhos brilhantes sonhadores (Hopeful)
      paint(ellPts(0, 0, rw * 0.95, rh * 0.95, 14), { wash: TRECO_PAL.cream, ink: TRECO_PAL.ink, sw: sw * 0.65 });
      paint(ellPts(lookX * 0.5, lookY * 0.5, rw * 0.6, rh * 0.6, 12), { wash: TRECO_PAL.ink, ink: null });
      paint(ellPts(lookX * 0.5 - rw * 0.12, lookY * 0.5 - rh * 0.12, rw * 0.22, rh * 0.22, 8), { wash: '#FFFFFF', ink: null });
      paint(ellPts(lookX * 0.5 + rw * 0.15, lookY * 0.5 + rh * 0.15, rw * 0.12, rh * 0.12, 8), { wash: '#FFFFFF', ink: null });
      break;

    case 'spark':
      // Olhos de estrela GRANDES (Starstruck)
      paint(ellPts(0, 0, rw * 1.05, rh * 1.05, 16), { wash: TRECO_PAL.cream, ink: TRECO_PAL.ink, sw: sw * 0.7 });
      paint(starPts(0, 0, rw * 0.75, 0.42, 5, T * 2), { wash: PAL.ochre, ink: TRECO_PAL.ink, sw: sw * 0.5 });
      paint(starPts(0, 0, rw * 0.4, 0.4, 5, -T * 2), { wash: '#FFFFFF', ink: null });
      break;

    case 'heart':
      paint(heartPts(0, 0, rw * 0.7), { wash: '#E2476E', ink: TRECO_PAL.ink, sw: sw * 0.5 });
      break;

    case 'x':
      inkLine([[-rw * 0.45, -rh * 0.45], [rw * 0.45, rh * 0.45]], sw * 1.0, TRECO_PAL.ink, 'ink', 0);
      inkLine([[rw * 0.45, -rh * 0.45], [-rw * 0.45, rh * 0.45]], sw * 1.0, TRECO_PAL.ink, 'ink', 0);
      break;

    case 'swirl': {
      const sp = [];
      for (let k = 0; k < 14; k++) {
        const a = k * 0.7 + T * 6 * (isLeft ? 1 : -1);
        const r = k * 0.05 * (rw / u) * u;
        sp.push([Math.cos(a) * r, Math.sin(a) * r]);
      }
      inkLine(sp, sw * 0.7, TRECO_PAL.ink, 'inkfine', 0.6);
      break;
    }

    case 'wide':
    case 'scared':
      paint(ellPts(0, 0, rw * 1.15, rh * 1.15, 16), { wash: TRECO_PAL.cream, ink: TRECO_PAL.ink, sw: sw * 0.75 });
      paint(ellPts(lookX * 0.8, lookY * 0.8, rw * 0.35, rh * 0.35, 10), { wash: TRECO_PAL.ink, ink: null });
      paint(ellPts(lookX * 0.8 - rw * 0.08, lookY * 0.8 - rh * 0.08, rw * 0.12, rh * 0.12, 8), { wash: '#FFFFFF', ink: null });
      break;

    default: // 'normal' e 'look'
      paint(ellPts(0, 0, rw * 0.95, rh * 0.95, 16), { wash: TRECO_PAL.cream, ink: TRECO_PAL.ink, sw: sw * 0.7 });
      // Pupila com leve desalinhamento entre o olho esquerdo e direito (charme de T.I. atrapalhado)
      const pupilOffset = isLeft ? 0.08 * u : -0.06 * u;
      paint(ellPts(lookX * 0.6 + pupilOffset, lookY * 0.6, rw * 0.48, rh * 0.48, 12), { wash: TRECO_PAL.ink, ink: null });
      paint(ellPts(lookX * 0.6 + pupilOffset - rw * 0.12, lookY * 0.6 - rh * 0.12, rw * 0.14, rh * 0.14, 8), { wash: '#FFFFFF', ink: null });
      break;
  }
}

// Óculos escuros com o lado esquerdo mantendo proporção maior
function trecoShades(u, sw, sides) {
  const P = pts => pts.map(([a, b]) => [a * u, b * u]);
  const lens = (cx, w, h) => P([
    [cx - w * 0.5, -7.5], [cx + w * 0.5, -7.5],
    [cx + w * 0.45, -5.9], [cx, -5.3],
    [cx - w * 0.45, -5.9]
  ]);

  inkLine(P([[-1.2, -6.8], [1.2, -6.8]]), sw * 1.0, TRECO_PAL.ink, 'ink', 0.2);

  for (const s of sides) {
    const isLeft = s < 0;
    const cx = isLeft ? -2.3 : 2.2;
    // O óculos do lado esquerdo é ~1.35x maior para acompanhar o olho gigante!
    const w = isLeft ? 3.0 : 2.2;
    const h = isLeft ? 2.5 : 1.9;

    paint(lens(cx, w, h), { wash: '#0D172A', ink: TRECO_PAL.ink, sw: sw * 0.9, curv: 0.3 });
    inkLine(P([[cx - w * 0.25, -7.1], [cx, -6.1]]), sw * 0.45, '#FFFFFF', 'inkfine', 0);
  }
}

// Rubor nas bochechas
function trecoBlush(u, sw, F, b) {
  for (const s of F.sides) {
    const bx = s * F.bx * u;
    paint(ellPts(bx, -4.5 * u, u * 0.95, u * 0.45, 14), { wash: TRECO_PAL.blush, washOp: 160 * clamp(b), ink: null });
    if (b > 0.6) {
      for (let k = 0; k < 3; k++) {
        inkLine([[bx - 0.4 * u + k * 0.35 * u, -4.3 * u], [bx - 0.2 * u + k * 0.35 * u, -4.75 * u]], sw * 0.4, mixCol(TRECO_PAL.blush, TRECO_PAL.ink, 0.3), 'inkfine', 0);
      }
    }
  }
}

// ---------- BOCA LARGA E TORTA COM UM DENTE BRANCO POR PADRÃO ----------
function trecoMouth(u, m = 'default', sw) {
  const P = pts => pts.map(([a, b]) => [a * u, b * u]);
  const line = (pts, w = 0.9, c = 0.4) => inkLine(P(pts), sw * w, TRECO_PAL.ink, 'ink', c);

  // Helper para desenhar o dente branco bem destacado
  const drawSingleTooth = (tx = 0.35, ty = -4.3, tw = 0.7, th = 0.75, pointDown = true) => {
    const d = pointDown ? 1 : -1;
    const toothPts = [
      [tx - tw * 0.5, ty],
      [tx + tw * 0.5, ty],
      [tx + tw * 0.42, ty + d * th],
      [tx - tw * 0.42, ty + d * th],
    ].map(([a, b]) => [a * u, b * u]);
    paint(toothPts, { wash: TRECO_PAL.tooth, washOp: 255, ink: TRECO_PAL.ink, sw: sw * 0.55 });
  };

  switch (m) {
    case 'smile':
    case 'grin': {
      const mouthShape = P([[-1.7, -4.6], [1.5, -4.3], [1.2, -3.3], [-0.1, -3.1], [-1.4, -3.5]]);
      paint(mouthShape, { wash: TRECO_PAL.mouthDark, ink: TRECO_PAL.ink, sw: sw * 0.75, curv: 0.35 });
      drawSingleTooth(0.4, -4.35, 0.68, 0.75, true);
      break;
    }

    case 'tongue': {
      // Playful: Língua de fora evidente + dente ao lado!
      const mouthShape = P([[-1.8, -4.5], [1.5, -4.2], [1.1, -3.3], [-0.1, -3.1], [-1.4, -3.5]]);
      paint(mouthShape, { wash: TRECO_PAL.mouthDark, ink: TRECO_PAL.ink, sw: sw * 0.75, curv: 0.35 });
      // Língua rosa estendida para fora
      paint(P([[-0.5, -3.6], [0.3, -3.6], [0.25, -2.6], [-0.45, -2.6]]), { wash: '#E5587E', ink: TRECO_PAL.ink, sw: sw * 0.5, curv: 0.5 });
      // Dente branco do outro lado
      drawSingleTooth(0.7, -4.3, 0.6, 0.65, true);
      break;
    }

    case 'laugh': {
      const mouthShape = P([[-1.8, -4.7], [1.7, -4.4], [1.3, -2.8], [0, -2.5], [-1.4, -3.0]]);
      paint(mouthShape, { wash: TRECO_PAL.mouthDark, ink: TRECO_PAL.ink, sw: sw * 0.8, curv: 0.4 });
      paint(ellPts(0.1 * u, -2.9 * u, 0.85 * u, 0.4 * u, 12), { wash: PAL.rose, ink: null });
      drawSingleTooth(0.45, -4.45, 0.75, 0.8, true);
      break;
    }

    case 'open':
    case 'O': {
      paint(ellPts(0.1 * u, -3.9 * u, 0.95 * u, 1.05 * u, 14), { wash: TRECO_PAL.mouthDark, ink: TRECO_PAL.ink, sw: sw * 0.7 });
      drawSingleTooth(0.2, -4.55, 0.62, 0.68, true);
      break;
    }

    case 'o': {
      paint(ellPts(0.1 * u, -4.1 * u, 0.5 * u, 0.55 * u, 12), { wash: TRECO_PAL.mouthDark, ink: TRECO_PAL.ink, sw: sw * 0.6 });
      drawSingleTooth(0.18, -4.4, 0.4, 0.42, true);
      break;
    }

    case 'frown': {
      line([[-1.4, -3.8], [0, -4.4], [1.4, -4.0]], 0.95, 0.4);
      drawSingleTooth(0.4, -4.05, 0.55, 0.58, false);
      break;
    }

    case 'flat': {
      line([[-1.3, -4.2], [1.3, -4.0]], 0.9, 0);
      drawSingleTooth(0.35, -4.05, 0.58, 0.65, true);
      break;
    }

    case 'wobble': {
      line([[-1.4, -4.1], [-0.6, -4.5], [0.1, -4.0], [0.8, -4.5], [1.4, -4.1]], 0.85, 0.3);
      drawSingleTooth(0.3, -4.15, 0.55, 0.62, true);
      break;
    }

    case 'cat': {
      line([[-1.2, -4.3], [-0.5, -3.9], [0, -4.3], [0.5, -3.9], [1.2, -4.2]], 0.85, 0.5);
      drawSingleTooth(0.35, -3.95, 0.5, 0.55, true);
      break;
    }

    case 'smirk': {
      line([[-1.2, -4.1], [0.1, -4.1], [1.4, -4.8]], 0.95, 0.4);
      drawSingleTooth(0.7, -4.45, 0.62, 0.65, true);
      break;
    }

    case 'teeth': {
      paint(rectPts(-1.5 * u, -4.6 * u, 3.0 * u, 1.0 * u, 0.05 * u), { wash: TRECO_PAL.mouthDark, ink: TRECO_PAL.ink, sw: sw * 0.65 });
      drawSingleTooth(0.35, -4.6, 0.75, 0.8, true);
      break;
    }

    case 'wail': {
      paint(P([[-1.7, -4.3], [1.7, -4.0], [1.4, -2.7], [-1.4, -2.7]]), { wash: TRECO_PAL.mouthDark, ink: TRECO_PAL.ink, sw: sw * 0.75, curv: 0.3 });
      paint(ellPts(0.1 * u, -3.0 * u, 0.9 * u, 0.35 * u, 12), { wash: PAL.rose, ink: null });
      drawSingleTooth(0.4, -4.2, 0.7, 0.75, true);
      break;
    }

    default: // Boca torta padrão no idle e neutral com o dente branco bem destacado!
      line([[-1.75, -4.35], [-0.5, -3.95], [0.2, -3.8], [1.85, -4.35]], 1.05, 0.45);
      drawSingleTooth(0.45, -3.9, 0.72, 0.8, true);
      break;
  }
}

// ---------- CABO GROSSO (#0F2A5C) + CONECTOR RJ45 GRANDE (5 CONTATOS) ----------
function drawRj45Cable(u, sw, V, o) {
  const cb = V.cable || { x: 0, y: -9.6, dir: 1 };
  const basePoint = [cb.x * u, cb.y * u];

  // Identificação do humor do cabo
  const cableMood = o.cableMood || (['sad', 'cry', 'sleepy', 'bored', 'ko', 'shy', 'relieved', 'disgusted'].includes(o.eyes) ? 'droop'
    : ['idea', 'excited', 'proud', 'starstruck'].includes(o.eyes) ? 'perk'
    : ['confused', 'thinking', 'suspicious', 'scared', 'nervous'].includes(o.eyes) ? 'alert'
    : 'idle');

  const lagPhase = T * 4.5;
  const dir = cb.dir || 1;

  let p1, p2, p3;

  if (cableMood === 'droop') {
    // Murcho e caído bem para o lado ou para trás do corpo, mantendo o rosto 100% livre
    const droopWiggle = Math.sin(lagPhase * 0.5) * 0.25 * u;
    // O cabo sai da base e cai para fora da silhueta do rosto / para trás
    p1 = [basePoint[0] + 1.8 * dir * u, basePoint[1] - 0.6 * u];
    p2 = [basePoint[0] + 4.2 * dir * u + droopWiggle, basePoint[1] + 0.3 * u];
    p3 = [basePoint[0] + 5.8 * dir * u + droopWiggle, basePoint[1] + 1.8 * u];
  } else if (cableMood === 'perk') {
    // Esticado para cima, vibrando de energia e acerto
    const perkWiggle = Math.sin(T * 22) * 0.25 * u;
    p1 = [basePoint[0] + 0.2 * dir * u, basePoint[1] - 1.9 * u];
    p2 = [basePoint[0] + 0.4 * dir * u + perkWiggle, basePoint[1] - 3.9 * u];
    p3 = [basePoint[0] + 0.5 * dir * u + perkWiggle, basePoint[1] - 5.6 * u];
  } else if (cableMood === 'alert') {
    // Curva nítida em formato de INTERROGAÇÃO (?)
    const alertWiggle = Math.sin(lagPhase) * 0.25 * u;
    p1 = [basePoint[0] + 0.6 * dir * u, basePoint[1] - 2.0 * u];
    p2 = [basePoint[0] + 2.3 * dir * u + alertWiggle, basePoint[1] - 3.4 * u];
    p3 = [basePoint[0] + 1.4 * dir * u + alertWiggle, basePoint[1] - 4.9 * u];
  } else {
    // Idle padrão com elegante curva em S
    const sway = Math.sin(lagPhase) * 0.7 * u;
    const swayTip = Math.sin(lagPhase - 0.7) * 1.0 * u;
    p1 = [basePoint[0] + 0.4 * dir * u + sway * 0.3, basePoint[1] - 1.8 * u];
    p2 = [basePoint[0] + 1.0 * dir * u + sway, basePoint[1] - 3.4 * u];
    p3 = [basePoint[0] + 1.5 * dir * u + swayTip, basePoint[1] - 4.9 * u];
  }

  // Cabo mais grosso, na mesma cor de contorno #0F2A5C!
  const cablePath = [basePoint, p1, p2, p3];
  const smoothCable = through(cablePath, 6);
  inkLine(smoothCable, sw * 3.0, TRECO_PAL.ink, 'ink', 0.5);

  // Conector RJ45 GRANDE na ponta (p3)
  const lastSegment = [p3[0] - p2[0], p3[1] - p2[1]];
  const rj45Angle = Math.atan2(lastSegment[1], lastSegment[0]);

  push();
  translate(p3[0], p3[1]);
  rotate(rj45Angle);

  // Conector RJ45 aumentado: 2.4u comprimento x 1.6u altura
  const connW = 2.4 * u;
  const connH = 1.6 * u;

  // Corpo laranja vibrante #F5A623
  paint(rrPts(0, -connH / 2, connW, connH, 0.25 * u), {
    wash: TRECO_PAL.rj45,
    washOp: 255,
    ink: TRECO_PAL.ink,
    sw: sw * 0.75,
  });

  // Presilha / clip plástico na base
  paint([[0.3 * u, -connH * 0.5], [connW * 0.75, -connH * 0.95], [connW * 0.65, -connH * 0.5]], {
    wash: TRECO_PAL.rj45Clip,
    washOp: 255,
    ink: TRECO_PAL.ink,
    sw: sw * 0.55,
  });

  // 5 contatos metálicos dourados #C77F0A bem visíveis na ponta frontal!
  const pinX = connW - 0.35 * u;
  for (let pin = 0; pin < 5; pin++) {
    const py = -connH * 0.38 + pin * (connH * 0.19);
    inkLine([[pinX, py], [connW, py]], sw * 0.75, TRECO_PAL.rj45Gold, 'inkfine', 0);
  }

  pop();
}

// Smear para giros
function trecoSmear(x, y, u, V, k, dir, col) {
  const sides = dir === 0 ? [-1, 1] : [-dir];
  for (const s of sides) {
    for (let i = 0; i < 4; i++) {
      const yy = y - (8.5 - i * 1.6) * u;
      const x0 = x + s * (V.R - 0.5) * u;
      const len = (3 + 3 * hash(i + 9 * s)) * u * k;
      inkLine([[x0, yy], [x0 + s * len * 0.5, yy + jit(u * 0.1)], [x0 + s * len, yy]], 2.4 * k, col, 'dry', 0.3);
      if (i % 2) {
        inkLine([[x0 + s * len * 0.3, yy + 0.5 * u], [x0 + s * len * 1.1, yy + 0.5 * u]], 0.6, TRECO_PAL.ink, 'inkfine', 0);
      }
    }
  }
}

// ---------- 31 EMOÇÕES DO TRECO BEM DIFERENCIADAS ----------
const _tb = t => {
  const bp = bpOf(t);
  const s1 = Math.sin(bp * Math.PI);
  return { bp, s1, ab: Math.abs(s1), hit: pulse(t), s2: Math.sin(bp * TAU), f: frac(bp) };
};

const TRECO_EMO = {
  // 1. NEUTRAL: boca torta padrão com dente branco, olhar despretensioso, cabo em S
  neutral: {
    eyes: 'normal', mouth: 'default', take: 0.3, cableMood: 'idle',
    body: t => {
      const b = _tb(t);
      return { dy: -0.35 * b.ab, sq: 0.03 * b.hit, aL: 0.15 + 0.05 * b.s1, aR: 0.15 - 0.05 * b.s1 };
    },
  },

  // 2. HAPPY: sorriso largo com dentinho, olhinhos felizes, blush suave, cabo alegre
  happy: {
    eyes: 'happy', mouth: 'smile', blush: 0.35, take: 0.6, cableMood: 'perk',
    body: t => {
      const b = _tb(t);
      return { dy: -1.3 * b.ab, sq: 0.08 * b.hit, aL: 0.45 + 0.35 * b.s1, aR: 0.45 - 0.35 * b.s1 };
    },
  },

  // 3. PLAYFUL: língua de fora ao lado do dente, inclinação extra do corpo, piscar
  playful: {
    eyes: 'happy', mouth: 'tongue', take: 0.65, cableMood: 'idle',
    body: t => {
      const b = _tb(t), side = beatN(t) % 2 ? 1 : -1, k = lerp(-side, side, easeOut(clamp(b.f * 3)));
      return { dx: 0.9 * k, dy: -1.5 * b.ab, rot: 0.18 * k, sq: 0.1 * b.hit, aL: 0.7 + 0.5 * k, aR: 0.7 - 0.5 * k };
    },
  },

  // 4. EXCITED: boca aberta com dente, spark emote, cabo esticado
  excited: {
    eyes: 'wide', mouth: 'open', emote: 'spark', take: 1, cableMood: 'perk',
    body: t => {
      const b = _tb(t), h = Math.abs(b.s2);
      return { dy: -2.6 * h, sq: 0.16 * pulse2(t) - 0.06 * h, aL: 1.1 + 0.5 * Math.sin(b.bp * TAU * 2), aR: 1.1 - 0.5 * Math.sin(b.bp * TAU * 2) };
    },
  },

  // 5. LAUGH: gargalhada gostosa, boca aberta com dente e língua
  laugh: {
    eyes: 'squeeze', mouth: 'laugh', blush: 0.45, take: 0.8, cableMood: 'perk',
    body: t => {
      const c = Math.abs(Math.sin(t * TAU * 5));
      return { dy: -0.55 * c, sq: 0.09 * c - 0.04, rot: -0.06 + 0.04 * Math.sin(t * TAU * 5), aL: -0.3 + 0.15 * c, aR: -0.3 + 0.15 * c };
    },
  },

  // 6. LOVE: olhos de coração, corações flutuando, blush forte
  love: {
    eyes: 'heart', mouth: 'cat', blush: 0.85, tint: 'rosy', tintK: 0.5, emote: 'hearts', take: 0.7,
    body: t => {
      const b = _tb(t), s = Math.sin(b.bp * Math.PI / 2);
      return { rot: 0.1 * s, dx: 0.55 * s, dy: -0.7 * b.ab, sq: 0.05 * b.hit, aL: -0.1 + 0.15 * b.s1, aR: -0.1 - 0.15 * b.s1 };
    },
  },

  // 7. SHY: tímido, olhando para o chão, blush forte, cabo murcho
  shy: {
    eyes: 'look', mouth: 'wobble', blush: 1, take: 0.3, cableMood: 'droop',
    body: t => {
      const b = _tb(t), s = Math.sin(b.bp * Math.PI / 2);
      return { lookX: -0.7, lookY: 0.8, sq: 0.06, rot: -0.05 + 0.02 * s, dx: 0.15 * s, aL: -0.55 + 0.15 * Math.sin(t * TAU * 1.5), aR: -0.6 - 0.12 * Math.sin(t * TAU * 1.5) };
    },
  },

  // 8. PROUD: peito estufado, sorriso e cabo esticado
  proud: {
    eyes: 'closed', mouth: 'smile', tint: 'gold', tintK: 0.3, emote: 'spark', take: 0.5, cableMood: 'perk',
    body: t => {
      const b = _tb(t);
      return { sq: -0.12 - 0.03 * b.ab, dy: -0.4 * b.hit, aL: -0.85, aR: -0.85, rot: 0.03 * b.s1 };
    },
  },

  // 9. SMUG: sorriso de lado convencido com o dente
  smug: {
    eyes: 'normal', mouth: 'smirk', take: 0.4, cableMood: 'idle',
    body: t => {
      const b = _tb(t), s = Math.sin(b.bp * Math.PI / 2);
      return { lookX: 0.55, rot: -0.08 + 0.04 * s, dy: -0.3 * b.ab, aL: -0.45, aR: 0.55 + 0.15 * s };
    },
  },

  // 10. RELIEVED: aliviado após consertar o servidor, gotinha de suor
  relieved: {
    eyes: 'closed', mouth: 'smile', emote: 'sweat', take: 0.4, cableMood: 'droop',
    body: t => {
      const b = _tb(t), br = Math.sin(t * TAU * 0.35);
      return { sq: 0.06 + 0.06 * br, dy: -0.2 * b.ab, aL: -0.7 + 0.1 * br, aR: -0.7 + 0.1 * br };
    },
  },

  // 11. SAD: triste, boca caída com dente saindo de baixo, cabo murcho
  sad: {
    eyes: 'sad', mouth: 'frown', tint: 'blue', tintK: 0.35, emote: 'cloud', take: 0.3, cableMood: 'droop',
    body: t => {
      const b = _tb(t), s = Math.sin(b.bp * Math.PI / 4);
      return { sq: 0.08 + 0.02 * s, rot: 0.04 * s, aL: -0.75, aR: -0.75, lookY: 0.5, dy: 0.4 };
    },
  },

  // 12. CRY: chorando, lágrimas caindo, cabo murcho
  cry: {
    eyes: 'cry', mouth: 'wail', tint: 'blue', tintK: 0.25, take: 0.8, cableMood: 'droop',
    body: t => {
      const b = _tb(t), sob = Math.sin(b.f * Math.PI) * Math.exp(-b.f * 2);
      return { sq: 0.15 * sob - 0.02, dy: 0.2 - 0.8 * sob, aL: 0.85 + 0.15 * Math.sin(t * TAU * 6), aR: 0.85 - 0.15 * Math.sin(t * TAU * 6), rot: 0.04 * b.s1 };
    },
  },

  // 13. ANGRY: irritado com código bugado, dentes cerrados
  angry: {
    eyes: 'angry', mouth: 'teeth', tint: 'flush', tintK: 0.45, emote: 'anger', take: 0.8, cableMood: 'alert',
    body: t => {
      const b = _tb(t);
      return { dx: 0.15 * Math.sin(t * TAU * 18), sq: 0.12 * b.hit, aL: -0.3 + 0.12 * b.hit, aR: -0.3 + 0.12 * b.hit };
    },
  },

  // 14. FURIOUS: servidor caiu! Vapor saindo, cabo em pé vibrando
  furious: {
    eyes: 'angry', mouth: 'teeth', tint: 'flush', tintK: 0.85, emote: 'steam', take: 1.2, cableMood: 'perk',
    body: t => {
      const b = _tb(t);
      return { dx: 0.25 * Math.sin(t * TAU * 20), rot: 0.03 * Math.sin(t * TAU * 13), sq: 0.2 * b.hit, dy: -0.9 * Math.sin(b.f * Math.PI) * (1 - b.f), aL: 1.1 + 0.2 * Math.sin(t * TAU * 9), aR: 1.1 - 0.2 * Math.sin(t * TAU * 9) };
    },
  },

  // 15. SCARED: pânico de perder o banco de dados
  scared: {
    eyes: 'scared', mouth: 'wobble', tint: 'pale', tintK: 0.6, emote: 'sweat', take: 1.1, cableMood: 'alert',
    body: t => ({
      dx: 0.14 * Math.sin(t * TAU * 22), sq: -0.07, dy: -0.5,
      aL: 1.05 + 0.08 * Math.sin(t * TAU * 17), aR: 1.05 + 0.08 * Math.sin(t * TAU * 19),
      lookX: 0.6 * Math.sign(Math.sin(t * 2.3))
    }),
  },

  // 16. SURPRISED: susto / exclamação
  surprised: {
    eyes: 'wide', mouth: 'O', emote: '!', fade: true, take: 1.3, cableMood: 'perk',
    body: t => {
      const b = _tb(t);
      return { sq: -0.15, dy: -0.8 - 0.2 * b.ab, aL: 1.15 + 0.05 * b.s2, aR: 1.15 - 0.05 * b.s2 };
    },
  },

  // 17. CONFUSED: olhar vesgo desconfiado, sobrancelhas bem desiguais, boca torta, cabo em ?
  confused: {
    eyes: ['normal', 'wide'], mouth: 'wobble', emote: '?', take: 0.6, cableMood: 'alert',
    body: t => {
      const b = _tb(t);
      return { rot: 0.12 * Math.sin(b.bp * Math.PI / 4), aL: 0.1, aR: 1.45 + 0.15 * Math.sin(t * TAU * 3), dy: -0.2 * b.ab, lookX: -0.4 };
    },
  },

  // 18. THINKING: olhando para cima e direita, cabo em INTERROGAÇÃO (?), emote dots
  thinking: {
    eyes: 'look', mouth: 'flat', emote: 'dots', take: 0.4, cableMood: 'alert',
    body: t => {
      const b = _tb(t);
      return { lookX: 0.65, lookY: -0.75, rot: 0.06, aR: 0.9, aL: -0.3 + 0.25 * Math.sin(b.f * Math.PI), dy: -0.15 * b.ab };
    },
  },

  // 19. IDEA: lâmpada na cabeça, olhos bem arregalados, sorriso eureka, cabo apontando para a lâmpada
  idea: {
    eyes: 'wide', mouth: 'smile', emote: 'bulb', take: 1.1, cableMood: 'perk',
    body: t => {
      const b = _tb(t);
      return { dy: -1.4 * b.ab, sq: -0.06 + 0.12 * b.hit, aR: 1.55 + 0.1 * b.s2, aL: 0.2 + 0.2 * b.s1 };
    },
  },

  // 20. HOPEFUL: SEM lâmpada; olhos brilhantes sonhadores olhando para CIMA, cabo suave para cima
  hopeful: {
    eyes: 'shine', mouth: 'cat', blush: 0.4, take: 0.5, cableMood: 'perk',
    body: t => {
      const b = _tb(t);
      return { sq: -0.06 - 0.02 * b.ab, dy: -0.4 * b.ab, lookY: -0.9, aL: 0.5 + 0.05 * b.s1, aR: 0.5 - 0.05 * b.s1, rot: 0.04 * Math.sin(b.bp * Math.PI / 2) };
    },
  },

  // 21. STARSTRUCK: olhos de estrela GRANDES, boca aberta com dente, cabo vibrando eufórico
  starstruck: {
    eyes: 'spark', mouth: 'open', tint: 'gold', tintK: 0.35, take: 1, cableMood: 'perk',
    body: t => {
      const b = _tb(t), h = Math.abs(b.s2);
      return { dy: -1.9 * h, sq: 0.13 * pulse2(t), aL: 1.15 + 0.35 * Math.sin(b.bp * TAU * 2), aR: 1.15 + 0.35 * Math.sin(b.bp * TAU * 2) };
    },
  },

  // 22. DETERMINED: foco total em consertar o código
  determined: {
    eyes: 'determined', mouth: 'flat', take: 0.7, cableMood: 'perk',
    body: t => {
      const b = _tb(t), p1 = Math.sin(b.f * Math.PI), p2 = Math.abs(Math.cos(b.f * Math.PI));
      return { rot: 0.08, sq: -0.04 + 0.06 * b.hit, dy: -0.4 * b.ab, aL: 0.1 + 0.7 * p1, aR: 0.1 + 0.7 * p2 };
    },
  },

  // 23. SLEEPY: sono após virar a noite programando (sem dente visível)
  sleepy: {
    eyes: 'sleepy', mouth: 'o', emote: 'zzz', take: 0.2, cableMood: 'droop',
    body: t => {
      const br = Math.sin(t * TAU * 0.3);
      return { sq: 0.06 + 0.06 * br, rot: 0.07 * Math.sin(t * 0.8), aL: -0.65, aR: -0.65, dy: 0.3 };
    },
  },

  // 24. BORED: entediado esperando o deploy demorado
  bored: {
    eyes: 'sleepy', mouth: 'flat', take: 0.2, cableMood: 'droop',
    body: t => {
      const f = frac(bpOf(t) / 4), sigh = f < 0.3 ? ease(f / 0.3) : 1 - ease((f - 0.3) / 0.7);
      return { lookX: -0.3, lookY: 0.4, sq: 0.08 - 0.14 * sigh, rot: -0.05, aL: -0.85 + 0.05 * Math.sin(t * 2), aR: -0.85 - 0.05 * Math.sin(t * 2), dy: 0.2 };
    },
  },

  // 25. NERVOUS: olhar oscilando rapidamente para os lados, boca e dente tremendo
  nervous: {
    eyes: 'look', mouth: 'wobble', tint: 'pale', tintK: 0.25, emote: 'sweat', take: 0.5, cableMood: 'alert',
    body: t => {
      const b = _tb(t);
      return { lookX: Math.sin(t * TAU * 4) * 0.7, dx: 0.35 * b.s1, sq: 0.05, aL: -0.1 + 0.25 * Math.sin(t * TAU * 6), aR: -0.1 + 0.25 * Math.sin(t * TAU * 6 + 1) };
    },
  },

  // 26. SUSPICIOUS: olhar de canto fixo, sobrancelhas arqueadas em dúvida, boca fina
  suspicious: {
    eyes: 'normal', mouth: 'flat', take: 0.4, cableMood: 'alert',
    body: t => {
      return { lookX: 0.8, lookY: 0.1, rot: -0.08, dx: 0.4, sq: 0.04, aL: -0.4, aR: -0.4, browTilt: 0.2 };
    },
  },

  // 27. DISGUSTED: viu código legado sem documentação
  disgusted: {
    eyes: 'squeeze', mouth: 'wobble', tint: 'green', tintK: 0.5, take: 0.8, cableMood: 'droop',
    body: t => {
      const a = frac(bpOf(t) / 2) * BEAT * 2, sh = Math.exp(-a * 6) * Math.sin(a * 45);
      return { rot: -0.12, dx: -0.3 + 0.15 * sh, sq: 0.06, aL: 0.7 + 0.2 * sh, aR: 0.7 - 0.2 * sh };
    },
  },

  // 28. DIZZY: tonto de tanto loop infinito
  dizzy: {
    eyes: 'swirl', mouth: 'wobble', emote: 'stars', take: 0.7, cableMood: 'idle',
    body: t => {
      const a = t * TAU * 0.8;
      return { rot: 0.15 * Math.sin(a), dx: 0.8 * Math.sin(a), dy: -0.4 * Math.abs(Math.cos(a)), aL: 0.3 + 0.6 * Math.sin(a * 1.3), aR: 0.3 - 0.6 * Math.sin(a * 1.3) };
    },
  },

  // 29. COOL: óculos escuros (esquerdo maior), smirk confiante com dente
  cool: {
    eyes: 'shades', mouth: 'smirk', emote: 'music', take: 0.4, cableMood: 'perk',
    body: t => {
      const b = _tb(t);
      return { rot: 0.05 * b.hit, dy: -0.45 * b.hit, sq: 0.06 * b.hit, aL: -0.4, aR: 0.75 + 0.1 * b.s1 };
    },
  },

  // 30. KO: tela azul da morte (olhos em X, sem dente)
  ko: {
    eyes: 'x', mouth: 'flat', tint: 'pale', tintK: 0.3, emote: 'stars', take: 1, cableMood: 'droop',
    body: t => ({ sq: 0.3 + 0.02 * Math.sin(t * 3), rot: 0.16, aL: -1, aR: -0.9, dy: 0.6 }),
  },

  // 31. MISCHIEF: traquinagem / hackeando de brincadeira
  mischief: {
    eyes: 'normal', mouth: 'grin', take: 0.5, cableMood: 'alert',
    body: t => {
      const r = Math.sin(t * TAU * 4);
      return { lookX: 0.35, sq: 0.08, rot: 0.05, aL: -0.05 + 0.15 * r, aR: -0.05 - 0.15 * r, dy: -0.15 * Math.abs(r) };
    },
  },
};

// Obter estado de emoção do Treco no tempo t
function trecoFeel(name, t, over = {}) {
  const E = TRECO_EMO[name] || TRECO_EMO.neutral;
  return {
    eyes: E.eyes, mouth: E.mouth, tint: E.tint, tintK: E.tintK ?? 1,
    blush: E.blush || 0, cableMood: E.cableMood, emote: E.emote,
    ...(E.body ? E.body(t) : {}), ...over
  };
}

// Movimentos e danças flutuantes do Treco
function trecoMove(style, t, seed = 0) {
  const bp = bpOf(t), bi = Math.floor(bp), bf = bp - bi, hit = Math.max(0, 1 - bf * 3.5), s1 = Math.sin(bp * Math.PI), ab = Math.abs(s1);
  const o = { dy: 0, sq: 0, aL: 0.2, aR: 0.2, rot: 0, dx: 0 };
  if (style === 'mix') style = ['hover', 'soar', 'sway', 'spin', 'bounce', 'wave'][(Math.floor(bp / 8) + seed) % 6];

  switch (style) {
    case 'hover':
    case 'idle':
      o.dy = -ab * 0.7;
      o.rot = Math.sin(t * 3) * 0.05;
      o.sq = hit * 0.05;
      break;

    case 'walk': // Deslize flutuante suave com inclinação
      o.dy = -ab * 0.9;
      o.dx = s1 * 0.4;
      o.rot = -0.1 + s1 * 0.04;
      o.aL = 0.35 * s1;
      o.aR = -o.aL;
      break;

    case 'run':
      o.dy = -Math.abs(Math.sin(bp * TAU)) * 1.2;
      o.rot = -0.15;
      o.aL = 0.85 * Math.sin(bp * TAU * 1.5);
      o.aR = -o.aL;
      break;

    case 'bounce':
      o.dy = -ab * 1.8;
      o.sq = hit * 0.12;
      o.aL = 0.4 + s1;
      o.aR = 0.4 - s1;
      break;

    case 'hop':
    case 'soar':
      o.dy = -ab * 4.2;
      o.sq = hit * 0.18;
      o.aL = o.aR = 0.3 + ab * 1.1;
      break;

    case 'sway':
      o.dx = s1 * 3.2;
      o.rot = s1 * 0.15;
      o.aL = 0.5 + 0.6 * s1;
      o.aR = 0.5 - 0.6 * s1;
      o.sq = hit * 0.08;
      break;

    case 'spin': {
      const ph = (((bi % 4) + 4) % 4 === 3) ? bf : 0;
      Object.assign(o, spinView(ph));
      o.smear = ph > 0.1 && ph < 0.9 ? 0.5 : 0;
      o.smearDir = 0;
      o.dy = -Math.sin(ph * Math.PI) * 3 - ab;
      o.aL = o.aR = 0.6 + ph;
      o.sq = hit * 0.1;
      break;
    }

    case 'wave':
      o.dy = -ab;
      o.aL = 1.1 + 0.5 * Math.sin(bp * TAU * 2);
      o.aR = -0.2;
      o.sq = hit * 0.08;
      break;

    default:
      o.dy = -ab * 0.7;
      break;
  }
  return o;
}

# Model Sheets do Personagem TRECO ("O Cara do T.I")

Apresentação oficial do design e das folhas de modelo (Model Sheets) do novo personagem **TRECO**, desenvolvido especificamente para o canal *"O Cara do T.I"* sobre o motor estético do Claude Animation Base (`p5.js` + `p5.brush`), respeitando a mesma API do Clawd.

---

## 1. Folha de Vistas 2D, Movimento Flutuante & Físico do Cabo RJ45

A folha abaixo reúne:
- **Linha 1:** As 5 vistas-chave 2D (`front`, `q`, `side`, `qback`, `back`) demonstrando a assimetria corporal, inclinação intencional de cerca de -4°, o dente solitário na boca torta e a sombra elíptica desacoplada no chão.
- **Linha 2:** Mecânicas de movimento flutuante (sem pernas), incluindo hover/idle com sopro de ar, deslize lateral, giros, impulsos com *squash & stretch* e reações de susto com bugs.
- **Linha 3:** O **Cabo de Rede RJ45** como termômetro de humor (modo alerta/interrogação, murcho/desanimado, perk/eufórico) e expressões típicas de T.I.

![Treco Views & Motion Sheet](C:/Users/User/.gemini/antigravity/brain/345066d5-7240-4258-bdb4-110d1f8be774/treco_views.jpg)

---

## 2. Folha das 31 Emoções do Treco

Todas as 31 emoções originais do Clawd foram adaptadas para a anatomia e personalidade do Treco:
- **Olhos Desiguais:** Olho esquerdo maior e curioso; olho direito menor; sobrancelhas em ângulos intencionalmente desalinhados ("atrapalhado").
- **Flutuação Contínua:** Poses que dependiam de pernas foram reescritas com dinâmica de pairar no ar e sopros de sustentação.
- **Cabo Reativo:** O conector RJ45 laranja com contatos metálicos dourados responde dinamicamente à energia de cada emoção.

![Treco 31 Emotions Sheet](C:/Users/User/.gemini/antigravity/brain/345066d5-7240-4258-bdb4-110d1f8be774/treco_emotions.jpg)

---

## 3. Especificações Técnicas e Performance

- **Arquivo Criado:** `src/treco.js` (API idêntica: `treco(x, y, u, options)`).
- **Compatibilidade no Studio:** `studio.html?loop=treco_views` e `studio.html?loop=treco_emotions` (ou `?loop=views&char=treco`).
- **Otimização para iGPU (Intel UHD Graphics 770):**
  - Substituídos os preenchimentos lentos de aquarela (`fill` com bleed/tex repetitivo do p5.brush) por camadas de `wash` artesanal com contorno a tinta `#0F2A5C`.
  - **Tempo de renderização reduzido de 11.342 ms para apenas 171–443 ms por frame** (mais de 25× mais veloz), sem perder a estética orgânica e o traço fervente a 12 FPS.

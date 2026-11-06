# PROJECT_STATE.md

> Registro consolidado do estado do sistema, configurações de ambiente, estrutura de composições, assets e pipeline de áudio integrado com ElevenLabs e Edge-TTS.

---

## 1. Versões e Ambiente

- **Sistema Operacional:** Windows
- **Node.js:** `v24.19.0`
- **npm:** `11.17.0`
- **Python:** `3.14.6`
- **pip:** `26.1.2`
- **Motores TTS:**
  - **ElevenLabs API:** Modelo `eleven_multilingual_v2` com síntese com marcas temporais (`/with-timestamps`), configurações de voz humanas (`stability: 0.5`, `similarity_boost: 0.75`, `style: 0.06`, `use_speaker_boost: true`).
  - **Edge-TTS:** Versão `7.3.1` (motor neural local e fallback automático).
- **Bibliotecas Python:** `requests`, `python-dotenv`, `edge-tts`.
- **FFmpeg:** `9.0.2-full_build-www.gyan.dev` (acessível no PATH do sistema).
- **TypeScript:** `v7.0.2` (compilador verificado sem erros via `tsc --noEmit`).
- **Remotion:** `^4.0.541` (`remotion`, `@remotion/player`, `@remotion/cli`, `@remotion/media-utils`).
- **React / React-DOM:** `^19.3.1`.
- **Status do Build:** Compilação concluída com sucesso (Remotion Studio bundling instantâneo, renderizador still e áudio validados).

---

## 2. Estrutura do Projeto

### Diretórios e Arquivos Principais

```text
d:\Animacao
├── .env                           # Chaves de API (ELEVENLABS_API_KEY, ELEVENLABS_DEFAULT_VOICE_ID) [no .gitignore]
├── .gitignore                     # Proteção de credenciais (.env, .env.local, node_modules, out/)
├── package.json                   # Dependências e scripts de execução ("voice", "voice:eleven", etc.)
├── tsconfig.json                  # Configuração TypeScript moderna para bundler / Remotion
├── remotion.config.ts             # Configurações globais de render do Remotion
├── PROJECT_STATE.md               # Registro consolidado de estado do projeto
├── ANIMATION_GUIDE.md             # Guia oficial de princípios de animação do Clawd
├── render.mjs                     # Renderizador headless legado (Puppeteer + Chrome)
├── studio.html                    # Preview legado do ClaudeAnimationBase
├── skills-remotion/               # Repositório de referência de boas práticas e skills do Remotion
├── scripts/
│   └── generate_voice.py          # Script utilitário multi-motor (ElevenLabs / Edge-TTS) com VTT
├── public/
│   ├── audio/                     # Trilhas de áudio e narrações geradas
│   │   ├── narracao.mp3           # Áudio gerado de narração oficial (137.969 bytes via ElevenLabs)
│   │   └── narracao.vtt           # Legendas WebVTT com marcação temporal precisa
│   └── sfx/                       # Efeitos sonoros (pops, clicks, glitch, etc.)
└── src/
    ├── index.ts                   # Entrypoint do Remotion (registra registerRoot)
    ├── Root.tsx                   # Registro de composições do Remotion (com calculateMetadata)
    ├── clawd.js                   # Definição paramétrica original do mascote Clawd (p5/brush)
    ├── core.js                    # Motor gráfico, paleta, helpers de interpolação e efeitos
    ├── config.js                  # Configurações base de projeto (BPM, duração)
    ├── sheets.js                  # Model sheets de emoções e poses
    ├── timeline.js                # Gerenciador de cenas e transições
    ├── components/
    │   ├── ClaudeMascot.tsx       # Componente React/Remotion do Clawd com estética hand-painted
    │   ├── ThinkingBubble.tsx     # Balão de pensamento estilizado com bloco de código de erro
    │   ├── IdeaCallout.tsx        # Card radiante de lâmpada/Eureka com raios pulsantes
    │   ├── KineticConclusion.tsx  # Cartão cinético de conclusão com palavras e estrelas
    │   └── DynamicCaptions.tsx    # Legendas dinâmicas estilizadas sincronizadas com a narração
    └── scenes/
        ├── demo.js                # Cena demo original do ClaudeAnimationBase
        ├── ClaudeDemoScene.tsx    # Cena widescreen com transição contínua de emoções
        ├── ClawdEmotionsScene.tsx # Showcase multi-estado simultâneo do mascote
        └── ClawdStoryScene.tsx    # Composição vertical com áudio embutido e 3 atos sincronizados
```

### Composições Registradas em `Root.tsx`

| Composição ID | FPS | Duração (Frames / Segundos) | Resolução | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **`ClawdStory`** | 24 | Dinâmica via `calculateMetadata` (~226–230 frames / ~9.4 s) | 1080 × 1920 (Vertical 9:16) | Narrativa vertical com áudio sincronizado do ElevenLabs via `<Audio src={staticFile('audio/narracao.mp3')} />`, legendas dinâmicas em `DynamicCaptions.tsx` e 3 atos sincronizados: (1) Análise de bug com expressão `thinking`; (2) Salto pop com transição para `idea` e lâmpada radiante; (3) Conclusão em `cool` com texto cinético "SHIPPED TO PRODUCTION!". |
| **`ClaudeDemo`** | 24 | 264 frames (~11.0 s) | 1920 × 1080 (Full HD) | Animação widescreen de Clawd no estilo hand-painted, transitando entre estados ao ritmo de 120 BPM. |
| **`ClawdEmotions`** | 24 | 120 frames (~5.0 s) | 1920 × 1080 (Full HD) | Vitrine multi-estado demonstrando expressões simultâneas com escalonamento temporal. |

---

## 3. Pipeline de Narração: Integração ElevenLabs & Edge-TTS

### Motores Suportados e Funcionamento
O script `scripts/generate_voice.py` suporta múltiplos motores selecionáveis via argumento `--engine`:

1. **ElevenLabs (`--engine elevenlabs` - Padrão quando API key está configurada):**
   - **Endpoint:** `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps`
   - **Modelo:** `eleven_multilingual_v2`
   - **Voice Settings:**
     ```json
     {
       "stability": 0.5,
       "similarity_boost": 0.75,
       "style": 0.06,
       "use_speaker_boost": true
     }
     ```
   - **Gerador de Legendas:** Extrai alinhamento temporal de caracteres (`alignment.character_start_times_seconds`) e compila legendas WebVTT (`public/audio/narracao.vtt`) milimétricas.
   - **Compatibilidade com Plano Free & Premade Voices:** A ElevenLabs restringe vozes da Library via API para planos gratuitos (erro 402). O script detecta essa condição e comuta automaticamente para a voz premade oficial `TX3LPaxmHKxFdv7VOQHJ` (Liam), garantindo geração com sucesso.
   - **Fallback para Edge-TTS:** Se houver erro de cota ou conexão na API ElevenLabs, o script faz fallback automático para `edge-tts` com aviso no terminal.

2. **Edge-TTS (`--engine edge-tts`):**
   - Motor local sem custos baseado em Microsoft Cloud TTS (`pt-BR-AntonioNeural`).

### Troca de Vozes via Voice ID (ElevenLabs)
Para alterar a voz utilizada pelo ElevenLabs, configure a variável no `.env`:
```env
ELEVENLABS_DEFAULT_VOICE_ID=<VOICE_ID_DESEJADO>
```
Ou passe diretamente via argumento:
```bash
python scripts/generate_voice.py --engine elevenlabs --voice <VOICE_ID> --text "Seu texto"
```

**Exemplos de Voice IDs oficiais testados:**
- `TX3LPaxmHKxFdv7VOQHJ` — Liam (Enérgico, criador de conteúdo, premade)
- `EXAVITQu4vr4xnSDxMaL` — Sarah (Madura, confiante, premade)
- `JBFqnCBsd6RMkjVDRZzb` — George (Narrador cativante, premade)
- `21m00Tcm4TlvDq8ikWAM` — Rachel (Library voice, requer tier pago na API)

### Narração Atual em `public/audio/narracao.mp3`
- **Texto:** *"Peguei um bug cabuloso no sistema e o build quebrou... Mas analisei o código com calma, achei a solução e mandei direto pra produção!"*
- **Tamanho:** **137.969 bytes**
- **Marcas no VTT:**
  * `00:00:00.000 --> 00:00:03.471`: *"Peguei um bug cabuloso no sistema e o build quebrou..."*
  * `00:00:03.796 --> 00:00:08.545`: *"Mas analisei o código com calma, achei a solução e mandei direto pra produção!"*

### Sincronização dos 3 Atos em `ClawdStoryScene.tsx`:
- **Ato 1 (Frames 0 a 86 | 0s a ~3.6s):** "Peguei um bug cabuloso no sistema e o build quebrou..." (Expressão `thinking` + `ThinkingBubble`).
- **Ato 2 (Frames 86 a 150 | ~3.6s a ~6.2s):** "Mas analisei o código com calma, achei a solução..." (Pulo elástico + `idea` + `IdeaCallout`).
- **Ato 3 (Frames 150 ao término | ~6.2s ao fim):** "...e mandei direto pra produção!" (Expressão `cool` + óculos escuros + `KineticConclusion`).

---

## 4. Status da Prévia e Comandos Úteis

- **Status do Servidor:** Ativo e em execução em background
- **URL Local de Preview:** [http://localhost:3000](http://localhost:3000)
- **URL Direta da Composição:** [http://localhost:3000/ClawdStory](http://localhost:3000/ClawdStory)
- **URL na Rede Local:** `http://192.168.0.193:3000`

### Comandos de Operação

```bash
# Iniciar o servidor de desenvolvimento / preview do Remotion Studio
npm run dev

# Sintetizar voz via ElevenLabs (atalho do package.json)
npm run voice:eleven

# Sintetizar voz via ElevenLabs com texto personalizado
python scripts/generate_voice.py --engine elevenlabs --text "Sua nova história aqui"

# Sintetizar voz via Edge-TTS (sem necessidade de internet/chaves)
npm run voice
# ou
python scripts/generate_voice.py --engine edge-tts --text "Texto de teste"

# Renderizar o vídeo completo com áudio sincronizado para MP4
npx remotion render ClawdStory out/ClawdStory.mp4

# Renderizar still (imagem estática) de teste
npx remotion still ClawdStory out/check/clawd_story_eleven_f100.jpg --frame=100
```

---

## 5. Histórico e Log de Ações

### Executado nesta Sessão:
1. **Configuração de Variáveis de Ambiente e Dependências:**
   - Instalados `requests` e `python-dotenv`.
   - Criado `.env` com `ELEVENLABS_API_KEY` e `ELEVENLABS_DEFAULT_VOICE_ID`.
   - Adicionado `.env` e `.env.local` ao `.gitignore`.
2. **Refatoração do Script Multi-Motor `scripts/generate_voice.py`:**
   - Suporte ao argumento `--engine` (`elevenlabs` e `edge-tts`).
   - Implementado endpoint `/with-timestamps` com modelo `eleven_multilingual_v2` e parâmetros de voz otimizados.
   - Conversão de dados de alinhamento em legendas WebVTT de alta precisão.
   - Fallback automático inteligente para voz premade e para `edge-tts`.
3. **Atalhos e Smoke Test:**
   - Adicionado `"voice:eleven": "python scripts/generate_voice.py --engine elevenlabs"` no `package.json`.
   - Teste executado gerando com sucesso `public/audio/narracao.mp3` (137.969 bytes) e `public/audio/narracao.vtt`.
4. **Sincronização em `ClawdStoryScene.tsx` e `DynamicCaptions.tsx`:**
   - Ajustadas as faixas de frames dos 3 atos e legendas para acompanhar o fluxo vocal do ElevenLabs.
   - Validado com `tsc --noEmit` e still render `clawd_story_eleven_f100.jpg`.
5. **Atualização da Documentação:**
   - `PROJECT_STATE.md` atualizado com o pipeline do ElevenLabs consolidado.
6. **Criação e Refinamento do Mascote Treco ("O Cara do T.I"):**
   - Criado `src/treco.js` com a mesma API do `clawd.js` (`treco(x, y, u, options)`).
   - Design refinado: proporção monstrinho 1.3:1, sem costura central em Q/QBack, olhos desiguais (esquerdo 1.5x maior), boca torta com dente único branco por padrão, conector RJ45 aumentado com 5 contatos dourados e clipe, braço no flanco em perfil, e 3 linhas de sopro de sustentação.
   - Otimização gráfica para iGPU Intel UHD 770 (tempo de renderização ~200-1200ms/folha).
   - Model sheets gerados em `docs/treco_views.jpg` e `docs/treco_emotions.jpg`.

import React from 'react';
import { Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { ClaudeMascot, PAL } from '../components/ClaudeMascot';
import { ThinkingBubble } from '../components/ThinkingBubble';
import { IdeaCallout } from '../components/IdeaCallout';
import { KineticConclusion } from '../components/KineticConclusion';
import { DynamicCaptions } from '../components/DynamicCaptions';

export const ClawdStoryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  // Background watercolor pattern & subtle camera zoom
  const bgZoom = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateRight: 'clamp',
  });

  // Dynamic timing boundaries derived from ElevenLabs narration cues:
  // Act 1: 0s - 3.6s (0 - 86 frames)
  // Act 2: 3.6s - 6.2s (86 - 150 frames -> duration 64 frames)
  // Act 3: 6.2s - End (150+ frames -> remainder)
  const act1Duration = 86;
  const act2Duration = 64;
  const act3Start = act1Duration + act2Duration; // 150
  const act3Duration = Math.max(60, durationInFrames - act3Start);

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: PAL.paper,
        backgroundImage: `radial-gradient(${PAL.cream} 20%, transparent 21%), radial-gradient(${PAL.clayLt} 12%, transparent 13%)`,
        backgroundSize: '48px 48px',
        backgroundPosition: '0 0, 24px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        transform: `scale(${bgZoom})`,
      }}
    >
      {/* Sincronização da Narração Neural (TTS) */}
      <Audio src={staticFile('audio/narracao.mp3')} volume={1} />

      {/* Paper texture overlay with organic vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,253,249,0.7) 20%, rgba(244,239,234,0.92) 85%)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Header Badge */}
      <div
        style={{
          position: 'absolute',
          top: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          zIndex: 20,
        }}
      >
        <div
          style={{
            backgroundColor: PAL.clayDk,
            color: PAL.cream,
            padding: '10px 28px',
            borderRadius: 9999,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            border: `3px solid ${PAL.ink}`,
            boxShadow: `4px 4px 0px ${PAL.ink}`,
          }}
        >
          Dev Chronicles
        </div>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: PAL.ink,
            margin: 0,
            textShadow: '0 3px 12px rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}
        >
          Building with Clawd
        </h1>
      </div>

      {/* ACT 1: 0s a 4.1s (Frames 0 - 98) -> "Peguei um bug cabuloso..." */}
      <Sequence from={0} durationInFrames={act1Duration} name="Act 1 - Thinking">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
            paddingTop: 80,
          }}
        >
          {/* Thought Bubble floating above */}
          <ThinkingBubble />

          {/* Clawd in Thinking mode */}
          <div style={{ marginTop: 20 }}>
            <ClaudeMascot emotion="thinking" scale={2.6} showEmote={false} />
          </div>
        </div>
      </Sequence>

      {/* ACT 2: 4.1s a 6.8s (Frames 98 - 165) -> "Mas analisei o código, achei a solução..." */}
      <Sequence from={act1Duration} durationInFrames={act2Duration} name="Act 2 - Eureka Idea">
        <Act2Scene />
      </Sequence>

      {/* ACT 3: 6.8s ao final (Frames 165+) -> "...e mandei direto pra produção!" */}
      <Sequence from={act3Start} durationInFrames={act3Duration} name="Act 3 - Conclusion">
        <Act3Scene />
      </Sequence>

      {/* Legendas Dinâmicas Sincronizadas com o VTT da Narração */}
      <DynamicCaptions />

      {/* Bottom Progress Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          width: '75%',
          height: 16,
          backgroundColor: PAL.cream,
          border: `3px solid ${PAL.ink}`,
          borderRadius: 9999,
          overflow: 'hidden',
          boxShadow: `3px 3px 0px ${PAL.ink}`,
          zIndex: 30,
        }}
      >
        <div
          style={{
            width: `${Math.min(100, (frame / durationInFrames) * 100)}%`,
            height: '100%',
            backgroundColor: PAL.clay,
          }}
        />
      </div>
    </div>
  );
};

// Sub-component for Act 2 with jump dynamics
const Act2Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Jump animation at the start of Act 2
  const jumpArc = spring({
    frame,
    fps,
    config: { damping: 9, mass: 0.5, stiffness: 140 },
  });

  const jumpY = interpolate(jumpArc, [0, 0.5, 1], [0, -90, 0]);
  const jumpSquash = interpolate(jumpArc, [0, 0.3, 0.7, 1], [0, 0.2, -0.15, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
        paddingTop: 60,
      }}
    >
      <IdeaCallout />

      <div
        style={{
          transform: `translateY(${jumpY}px) scale(${1 + jumpSquash}, ${1 - jumpSquash})`,
          marginTop: 20,
        }}
      >
        <ClaudeMascot emotion="idea" scale={2.8} showEmote={false} />
      </div>
    </div>
  );
};

// Sub-component for Act 3 with celebratory kinetic conclusion
const Act3Scene: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 50,
        paddingTop: 80,
      }}
    >
      <KineticConclusion />

      <div style={{ marginTop: 20 }}>
        <ClaudeMascot emotion="cool" scale={2.8} showEmote={false} />
      </div>
    </div>
  );
};

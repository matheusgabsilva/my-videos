import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PAL } from './ClaudeMascot';

interface CaptionCue {
  startSec: number;
  endSec: number;
  text: string;
  highlight?: string;
}

const CUES: CaptionCue[] = [
  {
    startSec: 0.0,
    endSec: 3.6,
    text: 'Peguei um bug cabuloso no sistema e o build quebrou...',
    highlight: 'build quebrou',
  },
  {
    startSec: 3.6,
    endSec: 6.2,
    text: 'Mas analisei o código com calma, achei a solução...',
    highlight: 'achei a solução',
  },
  {
    startSec: 6.2,
    endSec: 9.5,
    text: '...e mandei direto pra produção! 🚀',
    highlight: 'direto pra produção!',
  },
];

export const DynamicCaptions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentSec = frame / fps;

  // Find active cue
  const activeCueIndex = CUES.findIndex(
    (cue) => currentSec >= cue.startSec && currentSec < cue.endSec
  );

  const activeCue = activeCueIndex !== -1 ? CUES[activeCueIndex] : null;

  // Spring entrance for when cue changes
  const cueStartFrame = activeCue ? Math.floor(activeCue.startSec * fps) : 0;
  const localFrame = frame - cueStartFrame;

  const scale = spring({
    frame: localFrame,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 150 },
  });

  // Boil jitter (12fps)
  const boilStep = Math.floor(frame / 2);
  const boilX = ((boilStep * 7) % 4) - 2;
  const boilY = ((boilStep * 11) % 4) - 2;

  if (!activeCue) {
    return null;
  }

  // Split text to highlight key phrase
  const parts = activeCue.highlight
    ? activeCue.text.split(activeCue.highlight)
    : [activeCue.text];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 115,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 48px',
        zIndex: 25,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: PAL.cream,
          border: `3.5px solid ${PAL.ink}`,
          borderRadius: 24,
          padding: '14px 28px',
          boxShadow: `5px 5px 0px ${PAL.ink}`,
          transform: `translate(${boilX}px, ${boilY}px) scale(${scale})`,
          transformOrigin: 'center center',
          maxWidth: 920,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: PAL.ink,
            lineHeight: 1.35,
            letterSpacing: '0.02em',
          }}
        >
          {parts[0]}
          {activeCue.highlight && (
            <span
              style={{
                color: PAL.clay,
                textDecoration: 'underline',
                textDecorationColor: PAL.ochre,
                textUnderlineOffset: '4px',
                fontWeight: 900,
              }}
            >
              {activeCue.highlight}
            </span>
          )}
          {parts[1] || ''}
        </span>
      </div>
    </div>
  );
};

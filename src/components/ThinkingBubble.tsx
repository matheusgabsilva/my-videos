import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PAL } from './ClaudeMascot';

export const ThinkingBubble: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring
  const scale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 0.7 },
  });

  // Float animation
  const floatY = Math.sin(frame / 6) * 8;

  // Boil jitter
  const boilStep = Math.floor(frame / 2);
  const boilX = ((boilStep * 5) % 4) - 2;
  const boilY = ((boilStep * 9) % 4) - 2;

  // Code typing / flicker
  const codeLines = [
    '// Debugging async state...',
    'TypeError: cannot read properties of undefined',
    'at processRenderPipeline (worker.ts:42)',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translate(${boilX}px, ${floatY + boilY}px) scale(${scale})`,
        transformOrigin: 'bottom center',
        userSelect: 'none',
      }}
    >
      {/* Cloud bubble */}
      <div
        style={{
          backgroundColor: PAL.cream,
          border: `4px solid ${PAL.ink}`,
          borderRadius: 36,
          padding: '24px 36px',
          boxShadow: `8px 8px 0px ${PAL.ink}`,
          maxWidth: 680,
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 32 }}>🤔</span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: PAL.clayDk,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Investigating Bug...
          </span>
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 28,
              color: PAL.rose,
              fontWeight: 900,
              transform: `rotate(${Math.sin(frame / 4) * 15}deg)`,
            }}
          >
            ?
          </span>
        </div>

        {/* Mock Code Block */}
        <div
          style={{
            backgroundColor: '#24201E',
            borderRadius: 16,
            padding: '16px 20px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: 20,
            lineHeight: 1.6,
            color: '#E6EDF3',
            border: `2px solid ${PAL.ink}`,
            textAlign: 'left',
          }}
        >
          <div style={{ color: '#8B949E' }}>{codeLines[0]}</div>
          <div style={{ color: PAL.rose, fontWeight: 600 }}>{codeLines[1]}</div>
          <div style={{ color: PAL.ochre }}>{codeLines[2]}</div>
        </div>

        {/* Small question marks floating around */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: 40,
            fontSize: 34,
            fontWeight: 900,
            color: PAL.indigo,
            transform: `translateY(${Math.cos(frame / 5) * 6}px)`,
          }}
        >
          ?
        </div>
        <div
          style={{
            position: 'absolute',
            top: -30,
            left: 60,
            fontSize: 40,
            fontWeight: 900,
            color: PAL.clay,
            transform: `translateY(${Math.sin(frame / 5) * 6}px)`,
          }}
        >
          ?!
        </div>
      </div>

      {/* Trailing thought bubble dots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: PAL.cream,
            border: `3px solid ${PAL.ink}`,
            boxShadow: `3px 3px 0px ${PAL.ink}`,
          }}
        />
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: PAL.cream,
            border: `2.5px solid ${PAL.ink}`,
            boxShadow: `2px 2px 0px ${PAL.ink}`,
          }}
        />
      </div>
    </div>
  );
};

import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { ClaudeMascot, PAL } from '../components/ClaudeMascot';

export const ClawdEmotionsScene: React.FC = () => {
  const frame = useCurrentFrame();

  const emotions: Array<'happy' | 'thinking' | 'idea' | 'cool' | 'excited'> = [
    'happy',
    'thinking',
    'idea',
    'cool',
    'excited',
  ];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: PAL.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h2
        style={{
          position: 'absolute',
          top: 70,
          fontSize: 44,
          fontWeight: 800,
          color: PAL.ink,
          margin: 0,
        }}
      >
        Clawd Emotions Showcase
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {emotions.map((emo, idx) => {
          const delay = idx * 6;
          const localFrame = Math.max(0, frame - delay);
          const opacity = interpolate(localFrame, [0, 15], [0, 1]);

          return (
            <div
              key={emo}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                opacity,
              }}
            >
              <ClaudeMascot emotion={emo} scale={1.25} />
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: PAL.ink,
                  textTransform: 'capitalize',
                  backgroundColor: PAL.cream,
                  padding: '6px 16px',
                  borderRadius: 16,
                  border: `1.5px solid ${PAL.ink}`,
                }}
              >
                {emo}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

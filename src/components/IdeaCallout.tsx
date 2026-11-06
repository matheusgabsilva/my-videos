import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PAL } from './ClaudeMascot';

export const IdeaCallout: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Burst spring
  const scale = spring({
    frame,
    fps,
    config: { damping: 9, mass: 0.6, stiffness: 120 },
  });

  const glowPulse = interpolate(Math.sin(frame / 3), [-1, 1], [0.85, 1.15]);

  // Boil jitter
  const boilStep = Math.floor(frame / 2);
  const boilX = ((boilStep * 7) % 5) - 2;
  const boilY = ((boilStep * 11) % 5) - 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translate(${boilX}px, ${boilY}px) scale(${scale})`,
        transformOrigin: 'bottom center',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* Radiant light rays behind */}
      <svg
        width={360}
        height={360}
        viewBox="0 0 360 360"
        style={{
          position: 'absolute',
          top: -120,
          pointerEvents: 'none',
          transform: `scale(${glowPulse}) rotate(${frame * 1.5}deg)`,
        }}
      >
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1={180}
            y1={180}
            x2={180 + Math.cos((deg * Math.PI) / 180) * 160}
            y2={180 + Math.sin((deg * Math.PI) / 180) * 160}
            stroke={PAL.ochre}
            strokeWidth={4.5}
            strokeDasharray="14 10"
            opacity={0.65}
          />
        ))}
      </svg>

      {/* Main Idea Card */}
      <div
        style={{
          backgroundColor: PAL.cream,
          border: `5px solid ${PAL.ink}`,
          borderRadius: 36,
          padding: '28px 44px',
          boxShadow: `10px 10px 0px ${PAL.ink}`,
          maxWidth: 720,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Top badge with glowing lamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: PAL.ochre,
              border: `4px solid ${PAL.ink}`,
              boxShadow: `4px 4px 0px ${PAL.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              transform: `scale(${interpolate(frame % 20, [0, 10, 20], [1, 1.2, 1])})`,
            }}
          >
            💡
          </div>
          <span
            style={{
              fontSize: 38,
              fontWeight: 900,
              color: PAL.clayDk,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Eureka Moment!
          </span>
        </div>

        {/* Action description */}
        <div
          style={{
            backgroundColor: PAL.paper,
            border: `3px solid ${PAL.ink}`,
            borderRadius: 20,
            padding: '16px 28px',
            fontSize: 26,
            fontWeight: 700,
            color: PAL.ink,
            textAlign: 'center',
            lineHeight: 1.4,
          }}
        >
          ✨ Type-safe hooks + Remotion sequences configured!
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { PAL } from './ClaudeMascot';

export const KineticConclusion: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Kinetic words animation with staggered springs
  const words = ['SHIPPED', 'TO', 'PRODUCTION!'];

  // Boil jitter
  const boilStep = Math.floor(frame / 2);
  const boilX = ((boilStep * 7) % 5) - 2;
  const boilY = ((boilStep * 11) % 5) - 2;

  // Floating stars
  const stars = [
    { x: -280, y: -90, size: 36, color: PAL.ochre, rot: 15 },
    { x: 290, y: -80, size: 42, color: PAL.rose, rot: -20 },
    { x: -310, y: 120, size: 32, color: PAL.teal, rot: 45 },
    { x: 300, y: 140, size: 38, color: PAL.ochre, rot: -30 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translate(${boilX}px, ${boilY}px)`,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Decorative stars */}
      {stars.map((star, i) => {
        const starSpring = spring({
          frame: frame - i * 4,
          fps,
          config: { damping: 10, mass: 0.6 },
        });

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              transform: `translate(${star.x}px, ${star.y}px) scale(${starSpring}) rotate(${star.rot + frame * 2}deg)`,
              fontSize: star.size,
              pointerEvents: 'none',
            }}
          >
            ⭐
          </div>
        );
      })}

      {/* Main Kinetic Badge */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          backgroundColor: PAL.cream,
          border: `6px solid ${PAL.ink}`,
          borderRadius: 40,
          padding: '36px 60px',
          boxShadow: `14px 14px 0px ${PAL.ink}`,
          maxWidth: 820,
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: PAL.teal,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          🚀 Mission Accomplished
        </div>

        {/* Word by word kinetic impact */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          {words.map((word, index) => {
            const wordSpring = spring({
              frame: frame - index * 6,
              fps,
              config: { damping: 9, mass: 0.7, stiffness: 140 },
            });

            const isLast = index === words.length - 1;

            return (
              <span
                key={word}
                style={{
                  fontSize: 76,
                  fontWeight: 900,
                  color: isLast ? PAL.clay : PAL.ink,
                  textShadow: `3px 3px 0px ${PAL.paper}`,
                  transform: `scale(${wordSpring})`,
                  display: 'inline-block',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Sub-banner */}
        <div
          style={{
            backgroundColor: PAL.clay,
            color: PAL.cream,
            border: `3px solid ${PAL.ink}`,
            borderRadius: 9999,
            padding: '10px 32px',
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '0.08em',
            marginTop: 8,
            boxShadow: `4px 4px 0px ${PAL.ink}`,
            transform: `scale(${interpolate(frame % 24, [0, 12, 24], [1, 1.05, 1])})`,
          }}
        >
          100% BUILD VERIFIED
        </div>
      </div>
    </div>
  );
};

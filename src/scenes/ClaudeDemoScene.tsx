import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { ClaudeMascot, PAL } from '../components/ClaudeMascot';

export const ClaudeDemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Progress 0..1
  const progress = frame / durationInFrames;

  // Change emotion across scenes:
  // 0 - 60: thinking
  // 60 - 120: idea
  // 120 - 180: excited
  // 180 - 264: cool
  let currentEmotion: 'thinking' | 'idea' | 'excited' | 'cool' = 'thinking';
  if (frame >= 180) {
    currentEmotion = 'cool';
  } else if (frame >= 120) {
    currentEmotion = 'excited';
  } else if (frame >= 60) {
    currentEmotion = 'idea';
  }

  // Camera drift
  const panX = interpolate(progress, [0, 1], [-20, 20]);
  const panY = interpolate(progress, [0, 0.5, 1], [0, -10, 0]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: PAL.paper,
        backgroundImage: `radial-gradient(${PAL.cream} 15%, transparent 16%), radial-gradient(${PAL.clayLt} 10%, transparent 11%)`,
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Watercolor background texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,253,249,0.85) 0%, rgba(244,239,234,0.95) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Title & subtitle badge */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          zIndex: 10,
        }}
      >
        <span
          style={{
            fontSize: 22,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: PAL.clayDk,
            fontWeight: 700,
          }}
        >
          Claude Animation Base + Remotion
        </span>
        <h1
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: PAL.ink,
            margin: 0,
            textShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}
        >
          Hand-Painted Clawd in Motion
        </h1>
      </div>

      {/* Main mascot stage */}
      <div
        style={{
          transform: `translate(${panX}px, ${panY}px)`,
          zIndex: 5,
        }}
      >
        <ClaudeMascot emotion={currentEmotion} scale={2.0} />
      </div>

      {/* Current emotion indicator pill */}
      <div
        style={{
          position: 'absolute',
          bottom: 90,
          padding: '12px 28px',
          backgroundColor: PAL.cream,
          border: `2px solid ${PAL.ink}`,
          borderRadius: 9999,
          boxShadow: `4px 4px 0px ${PAL.ink}`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 10,
        }}
      >
        <span style={{ fontSize: 18, color: PAL.ink, fontWeight: 600 }}>
          Current State: <strong style={{ color: PAL.clay }}>{currentEmotion.toUpperCase()}</strong>
        </span>
      </div>
    </div>
  );
};

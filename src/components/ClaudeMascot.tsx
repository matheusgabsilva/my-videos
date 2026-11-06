import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const PAL = {
  paper: '#F4EFEA',
  ink: '#24201E',
  clay: '#D97757',
  clayDk: '#A65236',
  clayLt: '#F5B394',
  cream: '#FFFDF9',
  ochre: '#E5A84B',
  teal: '#438B87',
  indigo: '#384358',
  rose: '#D46F7A',
  sky: '#8AB4F8',
};

export interface ClaudeMascotProps {
  emotion?: 'happy' | 'thinking' | 'idea' | 'cool' | 'excited';
  scale?: number;
  showEmote?: boolean;
}

export const ClaudeMascot: React.FC<ClaudeMascotProps> = ({
  emotion = 'happy',
  scale = 1.0,
  showEmote = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Boil jitter (simulates 12fps boiling hand-drawn effect)
  const boilStep = Math.floor(frame / 2);
  const boilJitterX = ((boilStep * 7) % 5) - 2;
  const boilJitterY = ((boilStep * 11) % 5) - 2;

  // BPM bounce
  const bpm = 120;
  const beatsPerSec = bpm / 60;
  const t = frame / fps;
  const bouncePhase = (t * beatsPerSec) % 1;
  const bounceY = Math.sin(bouncePhase * Math.PI) * -14;
  const squash = Math.cos(bouncePhase * Math.PI * 2) * 0.04;

  // Entrance spring
  const entrance = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.8 },
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `translate(${boilJitterX}px, ${bounceY + boilJitterY}px) scale(${scale * entrance})`,
        transformOrigin: 'bottom center',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* Reaction Emote */}
      {showEmote && (
        <div
          style={{
            position: 'absolute',
            top: -70,
            right: -30,
            fontSize: 48,
            animation: 'none',
            transform: `scale(${interpolate(frame % 30, [0, 15, 30], [1, 1.15, 1])})`,
          }}
        >
          {emotion === 'idea' && '💡'}
          {emotion === 'happy' && '✨'}
          {emotion === 'thinking' && '💬'}
          {emotion === 'cool' && '🕶️'}
          {emotion === 'excited' && '⚡'}
        </div>
      )}

      {/* Hand-painted styled Clawd SVG */}
      <svg width={260} height={200} viewBox="0 0 260 200" fill="none">
        {/* Soft shadow */}
        <ellipse
          cx={130}
          cy={188}
          rx={90 * (1 - squash)}
          ry={14}
          fill={PAL.ink}
          opacity={0.18}
        />

        {/* Clawd Body group with squash and stretch */}
        <g
          transform={`scale(${1 + squash}, ${1 - squash})`}
          style={{ transformOrigin: '130px 180px' }}
        >
          {/* Back legs */}
          <rect x={70} y={150} width={22} height={30} rx={10} fill={PAL.clayDk} stroke={PAL.ink} strokeWidth={3.5} />
          <rect x={168} y={150} width={22} height={30} rx={10} fill={PAL.clayDk} stroke={PAL.ink} strokeWidth={3.5} />

          {/* Front legs */}
          <rect x={95} y={155} width={24} height={28} rx={10} fill={PAL.clay} stroke={PAL.ink} strokeWidth={3.5} />
          <rect x={141} y={155} width={24} height={28} rx={10} fill={PAL.clay} stroke={PAL.ink} strokeWidth={3.5} />

          {/* Main Body */}
          <rect
            x={45}
            y={50}
            width={170}
            height={115}
            rx={24}
            fill={PAL.clay}
            stroke={PAL.ink}
            strokeWidth={4.5}
            strokeLinejoin="round"
          />

          {/* Highlight/Watercolor wash gradient layer */}
          <path
            d="M 55 60 Q 130 54 205 60 Q 210 110 200 150 Q 130 155 55 150 Z"
            fill={PAL.clayLt}
            opacity={0.25}
          />

          {/* Arms */}
          <rect
            x={22}
            y={95 + Math.sin(t * 8) * 4}
            width={30}
            height={20}
            rx={8}
            fill={PAL.clay}
            stroke={PAL.ink}
            strokeWidth={3.5}
            transform={`rotate(${emotion === 'excited' ? -25 : 5}, 35, 105)`}
          />
          <rect
            x={208}
            y={95 - Math.sin(t * 8) * 4}
            width={30}
            height={20}
            rx={8}
            fill={PAL.clay}
            stroke={PAL.ink}
            strokeWidth={3.5}
            transform={`rotate(${emotion === 'excited' ? 25 : -5}, 225, 105)`}
          />

          {/* Eyes based on emotion */}
          {emotion === 'happy' && (
            <>
              {/* Slit / happy curve eyes */}
              <path d="M 98 96 Q 106 86 114 96" stroke={PAL.ink} strokeWidth={5} strokeLinecap="round" />
              <path d="M 146 96 Q 154 86 162 96" stroke={PAL.ink} strokeWidth={5} strokeLinecap="round" />
              {/* Rosy blush */}
              <circle cx={92} cy={116} r={10} fill={PAL.rose} opacity={0.65} />
              <circle cx={168} cy={116} r={10} fill={PAL.rose} opacity={0.65} />
            </>
          )}

          {emotion === 'thinking' && (
            <>
              <ellipse cx={104} cy={92} rx={6} ry={12} fill={PAL.ink} />
              <ellipse cx={152} cy={92} rx={6} ry={12} fill={PAL.ink} />
              <circle cx={106} cy={88} r={2.5} fill={PAL.cream} />
              <circle cx={154} cy={88} r={2.5} fill={PAL.cream} />
            </>
          )}

          {emotion === 'idea' && (
            <>
              <ellipse cx={104} cy={90} rx={8} ry={15} fill={PAL.ink} />
              <ellipse cx={156} cy={90} rx={8} ry={15} fill={PAL.ink} />
              <circle cx={101} cy={85} r={3.5} fill={PAL.cream} />
              <circle cx={153} cy={85} r={3.5} fill={PAL.cream} />
              {/* Smile */}
              <path d="M 122 120 Q 130 128 138 120" stroke={PAL.ink} strokeWidth={4} strokeLinecap="round" />
            </>
          )}

          {emotion === 'excited' && (
            <>
              <ellipse cx={102} cy={88} rx={9} ry={17} fill={PAL.ink} />
              <ellipse cx={158} cy={88} rx={9} ry={17} fill={PAL.ink} />
              <circle cx={99} cy={82} r={4} fill={PAL.cream} />
              <circle cx={155} cy={82} r={4} fill={PAL.cream} />
              <ellipse cx={130} cy={122} rx={12} ry={14} fill={PAL.ink} />
              <ellipse cx={130} cy={125} rx={8} ry={8} fill={PAL.rose} />
            </>
          )}

          {emotion === 'cool' && (
            <>
              {/* Sunglasses */}
              <polygon points="85,82 122,82 118,102 90,102" fill="#2A2740" stroke={PAL.ink} strokeWidth={2} />
              <polygon points="138,82 175,82 170,102 142,102" fill="#2A2740" stroke={PAL.ink} strokeWidth={2} />
              <line x1={122} y1={87} x2={138} y2={87} stroke={PAL.ink} strokeWidth={3} />
              <line x1={72} y1={84} x2={85} y2={84} stroke={PAL.ink} strokeWidth={2.5} />
              <line x1={175} y1={84} x2={188} y2={84} stroke={PAL.ink} strokeWidth={2.5} />
              {/* Smirk */}
              <path d="M 124 122 Q 134 120 142 115" stroke={PAL.ink} strokeWidth={3.5} strokeLinecap="round" />
            </>
          )}
        </g>
      </svg>
    </div>
  );
};

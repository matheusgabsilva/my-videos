import React from 'react';
import { Composition, staticFile } from 'remotion';
import { getAudioDurationInSeconds } from '@remotion/media-utils';
import { ClaudeDemoScene } from './scenes/ClaudeDemoScene';
import { ClawdEmotionsScene } from './scenes/ClawdEmotionsScene';
import { ClawdStoryScene } from './scenes/ClawdStoryScene';

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="ClawdStory"
        component={ClawdStoryScene}
        durationInFrames={240}
        fps={24}
        width={1080}
        height={1920}
        calculateMetadata={async () => {
          const fps = 24;
          const paddingFrames = 20; // margem de respiro de 20 frames no final (~0.8s)
          try {
            const audioSrc = staticFile('audio/narracao.mp3');
            const durationInSec = await getAudioDurationInSeconds(audioSrc);
            const calculatedDuration = Math.ceil(durationInSec * fps) + paddingFrames;
            return {
              durationInFrames: calculatedDuration,
            };
          } catch (err) {
            console.warn('[Root] Fallback to default duration for ClawdStory:', err);
            return {
              durationInFrames: 240,
            };
          }
        }}
      />
      <Composition
        id="ClaudeDemo"
        component={ClaudeDemoScene}
        durationInFrames={264}
        fps={24}
        width={1920}
        height={1080}
      />
      <Composition
        id="ClawdEmotions"
        component={ClawdEmotionsScene}
        durationInFrames={120}
        fps={24}
        width={1920}
        height={1080}
      />
    </>
  );
};

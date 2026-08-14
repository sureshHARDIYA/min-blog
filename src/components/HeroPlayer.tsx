'use client';

import React from 'react';
import { Player } from '@remotion/player';
import { HeroScene, HeroSceneProps } from '../remotion/HeroScene';
import { useTheme } from '../context/ThemeContext';

interface HeroPlayerProps {
  nodeLabel: string;
  name: string;
  title: string;
}

export const HeroPlayer: React.FC<HeroPlayerProps> = ({ nodeLabel, name, title }) => {
  const { theme } = useTheme();

  return (
    <Player<HeroSceneProps>
      component={HeroScene}
      inputProps={{ theme, nodeLabel, name, title }}
      durationInFrames={300}
      compositionWidth={880}
      compositionHeight={1000}
      fps={30}
      autoPlay
      loop
      initiallyMuted
      controls={false}
      clickToPlay={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

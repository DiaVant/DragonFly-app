import React from 'react';
import { Image } from 'react-native';

interface Props {
  size?: number;
  opacity?: number;
}

const LOGO = require('../../assets/logo.png');

/** Official DragonFly mark — brand logo asset. */
export function DragonflyMark({ size = 30, opacity = 1 }: Props) {
  return (
    <Image
      source={LOGO}
      resizeMode="contain"
      style={{ width: size, height: size, opacity }}
      accessibilityIgnoresInvertColors
    />
  );
}

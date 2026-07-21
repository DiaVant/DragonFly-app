import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

type Shadow = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation' | 'boxShadow'
>;

function soft(color: string, y: number, blur: number, opacity: number, elevation: number): Shadow {
  if (Platform.OS === 'web') {
    const rgb =
      color === colors.copper
        ? '196, 120, 63'
        : color === '#000' || color === '#000000'
          ? '0, 0, 0'
          : '10, 18, 28';
    return {
      boxShadow: `0 ${y}px ${blur}px rgba(${rgb}, ${opacity})`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: y },
    shadowOpacity: opacity,
    shadowRadius: blur / 2,
    elevation,
  };
}

export const shadows = {
  none: {} as Shadow,
  card: soft(colors.ink, 4, 18, 0.08, 2),
  raised: soft(colors.ink, 10, 28, 0.12, 5),
  cta: soft(colors.copper, 10, 28, 0.38, 8),
  fight: soft('#000', 6, 20, 0.45, 5),
  brand: soft(colors.ink, 12, 36, 0.14, 6),
} as const;

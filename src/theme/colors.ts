/**
 * DragonFly design tokens — from the product style guide.
 * Midnight navy structure, copper actions, pale fog canvas, cool sage success.
 */
export const colors = {
  // Brand (style guide)
  ink: '#1B2A41',
  navy: '#1B2A41',
  navyMuted: '#2F4058',
  slateBlue: '#4B6A88',
  copper: '#B87444',
  copperDark: '#9A5F36',
  copperSoft: '#D4A07A',
  lake: '#4B6A88',
  lakeSoft: '#6A86A0',

  // Surfaces
  background: '#F5F7F7',
  backgroundAlt: '#E8ECEB',
  mist: '#F5F7F7',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  /** Live fight stays on-brand pale fog (not a separate dark skin). */
  fightBg: '#F5F7F7',
  fightSurface: '#FFFFFF',
  fightPanel: '#FFFFFF',

  // Text
  text: '#1B2A41',
  textSecondary: '#5B6B7E',
  textMuted: '#9AA7B4',
  textOnDark: '#F5F7F7',
  textOnDarkSecondary: '#C5CED6',
  textOnAccent: '#FFFFFF',

  // Borders
  border: '#E1E6E8',
  borderFaint: 'rgba(27, 42, 65, 0.06)',
  borderStrong: 'rgba(27, 42, 65, 0.14)',

  // Semantic
  sage: '#8FA89A',
  sageSoft: '#A8BDB2',
  connected: '#8FA89A',
  caution: '#B87444',
  danger: '#C0453A',
  dangerSoft: '#A85A3C',
  missing: '#9AA7B4',

  // Overlays / atmosphere
  overlay: 'rgba(27, 42, 65, 0.45)',
  overlayLight: 'rgba(245, 247, 247, 0.94)',
  dawnTop: '#E8ECEB',
  dawnMid: '#F5F7F7',
  dawnBottom: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

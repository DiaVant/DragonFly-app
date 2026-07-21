/**
 * DragonFly design tokens — premium outdoor-tech palette.
 * Dawn-mist surfaces over deep ink navy, copper for action,
 * lake teal for live sensor feedback.
 */
export const colors = {
  // Brand
  ink: '#0A121C',
  navy: '#152536',
  navyMuted: '#2A3F55',
  slateBlue: '#5A758C',
  copper: '#C4783F',
  copperDark: '#A35F2E',
  copperSoft: '#E0B08A',
  lake: '#2A7A88',
  lakeSoft: '#4FA0AE',

  // Surfaces — cool mist, not flat SaaS gray
  background: '#E6ECF0',
  backgroundAlt: '#D5DEE5',
  mist: '#F2F5F7',
  surface: '#F7F9FA',
  surfaceRaised: '#FFFFFF',
  fightBg: '#081018',
  fightSurface: '#121C2A',
  fightPanel: '#182434',

  // Text
  text: '#152536',
  textSecondary: '#4F6275',
  textMuted: '#7A8B9A',
  textOnDark: '#F2F5F7',
  textOnDarkSecondary: '#9AABBA',
  textOnAccent: '#FFFFFF',

  // Borders
  border: 'rgba(21, 37, 54, 0.1)',
  borderFaint: 'rgba(21, 37, 54, 0.06)',
  borderStrong: 'rgba(21, 37, 54, 0.16)',

  // Semantic
  sage: '#3A8A6A',
  sageSoft: '#7FA892',
  connected: '#2A8A55',
  caution: '#C4872A',
  danger: '#C0453A',
  dangerSoft: '#A85A3C',
  missing: '#8A97A3',

  // Overlays / atmosphere
  overlay: 'rgba(10, 18, 28, 0.55)',
  overlayLight: 'rgba(247, 249, 250, 0.94)',
  dawnTop: '#C5D4DE',
  dawnMid: '#E6ECF0',
  dawnBottom: '#F2F5F7',
} as const;

export type ColorToken = keyof typeof colors;

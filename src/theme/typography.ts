import { TextStyle } from 'react-native';
import { colors } from './colors';
import { fonts } from './fonts';

type TextStyleMap = Record<string, TextStyle>;

export const typography: TextStyleMap = {
  displayHero: {
    fontFamily: fonts.displayBold,
    fontSize: 72,
    lineHeight: 76,
    letterSpacing: 0.5,
    color: colors.text,
  },
  displayLarge: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: 0.5,
    color: colors.text,
  },
  displayMedium: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 28,
    lineHeight: 32,
    color: colors.text,
  },
  displaySmall: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    lineHeight: 26,
    color: colors.text,
  },
  title: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  bodySmall: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: colors.textSecondary,
  },
  caption: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  mono: {
    fontFamily: fonts.monoRegular,
    fontSize: 14,
    lineHeight: 18,
    color: colors.text,
  },
  monoSmall: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  coaching: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textOnDark,
  },
  button: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textOnAccent,
  },
};

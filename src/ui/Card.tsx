import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { colors, fonts, radii, shadows } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  /** Softer panel without hard border — default for outdoor look. */
  variant?: 'raised' | 'flush' | 'ink';
}

export function Card({ children, style, padded = true, variant = 'raised' }: Props) {
  return (
    <View
      style={[
        styles.base,
        variant === 'raised' && styles.raised,
        variant === 'flush' && styles.flush,
        variant === 'ink' && styles.ink,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface MetricProps {
  label: string;
  value: string;
  mono?: boolean;
  emphasize?: boolean;
}

export function Metric({ label, value, mono, emphasize }: MetricProps) {
  return (
    <View style={styles.metric} accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, mono && styles.mono, emphasize && styles.emphasize]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionText}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    ...shadows.card,
  },
  flush: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: colors.borderFaint,
  },
  ink: {
    backgroundColor: colors.navy,
    ...shadows.raised,
  },
  padded: {
    padding: 18,
  },
  metric: {
    flex: 1,
    minWidth: 0,
  },
  metricLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: 6,
  },
  metricValue: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 22,
    color: colors.navy,
    letterSpacing: -0.3,
  },
  mono: {
    fontFamily: fonts.monoMedium,
    fontSize: 18,
  },
  emphasize: {
    color: colors.copper,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  sectionText: { flex: 1, minWidth: 0 },
  sectionTitle: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 18,
    color: colors.navy,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
});

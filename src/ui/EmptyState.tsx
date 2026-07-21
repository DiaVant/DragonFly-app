import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { DragonflyMark } from '../components/DragonflyMark';

interface EmptyProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, body, actionLabel, onAction }: EmptyProps) {
  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.mark}>
        <DragonflyMark size={88} tone="dark" opacity={0.45} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

interface ErrorProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({ title, body, actionLabel, onAction }: ErrorProps) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.errorKicker}>Something went wrong</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <PrimaryButton label={actionLabel} onPress={onAction} variant="navy" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  mark: { marginBottom: 8 },
  errorKicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.danger,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 26,
    letterSpacing: -0.4,
    color: colors.navy,
    textAlign: 'center',
    lineHeight: 32,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  action: {
    marginTop: 14,
    width: '100%',
    maxWidth: 280,
  },
});

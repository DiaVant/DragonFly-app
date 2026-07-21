import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, PrimaryButton, AppHeader } from '../ui';
import { colors, fonts, radii } from '../theme';
import { HARDWARE_NAME } from '../lib/product';
import {
  LINE_OPTIONS,
  ROD_OPTIONS,
  type GearConfig,
  type LineId,
  type RodId,
} from '../lib/gear';

interface Props {
  initial?: GearConfig | null;
  onSave: (gear: GearConfig) => void;
  onSkip?: () => void;
  title?: string;
}

export function GearSetupScreen({
  initial,
  onSave,
  onSkip,
  title = 'Set your gear',
}: Props) {
  const [rodId, setRodId] = useState<RodId>(initial?.rodId ?? 'medium');
  const [lineId, setLineId] = useState<LineId>(initial?.lineId ?? 'mono_10');

  return (
    <Screen scroll>
      <AppHeader
        title={title}
        subtitle={`${HARDWARE_NAME} calibrates relative tension to your rod and line.`}
        showMark={false}
      />

      <Text style={styles.section}>Rod</Text>
      <View style={styles.grid}>
        {ROD_OPTIONS.map((rod) => {
          const active = rod.id === rodId;
          return (
            <Pressable
              key={rod.id}
              onPress={() => setRodId(rod.id)}
              style={[styles.option, active && styles.optionActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{rod.label}</Text>
              <Text style={styles.optionDetail}>{rod.detail}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.section, { marginTop: 28 }]}>Line</Text>
      <View style={styles.grid}>
        {LINE_OPTIONS.map((line) => {
          const active = line.id === lineId;
          return (
            <Pressable
              key={line.id}
              onPress={() => setLineId(line.id)}
              style={[styles.option, active && styles.optionActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{line.label}</Text>
              <Text style={styles.optionDetail}>{line.detail}</Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        label="Save gear"
        onPress={() =>
          onSave({
            rodId,
            lineId,
            updatedAt: new Date().toISOString(),
          })
        }
        style={styles.save}
      />
      {onSkip ? (
        <Pressable onPress={onSkip} style={styles.skip} accessibilityRole="button">
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginBottom: 12,
    marginTop: 8,
  },
  grid: {
    gap: 10,
  },
  option: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionActive: {
    borderColor: colors.copper,
    backgroundColor: 'rgba(184,116,68,0.08)',
  },
  optionTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 16,
    color: colors.navy,
  },
  optionTitleActive: {
    color: colors.copperDark,
  },
  optionDetail: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  save: {
    marginTop: 28,
    marginBottom: 8,
  },
  skip: {
    alignItems: 'center',
    paddingVertical: 14,
    marginBottom: 24,
  },
  skipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
});

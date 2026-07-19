import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { DragonflyMark } from './DragonflyMark';

export function PhotoFill() {
  return <LinearGradient colors={['#4B6A88', '#1B2A41']} start={{ x: 0, y: 0 }} end={{ x: 0.3, y: 1 }} style={StyleSheet.absoluteFill} />;
}

interface NoPhotoFillProps {
  label?: string;
  title?: string;
  showMark?: boolean;
  markSize?: number;
}

export function NoPhotoFill({ label, title, showMark, markSize = 40 }: NoPhotoFillProps) {
  return (
    <LinearGradient colors={['#EEF1F1', '#E6EAEB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, styles.noPhoto]}>
      {showMark ? (
        <View style={{ width: markSize, height: markSize, opacity: 0.8 }}>
          <DragonflyMark size={markSize} tone="dark" />
        </View>
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  noPhoto: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 13,
    color: colors.navy,
    fontFamily: fonts.bodySemiBold,
  },
  label: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.missing,
  },
});

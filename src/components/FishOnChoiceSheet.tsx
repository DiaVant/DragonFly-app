import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, motion, radii } from '../theme';
import { PrimaryButton, SecondaryButton } from '../ui';
import { HARDWARE_NAME } from '../lib/product';

interface Props {
  visible: boolean;
  onPractice: () => void;
  onConnect: () => void;
  onClose: () => void;
}

/**
 * When Fish On is tapped without hardware — choose practice (sim) or connect.
 */
export function FishOnChoiceSheet({ visible, onPractice, onConnect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(360)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: motion.fast, useNativeDriver: true }),
        Animated.timing(sheetY, {
          toValue: 0,
          duration: motion.slow,
          easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: motion.fast, useNativeDriver: true }),
        Animated.timing(sheetY, {
          toValue: 360,
          duration: motion.normal,
          easing: Easing.bezier(0.2, 0.8, 0.2, 1),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible, backdrop, sheetY]);

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close Fish On options">
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdrop }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 24), transform: [{ translateY: sheetY }] },
          ]}
          accessibilityViewIsModal
        >
          <View style={styles.grabber} />
          <Text style={styles.kicker}>Fish On</Text>
          <Text style={styles.title}>{HARDWARE_NAME} isn’t connected</Text>
          <Text style={styles.lead}>
            Connect for a real fight, or practice with a live simulation — same coaching, no hardware.
          </Text>

          <PrimaryButton label={`Connect ${HARDWARE_NAME}`} onPress={onConnect} style={styles.primary} />
          <SecondaryButton label="Practice without hardware" onPress={onPractice} />
          <Pressable onPress={onClose} style={styles.cancel} accessibilityRole="button">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(10,18,28,0.48)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.mist,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: 22,
    paddingTop: 10,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  kicker: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.copper,
    marginBottom: 6,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    letterSpacing: -0.4,
    color: colors.navy,
  },
  lead: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 22,
  },
  primary: { marginBottom: 10 },
  cancel: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.textMuted,
  },
});

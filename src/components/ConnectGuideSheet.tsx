import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, motion, radii } from '../theme';
import { PrimaryButton, SecondaryButton } from '../ui';
import { HARDWARE_NAME } from '../lib/product';

interface Props {
  visible: boolean;
  connecting?: boolean;
  onConnect: () => void;
  onClose: () => void;
}

const STEPS = [
  { n: '1', title: 'Power on', body: `Wake ${HARDWARE_NAME} and keep it within a few feet.` },
  { n: '2', title: 'Clip to the rod', body: 'Seat the attachment firmly so tension can be read.' },
  { n: '3', title: 'Allow Bluetooth', body: 'Turn Bluetooth on, then approve access if asked.' },
  { n: '4', title: 'Connect', body: `Tap Connect — we’ll pair ${HARDWARE_NAME} for live coaching.` },
];

/** Beginner connect checklist — opens from Home troubleshooting. */
export function ConnectGuideSheet({ visible, connecting, onConnect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(420)).current;

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
          toValue: 420,
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
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close connect guide">
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
          <Text style={styles.kicker}>Get set</Text>
          <Text style={styles.title}>Connect {HARDWARE_NAME}</Text>
          <Text style={styles.lead}>Four quick steps before Fish On.</Text>

          <View style={styles.steps}>
            {STEPS.map((step) => (
              <View key={step.n} style={styles.step}>
                <View style={styles.num}>
                  <Text style={styles.numText}>{step.n}</Text>
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepBody}>{step.body}</Text>
                </View>
              </View>
            ))}
          </View>

          <PrimaryButton
            label={connecting ? 'Connecting…' : `Connect ${HARDWARE_NAME}`}
            onPress={onConnect}
            loading={connecting}
            disabled={connecting}
            style={styles.primary}
          />
          <SecondaryButton label="Not now" onPress={onClose} />
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
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.navy,
  },
  lead: {
    fontFamily: fonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 20,
  },
  steps: {
    gap: 14,
    marginBottom: 22,
  },
  step: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  numText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 13,
    color: colors.copperSoft,
  },
  stepText: { flex: 1 },
  stepTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.navy,
    marginBottom: 2,
  },
  stepBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  primary: { marginBottom: 10 },
});

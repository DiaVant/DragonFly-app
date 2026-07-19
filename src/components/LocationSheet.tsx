import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface Props {
  visible: boolean;
  locations: string[];
  current: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

export function LocationSheet({ visible, locations, current, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(320)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(sheetY, { toValue: 0, duration: 300, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdrop, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(sheetY, { toValue: 320, duration: 220, easing: Easing.bezier(0.2, 0.8, 0.2, 1), useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible, backdrop, sheetY]);

  if (!mounted) return null;

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdrop }]} />
        </Pressable>
        <Animated.View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 30), transform: [{ translateY: sheetY }] }]}>
          <View style={styles.grabber} />
          <Text style={styles.title}>Choose location</Text>
          {locations.map((name) => (
            <Pressable key={name} style={styles.row} onPress={() => onSelect(name)}>
              <View style={styles.rowLeft}>
                <View style={styles.dot} />
                <Text style={styles.rowLabel}>{name}</Text>
              </View>
              {name === current ? <Text style={styles.activeDot}>&#9679;</Text> : null}
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(27,42,65,.38)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 14,
    paddingHorizontal: 22,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 17,
    color: colors.navy,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.sage,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.navy,
    fontFamily: fonts.bodyRegular,
  },
  activeDot: {
    color: colors.copper,
    fontSize: 15,
  },
});

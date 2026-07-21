import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { colors, fonts, motion, radii, touchTarget } from '../theme';
import { PrimaryButton, SecondaryButton } from '../ui';
import { formatGpsLabel, nearestFishingWater } from '../lib/locations';

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
  const [custom, setCustom] = useState('');
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setCustom('');
      setGpsError(null);
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

  const submitCustom = () => {
    const name = custom.trim();
    if (!name) return;
    onSelect(name);
  };

  const useGps = async () => {
    setGpsBusy(true);
    setGpsError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setGpsError('Location permission needed to find nearby water.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = pos.coords;
      const nearest = nearestFishingWater(latitude, longitude);
      let reverseName: string | null = null;
      try {
        const places = await Location.reverseGeocodeAsync({ latitude, longitude });
        const p = places[0];
        if (p) {
          reverseName =
            [p.name, p.city || p.subregion, p.region].filter(Boolean).slice(0, 2).join(', ') || null;
        }
      } catch {
        // Offline / web — curated nearest water is enough.
      }
      onSelect(formatGpsLabel(nearest, reverseName));
    } catch {
      setGpsError('Couldn’t read GPS. Pick a lake below or type one.');
    } finally {
      setGpsBusy(false);
    }
  };

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close location picker">
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
          <Text style={styles.title}>Choose location</Text>

          <Pressable
            style={[styles.gpsBtn, gpsBusy && styles.gpsBusy]}
            onPress={() => void useGps()}
            disabled={gpsBusy}
            accessibilityRole="button"
            accessibilityLabel="Use current GPS location"
          >
            {gpsBusy ? (
              <ActivityIndicator color={colors.copper} />
            ) : (
              <Text style={styles.gpsLabel}>Use my location</Text>
            )}
          </Pressable>
          {gpsError ? <Text style={styles.gpsError}>{gpsError}</Text> : null}
          <Text style={styles.gpsHint}>Matches nearby lakes from GPS, or reverse-geocode when farther out.</Text>

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {locations.map((name) => (
              <Pressable
                key={name}
                style={styles.row}
                onPress={() => onSelect(name)}
                accessibilityRole="button"
                accessibilityState={{ selected: name === current }}
              >
                <View style={styles.rowLeft}>
                  <View style={styles.dot} />
                  <Text style={styles.rowLabel}>{name}</Text>
                </View>
                {name === current ? <Text style={styles.active}>Selected</Text> : null}
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.customLabel}>Custom location</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Grandpa’s dock"
            placeholderTextColor={colors.missing}
            value={custom}
            onChangeText={setCustom}
            accessibilityLabel="Custom location"
            onSubmitEditing={submitCustom}
          />
          <PrimaryButton label="Use custom location" onPress={submitCustom} disabled={!custom.trim()} />
          <SecondaryButton label="Close" onPress={onClose} style={{ marginTop: 8 }} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 14,
    paddingHorizontal: 22,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
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
    marginBottom: 12,
  },
  gpsBtn: {
    minHeight: touchTarget.min,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.copper,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184,116,68,0.08)',
    marginBottom: 8,
  },
  gpsBusy: { opacity: 0.7 },
  gpsLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.copper,
  },
  gpsHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
    marginBottom: 10,
  },
  gpsError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.danger,
    marginBottom: 6,
  },
  list: {
    maxHeight: 280,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: touchTarget.min,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderFaint,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    flex: 1,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.sageSoft,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.navy,
    fontFamily: fonts.bodyRegular,
    flex: 1,
  },
  active: {
    color: colors.copper,
    fontSize: 12,
    fontFamily: fonts.bodySemiBold,
  },
  customLabel: {
    marginTop: 12,
    marginBottom: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  input: {
    minHeight: touchTarget.comfortable,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: colors.background,
    fontFamily: fonts.bodyRegular,
    marginBottom: 12,
  },
});

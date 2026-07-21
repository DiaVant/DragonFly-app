import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
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
import {
  formatDistanceKm,
  formatGpsLabel,
  nearbyFishingWaters,
  nearestFishingWater,
  type NearbyWater,
} from '../lib/locations';

interface Props {
  visible: boolean;
  locations: string[];
  current: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

interface Coords {
  latitude: number;
  longitude: number;
}

async function readBrowserGeolocation(): Promise<Coords> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not available in this browser.');
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(new Error(err.message || 'Browser location denied')),
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    );
  });
}

async function readDeviceCoords(): Promise<Coords> {
  // Prefer last-known for speed, then a fresh read.
  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last?.coords) {
      return { latitude: last.coords.latitude, longitude: last.coords.longitude };
    }
  } catch {
    /* continue */
  }

  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch (err) {
    // Web / denied Expo path — fall back to browser geolocation.
    if (Platform.OS === 'web') {
      return readBrowserGeolocation();
    }
    throw err;
  }
}

export function LocationSheet({ visible, locations, current, onSelect, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [custom, setCustom] = useState('');
  const [gpsBusy, setGpsBusy] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [nearby, setNearby] = useState<NearbyWater[]>([]);
  const [gpsLabel, setGpsLabel] = useState<string | null>(null);
  const backdrop = useRef(new Animated.Value(0)).current;
  const sheetY = useRef(new Animated.Value(420)).current;
  const autoTried = useRef(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setCustom('');
      setGpsError(null);
      autoTried.current = false;
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
      ]).start(() => {
        setMounted(false);
        setNearby([]);
        setGpsLabel(null);
      });
    }
  }, [visible, backdrop, sheetY]);

  const applyCoords = useCallback(async (coords: Coords) => {
    const ranked = nearbyFishingWaters(coords.latitude, coords.longitude, {
      maxKm: 150,
      limit: 8,
      minResults: 5,
    });
    setNearby(ranked);

    const nearest = nearestFishingWater(coords.latitude, coords.longitude);
    let reverseName: string | null = null;
    try {
      const places = await Location.reverseGeocodeAsync(coords);
      const p = places[0];
      if (p) {
        reverseName =
          [p.name, p.city || p.subregion, p.region].filter(Boolean).slice(0, 2).join(', ') || null;
      }
    } catch {
      /* offline / web */
    }
    setGpsLabel(formatGpsLabel(nearest, reverseName));
  }, []);

  const locate = useCallback(
    async (opts?: { selectNearest?: boolean }) => {
      setGpsBusy(true);
      setGpsError(null);
      try {
        const perm = await Location.requestForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          // On web, permission may still work via browser prompt in getCurrentPosition.
          if (Platform.OS !== 'web') {
            setGpsError('Allow location access to find waters near you.');
            return;
          }
        }

        const coords = await readDeviceCoords();
        await applyCoords(coords);

        if (opts?.selectNearest) {
          const nearest = nearestFishingWater(coords.latitude, coords.longitude);
          let reverseName: string | null = null;
          try {
            const places = await Location.reverseGeocodeAsync(coords);
            const p = places[0];
            if (p) {
              reverseName =
                [p.name, p.city || p.subregion, p.region].filter(Boolean).slice(0, 2).join(', ') ||
                null;
            }
          } catch {
            /* ignore */
          }
          onSelect(formatGpsLabel(nearest, reverseName));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Couldn’t read GPS';
        setGpsError(
          Platform.OS === 'web'
            ? `${msg}. Allow location in the browser, or pick a lake below.`
            : `${msg}. Check location permissions, or pick a lake below.`
        );
      } finally {
        setGpsBusy(false);
      }
    },
    [applyCoords, onSelect]
  );

  // Auto-load nearby waters when the sheet opens.
  useEffect(() => {
    if (!visible || !mounted || autoTried.current) return;
    autoTried.current = true;
    void locate({ selectNearest: false });
  }, [visible, mounted, locate]);

  const otherLocations = useMemo(() => {
    const nearNames = new Set(nearby.map((n) => n.name));
    return locations.filter((name) => !nearNames.has(name));
  }, [locations, nearby]);

  if (!mounted) return null;

  const submitCustom = () => {
    const name = custom.trim();
    if (!name) return;
    onSelect(name);
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
            onPress={() => void locate({ selectNearest: true })}
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
          {gpsLabel && !gpsBusy ? (
            <Text style={styles.gpsHint}>Nearest match · {gpsLabel}</Text>
          ) : (
            <Text style={styles.gpsHint}>Finds waters near you and lists them below.</Text>
          )}
          {gpsError ? <Text style={styles.gpsError}>{gpsError}</Text> : null}

          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {nearby.length ? (
              <>
                <Text style={styles.sectionLabel}>Near you</Text>
                {nearby.map((water) => (
                  <Pressable
                    key={`near-${water.name}`}
                    style={styles.row}
                    onPress={() => onSelect(water.name)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: water.name === current }}
                  >
                    <View style={styles.rowLeft}>
                      <View style={[styles.dot, styles.dotNear]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.rowLabel}>{water.name}</Text>
                        <Text style={styles.rowMeta}>
                          {formatDistanceKm(water.distanceKm)}
                          {water.region ? ` · ${water.region}` : ''}
                        </Text>
                      </View>
                    </View>
                    {water.name === current ? <Text style={styles.active}>Selected</Text> : null}
                  </Pressable>
                ))}
              </>
            ) : null}

            <Text style={styles.sectionLabel}>{nearby.length ? 'All waters' : 'Waters'}</Text>
            {(nearby.length ? otherLocations : locations).map((name) => (
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
    marginBottom: 8,
  },
  gpsError: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.danger,
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.slateBlue,
    marginTop: 10,
    marginBottom: 4,
  },
  list: {
    maxHeight: 300,
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
  dotNear: {
    backgroundColor: colors.copper,
  },
  rowLabel: {
    fontSize: 15,
    color: colors.navy,
    fontFamily: fonts.bodyRegular,
    flex: 1,
  },
  rowMeta: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
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

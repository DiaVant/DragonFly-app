import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, motion, radii, touchTarget } from '../theme';
import { shareText, shareToFacebook, type ShareResult } from '../lib/share';

interface Props {
  visible: boolean;
  message: string;
  title?: string;
  onClose: () => void;
  onResult?: (result: ShareResult, via: string) => void;
}

type Dest = {
  id: string;
  label: string;
  hint: string;
  run: () => Promise<ShareResult>;
};

/**
 * Explicit share-destination sheet (Facebook, Messages, X, copy, system More).
 */
export function ShareDestinationSheet({ visible, message, title, onClose, onResult }: Props) {
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

  const finish = (result: ShareResult, via: string) => {
    onResult?.(result, via);
    onClose();
  };

  const dests: Dest[] = [
    {
      id: 'facebook',
      label: 'Facebook',
      hint: 'Open Facebook share',
      run: () => shareToFacebook(message),
    },
    {
      id: 'messages',
      label: 'Messages',
      hint: 'Text a friend',
      run: async () => {
        const body = encodeURIComponent(message.slice(0, 400));
        const url = Platform.OS === 'ios' ? `sms:&body=${body}` : `sms:?body=${body}`;
        try {
          const can = await Linking.canOpenURL(url);
          if (can) {
            await Linking.openURL(url);
            return 'shared';
          }
        } catch {
          /* fall through */
        }
        return shareText(message, 'Messages');
      },
    },
    {
      id: 'x',
      label: 'X',
      hint: 'Post to X',
      run: async () => {
        const text = encodeURIComponent(message.slice(0, 240));
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        try {
          if (typeof window !== 'undefined') {
            window.open(url, '_blank', 'noopener,noreferrer');
            return 'shared';
          }
          await Linking.openURL(url);
          return 'shared';
        } catch {
          return shareText(message, 'X');
        }
      },
    },
    {
      id: 'copy',
      label: 'Copy link text',
      hint: 'Paste into Instagram or anywhere',
      run: async () => shareText(message, title),
    },
    {
      id: 'more',
      label: 'More…',
      hint: 'System share sheet',
      run: async () => shareText(message, title),
    },
  ];

  return (
    <Modal transparent visible statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close share">
          <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdrop }]} />
        </Pressable>
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 20), transform: [{ translateY: sheetY }] },
          ]}
        >
          <View style={styles.grabber} />
          <Text style={styles.title}>Share to</Text>
          <Text style={styles.sub}>Pick Facebook, Messages, or another app</Text>
          {dests.map((d) => (
            <Pressable
              key={d.id}
              style={styles.row}
              onPress={() => {
                void (async () => {
                  const result = await d.run();
                  finish(result, d.label);
                })();
              }}
              accessibilityRole="button"
              accessibilityLabel={d.label}
              accessibilityHint={d.hint}
            >
              <View style={styles.icon}>
                <Text style={styles.iconText}>{d.label.slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{d.label}</Text>
                <Text style={styles.rowHint}>{d.hint}</Text>
              </View>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: colors.overlay },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 18,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 20,
    color: colors.navy,
  },
  sub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: touchTarget.min,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 15,
    color: colors.navy,
  },
  rowLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.navy,
  },
  rowHint: {
    fontFamily: fonts.bodyRegular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});

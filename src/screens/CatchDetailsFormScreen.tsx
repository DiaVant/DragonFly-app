import React, { useState, type ReactNode } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen, PrimaryButton, SecondaryButton, Card } from '../ui';
import { colors, fonts, radii, touchTarget } from '../theme';
import { NoPhotoFill } from '../components/PhotoPlaceholder';
import { resolveCatchImageSource } from '../lib/defaultPhotos';
import { fmtElapsed } from '../lib/format';
import type { CatchForm } from '../types';

interface Props {
  title: string;
  form: CatchForm;
  onSpecies: (v: string) => void;
  onSize: (v: string) => void;
  onWeight: (v: string) => void;
  onPhotoChange: (photo: boolean, imageUri?: string) => void;
  autoScore: number;
  autoFightSeconds: number;
  autoLocation: string;
  onChangeLocation?: () => void;
  autoDateTime: string;
  saveLabel: string;
  secondaryLabel: string;
  onSave: () => void;
  onSecondary: () => void;
}

export function CatchDetailsFormScreen({
  title,
  form,
  onSpecies,
  onSize,
  onWeight,
  onPhotoChange,
  autoScore,
  autoFightSeconds,
  autoLocation,
  onChangeLocation,
  autoDateTime,
  saveLabel,
  secondaryLabel,
  onSave,
  onSecondary,
}: Props) {
  const [saving, setSaving] = useState(false);
  const dirty =
    Boolean(form.species.trim()) ||
    Boolean(form.size.trim()) ||
    Boolean(form.weight.trim()) ||
    Boolean(form.imageUri) ||
    form.photo;

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo access needed', 'Allow photo library access to attach a catch photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        onPhotoChange(true, result.assets[0].uri);
      }
    } catch {
      // Polished fallback: keep boolean photo toggle if picker fails.
      onPhotoChange(!form.photo, undefined);
    }
  };

  const clearPhoto = () => onPhotoChange(false, undefined);

  const handleSecondary = () => {
    if (!dirty) {
      onSecondary();
      return;
    }
    const message = 'Discard the details you entered?';
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (window.confirm(message)) onSecondary();
      return;
    }
    Alert.alert('Discard changes?', message, [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: onSecondary },
    ]);
  };

  const handleSave = () => {
    setSaving(true);
    onSave();
    setSaving(false);
  };

  const photoSource = resolveCatchImageSource(form.imageUri);

  return (
    <Screen scroll>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>Every field is optional — add what you want to remember.</Text>

      <Pressable
        style={styles.photoBox}
        onPress={form.imageUri || form.photo ? clearPhoto : pickImage}
        accessibilityRole="button"
        accessibilityLabel={form.imageUri || form.photo ? 'Remove photo' : 'Add photo'}
      >
        {photoSource ? (
          <Image source={photoSource} style={styles.photo} resizeMode="cover" accessibilityLabel="Catch photo" />
        ) : form.photo ? (
          <View style={styles.photoAdded}>
            <Text style={styles.photoAddedLabel}>Photo marked · tap to remove</Text>
          </View>
        ) : (
          <NoPhotoFill title="Add a photo of your catch" label="Optional · tap to choose" showMark markSize={40} />
        )}
      </Pressable>

      <Text style={styles.group}>About the fish</Text>
      <Field label="Species (optional)">
        <TextInput
          style={styles.input}
          placeholder="e.g. Rainbow Trout"
          placeholderTextColor={colors.missing}
          value={form.species}
          onChangeText={onSpecies}
          accessibilityLabel="Species"
        />
      </Field>

      <View style={styles.row}>
        <View style={styles.rowField}>
          <Field label="Size (optional)">
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.inputWithUnit]}
                placeholder="0"
                placeholderTextColor={colors.missing}
                keyboardType="decimal-pad"
                value={form.size}
                onChangeText={onSize}
                accessibilityLabel="Size in inches"
              />
              <Text style={styles.unit}>in</Text>
            </View>
          </Field>
        </View>
        <View style={styles.rowField}>
          <Field label="Weight (optional)">
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, styles.inputWithUnit]}
                placeholder="0"
                placeholderTextColor={colors.missing}
                keyboardType="decimal-pad"
                value={form.weight}
                onChangeText={onWeight}
                accessibilityLabel="Weight in pounds"
              />
              <Text style={styles.unit}>lb</Text>
            </View>
          </Field>
        </View>
      </View>

      <Text style={styles.group}>Recorded by DragonFly</Text>
      <Card>
        <AutoRow label="Catch score" value={String(autoScore)} emphasize />
        <AutoRow label="Fight duration" value={fmtElapsed(autoFightSeconds)} mono />
        <Pressable onPress={onChangeLocation} disabled={!onChangeLocation}>
          <AutoRow label="Location" value={autoLocation} action={onChangeLocation ? 'Change' : undefined} />
        </Pressable>
        <AutoRow label="Date & time" value={autoDateTime} mono last />
      </Card>

      <PrimaryButton label={saving ? 'Saving…' : saveLabel} onPress={handleSave} loading={saving} style={styles.save} />
      <SecondaryButton label={secondaryLabel} onPress={handleSecondary} />
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function AutoRow({
  label,
  value,
  mono,
  emphasize,
  action,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  emphasize?: boolean;
  action?: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.autoRow, last && styles.autoRowLast]}>
      <Text style={styles.autoLabel}>{label}</Text>
      <View style={styles.autoRight}>
        <Text
          style={[styles.autoValue, mono && styles.mono, emphasize && styles.emphasize]}
          numberOfLines={2}
        >
          {value}
        </Text>
        {action ? <Text style={styles.action}>{action}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    color: colors.navy,
  },
  subtitle: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  photoBox: {
    height: 180,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    backgroundColor: colors.backgroundAlt,
  },
  photo: { width: '100%', height: '100%' },
  photoAdded: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 14,
  },
  photoAddedLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textOnDark,
  },
  group: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
    marginTop: 4,
  },
  field: { marginBottom: 14 },
  fieldLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    minHeight: touchTarget.comfortable,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.navy,
    backgroundColor: colors.surface,
    fontFamily: fonts.bodyRegular,
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  rowField: { flex: 1 },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  inputWithUnit: { paddingRight: 40 },
  unit: {
    position: 'absolute',
    right: 14,
    fontSize: 13,
    color: colors.missing,
    fontFamily: fonts.monoRegular,
  },
  autoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderFaint,
  },
  autoRowLast: { borderBottomWidth: 0 },
  autoLabel: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  autoRight: { flex: 1, alignItems: 'flex-end' },
  autoValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.navy,
    textAlign: 'right',
  },
  mono: { fontFamily: fonts.monoRegular },
  emphasize: {
    fontFamily: fonts.displaySemiBold,
    color: colors.copper,
    fontSize: 18,
  },
  action: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.copper,
    marginTop: 2,
  },
  save: { marginTop: 20, marginBottom: 8 },
});

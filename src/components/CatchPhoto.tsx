import React from 'react';
import { Image, StyleSheet, View, ImageStyle, StyleProp, ViewStyle } from 'react-native';
import { NoPhotoFill, PhotoFill } from './PhotoPlaceholder';
import { defaultPhotoForCatch, resolveCatchImageSource } from '../lib/defaultPhotos';
import type { Catch } from '../types';

interface Props {
  item: Pick<Catch, 'id' | 'species' | 'photo' | 'imageUri'>;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  emptyLabel?: string;
  showMark?: boolean;
  markSize?: number;
}

/**
 * Catch photo clipped to its container. Never uses absoluteFill on the Image
 * itself so it cannot paint over sibling text on web.
 */
export function CatchPhoto({
  item,
  style,
  containerStyle,
  emptyLabel = 'Photo not added',
  showMark,
  markSize,
}: Props) {
  const marker = item.imageUri || (item.photo ? defaultPhotoForCatch(item.id, item.species) : undefined);
  const source = resolveCatchImageSource(marker);

  return (
    <View style={[styles.clip, containerStyle]}>
      {source ? (
        <Image
          source={source}
          style={[styles.image, style]}
          resizeMode="cover"
          accessibilityLabel="Catch photo"
        />
      ) : item.photo ? (
        <PhotoFill />
      ) : (
        <NoPhotoFill label={emptyLabel} showMark={showMark} markSize={markSize} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

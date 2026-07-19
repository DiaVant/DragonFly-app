import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { CatchCard } from '../components/CatchCard';
import type { Catch } from '../types';

interface Props {
  catches: Catch[];
  onOpen: (id: string) => void;
}

export function JourneyGalleryScreen({ catches, onOpen }: Props) {
  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={catches}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Journey</Text>
          <Text style={styles.count}>{catches.length} catches</Text>
        </View>
      }
      renderItem={({ item }) => <CatchCard item={item} onPress={() => onOpen(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: 24,
    color: colors.navy,
  },
  count: {
    fontSize: 12,
    color: colors.missing,
    fontFamily: fonts.monoRegular,
  },
});

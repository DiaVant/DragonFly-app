import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme/colors';
import { useDragonflyState } from './hooks/useDragonflyState';
import { ScreenTransition } from './components/ScreenTransition';
import { TabBar } from './components/TabBar';
import { LocationSheet } from './components/LocationSheet';
import { HomeScreen } from './screens/HomeScreen';
import { FishingReadyScreen } from './screens/FishingReadyScreen';
import { FishingActiveScreen } from './screens/FishingActiveScreen';
import { CatchScoreScreen } from './screens/CatchScoreScreen';
import { CatchDetailsFormScreen } from './screens/CatchDetailsFormScreen';
import { JourneyEmptyScreen } from './screens/JourneyEmptyScreen';
import { JourneyGalleryScreen } from './screens/JourneyGalleryScreen';
import { CatchDetailScreen } from './screens/CatchDetailScreen';
import { fmtElapsed } from './lib/format';

export function DragonflyApp() {
  const state = useDragonflyState();
  const { route, actions } = state;

  const editingCatch = state.editing ? state.catches.find((c) => c.id === state.detailView) : undefined;
  const eo = state.editing ? editingCatch : state.lastCatch ?? undefined;
  const detailCatch = state.detailView ? state.catches.find((c) => c.id === state.detailView) : undefined;

  let content: React.ReactNode = null;
  switch (route) {
    case 'home':
      content = <HomeScreen />;
      break;
    case 'ready':
      content = (
        <FishingReadyScreen location={state.location} onOpenLocation={actions.openLoc} onStartFight={actions.startFight} />
      );
      break;
    case 'active':
      content = (
        <FishingActiveScreen location={state.location} elapsed={state.elapsed} onLandFish={actions.landFish} />
      );
      break;
    case 'score':
      content = (
        <CatchScoreScreen
          scoreDisplay={state.scoreDisplay}
          lastFight={state.lastCatch ? fmtElapsed(state.lastCatch.fightSeconds) : ''}
          lastLoc={state.lastCatch ? state.lastCatch.location : ''}
          onAddDetails={actions.gotoDetails}
          onSkip={actions.skipSave}
        />
      );
      break;
    case 'details':
      content = (
        <CatchDetailsFormScreen
          title={state.editing ? 'Edit Catch' : 'Add Catch Details'}
          form={state.form}
          onSpecies={actions.onSpecies}
          onSize={actions.onSize}
          onWeight={actions.onWeight}
          onTogglePhoto={actions.togglePhoto}
          autoScore={eo?.score ?? 0}
          autoFightSeconds={eo?.fightSeconds ?? 0}
          autoLocation={eo?.location || state.location}
          autoDateTime={eo ? `${eo.date}${eo.time ? ` · ${eo.time}` : ''}` : ''}
          saveLabel={state.editing ? 'Save changes' : 'Save to Journey'}
          secondaryLabel={state.editing ? 'Cancel' : 'Skip Details and Save'}
          onSave={actions.saveCatch}
          onSecondary={state.editing ? actions.cancelEdit : actions.skipSave}
        />
      );
      break;
    case 'empty':
      content = <JourneyEmptyScreen onStartFishing={actions.startFishing} />;
      break;
    case 'gallery':
      content = <JourneyGalleryScreen catches={state.catches} onOpen={actions.openDetail} />;
      break;
    case 'detail':
      content = detailCatch ? (
        <CatchDetailScreen item={detailCatch} onClose={actions.closeDetail} onEdit={actions.editCatch} onDelete={actions.deleteCatch} />
      ) : null;
      break;
  }

  const screenKey = `${route}|${state.detailView ?? ''}`;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <ScreenTransition screenKey={screenKey}>{content}</ScreenTransition>
      </View>
      <TabBar tab={state.tab} onHome={actions.goHome} onFishing={actions.goFishing} onJourney={actions.goJourney} />
      <LocationSheet
        visible={state.locOpen}
        locations={state.locations}
        current={state.location}
        onSelect={actions.setLoc}
        onClose={actions.closeLoc}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});

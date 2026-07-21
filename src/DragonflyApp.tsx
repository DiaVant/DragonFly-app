import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme';
import { useDragonflyState } from './hooks/useDragonflyState';
import { ScreenTransition } from './components/ScreenTransition';
import { TabBar } from './components/TabBar';
import { LocationSheet } from './components/LocationSheet';
import { HomeScreen } from './screens/HomeScreen';
import { FishingReadyScreen } from './screens/FishingReadyScreen';
import { FishingActiveScreen } from './screens/FishingActiveScreen';
import { CatchScoreScreen } from './screens/CatchScoreScreen';
import { FightLostScreen } from './screens/FightLostScreen';
import { CatchDetailsFormScreen } from './screens/CatchDetailsFormScreen';
import { JourneyEmptyScreen } from './screens/JourneyEmptyScreen';
import { JourneyGalleryScreen } from './screens/JourneyGalleryScreen';
import { CatchDetailScreen } from './screens/CatchDetailScreen';
import { ErrorState } from './ui';

export function DragonflyApp() {
  const state = useDragonflyState();
  const { route, actions } = state;

  if (!state.hydrated) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.copper} />
        </View>
      </SafeAreaView>
    );
  }

  const editingCatch = state.editing ? state.catches.find((c) => c.id === state.detailView) : undefined;
  const eo = state.editing ? editingCatch : state.lastCatch ?? undefined;
  const detailCatch = state.detailView ? state.catches.find((c) => c.id === state.detailView) : undefined;

  let content: React.ReactNode = null;
  switch (route) {
    case 'home':
      content = (
        <HomeScreen
          connectionStatus={state.ble.connectionStatus}
          connecting={state.ble.setupConnecting}
          error={state.ble.connectError}
          onConnect={actions.connectDevice}
          onStartFishing={actions.startFishing}
          onOpenJourney={actions.goJourney}
          onOpenCatch={actions.openDetail}
          summary={state.journeySummary}
          recentCatch={state.catches[0] ?? null}
        />
      );
      break;
    case 'ready':
      content = (
        <FishingReadyScreen
          location={state.location}
          connectionStatus={state.ble.connectionStatus}
          onOpenLocation={actions.openLoc}
          onStartFight={actions.startFight}
          onSimulateFight={actions.startSimulatedFight}
          onConnect={actions.connectDevice}
          connecting={state.ble.connecting}
          error={state.ble.error}
        />
      );
      break;
    case 'active':
      content = (
        <FishingActiveScreen
          location={state.location}
          elapsed={state.elapsed}
          samples={state.ble.values}
          sampleCount={state.ble.sampleCount}
          expectedCount={state.ble.expectedCount}
          receiving={state.ble.receiving}
          onLandFish={actions.landFish}
          onLoseFish={actions.loseFish}
          awaitingEnd={state.ble.awaitingEnd}
          stopping={state.ble.stopping}
          simulated={state.simulating}
        />
      );
      break;
    case 'score':
      content = (
        <CatchScoreScreen
          scoreDisplay={state.scoreDisplay}
          catchItem={state.lastCatch}
          aiReviewStatus={state.aiReviewStatus}
          onAddDetails={actions.gotoDetails}
          onSkip={actions.skipSave}
        />
      );
      break;
    case 'lost':
      content = (
        <FightLostScreen
          catchItem={state.lastCatch}
          aiReviewStatus={state.aiReviewStatus}
          onSaveNotes={actions.gotoDetails}
          onSaveToJourney={actions.skipSave}
          onTryAgain={actions.startFishing}
        />
      );
      break;
    case 'details':
      content = (
        <CatchDetailsFormScreen
          title={
            state.editing
              ? 'Edit Catch'
              : state.lastCatch?.outcome === 'lost'
                ? 'Save what you learned'
                : 'Add Catch Details'
          }
          form={state.form}
          onSpecies={actions.onSpecies}
          onSize={actions.onSize}
          onWeight={actions.onWeight}
          onPhotoChange={actions.onPhotoChange}
          autoScore={eo?.score ?? 0}
          autoFightSeconds={eo?.fightSeconds ?? 0}
          autoLocation={eo?.location || state.location}
          onChangeLocation={actions.openLoc}
          autoDateTime={eo ? `${eo.date}${eo.time ? ` · ${eo.time}` : ''}` : ''}
          saveLabel={
            state.editing
              ? 'Save changes'
              : state.lastCatch?.outcome === 'lost'
                ? 'Save to Journey'
                : 'Save to Journey'
          }
          secondaryLabel={
            state.editing
              ? 'Cancel'
              : state.lastCatch?.outcome === 'lost'
                ? 'Skip notes and save'
                : 'Skip Details and Save'
          }
          onSave={actions.saveCatch}
          onSecondary={state.editing ? actions.cancelEdit : actions.skipSave}
        />
      );
      break;
    case 'empty':
      content = <JourneyEmptyScreen onStartFishing={actions.startFishing} />;
      break;
    case 'gallery':
      content = (
        <JourneyGalleryScreen
          catches={state.catches}
          onOpen={actions.openDetail}
          onStartFishing={actions.startFishing}
        />
      );
      break;
    case 'detail':
      content = detailCatch ? (
        <CatchDetailScreen
          item={detailCatch}
          onClose={actions.closeDetail}
          onEdit={actions.editCatch}
          onDelete={actions.deleteCatch}
        />
      ) : (
        <ErrorState
          title="Catch not found"
          body="This catch may have been deleted."
          actionLabel="Back to Journey"
          onAction={actions.closeDetail}
        />
      );
      break;
  }

  const screenKey = `${route}|${state.detailView ?? ''}`;
  const hideTab = route === 'active' || route === 'score' || route === 'lost' || route === 'details';

  return (
    <SafeAreaView style={[styles.root, hideTab && styles.rootDark]} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        <ScreenTransition screenKey={screenKey}>{content}</ScreenTransition>
      </View>
      {!hideTab ? (
        <TabBar
          tab={state.tab}
          onHome={actions.goHome}
          onJourney={actions.goJourney}
          onFishOn={actions.onFishOn}
          fishOnActive={state.phase === 'active'}
          fishOnLabel={
            state.tab === 'fishing' && state.phase === 'ready'
              ? state.ble.connectionStatus === 'connected'
                ? 'Fish On — start fight'
                : 'Fish On — start live simulation'
              : 'Go fishing'
          }
        />
      ) : null}
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
    backgroundColor: colors.dawnMid,
  },
  rootDark: {
    backgroundColor: colors.fightBg,
  },
  content: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from './theme';
import { useDragonflyState } from './hooks/useDragonflyState';
import { ScreenTransition } from './components/ScreenTransition';
import { TabBar } from './components/TabBar';
import { FishOnExpand, type FishOnOrigin } from './components/FishOnExpand';
import { LocationSheet } from './components/LocationSheet';
import { ConnectGuideSheet } from './components/ConnectGuideSheet';
import { FishOnChoiceSheet } from './components/FishOnChoiceSheet';
import { HomeScreen } from './screens/HomeScreen';
import { FishingReadyScreen } from './screens/FishingReadyScreen';
import { FishingActiveScreen } from './screens/FishingActiveScreen';
import { CatchScoreScreen } from './screens/CatchScoreScreen';
import { FightLostScreen } from './screens/FightLostScreen';
import { CatchDetailsFormScreen } from './screens/CatchDetailsFormScreen';
import { JourneyEmptyScreen } from './screens/JourneyEmptyScreen';
import { JourneyGalleryScreen } from './screens/JourneyGalleryScreen';
import { CatchDetailScreen } from './screens/CatchDetailScreen';
import { SocialFeedScreen } from './screens/SocialFeedScreen';
import { GearSetupScreen } from './screens/GearSetupScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ErrorState } from './ui';
import { HARDWARE_NAME } from './lib/product';

function centerBurstOrigin(): FishOnOrigin {
  const { width, height } = Dimensions.get('window');
  const size = 88;
  return { x: (width - size) / 2, y: height * 0.42, size };
}

export function DragonflyApp() {
  const state = useDragonflyState();
  const { route, actions } = state;
  const [fishBurst, setFishBurst] = useState<FishOnOrigin | null>(null);
  const [connectGuideOpen, setConnectGuideOpen] = useState(false);
  const [fishChoiceOpen, setFishChoiceOpen] = useState(false);
  const skipTransitionRef = useRef(false);
  const fishActionPending = useRef(false);
  const pendingBurstAction = useRef<'navigate' | 'start' | 'simulate' | null>(null);
  const pendingChoiceOrigin = useRef<FishOnOrigin | null>(null);

  const runBurst = useCallback((origin: FishOnOrigin, intent: 'navigate' | 'start' | 'simulate') => {
    if (fishActionPending.current || state.phase === 'active') return;
    fishActionPending.current = true;
    skipTransitionRef.current = true;
    pendingBurstAction.current = intent;
    setFishBurst(origin);
  }, [state.phase]);

  const handleFishOnPress = useCallback(
    (origin: FishOnOrigin) => {
      if (fishActionPending.current || state.phase === 'active') return;

      // On Ready without hardware: ask before simulating (keep origin for burst).
      if (
        state.tab === 'fishing' &&
        state.phase === 'ready' &&
        state.ble.connectionStatus !== 'connected'
      ) {
        pendingChoiceOrigin.current = origin;
        setFishChoiceOpen(true);
        return;
      }

      runBurst(
        origin,
        state.tab === 'fishing' && state.phase === 'ready' ? 'start' : 'navigate'
      );
    },
    [state.phase, state.tab, state.ble.connectionStatus, runBurst]
  );

  const handleSimulateBurst = useCallback(
    (origin: FishOnOrigin) => {
      runBurst(origin, 'simulate');
    },
    [runBurst]
  );

  const handleFishCovered = useCallback(() => {
    const intent = pendingBurstAction.current;
    pendingBurstAction.current = null;
    if (intent === 'simulate') {
      actions.startSimulatedFight();
      return;
    }
    if (intent === 'start') {
      void actions.startFight();
      return;
    }
    actions.startFishing();
  }, [actions]);

  const handleFishFinished = useCallback(() => {
    setFishBurst(null);
    fishActionPending.current = false;
    requestAnimationFrame(() => {
      skipTransitionRef.current = false;
    });
  }, []);

  const startPracticeWithBurst = useCallback(() => {
    setFishChoiceOpen(false);
    const origin = pendingChoiceOrigin.current ?? centerBurstOrigin();
    pendingChoiceOrigin.current = null;
    runBurst(origin, 'simulate');
  }, [runBurst]);

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
          onOpenTroubleshooting={() => setConnectGuideOpen(true)}
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
          onFishOn={handleFishOnPress}
          onSimulateFight={handleSimulateBurst}
          onConnect={actions.connectDevice}
          connecting={state.ble.connecting}
          error={state.ble.error}
          gearLabel={state.gearLabel !== 'Not set' ? state.gearLabel : undefined}
          onEditGear={() => actions.openGearSetup('ready')}
        />
      );
      break;
    case 'settings':
      content = (
        <SettingsScreen
          connectionStatus={state.ble.connectionStatus}
          gear={state.gear}
          onEditGear={() => actions.openGearSetup('ready')}
          onConnectHelp={() => setConnectGuideOpen(true)}
          onConnect={actions.connectDevice}
          connecting={state.ble.setupConnecting}
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
          gearLabel={state.gearLabel !== 'Not set' ? state.gearLabel : undefined}
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
          saveLabel={state.editing ? 'Save changes' : 'Save to Journey'}
          secondaryLabel={
            state.editing
              ? 'Cancel'
              : state.lastCatch?.outcome === 'lost'
                ? 'Skip notes and save'
                : 'Skip details and save'
          }
          onSave={actions.saveCatch}
          onSecondary={state.editing ? actions.cancelEdit : actions.skipSave}
        />
      );
      break;
    case 'gear':
      content = (
        <GearSetupScreen
          initial={state.gear}
          onSave={actions.saveGearConfig}
          onSkip={actions.skipGearSetup}
        />
      );
      break;
    case 'social':
      content = (
        <SocialFeedScreen
          catches={state.catches}
          trips={state.trips}
          gear={state.gear}
          onCreateTrip={actions.createTrip}
          onStartFishing={actions.startFishing}
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
  const hideTab = route === 'active' || route === 'score' || route === 'lost' || route === 'details' || route === 'gear';
  const bursting = fishBurst != null;

  return (
    <View style={styles.shell}>
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <ScreenTransition screenKey={screenKey} instant={skipTransitionRef.current || bursting}>
            {content}
          </ScreenTransition>
        </View>
        {!hideTab ? (
          <TabBar
            tab={state.tab}
            onHome={actions.goHome}
            onSocial={actions.goSocial}
            onJourney={actions.goJourney}
            onSettings={actions.goSettings}
            onFishOn={handleFishOnPress}
            fishOnHidden={bursting}
            fishOnActive={state.phase === 'active'}
            fishOnLabel={
              state.tab === 'fishing' && state.phase === 'ready'
                ? state.ble.connectionStatus === 'connected'
                  ? `Fish On — start with ${HARDWARE_NAME}`
                  : 'Fish On — connect or practice'
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
        <ConnectGuideSheet
          visible={connectGuideOpen}
          connecting={state.ble.setupConnecting}
          onConnect={() => {
            setConnectGuideOpen(false);
            actions.connectDevice();
          }}
          onClose={() => setConnectGuideOpen(false)}
        />
        <FishOnChoiceSheet
          visible={fishChoiceOpen}
          onConnect={() => {
            setFishChoiceOpen(false);
            actions.connectDevice();
          }}
          onPractice={startPracticeWithBurst}
          onClose={() => setFishChoiceOpen(false)}
        />
      </SafeAreaView>
      <FishOnExpand origin={fishBurst} onCovered={handleFishCovered} onFinished={handleFishFinished} />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
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

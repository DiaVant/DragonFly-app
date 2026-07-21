import React from 'react';
import { EmptyState } from '../ui';
import { Screen } from '../ui';

interface Props {
  onStartFishing: () => void;
}

export function JourneyEmptyScreen({ onStartFishing }: Props) {
  return (
    <Screen>
      <EmptyState
        title="Your fishing journey starts here."
        body="Fight with DragonFly 1.0 coaching and save it here — perfect for introducing family and friends."
        actionLabel="Fish On"
        onAction={onStartFishing}
      />
    </Screen>
  );
}

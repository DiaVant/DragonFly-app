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
        title="Your fishing journey starts with the first catch."
        body="Land a fish with DragonFly coaching and it will appear here as a memory you can keep — perfect for introducing family and friends."
        actionLabel="Start Fishing"
        onAction={onStartFishing}
      />
    </Screen>
  );
}

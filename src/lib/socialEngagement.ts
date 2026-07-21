import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'dragonfly.socialEngagement';

export interface StoredComment {
  id: string;
  text: string;
  createdAt: string;
}

export interface SocialEngagementStore {
  /** Activity ids the user has kudoed. */
  kudoed: Record<string, boolean>;
  /** User comments keyed by activity id. */
  comments: Record<string, StoredComment[]>;
}

const EMPTY: SocialEngagementStore = { kudoed: {}, comments: {} };

export async function loadSocialEngagement(): Promise<SocialEngagementStore> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...EMPTY, kudoed: {}, comments: {} };
    const parsed = JSON.parse(raw) as Partial<SocialEngagementStore>;
    return {
      kudoed: parsed.kudoed && typeof parsed.kudoed === 'object' ? parsed.kudoed : {},
      comments: parsed.comments && typeof parsed.comments === 'object' ? parsed.comments : {},
    };
  } catch {
    return { ...EMPTY, kudoed: {}, comments: {} };
  }
}

export async function saveSocialEngagement(store: SocialEngagementStore): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(store));
}

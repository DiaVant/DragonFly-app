import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import type { DragonflySessionFile } from '../types';

const SESSION_FILENAME = 'dragonfly-session.json';
const WEB_SESSION_STORAGE_KEY = 'dragonfly-session';

function getSessionFile(): File {
  return new File(Paths.document, SESSION_FILENAME);
}

/** Overwrites the single fixed session file. No history is kept — every call replaces the prior contents. */
export async function writeSessionFile(session: DragonflySessionFile): Promise<void> {
  const contents = JSON.stringify(session, null, 2);

  // expo-file-system has no writable document directory in the browser.
  // Persist the same JSON in browser storage when running the Expo web build.
  if (Platform.OS === 'web') {
    localStorage.setItem(WEB_SESSION_STORAGE_KEY, contents);
    return;
  }

  const file = getSessionFile();
  if (!file.exists) {
    file.create();
  }
  file.write(contents);
}

export function getSessionFileUri(): string {
  if (Platform.OS === 'web') {
    return `localStorage://${WEB_SESSION_STORAGE_KEY}`;
  }
  return getSessionFile().uri;
}

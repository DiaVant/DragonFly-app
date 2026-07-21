import type { ImageSourcePropType } from 'react-native';

const trout = require('../../assets/catches/trout-catch.png');
const bass = require('../../assets/catches/bass-catch.png');
const cutthroat = require('../../assets/catches/cutthroat-catch.png');

export const CATCH_PHOTO_ASSETS = {
  trout,
  bass,
  cutthroat,
} as const;

export type CatchPhotoKey = keyof typeof CATCH_PHOTO_ASSETS;

const ASSET_PREFIX = '@asset/';

/** Stable marker stored on Catch.imageUri for bundled default photos. */
export function catchPhotoUri(key: CatchPhotoKey): string {
  return `${ASSET_PREFIX}${key}`;
}

export function isBundledCatchPhoto(uri: string | undefined): uri is string {
  return Boolean(uri?.startsWith(ASSET_PREFIX));
}

export function catchPhotoSource(key: CatchPhotoKey): ImageSourcePropType {
  return CATCH_PHOTO_ASSETS[key];
}

/** Convert a stored imageUri (picker URI or @asset/key) into an Image source. */
export function resolveCatchImageSource(uri: string | undefined): ImageSourcePropType | null {
  if (!uri) return null;
  if (uri.startsWith(ASSET_PREFIX)) {
    const key = uri.slice(ASSET_PREFIX.length) as CatchPhotoKey;
    if (key in CATCH_PHOTO_ASSETS) return CATCH_PHOTO_ASSETS[key];
    return null;
  }
  return { uri };
}

const DEFAULTS: CatchPhotoKey[] = ['trout', 'bass', 'cutthroat'];

/** Pick a stable default photo marker for legacy catches that only have photo: true. */
export function defaultPhotoForCatch(id: string, species?: string): string {
  const s = (species ?? '').toLowerCase();
  if (s.includes('bass')) return catchPhotoUri('bass');
  if (s.includes('cutthroat')) return catchPhotoUri('cutthroat');
  if (s.includes('trout')) return catchPhotoUri('trout');
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % DEFAULTS.length;
  return catchPhotoUri(DEFAULTS[hash]!);
}

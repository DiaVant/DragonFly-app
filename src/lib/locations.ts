/** Curated fishing waters + nearest-match helpers for location picking / GPS. */

export interface FishingWater {
  name: string;
  lat: number;
  lng: number;
  region?: string;
}

/** Expanded picker list — PNW-focused with national favorites for demos. */
export const FISHING_WATERS: FishingWater[] = [
  { name: 'Lake Sammamish', lat: 47.5557, lng: -122.0657, region: 'WA' },
  { name: 'Lake Washington', lat: 47.6205, lng: -122.2507, region: 'WA' },
  { name: 'Lake Union', lat: 47.6395, lng: -122.3331, region: 'WA' },
  { name: 'Green Lake', lat: 47.6803, lng: -122.3285, region: 'WA' },
  { name: 'Snoqualmie River', lat: 47.5287, lng: -121.8254, region: 'WA' },
  { name: 'Lake Stevens', lat: 48.0154, lng: -122.0637, region: 'WA' },
  { name: 'Lake Whatcom', lat: 48.7332, lng: -122.3335, region: 'WA' },
  { name: 'Lake Chelan', lat: 47.841, lng: -120.0219, region: 'WA' },
  { name: 'American Lake', lat: 47.129, lng: -122.5645, region: 'WA' },
  { name: 'Puget Sound — Edmonds', lat: 47.8107, lng: -122.3774, region: 'WA' },
  { name: 'Columbia River — Portland', lat: 45.6075, lng: -122.688, region: 'OR' },
  { name: 'Willamette River', lat: 45.5152, lng: -122.6784, region: 'OR' },
  { name: 'Crater Lake', lat: 42.9446, lng: -122.109, region: 'OR' },
  { name: 'Lake Tahoe', lat: 39.0968, lng: -120.0324, region: 'CA/NV' },
  { name: 'Clear Lake', lat: 39.022, lng: -122.804, region: 'CA' },
  { name: 'Lake Murray', lat: 34.0487, lng: -81.2262, region: 'SC' },
  { name: 'Santee Cooper', lat: 33.45, lng: -80.15, region: 'SC' },
  { name: 'Cooper River', lat: 32.95, lng: -79.93, region: 'SC' },
  { name: 'Lake Erie — Cleveland', lat: 41.54, lng: -81.7, region: 'OH' },
  { name: 'Lake Michigan — Chicago', lat: 41.9, lng: -87.55, region: 'IL' },
];

export const LOCATION_NAMES: string[] = FISHING_WATERS.map((w) => w.name);

export const DEFAULT_LOCATION = 'Lake Sammamish';

const EARTH_KM = 6371;

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export interface NearestWaterResult {
  water: FishingWater;
  distanceKm: number;
  /** Prefer curated name when within this radius; else reverse-geocode label. */
  withinCatalog: boolean;
}

/** Match GPS to the closest curated fishing water. */
export function nearestFishingWater(
  lat: number,
  lng: number,
  maxKm = 45
): NearestWaterResult {
  let best = FISHING_WATERS[0]!;
  let bestDist = Infinity;
  for (const water of FISHING_WATERS) {
    const d = haversineKm(lat, lng, water.lat, water.lng);
    if (d < bestDist) {
      bestDist = d;
      best = water;
    }
  }
  return {
    water: best,
    distanceKm: bestDist,
    withinCatalog: bestDist <= maxKm,
  };
}

export function formatGpsLabel(
  nearest: NearestWaterResult,
  reverseName?: string | null
): string {
  if (nearest.withinCatalog) return nearest.water.name;
  if (reverseName?.trim()) return reverseName.trim();
  return `${nearest.water.name} area`;
}

/** Rod / line options for DragonFly 1.0 calibration. */
export const ROD_OPTIONS = [
  { id: 'ultralight', label: 'Ultralight', detail: '1–4 lb class' },
  { id: 'light', label: 'Light', detail: '4–8 lb class' },
  { id: 'medium', label: 'Medium', detail: '8–14 lb class' },
  { id: 'medium_heavy', label: 'Medium-heavy', detail: '12–20 lb class' },
  { id: 'heavy', label: 'Heavy', detail: '20 lb+ class' },
] as const;

export const LINE_OPTIONS = [
  { id: 'mono_6', label: 'Mono 6 lb', detail: 'Monofilament' },
  { id: 'mono_8', label: 'Mono 8 lb', detail: 'Monofilament' },
  { id: 'mono_10', label: 'Mono 10 lb', detail: 'Monofilament' },
  { id: 'fluoro_8', label: 'Fluoro 8 lb', detail: 'Fluorocarbon' },
  { id: 'fluoro_10', label: 'Fluoro 10 lb', detail: 'Fluorocarbon' },
  { id: 'braid_10', label: 'Braid 10 lb', detail: 'Braided' },
  { id: 'braid_15', label: 'Braid 15 lb', detail: 'Braided' },
  { id: 'braid_20', label: 'Braid 20 lb', detail: 'Braided' },
] as const;

export type RodId = (typeof ROD_OPTIONS)[number]['id'];
export type LineId = (typeof LINE_OPTIONS)[number]['id'];

export interface GearConfig {
  rodId: RodId;
  lineId: LineId;
  updatedAt: string;
}

export function rodLabel(id: RodId): string {
  return ROD_OPTIONS.find((r) => r.id === id)?.label ?? id;
}

export function lineLabel(id: LineId): string {
  return LINE_OPTIONS.find((l) => l.id === id)?.label ?? id;
}

export function gearSummary(gear: GearConfig | null): string {
  if (!gear) return 'Not set';
  return `${rodLabel(gear.rodId)} · ${lineLabel(gear.lineId)}`;
}

# DragonFly

DragonFly is an M&TSI product: a compact smart fishing-rod attachment that monitors the fish fight and helps beginners manage drag and line tension. The app helps experienced anglers confidently introduce children, family, and friends to fishing.

This repository is an Expo (SDK 57) React Native app that runs on **iOS**, **Android**, and **web**.

## Installation

```bash
npm ci
```

Do not upgrade Expo, React Native, TypeScript, or BLE packages casually — pin to the versions in `package.json`.

## Normal web preview

```bash
npm run web
```

Then open the URL Metro prints (usually http://localhost:8081).

Desktop web uses a centered max-width shell so the UI does not stretch across the full browser.

## Mobile preview

```bash
npm start
```

Scan the QR code with Expo Go, or press `i` / `a` for simulators when available.

BLE hardware testing requires a physical device with Bluetooth (and Chrome/Edge + Web Bluetooth on web).

## Design Lab preview

Preview every important UI state **without DragonFly hardware**. Uses real production screens with development fixtures. Does **not** write catch data or drive live BLE.

```bash
EXPO_PUBLIC_DESIGN_LAB=true npm run web
```

Then open the printed localhost URL. Use the left panel (or “Show states” on narrow widths) to switch states: connect, fight coaching, score, journey, errors, and more.

Design Lab is gated with `__DEV__` **and** `EXPO_PUBLIC_DESIGN_LAB=true`.

## Hardware / BLE testing notes

- Device name: `DragonFly`
- Service / characteristic UUIDs and `START` / `STOP` commands are unchanged — see `src/ble/constants.ts`
- Web: Chrome or Edge on localhost/HTTPS; user gesture required for `requestDevice`
- Native: `react-native-ble-plx` with the Expo config plugin permission string
- Session samples are a **unitless relative tension index**, not calibrated pounds or force
- Baseline catch score (without OpenAI): average of collected samples, rounded
- With OpenAI configured: post-fight rubric score + coaching replace the baseline after review

## OpenAI post-fight review (optional)

Live in-fight coaching stays local and fast. After Landed / Didn't land, the app can call OpenAI for a 0–100 control score and short coaching notes.

```bash
cp .env.example .env
# set EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

- Default model: `gpt-4o-mini` (override with `EXPO_PUBLIC_OPENAI_MODEL`)
- Without a key, the app keeps rule-based coaching + average tension score
- Client-side keys are fine for a prototype only — prefer a backend proxy before shipping

## New dependencies / permissions

- `expo-image-picker` — optional catch photos (photo library permission)
- Existing: `expo-linear-gradient`, `react-native-svg`, `@react-native-async-storage/async-storage`, BLE stack

Legacy catches with `photo: boolean` still load. New catches may also store `imageUri` and optional session analytics.

## Relative coaching prototype

Coaching lives in `src/coaching/`:

- `thresholds.ts` — configurable ratios/windows (**requires hardware calibration**)
- `engine.ts` — rolling baseline, trend, variability → limited coaching states
- `dragAdvisor.ts` — anticipatory relative-drag Ease / Hold / Recover from trend + rise rate
- `analytics.ts` — downsample + summaries stored on the catch
- `src/ai/fightReview.ts` — optional OpenAI post-fight review

Advice examples: “Keep reeling steadily”, “Let the fish run”, “Ease the drag slightly”, “Watch for slack”.

The active-fight UI shows coaching first, then relative tension, timer, an anticipatory drag cue with a short reason, and an SVG trend chart. It never claims calibrated force.

## Project map

- `src/DragonflyApp.tsx` — navigation shell
- `src/hooks/useBleSession.ts` — BLE session + scoring
- `src/hooks/useDragonflyState.ts` — app state
- `src/screens/` — Home, Fishing, Score, Details, Journey, Detail
- `src/ui/` — design-system primitives
- `src/design-lab/` — development Design Lab
- `UI_AUDIT.md` — audit + implementation notes

## Validation

```bash
npx tsc --noEmit
npx expo-doctor
npm run web
npx expo export --platform web
```

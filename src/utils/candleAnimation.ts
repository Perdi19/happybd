/**
 * Pure animation timing and physics helpers for the interactive birthday candle scene.
 * Kept framework-agnostic so sequence timing, reduced-motion fallbacks, and
 * anti-double-trigger rules can be unit tested deterministically.
 */

export interface CandlePosition {
  x: number;
  y: number;
  height: number;
  waxTone: 'cream' | 'blush';
}

export interface CandleBlowStepSchedule {
  index: number;
  bendMs: number;
  extinguishMs: number;
  smokeDurationMs: number;
  smokeEndMs: number;
}

export interface CandleFlickerProfile {
  durationSec: number;
  delaySec: number;
  swayDeg: number;
  tiltAngleDeg: number;
}

export const CANDLE_POSITIONS: readonly CandlePosition[] = [
  { x: 310, y: 340, height: 50, waxTone: 'cream' },
  { x: 355, y: 330, height: 60, waxTone: 'blush' },
  { x: 400, y: 320, height: 70, waxTone: 'cream' },
  { x: 445, y: 330, height: 60, waxTone: 'blush' },
  { x: 490, y: 340, height: 50, waxTone: 'cream' },
] as const;

export const WIND_PARTICLES = [
  { id: 0, startX: 64, startY: 274, endX: 605, endY: 256, delay: 0.02, duration: 0.82, r: 2.6, tone: 'cyan' as const },
  { id: 1, startX: 48, startY: 248, endX: 628, endY: 226, delay: 0.06, duration: 0.88, r: 3.1, tone: 'gold' as const },
  { id: 2, startX: 82, startY: 292, endX: 590, endY: 282, delay: 0.09, duration: 0.78, r: 2.1, tone: 'cyan' as const },
  { id: 3, startX: 70, startY: 262, endX: 642, endY: 244, delay: 0.13, duration: 0.86, r: 2.8, tone: 'white' as const },
  { id: 4, startX: 95, startY: 236, endX: 650, endY: 214, delay: 0.17, duration: 0.84, r: 2.3, tone: 'gold' as const },
  { id: 5, startX: 55, startY: 284, endX: 612, endY: 268, delay: 0.2, duration: 0.9, r: 1.9, tone: 'cyan' as const },
  { id: 6, startX: 112, startY: 252, endX: 635, endY: 234, delay: 0.24, duration: 0.79, r: 2.7, tone: 'white' as const },
  { id: 7, startX: 76, startY: 268, endX: 660, endY: 248, delay: 0.27, duration: 0.85, r: 2.2, tone: 'gold' as const },
  { id: 8, startX: 105, startY: 298, endX: 620, endY: 274, delay: 0.31, duration: 0.81, r: 2.4, tone: 'cyan' as const },
  { id: 9, startX: 62, startY: 240, endX: 600, endY: 220, delay: 0.35, duration: 0.83, r: 1.8, tone: 'white' as const },
] as const;

export function canStartBlowSequence(
  isBlowing: boolean,
  candles: readonly boolean[]
): boolean {
  return !isBlowing && candles.some(Boolean);
}

export function getLitCandleIndices(candles: readonly boolean[]): number[] {
  const indices: number[] = [];
  candles.forEach((isLit, idx) => {
    if (isLit) indices.push(idx);
  });
  return indices;
}

export function getCandleFlameOrigin(pos: Pick<CandlePosition, 'x' | 'y' | 'height'>): {
  x: number;
  y: number;
} {
  return {
    x: pos.x,
    y: pos.y - pos.height - 10,
  };
}

export function getCandleFlickerProfile(index: number): CandleFlickerProfile {
  const durations = [1.52, 1.74, 1.44, 1.66, 1.58];
  const delays = [-0.25, -0.92, -0.48, -1.18, -0.7];
  const sways = [2.6, 3.2, 2.4, 3.0, 2.8];
  const tilts = [33, 37, 41, 36, 34];

  const safeIdx = ((index % durations.length) + durations.length) % durations.length;
  return {
    durationSec: durations[safeIdx],
    delaySec: delays[safeIdx],
    swayDeg: sways[safeIdx],
    tiltAngleDeg: tilts[safeIdx],
  };
}

export function getCandleBlowSchedule(
  index: number,
  litIndices: readonly number[],
  reducedMotion: boolean
): CandleBlowStepSchedule {
  const firstLit = litIndices.length > 0 ? Math.min(...litIndices) : 0;
  const relativeStep = Math.max(0, index - firstLit);

  if (reducedMotion) {
    const bendMs = 30 + relativeStep * 35;
    const extinguishMs = 95 + relativeStep * 55;
    const smokeDurationMs = 900;
    return {
      index,
      bendMs,
      extinguishMs,
      smokeDurationMs,
      smokeEndMs: extinguishMs + smokeDurationMs,
    };
  }

  const bendMs = 110 + relativeStep * 90;
  const extinguishMs = bendMs + 250 + relativeStep * 12;
  const smokeDurationMs = 2300;
  return {
    index,
    bendMs,
    extinguishMs,
    smokeDurationMs,
    smokeEndMs: extinguishMs + smokeDurationMs,
  };
}

export function getBlowSequenceDurationMs(
  litIndices: readonly number[],
  reducedMotion: boolean
): number {
  if (litIndices.length === 0) return 0;
  const lastIdx = Math.max(...litIndices);
  const lastStep = getCandleBlowSchedule(lastIdx, litIndices, reducedMotion);
  return lastStep.extinguishMs + (reducedMotion ? 160 : 300);
}

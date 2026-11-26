import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CANDLE_POSITIONS,
  WIND_PARTICLES,
  canStartBlowSequence,
  getLitCandleIndices,
  getCandleFlameOrigin,
  getCandleFlickerProfile,
  getCandleBlowSchedule,
  getBlowSequenceDurationMs,
} from './candleAnimation.ts';

test('canStartBlowSequence prevents duplicate clicks and empty states', () => {
  assert.equal(canStartBlowSequence(false, [true, true, true, true, true]), true);
  assert.equal(canStartBlowSequence(false, [false, false, true, false, false]), true);
  assert.equal(canStartBlowSequence(true, [true, true, true, true, true]), false);
  assert.equal(canStartBlowSequence(false, [false, false, false, false, false]), false);
});

test('getLitCandleIndices extracts active candle indices in order', () => {
  assert.deepEqual(getLitCandleIndices([true, false, true, false, true]), [0, 2, 4]);
  assert.deepEqual(getLitCandleIndices([false, false, false, false, false]), []);
});

test('getCandleFlameOrigin aligns exactly above each candle wick', () => {
  assert.deepEqual(getCandleFlameOrigin(CANDLE_POSITIONS[0]), { x: 310, y: 280 });
  assert.deepEqual(getCandleFlameOrigin(CANDLE_POSITIONS[2]), { x: 400, y: 240 });
  assert.deepEqual(getCandleFlameOrigin(CANDLE_POSITIONS[4]), { x: 490, y: 280 });
});

test('getCandleBlowSchedule produces monotonically left-to-right staggered blow times', () => {
  const allLit = [0, 1, 2, 3, 4];
  const schedules = allLit.map((i) => getCandleBlowSchedule(i, allLit, false));

  for (let i = 0; i < schedules.length; i++) {
    assert.ok(schedules[i].bendMs < schedules[i].extinguishMs, 'flame bends before extinguishing');
    assert.ok(schedules[i].smokeEndMs > schedules[i].extinguishMs, 'smoke trails after extinguish');
    if (i > 0) {
      assert.ok(schedules[i].bendMs > schedules[i - 1].bendMs);
      assert.ok(schedules[i].extinguishMs > schedules[i - 1].extinguishMs);
    }
  }
});

test('getCandleBlowSchedule respects reduced motion with faster gentle fade timing', () => {
  const allLit = [0, 1, 2, 3, 4];
  const normalEnd = getBlowSequenceDurationMs(allLit, false);
  const reducedEnd = getBlowSequenceDurationMs(allLit, true);

  assert.ok(reducedEnd > 0);
  assert.ok(reducedEnd < normalEnd);
  assert.equal(getBlowSequenceDurationMs([], false), 0);
});

test('candle flicker profiles and wind particles provide distinct organic values', () => {
  const profiles = CANDLE_POSITIONS.map((_, idx) => getCandleFlickerProfile(idx));
  const uniqueDurations = new Set(profiles.map((p) => p.durationSec));
  assert.equal(uniqueDurations.size, CANDLE_POSITIONS.length);
  assert.ok(WIND_PARTICLES.length >= 8);
  WIND_PARTICLES.forEach((p) => {
    assert.ok(p.endX > p.startX);
  });
});

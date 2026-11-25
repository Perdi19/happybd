import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HAPPY_BIRTHDAY_MELODY,
  HAPPY_BIRTHDAY_ACCOMPANIMENT,
  HAPPY_BIRTHDAY_LOOP_DURATION,
  audioEngine,
} from './audioEngine';

test('HAPPY_BIRTHDAY_MELODY uses exact recognizable 25-note F-major Happy Birthday sequence', () => {
  assert.equal(HAPPY_BIRTHDAY_MELODY.length, 25);

  const expectedFrequencies = [
    // Phrase 1: C4 C4 D4 C4 F4 E4
    261.63, 261.63, 293.66, 261.63, 349.23, 329.63,
    // Phrase 2: C4 C4 D4 C4 G4 F4
    261.63, 261.63, 293.66, 261.63, 392.0, 349.23,
    // Phrase 3: C4 C4 C5 A4 F4 E4 D4
    261.63, 261.63, 523.25, 440.0, 349.23, 329.63, 293.66,
    // Phrase 4: Bb4 Bb4 A4 F4 G4 F4
    466.16, 466.16, 440.0, 349.23, 392.0, 349.23,
  ];

  assert.deepEqual(
    HAPPY_BIRTHDAY_MELODY.map((n) => n.freq),
    expectedFrequencies
  );
});

test('HAPPY_BIRTHDAY_MELODY timing is strictly monotonic and fits smoothly inside loop duration', () => {
  for (let i = 1; i < HAPPY_BIRTHDAY_MELODY.length; i++) {
    assert.ok(
      HAPPY_BIRTHDAY_MELODY[i].start > HAPPY_BIRTHDAY_MELODY[i - 1].start,
      `Note ${i} start should follow previous note`
    );
  }

  const lastNote = HAPPY_BIRTHDAY_MELODY[HAPPY_BIRTHDAY_MELODY.length - 1];
  assert.ok(lastNote.start + lastNote.duration < HAPPY_BIRTHDAY_LOOP_DURATION);
  // Ensure at least ~1s gentle breathing room before looping back to Phrase 1
  assert.ok(HAPPY_BIRTHDAY_LOOP_DURATION - (lastNote.start + lastNote.duration) >= 1.0);
});

test('HAPPY_BIRTHDAY_ACCOMPANIMENT stays softer than melody and within loop duration', () => {
  assert.ok(HAPPY_BIRTHDAY_ACCOMPANIMENT.length >= 16);
  const maxMelodyVol = Math.max(...HAPPY_BIRTHDAY_MELODY.map((n) => n.volume));
  const minMelodyVol = Math.min(...HAPPY_BIRTHDAY_MELODY.map((n) => n.volume));

  for (const chordNote of HAPPY_BIRTHDAY_ACCOMPANIMENT) {
    assert.ok(chordNote.volume < minMelodyVol, 'Accompaniment should stay softer than melody');
    assert.ok(chordNote.volume < maxMelodyVol);
    assert.ok(chordNote.start + chordNote.duration <= HAPPY_BIRTHDAY_LOOP_DURATION);
  }
});

test('audioEngine handles non-browser environments safely without throwing', () => {
  assert.equal(audioEngine.getMelodyPlaying(), false);
  assert.equal(audioEngine.toggleMelody(), false);
  audioEngine.stopMelody();
  assert.equal(audioEngine.getMelodyPlaying(), false);
});

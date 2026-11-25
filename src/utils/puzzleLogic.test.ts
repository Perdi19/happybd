import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PUZZLE_TARGET_WORD,
  PUZZLE_DECOY_LETTERS,
  PROGRESSIVE_HINTS,
  createScrambledTiles,
  isWordComplete,
  evaluateAttempt,
  getUnlockedHints,
  getRemainingAttemptsForNextHint,
  LetterTile,
} from './puzzleLogic';

test('createScrambledTiles creates 10 tiles (7 JASMINE + 3 decoys) in scrambled order', () => {
  const tiles = createScrambledTiles(PUZZLE_TARGET_WORD, PUZZLE_DECOY_LETTERS);

  assert.equal(tiles.length, 10);
  const targetTiles = tiles.filter((t) => !t.isDecoy);
  const decoyTiles = tiles.filter((t) => t.isDecoy);

  assert.equal(targetTiles.length, 7);
  assert.equal(decoyTiles.length, 3);
  assert.equal(
    targetTiles.map((t) => t.char).sort().join(''),
    'JASMINE'.split('').sort().join('')
  );
  assert.deepEqual(
    decoyTiles.map((t) => t.char).sort(),
    [...PUZZLE_DECOY_LETTERS].sort()
  );

  // Leading 7 tiles must not spell JASMINE immediately
  const prefix = tiles
    .slice(0, PUZZLE_TARGET_WORD.length)
    .map((t) => t.char)
    .join('');
  assert.notEqual(prefix, PUZZLE_TARGET_WORD);
});

test('isWordComplete and evaluateAttempt validate JASMINE and reject incomplete or decoy answers', () => {
  const solvedTiles: (LetterTile | null)[] = PUZZLE_TARGET_WORD.split('').map((char, idx) => ({
    id: `tile-${idx}-${char}`,
    char,
    originalIndex: idx,
    isDecoy: false,
  }));

  assert.equal(isWordComplete(solvedTiles, PUZZLE_TARGET_WORD), true);
  assert.equal(evaluateAttempt(solvedTiles, PUZZLE_TARGET_WORD), 'solved');

  // Incomplete with null slot
  const incompleteTiles: (LetterTile | null)[] = [...solvedTiles];
  incompleteTiles[3] = null;
  assert.equal(isWordComplete(incompleteTiles, PUZZLE_TARGET_WORD), false);
  assert.equal(evaluateAttempt(incompleteTiles, PUZZLE_TARGET_WORD), 'incomplete');

  // Wrong spelling (swapped letters)
  const swappedTiles: (LetterTile | null)[] = [...solvedTiles];
  [swappedTiles[2], swappedTiles[3]] = [swappedTiles[3], swappedTiles[2]];
  assert.equal(isWordComplete(swappedTiles, PUZZLE_TARGET_WORD), false);
  assert.equal(evaluateAttempt(swappedTiles, PUZZLE_TARGET_WORD), 'incorrect');

  // Wrong answer containing decoy letter
  const withDecoyTiles: (LetterTile | null)[] = [...solvedTiles];
  withDecoyTiles[0] = { id: 'decoy-0-R', char: 'R', originalIndex: 7, isDecoy: true };
  assert.equal(isWordComplete(withDecoyTiles, PUZZLE_TARGET_WORD), false);
  assert.equal(evaluateAttempt(withDecoyTiles, PUZZLE_TARGET_WORD), 'incorrect');
});

test('progressive hints require 3 incorrect attempts for additional hint and reveal J without spoiling full word', () => {
  // Initial state: only general mysterious hint 1 is unlocked; 3 attempts remain for hint 2
  const initialHints = getUnlockedHints(0);
  assert.equal(initialHints.length, 1);
  assert.equal(initialHints[0].level, 1);
  assert.equal(initialHints[0].text.includes('JASMINE'), false);
  assert.equal(getRemainingAttemptsForNextHint(0), 3);

  // After 1 or 2 wrong attempts, additional hint stays locked
  assert.equal(getUnlockedHints(1).length, 1);
  assert.equal(getRemainingAttemptsForNextHint(1), 2);
  assert.equal(getUnlockedHints(2).length, 1);
  assert.equal(getRemainingAttemptsForNextHint(2), 1);

  // After 3 wrong attempts, second hint unlocks revealing the starting letter J
  const hintsAtThree = getUnlockedHints(3);
  assert.equal(hintsAtThree.length, 2);
  assert.equal(hintsAtThree[1].level, 2);
  assert.equal(hintsAtThree[1].highlightLetter, 'J');
  assert.ok(hintsAtThree[1].text.includes('J'));
  assert.equal(hintsAtThree[1].text.includes('JASMINE'), false);

  // Further hints unlock progressively without spoiling full answer
  const hintsAtFive = getUnlockedHints(5);
  assert.equal(hintsAtFive.length, 3);
  assert.equal(hintsAtFive[2].highlightLetter, 'E');

  const allHints = getUnlockedHints(7);
  assert.equal(allHints.length, PROGRESSIVE_HINTS.length);
  assert.equal(getRemainingAttemptsForNextHint(7), null);
  for (const hint of allHints) {
    assert.equal(hint.text.includes('JASMINE'), false);
  }
});
